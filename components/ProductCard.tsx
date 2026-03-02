
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Product } from '../types';
import { useAppDispatch, useAppSelector } from '../store';
import { toggleWishlistServer } from '../store/cartSlice';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useAppDispatch();
  const wishlist = useAppSelector((state) => state.cart.wishlist);
  const user = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();

  const productId = product._id || product.id;
  const isWishlisted = wishlist.includes(productId);

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
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
    dispatch(toggleWishlistServer(productId));
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
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-[1.5s] cubic-bezier(0.23,1,0.32,1) group-hover/img:scale-105"
        />

        {/* Action Buttons - Refined & Minimal */}
        <div className="absolute top-4 right-4 z-20 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
          <button
            onClick={handleWishlistToggle}
            className={`w-9 h-9 flex items-center justify-center rounded-full backdrop-blur-md shadow-lg transition-all ${isWishlisted ? 'bg-black text-white' : 'bg-white/80 text-zinc-900 hover:bg-black hover:text-white'}`}
          >
            <i className={`${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart text-[10px]`}></i>
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
            <span className="text-[14px] font-black text-zinc-950 tracking-tighter">₹{(product.price || 0).toLocaleString('en-IN')}</span>
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
          {product.originalPrice && (
            <span className="text-[10px] text-zinc-200 line-through italic font-serif">₹{(product.originalPrice || 0).toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
