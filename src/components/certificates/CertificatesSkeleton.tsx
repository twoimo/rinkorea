import { Skeleton } from "@/components/ui/skeleton";

const CertificateCardSkeleton = () => {
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
            <Skeleton className="w-full h-64 bg-gray-200" />
            <div className="p-4">
                <Skeleton className="h-5 w-3/4 bg-gray-200 mb-2" />
                <Skeleton className="h-4 w-1/2 bg-gray-200" />
            </div>
        </div>
    );
};

const CertificateTypeSkeleton = () => {
    return (
        <div className="bg-white rounded-lg shadow-lg p-6 text-center border border-gray-100">
            <div className="flex justify-center mb-4">
                <Skeleton className="w-12 h-12 bg-gray-200 rounded-full" />
            </div>
            <Skeleton className="h-6 w-3/4 mx-auto mb-2 bg-gray-200" />
            <Skeleton className="h-4 w-1/2 mx-auto mb-3 bg-gray-200" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-gray-200" />
                <Skeleton className="h-4 w-5/6 mx-auto bg-gray-200" />
            </div>
        </div>
    );
};

const CertificatesSkeleton = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section Skeleton */}
            <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 sm:py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <Skeleton className="h-12 w-96 mx-auto mb-6 bg-blue-800" />
                        <Skeleton className="h-6 w-2/3 mx-auto bg-blue-800" />
                    </div>
                </div>
            </section>

            {/* Certificate Types Skeleton */}
            <section className="py-12 sm:py-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
                        {Array(3).fill(0).map((_, index) => (
                            <CertificateTypeSkeleton key={index} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Certificate Sections Skeleton */}
            <section className="py-12 sm:py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <Skeleton className="h-8 w-64 mx-auto mb-4 bg-gray-200" />
                        <Skeleton className="h-5 w-96 mx-auto bg-gray-200" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {Array(6).fill(0).map((_, index) => (
                            <CertificateCardSkeleton key={index} />
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-12 sm:py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <Skeleton className="h-8 w-80 mx-auto mb-4 bg-gray-200" />
                        <Skeleton className="h-5 w-2/3 mx-auto bg-gray-200" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                        {Array(10).fill(0).map((_, index) => (
                            <CertificateCardSkeleton key={index} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CertificatesSkeleton; 