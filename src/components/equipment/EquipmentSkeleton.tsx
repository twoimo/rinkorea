import { Skeleton } from "@/components/ui/skeleton";

const EquipmentCardSkeleton = () => {
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
            <Skeleton className="w-full h-64 bg-gray-200" />
            <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Skeleton className="w-8 h-8 bg-gray-200 rounded" />
                    <Skeleton className="h-6 w-3/4 bg-gray-200" />
                </div>
                <div className="space-y-2 mb-4">
                    <Skeleton className="h-4 w-full bg-gray-200" />
                    <Skeleton className="h-4 w-5/6 bg-gray-200" />
                    <Skeleton className="h-4 w-4/6 bg-gray-200" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full bg-gray-200" />
                    <Skeleton className="h-4 w-3/4 bg-gray-200" />
                </div>
            </div>
        </div>
    );
};

const PartnershipSkeleton = () => {
    return (
        <section className="py-12 md:py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                    <div className="w-full md:w-1/2">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4">
                            <Skeleton className="w-8 h-8 bg-gray-200 rounded mr-3 mb-2 sm:mb-0" />
                            <Skeleton className="h-8 w-64 bg-gray-200" />
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full bg-gray-200" />
                                <Skeleton className="h-4 w-5/6 bg-gray-200" />
                                <Skeleton className="h-4 w-4/6 bg-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full bg-gray-200" />
                                <Skeleton className="h-4 w-3/4 bg-gray-200" />
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-1/2">
                        <Skeleton className="w-full h-64 bg-gray-200 rounded-lg" />
                    </div>
                </div>
            </div>
        </section>
    );
};

const TabsSkeleton = () => {
    return (
        <div className="flex justify-center mb-8 md:mb-12">
            <div className="flex bg-gray-100 p-1 rounded-lg">
                <Skeleton className="h-10 w-32 bg-gray-200 rounded mr-1" />
                <Skeleton className="h-10 w-24 bg-gray-200 rounded" />
            </div>
        </div>
    );
};

const EquipmentSkeleton = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <Skeleton className="h-12 w-96 mx-auto mb-6 bg-blue-800" />
                        <Skeleton className="h-6 w-2/3 mx-auto bg-blue-800" />
                    </div>
                </div>
            </section>

            {/* Partnership Section */}
            <PartnershipSkeleton />

            {/* Tabs */}
            <section className="py-8 md:py-12">
                <div className="container mx-auto px-4">
                    <TabsSkeleton />

                    {/* Equipment Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {Array(6).fill(0).map((_, index) => (
                            <EquipmentCardSkeleton key={index} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default EquipmentSkeleton; 