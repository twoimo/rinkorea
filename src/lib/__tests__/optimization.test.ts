import { vi } from 'vitest';
import { 
  LRUCache, 
  memoize, 
  memoizeAsync, 
  debounce, 
  throttle 
} from '../optimization';

describe('Optimization Utilities', () => {
  describe('LRUCache', () => {
    let cache: LRUCache<string>;

    beforeEach(() => {
      cache = new LRUCache<string>(3);
    });

    it('should store and retrieve values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return undefined for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('should respect max size and evict oldest items', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      cache.set('key4', 'value4'); // Should evict key1

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
      expect(cache.get('key4')).toBe('value4');
    });

    it('should update LRU order on access', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      
      // Access key1 to make it most recently used
      cache.get('key1');
      
      // Add key4, should evict key2 (oldest)
      cache.set('key4', 'value4');

      expect(cache.get('key1')).toBe('value1'); // Still exists
      expect(cache.get('key2')).toBeUndefined(); // Evicted
      expect(cache.get('key3')).toBe('value3');
      expect(cache.get('key4')).toBe('value4');
    });

    it('should handle TTL expiration', (done) => {
      cache.set('key1', 'value1', 50); // 50ms TTL

      expect(cache.get('key1')).toBe('value1');
      expect(cache.has('key1')).toBe(true);

      setTimeout(() => {
        expect(cache.get('key1')).toBeUndefined();
        expect(cache.has('key1')).toBe(false);
        done();
      }, 60);
    });

    it('should delete items', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
      
      cache.delete('key1');
      expect(cache.has('key1')).toBe(false);
    });

    it('should clear all items', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      expect(cache.size).toBe(2);
      
      cache.clear();
      expect(cache.size).toBe(0);
      expect(cache.get('key1')).toBeUndefined();
    });
  });

  describe('memoize', () => {
    it('should cache function results', () => {
      const fn = vi.fn((x: number) => x * 2);
      const memoizedFn = memoize(fn);

      const result1 = memoizedFn(5);
      const result2 = memoizedFn(5);

      expect(result1).toBe(10);
      expect(result2).toBe(10);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should use custom key function', () => {
      const fn = vi.fn((obj: { id: number; name: string }) => obj.name.toUpperCase());
      const memoizedFn = memoize(fn, {
        getKey: (obj) => obj.id.toString()
      });

      const result1 = memoizedFn({ id: 1, name: 'test' });
      const result2 = memoizedFn({ id: 1, name: 'different' }); // Same ID, should use cache

      expect(result1).toBe('TEST');
      expect(result2).toBe('TEST'); // Cached result
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should respect TTL', (done) => {
      const fn = vi.fn((x: number) => x * 2);
      const memoizedFn = memoize(fn, { ttl: 50 });

      memoizedFn(5);
      expect(fn).toHaveBeenCalledTimes(1);

      setTimeout(() => {
        memoizedFn(5); // Should call function again after TTL
        expect(fn).toHaveBeenCalledTimes(2);
        done();
      }, 60);
    });

    it('should use custom cache', () => {
      const customCache = new LRUCache<number>(1);
      const fn = vi.fn((x: number) => x * 2);
      const memoizedFn = memoize(fn, { cache: customCache });

      memoizedFn(1);
      memoizedFn(2); // Should evict result for 1
      memoizedFn(1); // Should call function again

      expect(fn).toHaveBeenCalledTimes(3);
    });
  });

  describe('memoizeAsync', () => {
    it('should cache async function results', async () => {
      const fn = vi.fn(async (x: number) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return x * 2;
      });
      const memoizedFn = memoizeAsync(fn);

      const result1 = await memoizedFn(5);
      const result2 = await memoizedFn(5);

      expect(result1).toBe(10);
      expect(result2).toBe(10);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should handle async function errors', async () => {
      const fn = vi.fn(async () => {
        throw new Error('Test error');
      });
      const memoizedFn = memoizeAsync(fn);

      await expect(memoizedFn()).rejects.toThrow('Test error');
      await expect(memoizedFn()).rejects.toThrow('Test error');

      // Should call function twice because error results are not cached
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should remove failed promises from cache', async () => {
      let shouldFail = true;
      const fn = vi.fn(async (x: number) => {
        if (shouldFail) {
          throw new Error('Test error');
        }
        return x * 2;
      });
      const memoizedFn = memoizeAsync(fn);

      // First call fails
      await expect(memoizedFn(5)).rejects.toThrow('Test error');

      // Second call should succeed
      shouldFail = false;
      const result = await memoizedFn(5);

      expect(result).toBe(10);
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should delay function execution', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should cancel previous calls', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should support leading edge execution', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100, { leading: true, trailing: false });

      debouncedFn();
      expect(fn).toHaveBeenCalledTimes(1);

      debouncedFn();
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1); // No trailing call
    });

    it('should support trailing edge execution', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100, { trailing: true });

      debouncedFn();
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should support maxWait option', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100, { maxWait: 200 });

      debouncedFn();
      vi.advanceTimersByTime(50);
      debouncedFn();
      vi.advanceTimersByTime(50);
      debouncedFn();
      vi.advanceTimersByTime(50);
      debouncedFn();
      vi.advanceTimersByTime(50);

      // Should have been called due to maxWait
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should be cancellable', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn.cancel();

      vi.advanceTimersByTime(100);
      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should limit function execution rate', () => {
      const fn = vi.fn();
      const throttledFn = throttle(fn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(fn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(2); // Trailing call
    });

    it('should support leading edge execution', () => {
      const fn = vi.fn();
      const throttledFn = throttle(fn, 100, { leading: true });

      throttledFn();
      expect(fn).toHaveBeenCalledTimes(1);

      throttledFn();
      throttledFn();
      expect(fn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should support disabling leading edge', () => {
      const fn = vi.fn();
      const throttledFn = throttle(fn, 100, { leading: false });

      throttledFn();
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});