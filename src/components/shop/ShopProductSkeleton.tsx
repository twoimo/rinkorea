import { Skeleton } from "@/components/ui/skeleton";

const ShopProductCardSkeleton = () => {
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
            {/* 이미지 스켈레톤 */}
            <div className="relative aspect-square w-full">
                <Skeleton className="w-full h-full bg-gray-200" />

                {/* 뱃지 영역 스켈레톤 */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <Skeleton className="w-12 h-6 bg-gray-300 rounded-full" />
                    <Skeleton className="w-10 h-6 bg-gray-300 rounded-full" />
                </div>
            </div>

            {/* 상품 정보 스켈레톤 */}
            <div className="p-4 sm:p-6 flex flex-col flex-grow">
                {/* 제품명 */}
                <div className="mb-3">
                    <Skeleton className="h-6 w-3/4 mb-2 bg-gray-200" />
                    <Skeleton className="h-4 w-full mb-1 bg-gray-200" />
                    <Skeleton className="h-4 w-2/3 bg-gray-200" />
                </div>

                {/* 평점 및 리뷰 */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <Skeleton className="w-4 h-4 bg-gray-200 rounded" />
                        <Skeleton className="w-8 h-4 bg-gray-200" />
                        <Skeleton className="w-12 h-4 bg-gray-200" />
                    </div>
                </div>

                {/* 가격 및 구매 버튼 */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-auto">
                    <div className="flex flex-col gap-1">
                        <Skeleton className="h-4 w-16 bg-gray-200" />
                        <Skeleton className="h-6 w-20 bg-gray-200" />
                    </div>
                    <Skeleton className="h-10 w-full sm:w-24 bg-gray-200 rounded-lg" />
                </div>
            </div>
        </div>
    );
};

const ShopProductGridSkeleton = ({ gridCols = 3 }: { gridCols?: number }) => {
    return (
        <div className={`grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-${Math.min(gridCols, 3)} lg:grid-cols-${gridCols}`}>
            {Array(gridCols * 3).fill(0).map((_, index) => (
                <ShopProductCardSkeleton key={index} />
            ))}
        </div>
    );
};

export { ShopProductCardSkeleton, ShopProductGridSkeleton }; 