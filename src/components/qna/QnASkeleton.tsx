import { Skeleton } from "@/components/ui/skeleton";

const QnAItemSkeleton = () => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <Skeleton className="w-16 h-6 bg-gray-200 rounded-full" />
                        <Skeleton className="w-20 h-6 bg-gray-200 rounded-full" />
                    </div>
                    <Skeleton className="h-6 w-3/4 bg-gray-200 mb-2" />
                    <Skeleton className="h-4 w-24 bg-gray-200" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="w-8 h-8 bg-gray-200 rounded" />
                    <Skeleton className="w-8 h-8 bg-gray-200 rounded" />
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <Skeleton className="h-4 w-full bg-gray-200" />
                <Skeleton className="h-4 w-5/6 bg-gray-200" />
                <Skeleton className="h-4 w-3/4 bg-gray-200" />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <Skeleton className="h-4 w-32 bg-gray-200" />
                <Skeleton className="h-8 w-20 bg-gray-200 rounded" />
            </div>
        </div>
    );
};

const QnAStatsSkeleton = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            {Array(3).fill(0).map((_, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Skeleton className="h-4 w-16 bg-gray-200 mb-2" />
                            <Skeleton className="h-8 w-12 bg-gray-200" />
                        </div>
                        <Skeleton className="w-8 h-8 bg-gray-200 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
};

const QnASkeleton = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 md:py-20">
                <div className="container mx-auto px-4 text-center">
                    <Skeleton className="h-12 w-64 mx-auto mb-6 bg-blue-800" />
                    <Skeleton className="h-6 w-96 mx-auto bg-blue-800" />
                </div>
            </section>

            {/* Main Content */}
            <section className="py-8 md:py-20">
                <div className="container mx-auto px-4 max-w-6xl">
                    {/* Stats Skeleton */}
                    <QnAStatsSkeleton />

                    {/* Filters Skeleton */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 mb-6 md:mb-8">
                        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                            <div className="flex flex-col md:flex-row gap-4">
                                <Skeleton className="h-10 w-64 bg-gray-200 rounded" />
                                <Skeleton className="h-10 w-32 bg-gray-200 rounded" />
                            </div>
                            <Skeleton className="h-10 w-24 bg-gray-200 rounded" />
                        </div>
                    </div>

                    {/* QnA Items Skeleton */}
                    <div className="space-y-4 md:space-y-6">
                        {Array(5).fill(0).map((_, index) => (
                            <QnAItemSkeleton key={index} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default QnASkeleton; 