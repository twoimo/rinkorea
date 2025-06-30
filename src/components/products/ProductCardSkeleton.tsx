import { Skeleton } from "@/components/ui/skeleton";

const ProductCardSkeleton = () => {
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
            {/* 이미지 스켈레톤 */}
            <Skeleton className="w-full h-48 bg-gray-200" />

            {/* 카드 본문 */}
            <div className="p-6 space-y-4">
                {/* 제품명 */}
                <Skeleton className="h-6 w-3/4 bg-gray-200" />

                {/* 설명 라인들 */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full bg-gray-200" />
                    <Skeleton className="h-4 w-5/6 bg-gray-200" />
                    <Skeleton className="h-4 w-4/6 bg-gray-200" />
                </div>

                {/* 가격/버튼 영역 */}
                <div className="flex justify-between items-center pt-4">
                    <Skeleton className="h-5 w-20 bg-gray-200" />
                    <Skeleton className="h-9 w-24 bg-gray-200 rounded-md" />
                </div>
            </div>
        </div>
    );
};

export default ProductCardSkeleton; 