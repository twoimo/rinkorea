import { Skeleton } from "@/components/ui/skeleton";

const ProjectCardSkeleton = () => {
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
            {/* 이미지 스켈레톤 */}
            <Skeleton className="w-full h-64 bg-gray-200" />

            {/* 카드 본문 */}
            <div className="p-6 space-y-4">
                {/* 제목 */}
                <Skeleton className="h-6 w-4/5 bg-gray-200" />

                {/* 위치 */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 bg-gray-200 rounded" />
                    <Skeleton className="h-4 w-32 bg-gray-200" />
                </div>

                {/* 날짜 */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 bg-gray-200 rounded" />
                    <Skeleton className="h-4 w-24 bg-gray-200" />
                </div>

                {/* 설명 */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full bg-gray-200" />
                    <Skeleton className="h-4 w-5/6 bg-gray-200" />
                    <Skeleton className="h-4 w-3/4 bg-gray-200" />
                </div>

                {/* 기능들 */}
                <div className="flex flex-wrap gap-2 pt-2">
                    <Skeleton className="h-6 w-16 bg-gray-200 rounded-full" />
                    <Skeleton className="h-6 w-20 bg-gray-200 rounded-full" />
                    <Skeleton className="h-6 w-18 bg-gray-200 rounded-full" />
                </div>

                {/* 버튼 영역 */}
                <div className="flex gap-2 pt-4">
                    <Skeleton className="h-9 w-20 bg-gray-200 rounded" />
                    <Skeleton className="h-9 w-16 bg-gray-200 rounded" />
                </div>
            </div>
        </div>
    );
};

const ProjectsGridSkeleton = ({ category }: { category: 'construction' | 'other' }) => {
    if (category === 'construction') {
        return (
            <section className="py-12 sm:py-20">
                <div className="w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                        {Array(8).fill(0).map((_, index) => (
                            <ProjectCardSkeleton key={index} />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12 sm:py-20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12 sm:mb-16">
                    <Skeleton className="h-10 w-64 mx-auto mb-4 bg-gray-200" />
                    <Skeleton className="h-6 w-96 mx-auto bg-gray-200" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {Array(6).fill(0).map((_, index) => (
                        <ProjectCardSkeleton key={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export { ProjectCardSkeleton, ProjectsGridSkeleton }; 