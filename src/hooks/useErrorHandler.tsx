import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { errorHandler, type AppError, ErrorType, ErrorSeverity } from '@/lib/errorHandler';
import { NotificationContainer } from '@/components/ErrorNotification';

interface ErrorContextType {
  errors: AppError[];
  addError: (error: AppError) => void;
  removeError: (errorId: string) => void;
  clearErrors: () => void;
  retryError: (errorId: string) => void;
  createAndAddError: (
    type: ErrorType,
    message: string,
    userMessage: string,
    severity?: ErrorSeverity,
    details?: any,
    context?: AppError['context']
  ) => AppError;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
  maxErrors?: number;
  showNotifications?: boolean;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({
  children,
  maxErrors = 10,
  showNotifications = true
}) => {
  const [errors, setErrors] = useState<AppError[]>([]);
  const [retryCallbacks, setRetryCallbacks] = useState<Map<string, () => void>>(new Map());

  const addError = useCallback((error: AppError) => {
    setErrors(prev => {
      const newErrors = [error, ...prev.filter(e => e.id !== error.id)];
      return newErrors.slice(0, maxErrors);
    });
  }, [maxErrors]);

  const removeError = useCallback((errorId: string) => {
    setErrors(prev => prev.filter(e => e.id !== errorId));
    setRetryCallbacks(prev => {
      const newMap = new Map(prev);
      newMap.delete(errorId);
      return newMap;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
    setRetryCallbacks(new Map());
  }, []);

  const retryError = useCallback(async (errorId: string) => {
    const error = errors.find(e => e.id === errorId);
    if (!error || !error.retryable) return;

    const retryCallback = retryCallbacks.get(errorId);
    if (retryCallback) {
      try {
        await retryCallback();
        removeError(errorId);
      } catch (retryError) {
        // 재시도 실패 시 오류 업데이트
        const updatedError = {
          ...error,
          retryCount: (error.retryCount || 0) + 1,
          timestamp: new Date()
        };
        
        if (updatedError.retryCount >= (updatedError.maxRetries || 3)) {
          updatedError.retryable = false;
          updatedError.userMessage = '최대 재시도 횟수를 초과했습니다.';
        }
        
        setErrors(prev => prev.map(e => e.id === errorId ? updatedError : e));
      }
    }
  }, [errors, retryCallbacks, removeError]);

  const createAndAddError = useCallback((
    type: ErrorType,
    message: string,
    userMessage: string,
    severity?: ErrorSeverity,
    details?: any,
    context?: AppError['context']
  ) => {
    const error = errorHandler.createError(type, message, userMessage, severity, details, context);
    addError(error);
    return error;
  }, [addError]);

  const contextValue: ErrorContextType = {
    errors,
    addError,
    removeError,
    clearErrors,
    retryError,
    createAndAddError
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
      {showNotifications && (
        <NotificationContainer
          errors={errors}
          onRetry={retryError}
          onDismiss={removeError}
        />
      )}
    </ErrorContext.Provider>
  );
};

export const useErrorHandler = () => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useErrorHandler must be used within an ErrorProvider');
  }
  return context;
};

// 편의 훅들
export const useErrorNotification = () => {
  const { createAndAddError, removeError } = useErrorHandler();

  const showError = useCallback((
    type: ErrorType,
    message: string,
    userMessage: string,
    severity?: ErrorSeverity,
    details?: any
  ) => {
    return createAndAddError(type, message, userMessage, severity, details);
  }, [createAndAddError]);

  const showNetworkError = useCallback((message: string = '네트워크 연결을 확인해주세요.') => {
    return showError(ErrorType.NETWORK, 'Network error', message, ErrorSeverity.MEDIUM);
  }, [showError]);

  const showValidationError = useCallback((message: string) => {
    return showError(ErrorType.VALIDATION, 'Validation error', message, ErrorSeverity.LOW);
  }, [showError]);

  const showFileProcessingError = useCallback((fileName: string, details?: any) => {
    return showError(
      ErrorType.FILE_PROCESSING,
      `File processing failed: ${fileName}`,
      `"${fileName}" 파일 처리 중 오류가 발생했습니다.`,
      ErrorSeverity.MEDIUM,
      details
    );
  }, [showError]);

  const showDatabaseError = useCallback((operation: string) => {
    return showError(
      ErrorType.DATABASE,
      `Database operation failed: ${operation}`,
      '데이터베이스 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      ErrorSeverity.HIGH
    );
  }, [showError]);

  return {
    showError,
    showNetworkError,
    showValidationError,
    showFileProcessingError,
    showDatabaseError,
    removeError
  };
};

// 비동기 작업을 위한 훅
export const useAsyncError = () => {
  const { addError } = useErrorHandler();

  const executeWithErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    errorConfig: {
      type: ErrorType;
      userMessage: string;
      context?: AppError['context'];
    }
  ): Promise<T | null> => {
    try {
      return await operation();
    } catch (error) {
      const appError = error instanceof Error
        ? errorHandler.fromJSError(error, errorConfig.type, errorConfig.userMessage, errorConfig.context)
        : error as AppError;
      
      addError(appError);
      return null;
    }
  }, [addError]);

  return { executeWithErrorHandling };
};

// 재시도 가능한 작업을 위한 훅
export const useRetryableOperation = () => {
  const { addError, removeError } = useErrorHandler();
  const [retryCallbacks, setRetryCallbacks] = useState<Map<string, () => void>>(new Map());

  const executeRetryableOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    config: {
      operationName: string;
      errorType: ErrorType;
      userMessage: string;
      maxRetries?: number;
      onSuccess?: (result: T) => void;
      onFinalFailure?: (error: AppError) => void;
    }
  ): Promise<T | null> => {
    try {
      const result = await errorHandler.executeWithRetry(operation, {
        operationName: config.operationName,
        errorType: config.errorType,
        userMessage: config.userMessage
      });
      
      config.onSuccess?.(result);
      return result;
    } catch (error) {
      const appError = error as AppError;
      
      // 재시도 콜백 등록
      if (appError.retryable) {
        setRetryCallbacks(prev => {
          const newMap = new Map(prev);
          newMap.set(appError.id, () => executeRetryableOperation(operation, config));
          return newMap;
        });
      }
      
      addError(appError);
      config.onFinalFailure?.(appError);
      return null;
    }
  }, [addError, removeError]);

  return { executeRetryableOperation };
};

// 폼 검증을 위한 훅
export const useFormErrorHandler = () => {
  const { showValidationError } = useErrorNotification();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const setFieldError = useCallback((field: string, message: string) => {
    setFieldErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllFieldErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  const validateField = useCallback((field: string, value: any, validator: (value: any) => string | null) => {
    const error = validator(value);
    if (error) {
      setFieldError(field, error);
      return false;
    } else {
      clearFieldError(field);
      return true;
    }
  }, [setFieldError, clearFieldError]);

  const hasErrors = Object.keys(fieldErrors).length > 0;

  return {
    fieldErrors,
    setFieldError,
    clearFieldError,
    clearAllFieldErrors,
    validateField,
    hasErrors
  };
};