import React from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
    children: React.ReactNode;
    container?: HTMLElement;
}

function Portal({ children, container }: PortalProps) {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) {
        return null;
    }

    // 컨테이너가 지정되지 않으면 body를 사용
    const targetContainer = container || document.body;

    // body가 존재하는지 확인
    if (!targetContainer) {
        console.warn('Portal: Target container not found');
        return null;
    }

    return createPortal(
        children,
        targetContainer
    );
}

export default Portal; 