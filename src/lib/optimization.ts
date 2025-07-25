import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Debounce function - delays execution until after delay milliseconds have passed
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options?: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  }
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout | null = null;
  let maxTimeoutId: NodeJS.Timeout | null = null;
  let lastCallTime = 0;
  let lastInvokeTime = 0;
  let lastArgs: Parameters<T> | undefined;
  let result: ReturnType<T>;

  const leading = options?.leading ?? false;
  const trailing = options?.trailing ?? true;
  const maxWait = options?.maxWait;

  function invokeFunc(time: number) {
    const args = lastArgs!;
    lastArgs = undefined;
    lastInvokeTime = time;
    result = func(...args);
    return result;
  }

  function leadingEdge(time: number) {
    lastInvokeTime = time;
    timeoutId = setTimeout(timerExpired, delay);
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time: number) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = delay - timeSinceLastCall;

    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time: number) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === 0 ||
      timeSinceLastCall >= delay ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }

  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timeoutId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time: number) {
    timeoutId = null;

    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = undefined;
    return result;
  }

  function cancel() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    if (maxTimeoutId !== null) {
      clearTimeout(maxTimeoutId);
    }
    lastInvokeTime = 0;
    lastArgs = undefined;
    lastCallTime = 0;
    timeoutId = null;
    maxTimeoutId = null;
  }

  function debounced(...args: Parameters<T>) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastCallTime = time;

    if (isInvoking) {
      if (timeoutId === null) {
        return leadingEdge(lastCallTime);
      }
      if (maxWait !== undefined) {
        timeoutId = setTimeout(timerExpired, delay);
        return invokeFunc(lastCallTime);
      }
    }
    if (timeoutId === null) {
      timeoutId = setTimeout(timerExpired, delay);
    }
    return result;
  }

  debounced.cancel = cancel;
  return debounced;
}

/**
 * Throttle function - limits execution to once per delay milliseconds
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options?: {
    leading?: boolean;
    trailing?: boolean;
  }
): (...args: Parameters<T>) => void {
  return debounce(func, delay, {
    leading: options?.leading ?? true,
    trailing: options?.trailing ?? true,
    maxWait: delay
  });
}

/**
 * React hook for debouncing a value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * React hook for debouncing a value with additional control
 */
export function useDebouncedValue<T>(
  initialValue: T,
  delay: number
): [T, (value: T) => void, T] {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return [debouncedValue, setValue, value];
}

/**
 * React hook for debouncing a callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay]
  );
}

/**
 * React hook for throttling a callback function
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const callbackRef = useRef(callback);
  const lastCallRef = useRef(0);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callbackRef.current(...args);
      }
    }) as T,
    [delay]
  );
}

/**
 * LRU Cache implementation
 */
export class LRUCache<T> {
  private cache = new Map<string, { value: T; timestamp?: number }>();
  private maxSize: number;
  private ttl?: number;

  constructor(maxSize: number, ttl?: number) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;

    // Check TTL
    if (this.ttl && item.timestamp && Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.value;
  }

  set(key: string, value: T): void {
    // Remove if exists
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    // Add new item
    this.cache.set(key, {
      value,
      timestamp: this.ttl ? Date.now() : undefined
    });
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

/**
 * Memoization utility for expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options?: {
    getKey?: (...args: Parameters<T>) => string;
    cache?: LRUCache<ReturnType<T>>;
    ttl?: number;
  }
): T {
  const cache = options?.cache || new LRUCache<ReturnType<T>>(100, options?.ttl);
  
  return ((...args: Parameters<T>) => {
    const key = options?.getKey ? options.getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Async memoization utility
 */
export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: {
    getKey?: (...args: Parameters<T>) => string;
    cache?: LRUCache<ReturnType<T>>;
    ttl?: number;
  }
): T {
  const cache = options?.cache || new LRUCache<ReturnType<T>>(100, options?.ttl);
  const pendingCache = new Map<string, ReturnType<T>>();
  
  return (async (...args: Parameters<T>) => {
    const key = options?.getKey ? options.getKey(...args) : JSON.stringify(args);
    
    // Return cached result
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    // Return pending promise
    if (pendingCache.has(key)) {
      return pendingCache.get(key)!;
    }
    
    // Create new promise
    const promise = fn(...args).catch((error) => {
      // Remove failed promise from pending cache
      pendingCache.delete(key);
      throw error;
    });
    
    pendingCache.set(key, promise);
    
    try {
      const result = await promise;
      cache.set(key, result);
      pendingCache.delete(key);
      return result;
    } catch (error) {
      pendingCache.delete(key);
      throw error;
    }
  }) as T;
}

/**
 * React hook for memoizing expensive computations with dependencies
 */
export function useExpensiveComputation<T>(
  computation: () => T,
  deps: React.DependencyList
): T {
  const [value, setValue] = useState<T>(() => computation());
  const depsRef = useRef(deps);

  useEffect(() => {
    // Check if dependencies have changed
    const hasChanged = deps.some((dep, index) => dep !== depsRef.current[index]);
    
    if (hasChanged) {
      setValue(computation());
      depsRef.current = deps;
    }
  }, deps);

  return value;
}