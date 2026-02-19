
import React, { useState, useRef, useEffect } from 'react';

interface Product360ViewProps {
  images: string[];
  onExit: () => void;
}

const Product360View: React.FC<Product360ViewProps> = ({ images, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const lastIndexRef = useRef(0);
  const sensitivity = 10; // Pixels per frame shift

  // Preload images for smooth rotation
  useEffect(() => {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [images]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    startXRef.current = clientX;
    lastIndexRef.current = currentIndex;
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - startXRef.current;
    
    // Calculate how many frames to shift
    const frameShift = Math.floor(deltaX / sensitivity);
    
    // Ensure the index wraps around correctly
    let nextIndex = (lastIndexRef.current - frameShift) % images.length;
    if (nextIndex < 0) nextIndex = images.length + nextIndex;
    
    setCurrentIndex(nextIndex);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="relative w-full h-full bg-vogue-50 overflow-hidden flex flex-col items-center justify-center rounded-sm select-none touch-none">
      <div 
        className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center"
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <img 
          src={images[currentIndex]} 
          alt="Product 360 View" 
          className="max-w-full max-h-full object-contain pointer-events-none"
        />
      </div>

      <div className="absolute top-6 left-6 pointer-events-none">
        <div className="flex items-center gap-3 bg-black/80 text-white px-4 py-2 rounded-full backdrop-blur-sm border border-white/10 shadow-xl">
          <i className="fa-solid fa-rotate text-xs animate-spin-slow"></i>
          <span className="text-[9px] font-bold uppercase tracking-[0.2em]">360° Interaction Mode</span>
        </div>
      </div>

      <div className="absolute top-6 right-6">
        <button 
          onClick={onExit}
          className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all border border-gray-100"
          title="Exit 360 View"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/5 flex items-center gap-4 animate-in fade-in slide-in-from-bottom duration-700">
         <div className="flex items-center gap-2">
            <i className="fa-solid fa-arrows-left-right text-white/60 text-xs"></i>
            <span className="text-[8px] font-bold uppercase tracking-widest text-white/80">Drag to Rotate</span>
         </div>
         <div className="w-px h-4 bg-white/20"></div>
         <div className="text-[8px] font-bold uppercase tracking-widest text-vogue-500">
            Frame {currentIndex + 1} / {images.length}
         </div>
      </div>
    </div>
  );
};

export default Product360View;
