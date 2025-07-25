import React, { useEffect, useRef, useCallback } from 'react';

export interface InfiniteScrollProps {
  children: React.ReactNode;
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  threshold?: number;
  className?: string;
  loader?: React.ReactNode;
  endMessage?: React.ReactNode;
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  hasMore,
  loading,
  onLoadMore,
  threshold = 100,
  className = '',
  loader,
  endMessage
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      onLoadMore();
    }
  }, [loading, hasMore, onLoadMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          handleLoadMore();
        }
      },
      {
        rootMargin: `${threshold}px`,
        threshold: 0.1
      }
    );

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleLoadMore, threshold]);

  return (
    <div ref={containerRef} className={className}>
      {children}
      
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-4">
          {loading && (loader || (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              <span>Loading more...</span>
            </div>
          ))}
        </div>
      )}
      
      {!hasMore && endMessage && (
        <div className="flex justify-center py-4 text-gray-500">
          {endMessage}
        </div>
      )}
    </div>
  );
};

export default InfiniteScroll;