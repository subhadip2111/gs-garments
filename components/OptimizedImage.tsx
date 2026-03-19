import React, { useState, useEffect } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
  aspectRatio?: string;
  showShimmer?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  aspectRatio = 'aspect-auto',
  showShimmer = true,
  loading = 'lazy',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset state when src changes
    setIsLoaded(false);
    setError(false);
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${aspectRatio} ${containerClassName}`}>
      {/* Shimmer Placeholder */}
      {showShimmer && !isLoaded && !error && (
        <div className="absolute inset-0 shimmer z-0" />
      )}

      {/* Error Placeholder */}
      {error && (
        <div className="absolute inset-0 bg-zinc-100 flex items-center justify-center">
          <i className="fa-regular fa-image text-zinc-300 text-xl"></i>
        </div>
      )}

      <img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        className={`
          ${className}
          w-full h-full object-cover
          transition-opacity duration-700 ease-in-out
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
        `}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;
