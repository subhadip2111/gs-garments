
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
      className="group relative flex flex-col h-full cursor-pointer"
      onClick={handleNavigateToDetail}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F8F8F8] rounded-2xl group/img">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Action Buttons - Myntra Style */}
        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleWishlistToggle}
            className={`w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm shadow-sm transition-all ${isWishlisted ? 'bg-white text-red-500' : 'bg-white/80 text-black hover:bg-white'}`}
          >
            <i className={`${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart text-[10px]`}></i>
          </button>
        </div>

        {/* Simple Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
          {product.isNewArrival && (
            <span className="bg-black text-white text-[7px] uppercase font-bold px-2 py-1 rounded-sm tracking-widest">
              New
            </span>
          )}
          {discountPercentage && (
            <span className="bg-red-500 text-white text-[7px] uppercase font-bold px-2 py-1 rounded-sm tracking-widest">
              -{discountPercentage}%
            </span>
          )}
        </div>
      </div>

      {/* Info Container */}
      <div className="mt-4 space-y-2">
        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <h3 className="text-[13px] font-medium text-zinc-900 leading-tight">
              {product.name}
            </h3>
            <p className="text-[11px] text-zinc-400">{product.subcategory}</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[14px] font-bold text-zinc-900">₹{product.price.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Simple Rating */}
        <div className="flex items-center gap-1.5 opacity-60">
          <i className="fa-solid fa-star text-[8px] text-zinc-900"></i>
          <span className="text-[10px] font-medium">{product.rating.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
