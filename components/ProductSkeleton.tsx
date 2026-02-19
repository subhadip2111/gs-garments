
import React from 'react';

const ProductSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col h-full space-y-5 animate-pulse">
      {/* Image Area */}
      <div className="relative aspect-[3/4] bg-gray-100 rounded-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
      </div>

      {/* Content Area */}
      <div className="space-y-3 px-1">
        {/* Name Line */}
        <div className="h-4 bg-gray-100 rounded-sm w-3/4"></div>
        
        {/* Rating Line */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-2 h-2 bg-gray-100 rounded-full"></div>
            ))}
          </div>
          <div className="h-2 bg-gray-50 rounded-sm w-8"></div>
        </div>

        {/* Subcategory Line */}
        <div className="h-3 bg-gray-50 rounded-sm w-1/4"></div>

        {/* Price Line */}
        <div className="flex items-center gap-3 pt-1">
          <div className="h-5 bg-gray-100 rounded-sm w-20"></div>
          <div className="h-4 bg-gray-50 rounded-sm w-16"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
