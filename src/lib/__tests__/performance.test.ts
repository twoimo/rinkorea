import { vi } from 'vitest';
import { performanceMonitor, PerformanceMonitor, measure, startTimer, endTimer } from '../performance';

// Mock performance.now()
const mockPerformanceNow = vi.fn();
Object.defineProperty(global, 'performance', {
  value: {
    now: mockPerformanceNow
  }
});

describe('Performance Monitor', () => {
  beforeEach(() => {
    performanceMonitor.reset();
    mockPerformanceNow.mockClear();
  });

  describe('PerformanceMonitor', () => {
    it('should be a singleton', () => {
      const instance1 = PerformanceMonitor.getInstance();
      const instance2 = PerformanceMonitor.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should start and end timers correctly', () => {
      mockPerformanceNow.mockReturnValueOnce(100).mockReturnValueOnce(200);

      performanceMonitor.startTimer('test');
      const measurement = performanceMonitor.endTimer('test');

      expect(measurement).toEqual({
        name: 'test',
        startTime: 100,
        endTime: 200,
        duration: 100,
        metadata: undefined
      });
    });

    it('should handle timer that was never started', () => {
      const measurement = performanceMonitor.endTimer('nonexistent');
      expect(measurement).toBeNull();
    });

    it('should store measurements', () => {
      mockPerformanceNow.mockReturnValueOnce(100).mockReturnValueOnce(150);

      performanceMonitor.startTimer('test');
      performanceMonitor.endTimer('test');

      const measurements = performanceMonitor.getMeasurements();
      expect(measurements).toHaveLength(1);
      expect(measurements[0].name).toBe('test');
    });

    it('should filter measurements by name', () => {
      mockPerformanceNow
        .mockReturnValueOnce(100).mockReturnValueOnce(150)
        .mockReturnValueOnce(200).mockReturnValueOnce(250);

      performanceMonitor.startTimer('test1');
      performanceMonitor.endTimer('test1');
      performanceMonitor.startTimer('test2');
      performanceMonitor.endTimer('test2');

      const test1Measurements = performanceMonitor.getMeasurementsByName('test1');
      expect(test1Measurements).toHaveLength(1);
      expect(test1Measurements[0].name).toBe('test1');
    });

    it('should calculate statistics correctly', () => {
      mockPerformanceNow
        .mockReturnValueOnce(100).mockReturnValueOnce(150) // 50ms
        .mockReturnValueOnce(200).mockReturnValueOnce(300) // 100ms
        .mockReturnValueOnce(400).mockReturnValueOnce(450); // 50ms

      performanceMonitor.startTimer('test');
      performanceMonitor.endTimer('test');
      performanceMonitor.startTimer('test');
      performanceMonitor.endTimer('test');
      performanceMonitor.startTimer('test');
      performanceMonitor.endTimer('test');

      const stats = performanceMonitor.getStats('test');
      expect(stats).toEqual({
        count: 3,
        totalDuration: 200,
        avgDuration: 200 / 3,
        minDuration: 50,
        maxDuration: 100
      });
    });

    it('should return empty stats for non-existent measurements', () => {
      const stats = performanceMonitor.getStats('nonexistent');
      expect(stats).toEqual({
        count: 0,
        totalDuration: 0,
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0
      });
    });

    it('should clear measurements', () => {
      mockPerformanceNow.mockReturnValueOnce(100).mockReturnValueOnce(150);

      performanceMonitor.startTimer('test');
      performanceMonitor.endTimer('test');
      
      expect(performanceMonitor.getMeasurements()).toHaveLength(1);
      
      performanceMonitor.clearMeasurements();
      expect(performanceMonitor.getMeasurements()).toHaveLength(0);
    });

    it('should reset all data', () => {
      mockPerformanceNow.mockReturnValueOnce(100);

      performanceMonitor.startTimer('test');
      performanceMonitor.reset();

      expect(performanceMonitor.getMeasurements()).toHaveLength(0);
      // Timer should be cleared, so ending it should return null
      const measurement = performanceMonitor.endTimer('test');
      expect(measurement).toBeNull();
    });
  });

  describe('measure function', () => {
    it('should measure synchronous function execution', async () => {
      mockPerformanceNow.mockReturnValueOnce(100).mockReturnValueOnce(200);

      const testFn = jest.fn(() => 'result');
      const result = await measure('test', testFn);

      expect(result).toBe('result');
      expect(testFn).toHaveBeenCalled();

      const measurements = performanceMonitor.getMeasurements();
      expect(measurements).toHaveLength(1);
      expect(measurements[0].name).toBe('test');
      expect(measurements[0].duration).toBe(100);
    });

    it('should measure asynchronous function execution', async () => {
      mockPerformanceNow.mockReturnValueOnce(100).mockReturnValueOnce(300);

      const testFn = jest.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'async result';
      });

      const result = await measure('async-test', testFn);

      expect(result).toBe('async result');
      expect(testFn).toHaveBeenCalled();

      const measurements = performanceMonitor.getMeasurements();
      expect(measurements).toHaveLength(1);
      expect(measurements[0].name).toBe('async-test');
    });

    it('should handle function errors', async () => {
      mockPerformanceNow.mockReturnValueOnce(100).mockReturnValueOnce(200);

      const testFn = jest.fn(() => {
        throw new Error('Test error');
      });

      await expect(measure('error-test', testFn)).rejects.toThrow('Test error');

      const measurements = performanceMonitor.getMeasurements();
      expect(measurements).toHaveLength(1);
      expect(measurements[0].name).toBe('error-test');
    });

    it('should include metadata in measurements', async () => {
      mockPerformanceNow.mockReturnValueOnce(100).mockReturnValueOnce(200);

      const testFn = jest.fn(() => 'result');
      const metadata = { userId: '123', action: 'test' };

      await measure('test-with-metadata', testFn, metadata);

      const measurements = performanceMonitor.getMeasurements();
      expect(measurements[0].metadata).toEqual(metadata);
    });
  });

  describe('convenience functions', () => {
    it('should work with startTimer and endTimer functions', () => {
      mockPerformanceNow.mockReturnValueOnce(100).mockReturnValueOnce(200);

      startTimer('convenience-test');
      const measurement = endTimer('convenience-test');

      expect(measurement).not.toBeNull();
      expect(measurement?.name).toBe('convenience-test');
      expect(measurement?.duration).toBe(100);
    });

    it('should handle metadata in endTimer', () => {
      mockPerformanceNow.mockReturnValueOnce(100).mockReturnValueOnce(200);

      startTimer('metadata-test');
      const metadata = { test: true };
      const measurement = endTimer('metadata-test', metadata);

      expect(measurement?.metadata).toEqual(metadata);
    });
  });

  describe('options and thresholds', () => {
    it('should respect threshold settings', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      performanceMonitor.setOptions({ 
        logToConsole: true, 
        threshold: 50 
      });

      // Below threshold - should not log
      mockPerformanceNow.mockReturnValueOnce(100).mockReturnValueOnce(130);
      performanceMonitor.startTimer('below-threshold');
      performanceMonitor.endTimer('below-threshold');

      // Above threshold - should log
      mockPerformanceNow.mockReturnValueOnce(200).mockReturnValueOnce(300);
      performanceMonitor.startTimer('above-threshold');
      performanceMonitor.endTimer('above-threshold');

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('above-threshold: 100.00ms'),
        ''
      );

      consoleSpy.mockRestore();
    });
  });
});