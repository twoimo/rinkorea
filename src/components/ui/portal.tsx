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

    return createPortal(
        children,
        container || document.body
    );
}

export default Portal; 