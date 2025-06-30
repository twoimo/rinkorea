import { Skeleton } from "@/components/ui/skeleton";

const NewsCardSkeleton = () => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-6 space-y-4">
                {/* 제목 */}
                <Skeleton className="h-6 w-4/5 bg-gray-200" />

                {/* 내용 미리보기 */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full bg-gray-200" />
                    <Skeleton className="h-4 w-5/6 bg-gray-200" />
                    <Skeleton className="h-4 w-3/4 bg-gray-200" />
                </div>

                {/* 날짜와 버튼 영역 */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <Skeleton className="h-4 w-24 bg-gray-200" />
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-16 bg-gray-200 rounded" />
                        <Skeleton className="h-8 w-16 bg-gray-200 rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const NewsListSkeleton = () => {
    return (
        <div className="space-y-6">
            {Array(6).fill(0).map((_, index) => (
                <NewsCardSkeleton key={index} />
            ))}
        </div>
    );
};

export { NewsCardSkeleton, NewsListSkeleton }; 