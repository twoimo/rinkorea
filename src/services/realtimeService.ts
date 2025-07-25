// 실시간 상태 업데이트 서비스
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface RealtimeEvent<T = any> {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: T;
  old_record?: T;
  timestamp: string;
}

export interface RealtimeSubscription {
  id: string;
  table: string;
  filter?: string;
  callback: (event: RealtimeEvent) => void;
}

export class RealtimeManager {
  private static instance: RealtimeManager;
  private subscriptions = new Map<string, RealtimeSubscription>();
  private channels = new Map<string, any>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  private constructor() {
    this.setupConnectionMonitoring();
  }

  public static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager();
    }
    return RealtimeManager.instance;
  }

  /**
   * 테이블 변경사항 구독
   */
  public subscribe<T = any>(
    table: string,
    callback: (event: RealtimeEvent<T>) => void,
    filter?: string
  ): string {
    const subscriptionId = this.generateSubscriptionId();
    const subscription: RealtimeSubscription = {
      id: subscriptionId,
      table,
      filter,
      callback: callback as (event: RealtimeEvent) => void
    };

    this.subscriptions.set(subscriptionId, subscription);
    this.createChannel(table, filter);

    logger.info(`실시간 구독 생성: ${table}`, { subscriptionId, filter });
    return subscriptionId;
  }

  /**
   * 구독 해제
   */
  public unsubscribe(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return false;
    }

    this.subscriptions.delete(subscriptionId);

    // 같은 테이블/필터를 구독하는 다른 구독이 없으면 채널 제거
    const hasOtherSubscriptions = Array.from(this.subscriptions.values()).some(
      sub => sub.table === subscription.table && sub.filter === subscription.filter
    );

    if (!hasOtherSubscriptions) {
      const channelKey = this.getChannelKey(subscription.table, subscription.filter);
      const channel = this.channels.get(channelKey);
      if (channel) {
        supabase.removeChannel(channel);
        this.channels.delete(channelKey);
      }
    }

    logger.info(`실시간 구독 해제: ${subscription.table}`, { subscriptionId });
    return true;
  }

  /**
   * 모든 구독 해제
   */
  public unsubscribeAll(): void {
    for (const channel of this.channels.values()) {
      supabase.removeChannel(channel);
    }
    
    this.subscriptions.clear();
    this.channels.clear();
    
    logger.info('모든 실시간 구독 해제');
  }

  /**
   * 채널 생성
   */
  private createChannel(table: string, filter?: string): void {
    const channelKey = this.getChannelKey(table, filter);
    
    if (this.channels.has(channelKey)) {
      return; // 이미 존재하는 채널
    }

    const channel = supabase
      .channel(`realtime:${channelKey}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter
        },
        (payload) => this.handleRealtimeEvent(table, filter, payload)
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          logger.info(`실시간 채널 구독 성공: ${table}`, { filter });
          this.reconnectAttempts = 0;
        } else if (status === 'CHANNEL_ERROR') {
          logger.error(`실시간 채널 오류: ${table}`, { filter });
          this.handleReconnection();
        } else if (status === 'TIMED_OUT') {
          logger.warn(`실시간 채널 타임아웃: ${table}`, { filter });
          this.handleReconnection();
        }
      });

    this.channels.set(channelKey, channel);
  }

  /**
   * 실시간 이벤트 처리
   */
  private handleRealtimeEvent(table: string, filter: string | undefined, payload: any): void {
    const event: RealtimeEvent = {
      type: payload.eventType,
      table,
      record: payload.new || payload.old,
      old_record: payload.old,
      timestamp: new Date().toISOString()
    };

    // 해당 테이블/필터를 구독하는 모든 콜백 호출
    for (const subscription of this.subscriptions.values()) {
      if (subscription.table === table && subscription.filter === filter) {
        try {
          subscription.callback(event);
        } catch (error) {
          logger.error('실시간 이벤트 콜백 오류', { 
            subscriptionId: subscription.id,
            error: error instanceof Error ? error.message : error
          });
        }
      }
    }
  }

  /**
   * 연결 모니터링 설정
   */
  private setupConnectionMonitoring(): void {
    // 주기적으로 연결 상태 확인
    setInterval(() => {
      const connectionState = supabase.realtime.connection?.readyState;
      if (connectionState !== WebSocket.OPEN) {
        logger.warn('실시간 연결 상태 불안정', { connectionState });
        this.handleReconnection();
      }
    }, 30000); // 30초마다 확인
  }

  /**
   * 재연결 처리
   */
  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('실시간 연결 재시도 횟수 초과');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    logger.info(`실시간 연결 재시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`, { delay });

    setTimeout(() => {
      this.recreateAllChannels();
    }, delay);
  }

  /**
   * 모든 채널 재생성
   */
  private recreateAllChannels(): void {
    const existingSubscriptions = Array.from(this.subscriptions.values());
    
    // 기존 채널 모두 제거
    for (const channel of this.channels.values()) {
      supabase.removeChannel(channel);
    }
    this.channels.clear();

    // 채널 재생성
    const processedChannels = new Set<string>();
    for (const subscription of existingSubscriptions) {
      const channelKey = this.getChannelKey(subscription.table, subscription.filter);
      if (!processedChannels.has(channelKey)) {
        this.createChannel(subscription.table, subscription.filter);
        processedChannels.add(channelKey);
      }
    }
  }

  /**
   * 채널 키 생성
   */
  private getChannelKey(table: string, filter?: string): string {
    return filter ? `${table}:${filter}` : table;
  }

  /**
   * 구독 ID 생성
   */
  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 구독 통계
   */
  public getStats(): {
    subscriptions: number;
    channels: number;
    tables: string[];
  } {
    const tables = [...new Set(Array.from(this.subscriptions.values()).map(sub => sub.table))];
    
    return {
      subscriptions: this.subscriptions.size,
      channels: this.channels.size,
      tables
    };
  }
}

// 전역 인스턴스
export const realtimeManager = RealtimeManager.getInstance();

// 편의 함수들
export const subscribeToTable = <T = any>(
  table: string,
  callback: (event: RealtimeEvent<T>) => void,
  filter?: string
) => realtimeManager.subscribe(table, callback, filter);

export const unsubscribeFromTable = (subscriptionId: string) =>
  realtimeManager.unsubscribe(subscriptionId);

// React Hook
export const useRealtimeSubscription = <T = any>(
  table: string,
  callback: (event: RealtimeEvent<T>) => void,
  filter?: string,
  enabled: boolean = true
) => {
  const [subscriptionId, setSubscriptionId] = React.useState<string | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) {
      if (subscriptionId) {
        unsubscribeFromTable(subscriptionId);
        setSubscriptionId(null);
        setIsConnected(false);
      }
      return;
    }

    const wrappedCallback = (event: RealtimeEvent<T>) => {
      setIsConnected(true);
      callback(event);
    };

    const id = subscribeToTable(table, wrappedCallback, filter);
    setSubscriptionId(id);

    return () => {
      if (id) {
        unsubscribeFromTable(id);
      }
    };
  }, [table, filter, enabled, callback]);

  return { subscriptionId, isConnected };
};

// 특정 테이블 변경사항을 상태로 관리하는 Hook
export const useRealtimeTable = <T = any>(
  table: string,
  initialData: T[] = [],
  filter?: string
) => {
  const [data, setData] = React.useState<T[]>(initialData);
  const [lastUpdate, setLastUpdate] = React.useState<Date | null>(null);

  const handleRealtimeEvent = React.useCallback((event: RealtimeEvent<T>) => {
    setLastUpdate(new Date());
    
    switch (event.type) {
      case 'INSERT':
        setData(prev => [...prev, event.record]);
        break;
      case 'UPDATE':
        setData(prev => prev.map(item => 
          (item as any).id === (event.record as any).id ? event.record : item
        ));
        break;
      case 'DELETE':
        setData(prev => prev.filter(item => 
          (item as any).id !== (event.old_record as any).id
        ));
        break;
    }
  }, []);

  useRealtimeSubscription(table, handleRealtimeEvent, filter);

  return { data, setData, lastUpdate };
};

// 문서 처리 상태 실시간 업데이트 Hook
export const useDocumentProcessingStatus = (documentIds?: string[]) => {
  const [processingStatus, setProcessingStatus] = React.useState<Record<string, string>>({});

  const handleStatusUpdate = React.useCallback((event: RealtimeEvent) => {
    if (event.record && event.record.id) {
      setProcessingStatus(prev => ({
        ...prev,
        [event.record.id]: event.record.processing_status
      }));
    }
  }, []);

  const filter = documentIds?.length 
    ? `id=in.(${documentIds.join(',')})`
    : undefined;

  useRealtimeSubscription('documents', handleStatusUpdate, filter);

  return processingStatus;
};

// 검색 통계 실시간 업데이트 Hook
export const useRealtimeSearchStats = () => {
  const [searchCount, setSearchCount] = React.useState(0);
  const [recentSearches, setRecentSearches] = React.useState<any[]>([]);

  const handleSearchLogUpdate = React.useCallback((event: RealtimeEvent) => {
    if (event.type === 'INSERT') {
      setSearchCount(prev => prev + 1);
      setRecentSearches(prev => [event.record, ...prev.slice(0, 9)]); // 최근 10개만 유지
    }
  }, []);

  useRealtimeSubscription('search_logs', handleSearchLogUpdate);

  return { searchCount, recentSearches };
};

// React import (조건부)
let React: any;
try {
  React = require('react');
} catch {
  // React가 없는 환경에서는 Hook을 사용할 수 없음
}