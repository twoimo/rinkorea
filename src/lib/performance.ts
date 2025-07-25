/**
 * Performance monitoring utilities
 */

export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface PerformanceReport {
  metrics: PerformanceMetric[];
  totalDuration: number;
  averageDuration: number;
  slowestOperation: PerformanceMetric | null;
  fastestOperation: PerformanceMetric | null;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private completedMetrics: PerformanceMetric[] = [];

  /**
   * Start measuring performance for an operation
   */
  start(name: string, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata
    };
    
    this.metrics.set(name, metric);
  }

  /**
   * End measuring performance for an operation
   */
  end(name: string): number | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" not found`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    const completedMetric: PerformanceMetric = {
      ...metric,
      endTime,
      duration
    };

    this.completedMetrics.push(completedMetric);
    this.metrics.delete(name);

    return duration;
  }

  /**
   * Measure a function execution time
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T> | T,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.start(name, metadata);
    try {
      const result = await fn();
      return result;
    } finally {
      this.end(name);
    }
  }

  /**
   * Get performance report
   */
  getReport(): PerformanceReport {
    if (this.completedMetrics.length === 0) {
      return {
        metrics: [],
        totalDuration: 0,
        averageDuration: 0,
        slowestOperation: null,
        fastestOperation: null
      };
    }

    const totalDuration = this.completedMetrics.reduce(
      (sum, metric) => sum + (metric.duration || 0),
      0
    );

    const averageDuration = totalDuration / this.completedMetrics.length;

    const slowestOperation = this.completedMetrics.reduce((slowest, current) =>
      (current.duration || 0) > (slowest.duration || 0) ? current : slowest
    );

    const fastestOperation = this.completedMetrics.reduce((fastest, current) =>
      (current.duration || 0) < (fastest.duration || 0) ? current : fastest
    );

    return {
      metrics: [...this.completedMetrics],
      totalDuration,
      averageDuration,
      slowestOperation,
      fastestOperation
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
    this.completedMetrics = [];
  }

  /**
   * Get metrics by name pattern
   */
  getMetricsByPattern(pattern: RegExp): PerformanceMetric[] {
    return this.completedMetrics.filter(metric => pattern.test(metric.name));
  }

  /**
   * Log performance report to console
   */
  logReport(): void {
    const report = this.getReport();
    
    console.group('Performance Report');
    console.log(`Total operations: ${report.metrics.length}`);
    console.log(`Total duration: ${report.totalDuration.toFixed(2)}ms`);
    console.log(`Average duration: ${report.averageDuration.toFixed(2)}ms`);
    
    if (report.slowestOperation) {
      console.log(`Slowest: ${report.slowestOperation.name} (${report.slowestOperation.duration?.toFixed(2)}ms)`);
    }
    
    if (report.fastestOperation) {
      console.log(`Fastest: ${report.fastestOperation.name} (${report.fastestOperation.duration?.toFixed(2)}ms)`);
    }
    
    console.table(
      report.metrics.map(metric => ({
        name: metric.name,
        duration: `${metric.duration?.toFixed(2)}ms`,
        metadata: JSON.stringify(metric.metadata || {})
      }))
    );
    
    console.groupEnd();
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Performance decorator for methods
 */
export function measurePerformance(name?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const metricName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      return performanceMonitor.measure(metricName, () => originalMethod.apply(this, args));
    };

    return descriptor;
  };
}

/**
 * React hook for measuring component render performance
 */
export function usePerformanceMonitor(componentName: string) {
  const renderCount = React.useRef(0);
  const startTime = React.useRef(performance.now());

  React.useEffect(() => {
    renderCount.current++;
    const endTime = performance.now();
    const duration = endTime - startTime.current;

    performanceMonitor.start(`${componentName}-render-${renderCount.current}`);
    performanceMonitor.end(`${componentName}-render-${renderCount.current}`);

    startTime.current = performance.now();
  });

  return {
    renderCount: renderCount.current,
    measure: (name: string, fn: () => void) => {
      performanceMonitor.measure(`${componentName}-${name}`, fn);
    }
  };
}

/**
 * Memory usage monitoring
 */
export function getMemoryUsage(): {
  used: number;
  total: number;
  percentage: number;
} | null {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
    };
  }
  return null;
}

/**
 * FPS monitoring
 */
export class FPSMonitor {
  private frames: number[] = [];
  private lastTime = performance.now();
  private animationId: number | null = null;

  start(): void {
    const measure = () => {
      const now = performance.now();
      const delta = now - this.lastTime;
      this.lastTime = now;

      const fps = 1000 / delta;
      this.frames.push(fps);

      // Keep only last 60 frames
      if (this.frames.length > 60) {
        this.frames.shift();
      }

      this.animationId = requestAnimationFrame(measure);
    };

    this.animationId = requestAnimationFrame(measure);
  }

  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  getAverageFPS(): number {
    if (this.frames.length === 0) return 0;
    return this.frames.reduce((sum, fps) => sum + fps, 0) / this.frames.length;
  }

  getCurrentFPS(): number {
    return this.frames[this.frames.length - 1] || 0;
  }
}

// Add React import for the hook
import React from 'react';