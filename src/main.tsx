import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Service Worker temporarily disabled for debugging NO_FCP
// TODO: Re-enable after confirming basic rendering works
/*
if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
*/

// Render React app ONLY - disable all performance optimizations temporarily
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Performance optimizations temporarily disabled for debugging NO_FCP
// TODO: Re-enable gradually after confirming basic rendering works
/*
if (typeof window !== 'undefined') {
  setTimeout(() => {
    try {
      initPerformanceMonitoring();
      initImageOptimization();
    } catch (error) {
      console.warn('Performance optimization failed:', error);
    }
  }, 2000);
}
*/
