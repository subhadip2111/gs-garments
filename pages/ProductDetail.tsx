import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MOCK_PRODUCTS, LAUNCH_PROMOS, MOCK_REVIEWS, MOCK_COUPONS, MOCK_COMBO_OFFERS } from '../constants';
import { useAppDispatch, useAppSelector } from '../store';
import { addToCart, toggleWishlist } from '../store/cartSlice';
import { setSharedProduct } from '../store/uiSlice';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import ProductDetailSkeleton from '../components/ProductDetailSkeleton';
import { Product, Review } from '../types';
import Product360View from '../components/Product360View';

const RatingHistogram: React.FC<{ rating: number; reviewsCount: number }> = ({ rating, reviewsCount }) => {
  const distribution = [70, 15, 8, 5, 2]; // Mocked distribution percentages
  return (
    <div className="space-y-1 w-full max-w-xs">
      {distribution.map((pct, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex items-center gap-1 w-5">
            <span className="text-[8px] font-bold">{5 - i}</span>
            <i className="fa-solid fa-star text-[6px]"></i>
          </div>
          <div className="flex-grow h-0.5 bg-zinc-100 rounded-full overflow-hidden">
            <div className="h-full bg-black transition-all duration-1000" style={{ width: `${pct}%` }}></div>
          </div>
          <span className="text-[8px] text-zinc-400 font-medium w-6 text-right">{pct}%</span>
        </div>
      ))}
    </div>
  );
};

export const SmartOfferWidget: React.FC<{ currentTotal: number }> = ({ currentTotal }) => {
  const nextOffer = MOCK_COMBO_OFFERS.find(o => currentTotal < o.threshold) || MOCK_COMBO_OFFERS[MOCK_COMBO_OFFERS.length - 1];
  const progress = Math.min(100, (currentTotal / nextOffer.threshold) * 100);
  const remaining = Math.max(0, nextOffer.threshold - currentTotal);
  const hasUnlockedAll = currentTotal >= MOCK_COMBO_OFFERS[MOCK_COMBO_OFFERS.length - 1].threshold;

  return (
    <div className="bg-zinc-950 text-white p-4 rounded-xl shadow-2xl overflow-hidden relative group border border-zinc-800/50">
      <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
        <i className="fa-solid fa-bolt-lightning text-5xl transform rotate-12"></i>
      </div>
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500">{hasUnlockedAll ? 'Max Tier Reached' : nextOffer.label}</span>
          {!hasUnlockedAll && (
            <span className="text-[9px] font-black text-emerald-400 animate-pulse">Up to ₹{nextOffer.discount} OFF</span>
          )}
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-grow">
            <p className="text-[10px] font-bold">
              {!hasUnlockedAll ? (
                <>Add <span className="text-emerald-400 font-black">₹{remaining.toLocaleString('en-IN')}</span> more to get <span className="text-zinc-100 bg-emerald-500/20 px-1 py-0.5 rounded ml-1">₹{nextOffer.discount} INSTANT OFF</span></>
              ) : (
                <><i className="fa-solid fa-crown text-amber-400 mr-2"></i> All Style Rewards Unlocked!</>
              )}
            </p>
          </div>
        </div>
        <div className="h-1 bg-zinc-900 rounded-full overflow-hidden flex gap-1">
          {MOCK_COMBO_OFFERS.map((offer, idx) => {
            const isAchieved = currentTotal >= offer.threshold;
            return (
              <div
                key={idx}
                className={`h-full flex-grow rounded-full transition-all duration-1000 ${isAchieved ? 'bg-emerald-500' : 'bg-zinc-800'}`}
                style={{ opacity: isAchieved ? 1 : 0.3 }}
              ></div>
            );
          })}
        </div>
        {!hasUnlockedAll && (
          <div className="mt-2 flex justify-between text-[7px] font-bold uppercase tracking-widest text-zinc-500">
            <span>Progress to Reward</span>
            <span>₹{currentTotal.toLocaleString('en-IN')} / ₹{nextOffer.threshold.toLocaleString('en-IN')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const wishlist = useAppSelector((state) => state.cart.wishlist);
  const user = useAppSelector((state) => state.auth.user);
  const isLoadingProducts = useAppSelector((state) => state.products.isLoading);

  const product = MOCK_PRODUCTS.find(p => p.id === id);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [is360Active, setIs360Active] = useState(false);

  // Review State
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', images: [] as string[] });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // Dynamic Delivery Logic
  const estimatedDeliveryDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 4); // Default 4 days delivery
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  }, []);

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0]);
      setSelectedColor(product.colors[0]);
      setActiveImg(0);
      setQuantity(1);
      setIs360Active(false);

      // Trigger Related Products
      fetchRelatedProducts(product);
    }
  }, [product, id]);

  const fetchRelatedProducts = (currentProd: Product) => {
    setLoadingRelated(true);
    setRelatedProducts(MOCK_PRODUCTS.filter(p => p.id !== currentProd.id).slice(0, 4));
    setLoadingRelated(false);
  };

  const handleHelpful = (reviewId: string) => {
    setReviews(prev => prev.map(r =>
      r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r
    ));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewReview(prev => ({
            ...prev,
            images: [...prev.images, reader.result as string]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth');
      return;
    }
    const review: Review = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.user_metadata?.full_name || user.email.split('@')[0],
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date()),
      images: newReview.images,
      helpfulCount: 0
    };
    setReviews([review, ...reviews]);
    setNewReview({ rating: 5, comment: '', images: [] });
    setIsWritingReview(false);
  };

  if (isLoadingProducts) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="py-40 text-center">
        <h2 className="text-2xl font-serif mb-4">Product not found.</h2>
        <button onClick={() => navigate('/shop')} className="underline">Back to Shop</button>
      </div>
    );
  }

  const handleBuyNow = () => {
    if (!selectedSize) {
      alert('Please select a size first.');
      return;
    }
    navigate('/checkout', {
      state: {
        buyNowItem: {
          productId: product.id,
          selectedSize,
          selectedColor: 'Default',
          quantity: 1,
          priceAtPurchase: product.price
        }
      }
    });
  };

  const handleShare = (platform: 'facebook' | 'twitter' | 'pinterest' | 'copy') => {
    const url = window.location.href;
    const text = `Check out this ${product.name} at GS!`;

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      return;
    }

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(product.images[0])}&description=${encodeURIComponent(text)}`;
        break;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const isWishlisted = wishlist.includes(product.id);
  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className="bg-white min-h-screen">
      {/* Size Guide Modal Overlay */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-950/20 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="relative bg-white w-full max-w-3xl p-16 shadow-2xl animate-in zoom-in-95 duration-500 rounded-sm">
            <button onClick={() => setShowSizeGuide(false)} className="absolute top-8 right-8 text-zinc-300 hover:text-black transition-colors"><i className="fa-solid fa-xmark text-xl"></i></button>
            <div className="space-y-4 mb-12 text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-300">Archives of Measurement</span>
              <h2 className="text-5xl font-serif font-bold italic">The Perfect Drape.</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100">
                    <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900 leading-none">Standard</th>
                    <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900 leading-none">Bust (Inches)</th>
                    <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900 leading-none">Waist (Inches)</th>
                    <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900 leading-none">Length (Inches)</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-medium text-zinc-500">
                  <tr className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors"><td className="py-6 font-black text-black">Petite (S)</td><td className="py-6">36 - 38</td><td className="py-6">30 - 32</td><td className="py-6">27.5</td></tr>
                  <tr className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors"><td className="py-6 font-black text-black">Classic (M)</td><td className="py-6">38 - 40</td><td className="py-6">32 - 34</td><td className="py-6">28.5</td></tr>
                  <tr className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors"><td className="py-6 font-black text-black">Grande (L)</td><td className="py-6">40 - 42</td><td className="py-6">34 - 36</td><td className="py-6">29.5</td></tr>
                  <tr className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors"><td className="py-6 font-black text-black">Exalt (XL)</td><td className="py-6">42 - 44</td><td className="py-6">36 - 38</td><td className="py-6">30.5</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-12 text-[10px] text-zinc-400 text-center leading-relaxed">Measurements are indicative of the garment's silhouette. <br /> For bespoke draping consultations, please visit our Boutique Destinations.</p>
          </div>
        </div>
      )}

      {/* Global Breadcrumbs - Refined */}
      <div className="max-w-[1920px] mx-auto px-6 sm:px-12 lg:px-24">
        <nav className="flex items-center pt-24 pb-12 text-[9px] font-black uppercase tracking-[0.5em] text-zinc-300">
          <Link to="/" className="hover:text-black transition-colors">Atelier</Link>
          <i className="fa-solid fa-circle text-[4px] mx-6 opacity-20"></i>
          <Link to={`/shop?category=${product.category}`} className="hover:text-black transition-colors">{product.category}</Link>
          <i className="fa-solid fa-circle text-[4px] mx-6 opacity-20"></i>
          <span className="text-black">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 xl:gap-32 pb-32">
          {/* Gallery Section - High Impact */}
          <div className="lg:w-[55%]">
            <div className="flex flex-col-reverse lg:flex-row gap-8">
              {/* Thumbnails */}
              <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible no-scrollbar pb-4 lg:pb-0">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => { setActiveImg(i); setIs360Active(false); }}
                    className={`flex-shrink-0 w-16 lg:w-20 aspect-[3/4] overflow-hidden transition-all duration-700 relative ${activeImg === i && !is360Active ? 'ring-2 ring-black ring-offset-4 scale-105' : 'opacity-40 hover:opacity-100 hover:scale-105'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt={`${product.name} view ${i + 1}`} />
                    {activeImg === i && !is360Active && <div className="absolute inset-0 bg-white/10"></div>}
                  </button>
                ))}
                {product.images.length > 2 && (
                  <button
                    onClick={() => setIs360Active(true)}
                    className={`flex-shrink-0 w-16 lg:w-20 aspect-[3/4] flex flex-col items-center justify-center gap-2 transition-all duration-700 ${is360Active ? 'bg-black text-white ring-2 ring-black ring-offset-4 scale-105' : 'bg-zinc-50 text-zinc-300 hover:text-black hover:bg-zinc-100'}`}
                  >
                    <i className="fa-solid fa-rotate-right text-base animate-slow-spin"></i>
                    <span className="text-[7px] font-black uppercase tracking-[0.2em]">360° View</span>
                  </button>
                )}
              </div>

              {/* Main Image Viewport */}
              <div className="flex-grow aspect-[3/4] bg-zinc-50 relative group overflow-hidden rounded-sm ring-1 ring-zinc-100/50 cursor-crosshair">
                {is360Active ? (
                  <Product360View images={product.images} onExit={() => setIs360Active(false)} />
                ) : (
                  <>
                    <div className={`w-full h-full transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${isZoomed ? 'scale-[2] origin-center' : 'scale-100'}`} onClick={() => setIsZoomed(!isZoomed)}>
                      <img src={product.images[activeImg]} className="w-full h-full object-cover" alt={product.name} />
                    </div>

                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                      <div className="bg-black/80 backdrop-blur-xl px-8 py-4 text-white text-[9px] font-black uppercase tracking-[0.4em] flex items-center gap-4 rounded-full shadow-2xl">
                        <i className={`fa-solid ${isZoomed ? 'fa-magnifying-glass-minus' : 'fa-magnifying-glass-plus'} text-xs`}></i>
                        {isZoomed ? 'Release Viewport' : 'Engage Precision Zoom'}
                      </div>
                    </div>

                    <div className="absolute top-8 right-8">
                      <button onClick={(e) => { e.stopPropagation(); dispatch(toggleWishlist(product.id)); }} className={`w-14 h-14 rounded-full backdrop-blur-xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-500 ${isWishlisted ? 'bg-black text-white' : 'bg-white/80 text-zinc-900 hover:bg-black hover:text-white'}`}>
                        <i className={`${isWishlisted ? 'fa-solid text-red-500' : 'fa-regular'} text-xl fa-heart`}></i>
                      </button>
                    </div>

                    {/* Perspective Label */}
                    <div className="absolute top-8 left-8">
                      <div className="bg-white/90 backdrop-blur-md border border-zinc-100 px-4 py-2 rounded-sm shadow-sm">
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-300">Perspective {activeImg + 1} // Archive</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Configuration & Details Section */}
          <div className="lg:w-[45%]">
            <div className="lg:sticky lg:top-32 space-y-12 xl:space-y-16">
              {/* Product Signature */}
              <header className="space-y-8">
                <div className="flex items-center gap-4 animate-in slide-in-from-left duration-700">
                  <span className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-300">Bespoke Boutique Selection</span>
                  <div className="h-[1px] w-12 bg-zinc-100"></div>
                  {product.isBestSeller && (<span className="text-[8px] font-black text-white bg-zinc-950 px-2 py-1 uppercase tracking-[0.2em] rounded-sm">Elite Choice</span>)}
                </div>

                <div className="space-y-4">
                  <h1 className="text-5xl xl:text-6xl font-serif font-bold italic tracking-tight text-zinc-900 leading-[0.9]">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-6">
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-400">{product.brand || 'GS Heritage'}</span>
                    <div className="w-1.5 h-1.5 bg-zinc-200 rounded-full"></div>
                    <span className="text-[11px] font-bold text-zinc-400 italic font-serif">Ref. {product.sku || 'GS-' + product.id.toUpperCase()}</span>
                  </div>
                </div>

                <div className="flex items-end gap-6 pt-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 mb-2">Acquisition Price</span>
                    <div className="flex items-baseline gap-4">
                      <span className="text-5xl font-black tracking-tighter text-zinc-950">₹{product.price.toLocaleString('en-IN')}</span>
                      {product.originalPrice && (
                        <span className="text-xl text-zinc-200 line-through italic font-serif opacity-80 font-light">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  </div>
                  {discountPercentage && (
                    <div className="pb-1.5">
                      <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] border border-emerald-100">
                        {discountPercentage}% Privileged Offer
                      </span>
                    </div>
                  )}
                </div>
              </header>

              <SmartOfferWidget currentTotal={product.price} />

              {/* Selector Interface */}
              <div className="space-y-12">
                {/* Size Configuration */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300">Select Silhouette</h4>
                    <button onClick={() => setShowSizeGuide(true)} className="group flex items-center gap-3">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-900 group-hover:underline underline-offset-8 transition-all">Archives of Measurement</span>
                      <i className="fa-solid fa-ruler-horizontal text-[10px] text-zinc-300 group-hover:text-black transition-colors"></i>
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {product.sizes.map(size => {
                      const lowStock = product.stock[size] > 0 && product.stock[size] < 5;
                      const outOfStock = product.stock[size] === 0;
                      return (
                        <button
                          key={size}
                          disabled={outOfStock}
                          onClick={() => setSelectedSize(size)}
                          className={`relative py-6 text-[11px] font-black tracking-[0.2em] transition-all duration-700 rounded-sm border ${outOfStock ? 'opacity-20 cursor-not-allowed bg-zinc-50 border-zinc-100 grayscale' : selectedSize === size ? 'bg-black text-white border-black shadow-2xl scale-[1.05] z-10' : 'bg-white border-zinc-100 text-zinc-400 hover:border-black hover:text-black'}`}
                        >
                          {size}
                          {lowStock && !outOfStock && (
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
                              <div className="bg-red-500 w-1.5 h-1.5 rounded-full animate-ping mb-1"></div>
                              <span className="bg-red-50 text-red-600 text-[6px] font-black px-2 py-0.5 rounded-full border border-red-100 uppercase tracking-tighter whitespace-nowrap shadow-sm">
                                Legacy Item: {product.stock[size]} Left
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Primary Actions */}
                <div className="space-y-4 pt-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => dispatch(addToCart({ productId: product.id, size: selectedSize, color: selectedColor, quantity }))}
                      className="flex-1 bg-zinc-900 text-white py-6 text-[11px] font-black uppercase tracking-[0.4em] hover:bg-zinc-800 transition-all duration-700 active:scale-[0.98] shadow-lg rounded-full"
                    >
                      Add to Bag
                    </button>
                    <button
                      onClick={handleBuyNow}
                      className="flex-1 bg-white text-black border-2 border-zinc-900 py-6 text-[11px] font-black uppercase tracking-[0.4em] hover:bg-zinc-50 transition-all duration-700 active:scale-[0.98] rounded-full"
                    >
                      Buy Now
                    </button>
                  </div>
                  <p className="text-center text-[9px] text-zinc-300 font-bold uppercase tracking-[0.2em]">Complimentary White-Glove Shipping on all Elite Purchases</p>
                </div>

                {/* The Narrative Section */}
                <div className="pt-12 border-t border-zinc-100 space-y-12">
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300">The Narrative</h3>
                    <p className="text-[15px] font-serif font-medium leading-relaxed text-zinc-600 italic">
                      Crafted with a legacy of excellence, this {product.fabric || 'timeless creation'} embodies the spirit of our boutique archives. Every stitch reflects a meticulous attention to detail, designed for the individual who values both heritage and a contemporary silhouette.
                    </p>
                  </div>

                  {/* Technical Specifications - Luxury Style */}
                  <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                    {[
                      { label: "Fabrication", value: product.fabric || "Heritage Blend", icon: "fa-swatchbook" },
                      { label: "Archival SKU", value: product.sku || product.id.toUpperCase(), icon: "fa-barcode" },
                      { label: "Origin", value: "Indian Heritage", icon: "fa-earth-asia" },
                      { label: "Care Protocol", value: "Dry Clean Only", icon: "fa-wind" }
                    ].map((spec, i) => (
                      <div key={i} className="space-y-2 group">
                        <div className="flex items-center gap-3">
                          <i className={`fa-solid ${spec.icon} text-[10px] text-zinc-300 group-hover:text-black transition-colors`}></i>
                          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-300 leading-none">
                            {spec.label}
                          </span>
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-zinc-900 ml-6 group-hover:translate-x-1 transition-transform">
                          {spec.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Distribution & Assurance */}
                  <div className="p-10 bg-zinc-50/50 rounded-sm border border-zinc-100 ring-1 ring-zinc-50">
                    <div className="flex justify-between items-center mb-10">
                      <div className="space-y-1">
                        <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-300">Delivery Status</h4>
                        <p className="text-[12px] font-serif font-bold italic">Check Availability.</p>
                      </div>
                      <i className="fa-solid fa-map-location-dot text-zinc-300 text-xl"></i>
                    </div>
                    <div className="flex gap-4 mb-8">
                      <div className="flex-grow relative">
                        <input type="text" placeholder="Enter Pincode" className="w-full bg-white border-b border-zinc-200 py-3 text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:border-black transition-all" />
                        <button className="absolute right-0 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-widest text-emerald-600 hover:text-black transition-colors">Check</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                          <i className="fa-solid fa-calendar-check text-[10px] text-emerald-600"></i>
                        </div>
                        <div className="space-y-0.5">
                          <span className="block text-[8px] font-black uppercase tracking-[0.3em] text-zinc-300">Expected</span>
                          <span className="block text-[10px] font-bold">2-4 Business Days</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                          <i className="fa-solid fa-shield-halved text-[10px] text-zinc-900"></i>
                        </div>
                        <div className="space-y-0.5">
                          <span className="block text-[8px] font-black uppercase tracking-[0.3em] text-zinc-300">Certified</span>
                          <span className="block text-[10px] font-bold">Authentic Piece</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Integration */}
                <div className="flex items-center gap-6 pt-12 border-t border-zinc-100 group">
                  <span className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-300">Share Archivist</span>
                  <div className="flex items-center gap-2">
                    {[
                      { platform: 'facebook', icon: 'fa-facebook-f' },
                      { platform: 'twitter', icon: 'fa-x-twitter' },
                      { platform: 'pinterest', icon: 'fa-pinterest-p' }
                    ].map((social) => (
                      <button
                        key={social.platform}
                        onClick={() => handleShare(social.platform as any)}
                        className="w-10 h-10 rounded-full border border-zinc-50 hover:bg-zinc-950 hover:text-white transition-all duration-500 flex items-center justify-center text-xs"
                      >
                        <i className={`fa-brands ${social.icon}`}></i>
                      </button>
                    ))}
                    <button
                      onClick={() => handleShare('copy')}
                      className={`h-10 px-6 rounded-full border border-zinc-100 flex items-center gap-2 transition-all duration-700 ${copySuccess ? 'bg-emerald-500 text-white border-emerald-500' : 'hover:border-black text-[9px] font-black uppercase tracking-[0.3em]'}`}
                    >
                      <i className={`fa-solid ${copySuccess ? 'fa-check' : 'fa-link'}`}></i>
                      {copySuccess ? 'Archived URL' : 'Reference Link'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FEEDBACK & REVIEWS - Boutique Aesthetic */}
        <section className="pt-32 border-t border-zinc-100">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-24 lg:gap-32 pb-40">
            <div className="lg:col-span-1 space-y-12">
              <div className="space-y-6">
                <span className="text-zinc-300 text-[10px] font-black uppercase tracking-[0.6em]">Clientele Chronicles</span>
                <h2 className="text-4xl xl:text-5xl font-serif font-bold italic tracking-tight leading-[0.9]">Exceptional <br /> Perspectives.</h2>
              </div>

              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-8 border-b border-zinc-100 pb-8">
                  <span className="text-7xl font-black text-zinc-950 leading-none">{product.rating.toFixed(1)}</span>
                  <div className="space-y-2">
                    <div className="flex text-zinc-900 text-[10px]">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`fa-solid fa-star ${i < Math.floor(product.rating) ? 'text-zinc-950' : 'text-zinc-100'}`}></i>
                      ))}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">{reviews.length} Reflections</p>
                  </div>
                </div>
                <RatingHistogram rating={product.rating} reviewsCount={reviews.length} />
              </div>

              <button
                onClick={() => setIsWritingReview(!isWritingReview)}
                className="w-full bg-zinc-950 text-white py-6 text-[11px] font-black uppercase tracking-[0.4em] hover:bg-zinc-800 transition-all duration-700 shadow-xl rounded-full flex items-center justify-center gap-4 group"
              >
                <i className={`fa-solid ${isWritingReview ? 'fa-xmark' : 'fa-pen-nib'} text-xs group-hover:scale-110 transition-transform`}></i>
                {isWritingReview ? 'Cancel' : 'Write a Review'}
              </button>
            </div>

            <div className="lg:col-span-3">
              {isWritingReview && (
                <div className="mb-24 p-12 bg-zinc-50/50 border border-zinc-100 rounded-sm animate-in slide-in-from-top duration-1000">
                  <form onSubmit={submitReview} className="space-y-10 max-w-3xl">
                    <div className="space-y-6">
                      <label className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-300 block">Archetype Rating</label>
                      <div className="flex gap-4">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button key={star} type="button" onClick={() => setNewReview(prev => ({ ...prev, rating: star }))} className={`text-2xl transition-all duration-500 hover:scale-125 ${newReview.rating >= star ? 'text-black' : 'text-zinc-100'}`}><i className="fa-solid fa-star"></i></button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-6">
                      <label className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-300 block">Perspective Commentary</label>
                      <textarea required rows={6} value={newReview.comment} onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))} placeholder="Share your experience with this archival piece..." className="w-full bg-white border border-zinc-100 p-8 text-sm font-serif font-medium italic outline-none focus:border-black transition-all resize-none shadow-sm" />
                    </div>
                    <button type="submit" className="bg-black text-white px-20 py-6 text-[11px] font-black uppercase tracking-[0.4em] hover:bg-zinc-800 transition-all shadow-2xl active:scale-95">Catalog Perspective</button>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                {reviews.map(review => (
                  <div key={review.id} className="space-y-8 animate-in fade-in duration-1000 group">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h4 className="text-[14px] font-black uppercase tracking-tight text-zinc-950">{review.userName}</h4>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-zinc-300 uppercase font-black tracking-widest">{review.date}</span>
                          <div className="w-1 h-1 bg-zinc-100 rounded-full"></div>
                          <span className="text-[8px] text-emerald-500 font-black uppercase tracking-widest">Verified Collector</span>
                        </div>
                      </div>
                      <div className="flex text-zinc-950 text-[10px] pt-1">
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className={`fa-solid fa-star ${i < review.rating ? 'text-zinc-950' : 'text-zinc-100'}`}></i>
                        ))}
                      </div>
                    </div>
                    <blockquote className="text-[16px] text-zinc-500 font-serif font-medium italic leading-relaxed pl-6 border-l-2 border-zinc-100 group-hover:border-zinc-900 transition-colors duration-700">
                      "{review.comment}"
                    </blockquote>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Heritage Partners Section */}
        <section className="pt-32 pb-40 border-t border-zinc-100">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-24">
            <div className="space-y-6 max-w-2xl">
              <span className="text-zinc-300 text-[10px] font-black uppercase tracking-[0.6em]">The Curated Network</span>
              <h2 className="text-5xl md:text-6xl font-serif font-bold italic tracking-tight leading-[0.9]">Heritage & <br /> Craftsmanship.</h2>
            </div>
            <p className="text-xl text-zinc-300 font-serif font-medium italic leading-relaxed max-w-sm">
              We partner with prestigious ateliers to bring you the finest expressions of Indian ethnic craftsmanship.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-16">
            {['GS Heritage', 'GS Boutique', 'Aura Ethnic', 'Vogue Archive'].map(brand => (
              <div key={brand} className="group relative grayscale hover:grayscale-0 transition-all duration-1000">
                <div className="relative aspect-video flex items-center justify-center bg-zinc-50 border border-zinc-100 group-hover:bg-white group-hover:border-zinc-950 transition-all duration-700 overflow-hidden shadow-sm hover:shadow-2xl">
                  <span className="text-[20px] font-serif font-bold italic text-zinc-300 group-hover:text-black group-hover:scale-110 transition-all duration-700 tracking-tight">{brand}</span>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recommended Pieces Section */}
        <section className="pt-32 pb-40 border-t border-zinc-100">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-24">
            <div className="space-y-6">
              <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.5em] text-zinc-300">
                <span>Elevate the Ensemble</span>
                <div className="h-[1px] w-12 bg-zinc-100"></div>
              </div>
              <h2 className="text-6xl md:text-7xl font-serif font-bold italic tracking-tight leading-[0.8] text-zinc-950">Complete <br /> The Look.</h2>
            </div>
            <Link to="/shop" className="group flex items-center gap-6 pb-2 border-b-2 border-zinc-950">
              <span className="text-[12px] font-black uppercase tracking-[0.4em]">View Entire Archive</span>
              <i className="fa-solid fa-arrow-right-long transition-transform group-hover:translate-x-3 duration-500"></i>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-24">
            {loadingRelated ? [...Array(4)].map((_, i) => <ProductSkeleton key={i} />) : relatedProducts.map(p => (
              <div key={p.id} className="animate-in fade-in slide-in-from-bottom-8 duration-1000" style={{ animationDelay: `${relatedProducts.indexOf(p) * 100}ms` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;
