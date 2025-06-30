import { useEffect } from 'react';

const LoadingFallback = () => {
    useEffect(() => {
        // React가 렌더링된 후 초기 로더 제거
        const initialLoader = document.getElementById('initial-loader');
        if (initialLoader) {
            // 부드러운 페이드아웃
            initialLoader.style.transition = 'opacity 0.3s ease-out';
            initialLoader.style.opacity = '0';

            setTimeout(() => {
                try {
                    initialLoader.remove();
                } catch (e) {
                    // 이미 제거된 경우 무시
                }
            }, 300);
        }
    }, []);

    return null; // 실제로 렌더링하지 않음
};

export default LoadingFallback; 