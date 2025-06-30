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