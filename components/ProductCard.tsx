
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Product } from '../types';
import { useAppDispatch, useAppSelector } from '../store';
import { toggleWishlistServer } from '../store/wishlistSlice';
import { useToast } from '../components/Toast';
import OptimizedImage from './OptimizedImage';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useAppDispatch();
  const wishlist = useAppSelector((state) => state.wishlist.items);
  const user = useAppSelector((state) => state.auth.user);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const productId = product._id || product.id;
  const isWishlisted = wishlist.includes(productId);

  const price = product.variants?.[0]?.sizes?.[0]?.price || product.price || 0;
  const originalPrice = product.variants?.[0]?.sizes?.[0]?.originalPrice || product.originalPrice;

  const discountPercentage = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  const handleNavigateToDetail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/product/${productId}`);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      sessionStorage.setItem('authReturnUrl', location.pathname);
      sessionStorage.setItem('pendingAction', JSON.stringify({
        type: 'WISHLIST_TOGGLE',
        productId: productId
      }));
      navigate('/auth');
      return;
    }
    dispatch(toggleWishlistServer(productId)).unwrap()
      .then(() => {
        showToast(isWishlisted ? 'Removed from favorites' : 'Added to favorites', 'success');
      })
      .catch(() => {
        showToast('Action failed. Please try again.', 'error');
      });
  };

  const subcategoryName = (product.subcategory && typeof product.subcategory === 'object')
    ? (product.subcategory as any).name
    : product.subcategory;

  const brandName = (product.brand && typeof product.brand === 'object')
    ? (product.brand as any).name
    : (product.brand || 'GS Archive');







  return (
    <div
      className="group relative flex flex-col h-full cursor-pointer animate-in fade-in duration-1000"
      onClick={handleNavigateToDetail}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-50 rounded-sm group/img">
        <OptimizedImage
          src={product.images[0]}
          alt={product.name}
          className="transition-all duration-[1.5s] cubic-bezier(0.23,1,0.32,1) group-hover/img:scale-105"
          aspectRatio="aspect-[3/4]"
        />

        {/* Action Buttons - Persistent on Mobile, Hover on Desktop */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-500">
          <button
            onClick={handleWishlistToggle}
            className={`w-10 h-10 md:w-9 md:h-9 flex items-center justify-center rounded-full backdrop-blur-md shadow-lg transition-all ${isWishlisted ? 'bg-black text-white' : 'bg-white/80 text-zinc-900 hover:bg-black hover:text-white'}`}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <i className={`${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart text-[12px] md:text-[10px]`}></i>
          </button>

          <button
            onClick={handleNavigateToDetail}
            className="w-10 h-10 md:w-9 md:h-9 flex md:hidden items-center justify-center rounded-full bg-black text-white shadow-lg transition-all active:scale-95"
            title="View options & add to bag"
          >
            <i className="fa-solid fa-bag-shopping text-[12px]"></i>
          </button>
        </div>

        {/* Promotional Tags - Solid Green Rectangles */}
        <div className="absolute top-0 left-0 z-10">
          {discountPercentage && (
            <div className="bg-[#00C853] text-white text-[9px] font-black px-3 py-1.5 uppercase tracking-widest shadow-sm">
              {discountPercentage}% OFF
            </div>
          )}
          {product.isNewArrival && !discountPercentage && (
            <div className="bg-black text-white text-[9px] font-black px-3 py-1.5 uppercase tracking-widest shadow-sm">
              NEW
            </div>
          )}
        </div>

        {/* Quick View Link - Minimalist */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="px-6 py-2 bg-black/90 text-white text-[10px] font-black uppercase tracking-[0.4em] backdrop-blur-md rounded-full shadow-2xl">
            VIEW DETAILS
          </div>
        </div>
      </div>

      {/* Info Container - Direct & Minimalist */}
      <div className="mt-4 flex flex-col gap-1">
        <div className="flex justify-between items-baseline gap-4">
          <h3 className="text-[13px] font-serif font-black italic text-zinc-900 tracking-tight flex-grow truncate">
            {product.name}
          </h3>
          <div className="flex flex-col items-end">
            <span className="text-[14px] font-black text-zinc-950 tracking-tighter">₹{(price || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-300">
              {subcategoryName}
            </span>
            <span className="text-[9px] text-zinc-200 mt-[-2px]">·</span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
              {brandName}
            </span>
          </div>
          {originalPrice && (
            <span className="text-[10px] text-zinc-200 line-through italic font-serif">₹{(originalPrice || 0).toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
