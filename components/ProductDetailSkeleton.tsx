import React from 'react';

const ProductDetailSkeleton: React.FC = () => {
    return (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-10 animate-pulse">
            {/* Breadcrumbs Skeleton */}
            <div className="flex items-center mb-10 gap-3">
                <div className="h-2.5 bg-zinc-100 rounded-full w-12"></div>
                <div className="h-2 bg-zinc-50 rounded-full w-2"></div>
                <div className="h-2.5 bg-zinc-100 rounded-full w-20"></div>
                <div className="h-2 bg-zinc-50 rounded-full w-2"></div>
                <div className="h-2.5 bg-zinc-200 rounded-full w-32"></div>
            </div>

            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
                {/* Gallery Skeleton */}
                <div className="lg:w-[60%]">
                    <div className="flex flex-col-reverse lg:flex-row gap-6">
                        <div className="flex lg:flex-col gap-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex-shrink-0 w-16 lg:w-20 aspect-[3/4] bg-zinc-100 rounded-sm"></div>
                            ))}
                        </div>
                        <div className="flex-grow aspect-[3/4] bg-zinc-50 rounded-sm relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                        </div>
                    </div>
                </div>

                {/* Content Skeleton */}
                <div className="lg:w-[40%]">
                    <div className="space-y-8">
                        <div>
                            <div className="flex gap-3 mb-4">
                                <div className="h-2.5 bg-zinc-100 rounded-full w-20"></div>
                                <div className="h-2.5 bg-zinc-900 rounded-sm w-16 opacity-10"></div>
                            </div>
                            <div className="h-10 bg-zinc-100 rounded-full w-full mb-4"></div>
                            <div className="h-10 bg-zinc-100 rounded-full w-2/3 mb-8"></div>

                            <div className="flex gap-8 mb-8">
                                <div className="space-y-2">
                                    <div className="h-2 bg-zinc-100 rounded-full w-12"></div>
                                    <div className="h-3 bg-zinc-200 rounded-full w-24"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2 bg-zinc-100 rounded-full w-12"></div>
                                    <div className="h-3 bg-zinc-200 rounded-full w-32"></div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="h-8 bg-zinc-100 rounded-full w-32"></div>
                                <div className="h-6 bg-zinc-50 rounded-full w-20"></div>
                            </div>
                        </div>

                        <div className="space-y-10 py-10 border-y border-zinc-100/60">
                            <div className="space-y-5">
                                <div className="flex justify-between">
                                    <div className="h-2.5 bg-zinc-100 rounded-full w-24"></div>
                                    <div className="h-2.5 bg-zinc-100 rounded-full w-20"></div>
                                </div>
                                <div className="grid grid-cols-4 gap-3">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="h-12 bg-zinc-100 rounded-sm"></div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="h-2.5 bg-zinc-200 rounded-full w-40"></div>
                                <div className="grid grid-cols-2 gap-x-12 gap-y-5">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="h-3 bg-zinc-100 rounded-full w-full"></div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-grow h-14 bg-zinc-100 rounded-sm"></div>
                            <div className="flex-grow h-14 bg-zinc-900 rounded-sm opacity-10"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailSkeleton;
