import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5,
  onScroll,
  loading = false,
  loadingComponent,
  emptyComponent
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  const { visibleItems, totalHeight, offsetY } = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const visibleItems = items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index
    }));

    return {
      visibleItems,
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, itemHeight, scrollTop, containerHeight, overscan]);

  if (loading && loadingComponent) {
    return (
      <div 
        className={cn('overflow-auto', className)}
        style={{ height: containerHeight }}
      >
        {loadingComponent}
      </div>
    );
  }

  if (items.length === 0 && emptyComponent) {
    return (
      <div 
        className={cn('overflow-auto flex items-center justify-center', className)}
        style={{ height: containerHeight }}
      >
        {emptyComponent}
      </div>
    );
  }

  return (
    <div
      ref={scrollElementRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(({ item, index }) => (
            <div
              key={index}
              style={{ height: itemHeight }}
              className="flex items-center"
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 무한 스크롤을 지원하는 가상 리스트
interface InfiniteVirtualListProps<T> extends Omit<VirtualListProps<T>, 'items'> {
  items: T[];
  hasNextPage: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  loadMoreThreshold?: number;
}

export function InfiniteVirtualList<T>({
  items,
  hasNextPage,
  isLoadingMore,
  onLoadMore,
  loadMoreThreshold = 5,
  ...virtualListProps
}: InfiniteVirtualListProps<T>) {
  const handleScroll = useCallback((scrollTop: number) => {
    const { containerHeight, itemHeight } = virtualListProps;
    const totalHeight = items.length * itemHeight;
    const scrollBottom = scrollTop + containerHeight;
    const threshold = totalHeight - (loadMoreThreshold * itemHeight);

    if (scrollBottom >= threshold && hasNextPage && !isLoadingMore) {
      onLoadMore();
    }

    virtualListProps.onScroll?.(scrollTop);
  }, [items.length, virtualListProps, hasNextPage, isLoadingMore, onLoadMore, loadMoreThreshold]);

  return (
    <VirtualList
      {...virtualListProps}
      items={items}
      onScroll={handleScroll}
    />
  );
}

// 그리드 형태의 가상화된 리스트
interface VirtualGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  gap?: number;
  overscan?: number;
}

export function VirtualGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  renderItem,
  className,
  gap = 0,
  overscan = 5
}: VirtualGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const { visibleItems, totalHeight, offsetY } = useMemo(() => {
    const columnsPerRow = Math.floor(containerWidth / (itemWidth + gap));
    const rowHeight = itemHeight + gap;
    const totalRows = Math.ceil(items.length / columnsPerRow);

    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const endRow = Math.min(
      totalRows - 1,
      Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
    );

    const visibleItems = [];
    for (let row = startRow; row <= endRow; row++) {
      for (let col = 0; col < columnsPerRow; col++) {
        const index = row * columnsPerRow + col;
        if (index < items.length) {
          visibleItems.push({
            item: items[index],
            index,
            row,
            col
          });
        }
      }
    }

    return {
      visibleItems,
      totalHeight: totalRows * rowHeight,
      offsetY: startRow * rowHeight
    };
  }, [items, itemWidth, itemHeight, containerWidth, containerHeight, gap, scrollTop, overscan]);

  return (
    <div
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(({ item, index, row, col }) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: col * (itemWidth + gap),
                top: (row * (itemHeight + gap)) - (visibleItems[0]?.row || 0) * (itemHeight + gap),
                width: itemWidth,
                height: itemHeight
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 사용 예시를 위한 훅
export const useVirtualList = <T,>(
  items: T[],
  options: {
    itemHeight: number;
    containerHeight: number;
    overscan?: number;
  }
) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const { itemHeight, containerHeight, overscan = 5 } = options;

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  return {
    visibleItems,
    visibleRange,
    scrollTop,
    setScrollTop,
    totalHeight: items.length * itemHeight,
    offsetY: visibleRange.startIndex * itemHeight
  };
};