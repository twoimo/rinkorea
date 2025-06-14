import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
    className?: string;
    size?: "sm" | "md" | "lg";
}

export const LoadingSpinner = ({ className, size = "md" }: LoadingSpinnerProps) => {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12",
    };

    return (
        <div
            className={cn(
                "animate-spin rounded-full border-4 border-gray-200 border-t-blue-600",
                sizeClasses[size],
                className
            )}
            role="status"
            aria-label="Loading"
        />
    );
}; 