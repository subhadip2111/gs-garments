
import React from 'react';

const ProductSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col h-full group animate-pulse">
      {/* Image Area */}
      <div className="relative aspect-[3/4] bg-zinc-100 rounded-2xl overflow-hidden mb-4">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
      </div>

      {/* Content Area */}
      <div className="space-y-3 px-1">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-grow">
            {/* Name Line */}
            <div className="h-3.5 bg-zinc-100 rounded-full w-4/5"></div>
            {/* Subcategory Line */}
            <div className="h-2.5 bg-zinc-50 rounded-full w-1/3"></div>
          </div>
          {/* Price Line */}
          <div className="h-4 bg-zinc-100 rounded-full w-16"></div>
        </div>

        {/* Rating Line */}
        <div className="flex items-center gap-1.5 opacity-40">
          <div className="w-2.5 h-2.5 bg-zinc-100 rounded-full"></div>
          <div className="h-2.5 bg-zinc-50 rounded-full w-8"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
