import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

const initialState: ToastState = {
  toasts: []
};

let toastCount = 0;

export const useToast = () => {
  const [state, setState] = useState<ToastState>(initialState);

  const toast = useCallback(({ title, description, variant = 'default', duration = 5000 }: Omit<Toast, 'id'>) => {
    const id = (++toastCount).toString();
    const newToast: Toast = {
      id,
      title,
      description,
      variant,
      duration
    };

    setState((prevState) => ({
      ...prevState,
      toasts: [...prevState.toasts, newToast]
    }));

    // 자동으로 토스트 제거
    setTimeout(() => {
      setState((prevState) => ({
        ...prevState,
        toasts: prevState.toasts.filter(t => t.id !== id)
      }));
    }, duration);

    return id;
  }, []);

  const dismiss = useCallback((toastId: string) => {
    setState((prevState) => ({
      ...prevState,
      toasts: prevState.toasts.filter(t => t.id !== toastId)
    }));
  }, []);

  return {
    toast,
    dismiss,
    toasts: state.toasts
  };
};