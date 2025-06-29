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
            console.log(`🔍 [DEBUG] ${message}`, ...args);
        }
    }

    info(message: string, ...args: unknown[]): void {
        if (this.shouldLog('info')) {
            console.log(`ℹ️ [INFO] ${message}`, ...args);
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
            console.log(`📊 [PERF] ${name}: ${value.toFixed(2)}ms`);
        }
    }
}

// Export singleton instance
export const logger = new Logger({
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    enableProduction: false
});

export default logger; 