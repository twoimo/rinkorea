import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { logger } from './lib/logger'

// Register Service Worker for caching and offline functionality
if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                logger.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                logger.error('SW registration failed: ', registrationError);
            });
    });
}

// Preload critical resources
const preloadCriticalResources = () => {
    // Preload fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.as = 'font';
    fontLink.type = 'font/woff2';
    fontLink.crossOrigin = 'anonymous';
    document.head.appendChild(fontLink);

    // Preload critical images
    const logoImg = new Image();
    logoImg.src = '/images/rin-korea-logo-black.png';

    const logoWhiteImg = new Image();
    logoWhiteImg.src = '/images/rin-korea-logo-white.png';
};

// Optimize for performance
if (import.meta.env.PROD) {
    preloadCriticalResources();
}

// DOM이 로드되었는지 확인
const ensureDOM = () => {
    return new Promise<void>((resolve) => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => resolve());
        } else {
            resolve();
        }
    });
};

// 안전한 렌더링 함수
const renderApp = async () => {
    try {
        await ensureDOM();

        const rootElement = document.getElementById("root");
        if (!rootElement) {
            throw new Error("Root element not found");
        }

        const root = ReactDOM.createRoot(rootElement);

        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
    } catch (error) {
        console.error('Failed to render app:', error);
        // 폴백 렌더링
        document.body.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
        <div style="text-align: center;">
          <h1>Loading...</h1>
          <p>앱을 로드하는 중입니다...</p>
        </div>
      </div>
    `;
        // 재시도
        setTimeout(renderApp, 1000);
    }
};

// 앱 렌더링 시작
renderApp();

// Add performance monitoring
if (import.meta.env.PROD) {
    // Measure and log key web vitals
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'largest-contentful-paint') {
                    logger.log('LCP', entry);
                }
                if (entry.entryType === 'first-input') {
                    logger.log('FID', entry);
                }
                if (entry.entryType === 'layout-shift') {
                    logger.log('CLS', entry);
                }
            }
        });

        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    }
}
