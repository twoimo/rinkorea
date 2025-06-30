import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// DND 컴포넌트들을 lazy loading
const DndContext = lazy(() =>
    import('@dnd-kit/core').then(module => ({
        default: module.DndContext
    }))
);

const SortableContext = lazy(() =>
    import('@dnd-kit/sortable').then(module => ({
        default: module.SortableContext
    }))
);

// DND 관련 훅들과 유틸리티는 별도 lazy import
export const useDndKit = () => {
    return import('@dnd-kit/core').then(module => ({
        closestCenter: module.closestCenter,
        KeyboardSensor: module.KeyboardSensor,
        PointerSensor: module.PointerSensor,
        useSensor: module.useSensor,
        useSensors: module.useSensors
    }));
};

export const useSortableKit = () => {
    return import('@dnd-kit/sortable').then(module => ({
        sortableKeyboardCoordinates: module.sortableKeyboardCoordinates,
        verticalListSortingStrategy: module.verticalListSortingStrategy,
        useSortable: module.useSortable,
        arrayMove: module.arrayMove
    }));
};

export const useDndUtilities = () => {
    return import('@dnd-kit/utilities').then(module => ({
        CSS: module.CSS
    }));
};

// DND Provider 래퍼 컴포넌트
interface LazyDndProviderProps {
    children: React.ReactNode;
    onDragEnd?: (event: unknown) => void;
    [key: string]: unknown;
}

export const LazyDndProvider = ({ children, ...props }: LazyDndProviderProps) => {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center p-8">
                    <LoadingSpinner className="w-6 h-6" />
                    <span className="ml-2 text-sm text-gray-600">드래그 앤 드롭 기능 로딩 중...</span>
                </div>
            }
        >
            <DndContext {...props}>
                {children}
            </DndContext>
        </Suspense>
    );
};

// Sortable Provider 래퍼 컴포넌트
interface LazySortableProviderProps {
    children: React.ReactNode;
    items: string[];
    [key: string]: unknown;
}

export const LazySortableProvider = ({ children, ...props }: LazySortableProviderProps) => {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center p-4">
                    <LoadingSpinner className="w-4 h-4" />
                </div>
            }
        >
            <SortableContext {...props}>
                {children}
            </SortableContext>
        </Suspense>
    );
};

export default LazyDndProvider; 