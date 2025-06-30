import { Skeleton } from "@/components/ui/skeleton";

const PageSkeleton = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* 헤더 스켈레톤 */}
            <div className="border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-8 w-32 bg-gray-200" />
                        <div className="hidden md:flex space-x-6">
                            {Array(6).fill(0).map((_, i) => (
                                <Skeleton key={i} className="h-6 w-16 bg-gray-200" />
                            ))}
                        </div>
                        <Skeleton className="h-8 w-8 bg-gray-200 rounded" />
                    </div>
                </div>
            </div>

            {/* 히어로 섹션 스켈레톤 */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-20">
                <div className="container mx-auto px-4 text-center">
                    <Skeleton className="h-12 w-96 mx-auto mb-6 bg-blue-800" />
                    <Skeleton className="h-6 w-2/3 mx-auto bg-blue-800" />
                </div>
            </div>

            {/* 콘텐츠 영역 스켈레톤 */}
            <div className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array(6).fill(0).map((_, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                                <Skeleton className="w-full h-48 bg-gray-200" />
                                <div className="p-6 space-y-4">
                                    <Skeleton className="h-6 w-3/4 bg-gray-200" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-full bg-gray-200" />
                                        <Skeleton className="h-4 w-5/6 bg-gray-200" />
                                        <Skeleton className="h-4 w-4/6 bg-gray-200" />
                                    </div>
                                    <div className="flex justify-between items-center pt-4">
                                        <Skeleton className="h-5 w-20 bg-gray-200" />
                                        <Skeleton className="h-9 w-24 bg-gray-200 rounded" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 푸터 스켈레톤 */}
            <div className="bg-gray-800 py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {Array(4).fill(0).map((_, i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="h-6 w-24 bg-gray-700" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32 bg-gray-700" />
                                    <Skeleton className="h-4 w-28 bg-gray-700" />
                                    <Skeleton className="h-4 w-36 bg-gray-700" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageSkeleton; 