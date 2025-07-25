// 백그라운드 작업 관리 서비스
import { logger } from '@/lib/logger';

export interface BackgroundTask {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  error?: string;
  result?: any;
  metadata?: Record<string, any>;
}

export interface TaskOptions {
  timeout?: number;
  retries?: number;
  onProgress?: (progress: number) => void;
  onStatusChange?: (status: BackgroundTask['status']) => void;
  signal?: AbortSignal;
}

type TaskExecutor<T> = (
  updateProgress: (progress: number) => void,
  signal?: AbortSignal
) => Promise<T>;

export class BackgroundTaskManager {
  private static instance: BackgroundTaskManager;
  private tasks = new Map<string, BackgroundTask>();
  private listeners = new Set<(tasks: BackgroundTask[]) => void>();
  private maxConcurrentTasks = 3;
  private runningTasks = 0;
  private taskQueue: Array<() => Promise<void>> = [];

  private constructor() {}

  public static getInstance(): BackgroundTaskManager {
    if (!BackgroundTaskManager.instance) {
      BackgroundTaskManager.instance = new BackgroundTaskManager();
    }
    return BackgroundTaskManager.instance;
  }

  /**
   * 작업 실행
   */
  public async executeTask<T>(
    name: string,
    executor: TaskExecutor<T>,
    options: TaskOptions = {}
  ): Promise<T> {
    const taskId = this.generateTaskId();
    const task: BackgroundTask = {
      id: taskId,
      name,
      status: 'pending',
      progress: 0,
      metadata: options
    };

    this.tasks.set(taskId, task);
    this.notifyListeners();

    return new Promise((resolve, reject) => {
      const executeTaskInternal = async () => {
        if (this.runningTasks >= this.maxConcurrentTasks) {
          // 큐에 추가
          this.taskQueue.push(executeTaskInternal);
          return;
        }

        this.runningTasks++;
        
        try {
          await this.runTask(taskId, executor, options, resolve, reject);
        } finally {
          this.runningTasks--;
          this.processQueue();
        }
      };

      executeTaskInternal();
    });
  }

  /**
   * 작업 실행 내부 로직
   */
  private async runTask<T>(
    taskId: string,
    executor: TaskExecutor<T>,
    options: TaskOptions,
    resolve: (value: T) => void,
    reject: (reason: any) => void
  ): Promise<void> {
    const task = this.tasks.get(taskId)!;
    
    // 타임아웃 설정
    const timeoutId = options.timeout 
      ? setTimeout(() => {
          this.cancelTask(taskId);
          reject(new Error('Task timeout'));
        }, options.timeout)
      : null;

    try {
      // 작업 시작
      task.status = 'running';
      task.startTime = new Date();
      this.updateTask(taskId, task);
      options.onStatusChange?.('running');

      // 진행률 업데이트 함수
      const updateProgress = (progress: number) => {
        task.progress = Math.max(0, Math.min(100, progress));
        this.updateTask(taskId, task);
        options.onProgress?.(task.progress);
      };

      // 작업 실행
      const result = await executor(updateProgress, options.signal);

      // 작업 완료
      if (timeoutId) clearTimeout(timeoutId);
      
      task.status = 'completed';
      task.progress = 100;
      task.endTime = new Date();
      task.result = result;
      this.updateTask(taskId, task);
      options.onStatusChange?.('completed');

      resolve(result);

    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);

      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      
      // 재시도 로직
      if (options.retries && options.retries > 0) {
        logger.warn(`작업 재시도: ${task.name} (${options.retries}회 남음)`);
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
        
        return this.runTask(
          taskId,
          executor,
          { ...options, retries: options.retries - 1 },
          resolve,
          reject
        );
      }

      // 작업 실패
      task.status = 'failed';
      task.endTime = new Date();
      task.error = errorMessage;
      this.updateTask(taskId, task);
      options.onStatusChange?.('failed');

      reject(error);
    }
  }

  /**
   * 큐 처리
   */
  private processQueue(): void {
    if (this.taskQueue.length > 0 && this.runningTasks < this.maxConcurrentTasks) {
      const nextTask = this.taskQueue.shift();
      nextTask?.();
    }
  }

  /**
   * 작업 취소
   */
  public cancelTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || task.status === 'completed' || task.status === 'failed') {
      return false;
    }

    task.status = 'cancelled';
    task.endTime = new Date();
    this.updateTask(taskId, task);

    return true;
  }

  /**
   * 모든 작업 취소
   */
  public cancelAllTasks(): void {
    for (const [taskId, task] of this.tasks) {
      if (task.status === 'pending' || task.status === 'running') {
        this.cancelTask(taskId);
      }
    }
    this.taskQueue = [];
  }

  /**
   * 작업 목록 조회
   */
  public getTasks(): BackgroundTask[] {
    return Array.from(this.tasks.values()).sort((a, b) => {
      const aTime = a.startTime || new Date(0);
      const bTime = b.startTime || new Date(0);
      return bTime.getTime() - aTime.getTime();
    });
  }

  /**
   * 특정 작업 조회
   */
  public getTask(taskId: string): BackgroundTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * 완료된 작업 정리
   */
  public cleanupCompletedTasks(olderThanMinutes: number = 60): void {
    const cutoffTime = new Date(Date.now() - olderThanMinutes * 60 * 1000);
    
    for (const [taskId, task] of this.tasks) {
      if (
        (task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled') &&
        task.endTime &&
        task.endTime < cutoffTime
      ) {
        this.tasks.delete(taskId);
      }
    }
    
    this.notifyListeners();
  }

  /**
   * 리스너 등록
   */
  public addListener(listener: (tasks: BackgroundTask[]) => void): () => void {
    this.listeners.add(listener);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 작업 업데이트
   */
  private updateTask(taskId: string, task: BackgroundTask): void {
    this.tasks.set(taskId, { ...task });
    this.notifyListeners();
  }

  /**
   * 리스너들에게 알림
   */
  private notifyListeners(): void {
    const tasks = this.getTasks();
    this.listeners.forEach(listener => listener(tasks));
  }

  /**
   * 작업 ID 생성
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 통계 조회
   */
  public getStats(): {
    total: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
    cancelled: number;
  } {
    const tasks = this.getTasks();
    
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      running: tasks.filter(t => t.status === 'running').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length,
    };
  }

  /**
   * 최대 동시 작업 수 설정
   */
  public setMaxConcurrentTasks(max: number): void {
    this.maxConcurrentTasks = Math.max(1, max);
  }
}

// 전역 인스턴스
export const backgroundTaskManager = BackgroundTaskManager.getInstance();

// 편의 함수들
export const executeBackgroundTask = <T>(
  name: string,
  executor: TaskExecutor<T>,
  options?: TaskOptions
) => backgroundTaskManager.executeTask(name, executor, options);

export const cancelBackgroundTask = (taskId: string) => 
  backgroundTaskManager.cancelTask(taskId);

export const getBackgroundTasks = () => 
  backgroundTaskManager.getTasks();

export const addTaskListener = (listener: (tasks: BackgroundTask[]) => void) =>
  backgroundTaskManager.addListener(listener);

// React Hook
export const useBackgroundTasks = () => {
  const [tasks, setTasks] = React.useState<BackgroundTask[]>([]);

  React.useEffect(() => {
    const unsubscribe = addTaskListener(setTasks);
    setTasks(getBackgroundTasks()); // 초기 데이터 로드
    
    return unsubscribe;
  }, []);

  const executeTask = React.useCallback(<T>(
    name: string,
    executor: TaskExecutor<T>,
    options?: TaskOptions
  ) => {
    return executeBackgroundTask(name, executor, options);
  }, []);

  const cancelTask = React.useCallback((taskId: string) => {
    return cancelBackgroundTask(taskId);
  }, []);

  const stats = React.useMemo(() => {
    return backgroundTaskManager.getStats();
  }, [tasks]);

  return {
    tasks,
    executeTask,
    cancelTask,
    stats
  };
};

// React import (조건부)
let React: any;
try {
  React = require('react');
} catch {
  // React가 없는 환경에서는 Hook을 사용할 수 없음
}

// 자동 정리 설정 (5분마다 1시간 이상 된 완료 작업 정리)
setInterval(() => {
  backgroundTaskManager.cleanupCompletedTasks(60);
}, 5 * 60 * 1000);