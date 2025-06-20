import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
    className?: string;
    showCloseButton?: boolean;
    closeOnOverlayClick?: boolean;
    maxHeight?: string;
}

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    full: 'max-w-full mx-4'
};

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'lg',
    className,
    showCloseButton = true,
    closeOnOverlayClick = true,
    maxHeight = 'max-h-[90vh]'
}) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && closeOnOverlayClick) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[110] p-4"
            onClick={handleOverlayClick}
        >
            <div className={cn(
                "bg-white rounded-2xl shadow-2xl w-full",
                sizeClasses[size],
                maxHeight,
                "overflow-hidden flex flex-col",
                "transform transition-all duration-300 ease-out",
                "animate-in fade-in-0 zoom-in-95 duration-300",
                className
            )}>
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
                        {title && (
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 pr-4">
                                {title}
                            </h2>
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="group p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 flex-shrink-0"
                                aria-label="닫기"
                            >
                                <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

interface ModalHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ children, className }) => (
    <div className={cn("p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white", className)}>
        {children}
    </div>
);

interface ModalBodyProps {
    children: React.ReactNode;
    className?: string;
}

export const ModalBody: React.FC<ModalBodyProps> = ({ children, className }) => (
    <div className={cn("p-6 flex-1 overflow-y-auto", className)}>
        {children}
    </div>
);

interface ModalFooterProps {
    children: React.ReactNode;
    className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ children, className }) => (
    <div className={cn("p-6 border-t border-gray-100 bg-gray-50/50 flex-shrink-0", className)}>
        {children}
    </div>
);

interface FormFieldProps {
    label: string;
    children: React.ReactNode;
    required?: boolean;
    error?: string;
    className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
    label,
    children,
    required = false,
    error,
    className
}) => (
    <div className={cn("space-y-2", className)}>
        <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {children}
        {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                {error}
            </p>
        )}
    </div>
);

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
    error = false,
    className,
    ...props
}) => (
    <input
        className={cn(
            "w-full px-4 py-3 border rounded-lg text-base transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "hover:border-gray-400",
            error
                ? "border-red-300 bg-red-50"
                : "border-gray-300 bg-white",
            "disabled:bg-gray-100 disabled:cursor-not-allowed",
            className
        )}
        {...props}
    />
);

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: boolean;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
    error = false,
    className,
    ...props
}) => (
    <textarea
        className={cn(
            "w-full px-4 py-3 border rounded-lg text-base transition-all duration-200 resize-vertical",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "hover:border-gray-400",
            error
                ? "border-red-300 bg-red-50"
                : "border-gray-300 bg-white",
            "disabled:bg-gray-100 disabled:cursor-not-allowed",
            className
        )}
        {...props}
    />
);

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    error?: boolean;
}

export const FormSelect: React.FC<FormSelectProps> = ({
    error = false,
    className,
    children,
    ...props
}) => (
    <select
        className={cn(
            "w-full px-4 py-3 border rounded-lg text-base transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "hover:border-gray-400 bg-white",
            error
                ? "border-red-300 bg-red-50"
                : "border-gray-300",
            "disabled:bg-gray-100 disabled:cursor-not-allowed",
            className
        )}
        {...props}
    >
        {children}
    </select>
);

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
}

const buttonVariants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-800"
};

const buttonSizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
};

export const ActionButton: React.FC<ActionButtonProps> = ({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    children,
    className,
    ...props
}) => (
    <button
        className={cn(
            "rounded-lg font-medium transition-all duration-200 touch-manipulation",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transform hover:scale-105 active:scale-95",
            buttonVariants[variant],
            buttonSizes[size],
            variant === 'primary' && "focus:ring-blue-500",
            variant === 'danger' && "focus:ring-red-500",
            variant === 'secondary' && "focus:ring-gray-500",
            variant === 'ghost' && "focus:ring-gray-500",
            className
        )}
        disabled={disabled || loading}
        {...props}
    >
        {loading ? (
            <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                처리중...
            </div>
        ) : (
            children
        )}
    </button>
); 