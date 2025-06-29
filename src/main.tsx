import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { logger } from './lib/logger';
import ErrorBoundary from './components/error-boundary';

// Service Worker 등록 (더 안전하게)
const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            logger.log('SW registered successfully', registration);
        } catch (error) {
            // Service Worker 실패해도 앱은 정상 작동
            console.warn('SW registration failed:', error);
        }
    }
};

// DOM이 준비되었는지 확인
const ensureDOM = (): Promise<void> => {
    return new Promise((resolve) => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => resolve());
        } else {
            resolve();
        }
    });
};

// 전역 에러 핸들러
const setupGlobalErrorHandlers = () => {
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        logger.error('Global error:', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        logger.error('Unhandled promise rejection:', event.reason);
    });
};

// 안전한 앱 렌더링
const renderApp = async () => {
    try {
        await ensureDOM();
        setupGlobalErrorHandlers();

        const rootElement = document.getElementById("root");
        if (!rootElement) {
            throw new Error("Root element not found");
        }

        const root = ReactDOM.createRoot(rootElement);

        root.render(
            <React.StrictMode>
                <ErrorBoundary>
                    <App />
                </ErrorBoundary>
            </React.StrictMode>
        );

        // Service Worker는 앱 렌더링 후에 등록 (논블로킹)
        setTimeout(registerServiceWorker, 100);

    } catch (error) {
        console.error('Failed to render app:', error);

        // 기본 폴백 UI 표시
        const rootElement = document.getElementById("root");
        if (rootElement) {
            rootElement.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; background-color: #f8fafc;">
                    <div style="max-width: 400px; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
                        <div style="width: 64px; height: 64px; margin: 0 auto 1.5rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <div style="color: white; font-size: 24px; font-weight: bold;">R</div>
                        </div>
                        <h1 style="color: #1e293b; margin-bottom: 0.5rem; font-size: 1.5rem; font-weight: 600;">린코리아</h1>
                        <p style="color: #64748b; margin-bottom: 1.5rem; line-height: 1.5;">
                            페이지를 로드하고 있습니다.<br>
                            잠시만 기다려 주세요.
                        </p>
                        <div style="margin: 1.5rem 0;">
                            <div style="width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top: 3px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                        </div>
                        <button onclick="window.location.reload()" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s; width: 100%;">
                            새로고침
                        </button>
                    </div>
                </div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    button:hover {
                        transform: translateY(-1px);
                        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                    }
                </style>
            `;
        }

        // 5초 후 자동 새로고침
        setTimeout(() => {
            window.location.reload();
        }, 5000);
    }
};

// 앱 시작
renderApp();

// 성능 모니터링 (에러가 발생해도 앱에 영향 없도록)
if (import.meta.env.PROD) {
    try {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'largest-contentful-paint') {
                        logger.log('LCP', entry.startTime);
                    }
                    if (entry.entryType === 'first-input') {
                        logger.log('FID', entry.processingStart - entry.startTime);
                    }
                    if (entry.entryType === 'layout-shift' && 'value' in entry) {
                        logger.log('CLS', (entry as any).value);
                    }
                }
            });

            observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
        }
    } catch (error) {
        console.warn('Performance monitoring failed:', error);
    }
}
