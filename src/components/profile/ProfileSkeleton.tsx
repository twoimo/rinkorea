import { Skeleton } from "@/components/ui/skeleton";

const ProfileSkeleton = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Content */}
            <section className="container mx-auto px-4 py-12 sm:py-20">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8">
                        {/* Header */}
                        <div className="text-center mb-6 sm:mb-8">
                            <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full mx-auto mb-4" />
                            <Skeleton className="h-8 w-48 mx-auto mb-2 bg-gray-200" />
                            <Skeleton className="h-5 w-64 mx-auto bg-gray-200" />
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4 sm:space-y-6">
                            {/* Name */}
                            <div>
                                <Skeleton className="h-4 w-16 mb-1 bg-gray-200" />
                                <Skeleton className="h-10 w-full bg-gray-200 rounded-lg" />
                            </div>

                            {/* Email */}
                            <div>
                                <Skeleton className="h-4 w-16 mb-1 bg-gray-200" />
                                <Skeleton className="h-10 w-full bg-gray-200 rounded-lg" />
                            </div>

                            {/* Company */}
                            <div>
                                <Skeleton className="h-4 w-16 mb-1 bg-gray-200" />
                                <Skeleton className="h-10 w-full bg-gray-200 rounded-lg" />
                            </div>

                            {/* Phone */}
                            <div>
                                <Skeleton className="h-4 w-16 mb-1 bg-gray-200" />
                                <Skeleton className="h-10 w-full bg-gray-200 rounded-lg" />
                            </div>

                            {/* Password Section */}
                            <div className="border-t pt-4 sm:pt-6 mt-4 sm:mt-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <Skeleton className="w-5 h-5 bg-gray-200 rounded" />
                                    <Skeleton className="h-6 w-32 bg-gray-200" />
                                </div>

                                <div className="space-y-4">
                                    <Skeleton className="h-10 w-full bg-gray-200 rounded-lg" />
                                    <Skeleton className="h-10 w-full bg-gray-200 rounded-lg" />
                                    <Skeleton className="h-10 w-full bg-gray-200 rounded-lg" />
                                </div>

                                <div className="flex items-start gap-1 mt-2">
                                    <Skeleton className="w-4 h-4 bg-gray-200 rounded" />
                                    <Skeleton className="h-4 w-3/4 bg-gray-200" />
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-end mt-6 sm:mt-8">
                                <Skeleton className="h-12 w-full bg-gray-200 rounded-lg" />
                            </div>
                        </div>

                        {/* Account Deletion Section */}
                        <div className="border-t mt-8 sm:mt-12 pt-6 sm:pt-8">
                            <div className="flex items-center gap-2 mb-4">
                                <Skeleton className="w-5 h-5 bg-gray-200 rounded" />
                                <Skeleton className="h-6 w-24 bg-gray-200" />
                            </div>
                            <Skeleton className="h-4 w-full mb-2 bg-gray-200" />
                            <Skeleton className="h-4 w-3/4 mb-4 bg-gray-200" />
                            <Skeleton className="h-12 w-full bg-gray-200 rounded-lg" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ProfileSkeleton; 