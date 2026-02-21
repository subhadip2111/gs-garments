
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useAppDispatch, useAppSelector } from '../store';
import { toggleWishlist } from '../store/cartSlice';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useAppDispatch();
  const wishlist = useAppSelector((state) => state.cart.wishlist);
  const user = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const isWishlisted = wishlist.includes(product.id);

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleNavigateToDetail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/product/${product.id}`);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/auth', { state: { from: `/shop` } });
      return;
    }
    dispatch(toggleWishlist(product.id));
  };

  return (
    <div
      className="group relative flex flex-col h-full cursor-pointer animate-in fade-in duration-1000"
      onClick={handleNavigateToDetail}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-50 rounded-sm group/img ring-1 ring-zinc-100/50">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-[1.5s] cubic-bezier(0.23,1,0.32,1) group-hover/img:scale-110 group-hover/img:rotate-1"
        />

        {/* Elegant Overlay on Hover */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/img:opacity-100 transition-opacity duration-700"></div>

        {/* Action Buttons - Refined */}
        <div className="absolute top-4 right-4 z-20 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-75">
          <button
            onClick={handleWishlistToggle}
            className={`w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-md shadow-2xl transition-all ${isWishlisted ? 'bg-black text-white' : 'bg-white/90 text-zinc-900 hover:bg-black hover:text-white'}`}
          >
            <i className={`${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart text-[11px]`}></i>
          </button>
        </div>

        {/* Boutique Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
          {product.isNewArrival && (
            <span className="bg-white/90 backdrop-blur-md text-black text-[8px] uppercase font-black px-3 py-1 shadow-sm tracking-[0.2em] border border-zinc-100">
              New Arrival
            </span>
          )}
          {discountPercentage && (
            <span className="bg-emerald-500 text-white text-[8px] uppercase font-black px-3 py-1 shadow-sm tracking-[0.2em]">
              {discountPercentage}% Off
            </span>
          )}
        </div>

        {/* Quick View Trigger */}
        <div className="absolute bottom-0 left-0 w-full p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-700 bg-black/90 backdrop-blur-2xl">
          <div className="text-[10px] font-black text-white uppercase tracking-[0.5em] text-center">
            View Details
          </div>
        </div>
      </div>

      {/* Info Container - Premium Typography */}
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1.5 flex-grow">
            <h3 className="text-[17px] font-serif font-bold italic text-zinc-900 leading-[1.1] tracking-tight group-hover:text-vogue-600 transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-300">
                {product.subcategory}
              </span>
              <div className="w-1 h-1 bg-zinc-200 rounded-full"></div>
              <span className="text-[9px] font-bold text-zinc-400 italic font-serif">
                {product.brand || 'GS Heritage'}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end pt-1">
            <span className="text-[16px] font-black text-zinc-950 tracking-tighter">₹{product.price.toLocaleString('en-IN')}</span>
            {product.originalPrice && (
              <span className="text-[10px] text-zinc-300 line-through italic font-serif">₹{product.originalPrice.toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>

        {/* Premium Detail Micro-info */}
        <div className="flex items-center justify-between border-t border-zinc-50 pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-star text-[7px] text-zinc-900"></i>
            <span className="text-[9px] font-black tracking-widest">{product.rating.toFixed(1)}</span>
            <span className="text-[9px] text-zinc-300 uppercase font-black ml-1 tracking-tighter">(Verified)</span>
          </div>
          <div className="flex gap-1.5">
            {product.colors.slice(0, 3).map((c, i) => (
              <div key={i} className="w-2 h-2 rounded-full ring-1 ring-zinc-100" style={{ backgroundColor: c.toLowerCase() }}></div>
            ))}
            {product.colors.length > 3 && (
              <span className="text-[8px] text-zinc-300 font-black">+{product.colors.length - 3}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
