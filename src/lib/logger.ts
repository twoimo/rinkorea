// Logger utility to replace console statements
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
    level: LogLevel;
    enableProduction: boolean;
}

class Logger {
    private config: LoggerConfig;

    constructor(config: LoggerConfig = {
        level: 'debug',
        enableProduction: false
    }) {
        this.config = config;
    }

    private shouldLog(level: LogLevel): boolean {
        if (process.env.NODE_ENV === 'production' && !this.config.enableProduction) {
            return false;
        }

        const levels = ['debug', 'info', 'warn', 'error'];
        return levels.indexOf(level) >= levels.indexOf(this.config.level);
    }

    debug(message: string, ...args: unknown[]): void {
        if (this.shouldLog('debug')) {
            console.warn(`🔍 [DEBUG] ${message}`, ...args);
        }
    }

    info(message: string, ...args: unknown[]): void {
        if (this.shouldLog('info')) {
            console.warn(`ℹ️ [INFO] ${message}`, ...args);
        }
    }

    warn(message: string, ...args: unknown[]): void {
        if (this.shouldLog('warn')) {
            console.warn(`⚠️ [WARN] ${message}`, ...args);
        }
    }

    error(message: string, ...args: unknown[]): void {
        if (this.shouldLog('error')) {
            console.error(`❌ [ERROR] ${message}`, ...args);
        }
    }

    // Performance logging
    performance(name: string, value: number): void {
        if (this.shouldLog('debug')) {
            console.warn(`📊 [PERF] ${name}: ${value.toFixed(2)}ms`);
        }
    }

    // General log method
    log(message: string, data?: unknown): void {
        if (this.shouldLog('warn')) {
            const timestamp = new Date().toISOString();
            const logMessage = `[${timestamp}] [LOG] ${message}`;

            if (data) {
                console.warn(logMessage, data);
            } else {
                console.warn(logMessage);
            }
        }
    }

    logPerformanceMetric(metric: string, value: number, unit = 'ms'): void {
        if (this.shouldLog('warn')) {
            const message = `Performance: ${metric} = ${value}${unit}`;
            console.warn(`📊 [PERF] ${message}`);
        }
    }

    logQuery(query: string, variables: unknown): void {
        if (this.shouldLog('warn')) {
            console.warn('[SUPABASE]', {
                query,
                variables,
                timestamp: new Date().toISOString()
            });
        }
    }
}

// Export singleton instance
export const logger = new Logger({
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    enableProduction: false
});

export default logger; 