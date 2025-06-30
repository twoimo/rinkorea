import { Skeleton } from "@/components/ui/skeleton";

const ResourceCardSkeleton = () => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="w-10 h-10 bg-gray-200 rounded" />
                    <div className="flex-1">
                        <Skeleton className="h-5 w-3/4 bg-gray-200 mb-2" />
                        <Skeleton className="h-4 w-1/2 bg-gray-200" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Skeleton className="w-8 h-8 bg-gray-200 rounded" />
                    <Skeleton className="w-8 h-8 bg-gray-200 rounded" />
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <Skeleton className="h-4 w-full bg-gray-200" />
                <Skeleton className="h-4 w-5/6 bg-gray-200" />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 bg-gray-200 rounded" />
                    <Skeleton className="h-4 w-16 bg-gray-200" />
                </div>
                <Skeleton className="h-8 w-20 bg-gray-200 rounded" />
            </div>
        </div>
    );
};

const CategoryTabsSkeleton = () => {
    return (
        <div className="flex flex-wrap gap-2 mb-6">
            {Array(5).fill(0).map((_, index) => (
                <Skeleton key={index} className="h-10 w-24 bg-gray-200 rounded-lg" />
            ))}
        </div>
    );
};

const ResourcesSkeleton = () => {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 md:py-20">
                <div className="container mx-auto px-4 text-center">
                    <Skeleton className="h-12 w-64 mx-auto mb-6 bg-blue-800" />
                    <Skeleton className="h-6 w-96 mx-auto bg-blue-800" />
                </div>
            </section>

            {/* Main Content */}
            <section className="py-6 md:py-12 lg:py-20">
                <div className="container mx-auto px-4 max-w-7xl">
                    {/* Category Tabs Skeleton */}
                    <CategoryTabsSkeleton />

                    {/* Resources Grid Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array(9).fill(0).map((_, index) => (
                            <ResourceCardSkeleton key={index} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ResourcesSkeleton;
