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
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-10 animate-fade-in">
      {/* Size Guide Modal Overlay */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative bg-white w-full max-w-2xl p-12 shadow-2xl animate-in zoom-in-95 duration-300">
            <button onClick={() => setShowSizeGuide(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors"><i className="fa-solid fa-xmark text-xl"></i></button>
            <h2 className="text-3xl font-serif font-bold mb-8">Official Size Chart</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-vogue-500">Tag Size</th>
                    <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-vogue-500">Bust/Chest (in)</th>
                    <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-vogue-500">Waist (in)</th>
                    <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-vogue-500">Length (in)</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-light">
                  <tr className="border-b border-gray-50"><td className="py-4 font-bold">S</td><td className="py-4">36 - 38</td><td className="py-4">30 - 32</td><td className="py-4">27.5</td></tr>
                  <tr className="border-b border-gray-50"><td className="py-4 font-bold">M</td><td className="py-4">38 - 40</td><td className="py-4">32 - 34</td><td className="py-4">28.5</td></tr>
                  <tr className="border-b border-gray-50"><td className="py-4 font-bold">L</td><td className="py-4">40 - 42</td><td className="py-4">34 - 36</td><td className="py-4">29.5</td></tr>
                  <tr className="border-b border-gray-50"><td className="py-4 font-bold">XL</td><td className="py-4">42 - 44</td><td className="py-4">36 - 38</td><td className="py-4">30.5</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="flex items-center mb-10 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        <Link to="/" className="hover:text-black transition-colors">Home</Link>
        <span className="mx-3 opacity-30">/</span>
        <Link to={`/shop?category=${product.category}`} className="hover:text-black transition-colors">{product.category}</Link>
        <span className="mx-3 opacity-30">/</span>
        <span className="text-black">{product.name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        {/* Gallery */}
        <div className="lg:w-[45%]">
          <div className="flex flex-col-reverse lg:flex-row gap-4">
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible no-scrollbar">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveImg(i); setIs360Active(false); }}
                  className={`flex-shrink-0 w-12 lg:w-16 aspect-[3/4] overflow-hidden transition-all duration-300 border-2 ${activeImg === i && !is360Active ? 'border-black scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`${product.name} view ${i + 1}`} />
                </button>
              ))}
              {product.images.length > 3 && (
                <button
                  onClick={() => setIs360Active(true)}
                  className={`flex-shrink-0 w-12 lg:w-16 aspect-[3/4] flex flex-col items-center justify-center gap-1.5 border-2 transition-all ${is360Active ? 'border-black bg-black text-white shadow-md' : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-black hover:text-black'}`}
                >
                  <i className="fa-solid fa-rotate text-base"></i>
                  <span className="text-[7px] font-bold uppercase tracking-widest">360°</span>
                </button>
              )}
            </div>

            <div className="flex-grow aspect-[3/4] bg-vogue-50 overflow-hidden relative group rounded-sm shadow-inner">
              {is360Active ? (
                <Product360View images={product.images} onExit={() => setIs360Active(false)} />
              ) : (
                <>
                  <div className={`w-full h-full overflow-hidden ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`} onClick={() => setIsZoomed(!isZoomed)}>
                    <img src={product.images[activeImg]} className={`w-full h-full object-cover transition-transform duration-700 ease-out ${isZoomed ? 'scale-150' : 'group-hover:scale-105'}`} alt={product.name} />
                  </div>

                  <div className="absolute bottom-6 left-6 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/60 backdrop-blur-md px-4 py-2 text-white text-[8px] font-bold uppercase tracking-widest flex items-center gap-3 rounded-full">
                      <i className="fa-solid fa-magnifying-glass-plus"></i>
                      Click to Zoom
                    </div>
                  </div>

                  <div className="absolute top-6 right-6">
                    <button onClick={(e) => { e.stopPropagation(); dispatch(toggleWishlist(product.id)); }} className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-110 transition-all"><i className={`${isWishlisted ? 'fa-solid text-red-500' : 'fa-regular'} fa-heart text-xl`}></i></button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="lg:w-[55%]">
          <div className="lg:sticky lg:top-24 flex flex-col space-y-6">
            <header>
              <div className="flex items-center gap-2 mb-2">
                {product.brand && (
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900 border-b border-black pb-0.5">{product.brand}</span>
                )}
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">{product.subcategory}</span>
                {product.isBestSeller && (<span className="bg-black text-white text-[7px] font-bold px-1.5 py-0.5 uppercase tracking-widest">Bestseller</span>)}
              </div>
              <h1 className="text-3xl xl:text-4xl font-serif font-bold tracking-tight mb-3 leading-tight">{product.name}</h1>
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mb-6 px-0.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[7px] font-black uppercase tracking-[0.2em] text-gray-400">Ref. Identity</span>
                  <span className="text-[9px] font-bold text-black">{product.sku || 'GS-PROD-NAV'}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[7px] font-black uppercase tracking-[0.2em] text-gray-400">Material Composition</span>
                  <span className="text-[9px] font-bold text-vogue-600 uppercase tracking-wider">{product.fabric || 'Heritage Textile'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-end gap-3 flex-wrap">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 mb-0.5">Best Price</span>
                    <span className="text-3xl font-black tracking-tighter">₹{(product.price * 0.9).toLocaleString('en-IN')}</span>
                  </div>
                  {product.originalPrice && (
                    <div className="flex items-center gap-2 pb-1">
                      <span className="text-sm text-gray-300 line-through font-light italic">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                      <span className="bg-emerald-50 text-emerald-600 text-[8px] font-black px-2 py-0.5 rounded-sm uppercase tracking-widest">
                        Offer Drop Applied
                      </span>
                    </div>
                  )}
                </div>
                {product.priceDetails && (
                  <div className="group relative">
                    <button className="text-[8px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 underline underline-offset-4 transition-colors">View Price Breakdown</button>
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-zinc-100 shadow-2xl p-4 z-[50] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 rounded-xl">
                      <h5 className="text-[9px] font-black uppercase tracking-widest mb-3">Price Details</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-zinc-400">MRP</span>
                          <span className="font-bold">₹{product.priceDetails.mrp}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-zinc-400">Auto-Apply (HI-FASHION)</span>
                          <span className="text-emerald-500 font-bold">-₹{Math.round(product.price * 0.1)}</span>
                        </div>
                        <div className="pt-2 border-t border-zinc-50 flex justify-between text-xs">
                          <span className="font-black uppercase tracking-tighter">Final Price</span>
                          <span className="font-black">₹{Math.round(product.price * 0.9)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </header>

            <SmartOfferWidget currentTotal={product.price} />

            <div className="space-y-8 py-6 border-y border-gray-100/60">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">Dimensions</h4>
                  <button onClick={() => setShowSizeGuide(true)} className="text-[8px] font-bold uppercase tracking-widest text-vogue-600 hover:text-black transition-colors flex items-center gap-1.5">
                    <span className="underline underline-offset-4">Size Guide</span>
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map(size => {
                    const lowStock = product.stock[size] > 0 && product.stock[size] < 5;
                    const outOfStock = product.stock[size] === 0;
                    return (
                      <button
                        key={size}
                        disabled={outOfStock}
                        onClick={() => setSelectedSize(size)}
                        className={`relative py-3 text-[9px] font-black border transition-all duration-500 ${outOfStock ? 'opacity-20 cursor-not-allowed bg-zinc-50' : selectedSize === size ? 'bg-black text-white border-black shadow-lg scale-[1.02] z-10' : 'hover:border-stone-400 text-gray-400 hover:text-stone-800'}`}
                      >
                        {size}
                        {lowStock && !outOfStock && (
                          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-red-50 text-red-600 text-[6px] font-black px-1 py-0.5 rounded-full border border-red-100 shadow-sm whitespace-nowrap">
                            {product.stock[size]} left
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Options & Offers */}
              <div className="space-y-8">
                <div className="p-6 bg-zinc-50/50 rounded-xl border border-zinc-100/60">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    Delivery Options
                    <i className="fa-solid fa-truck-fast text-zinc-400 text-[8px]"></i>
                  </h4>
                  <div className="flex gap-2 mb-4">
                    <div className="relative flex-grow">
                      <input type="text" placeholder="Pincode" className="w-full bg-white border border-zinc-200 px-3 py-2 text-[10px] outline-none focus:border-black transition-all" defaultValue="700091" />
                      <button className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase tracking-widest text-emerald-600">Change</button>
                    </div>
                    <button className="bg-black text-white px-4 text-[8px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all">Check</button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-calendar-check text-[8px] text-zinc-400"></i>
                      <p className="text-[9px] font-bold">Delivery by <span className="text-black">Sat, Feb 21</span></p>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-600">
                      <i className="fa-solid fa-hand-holding-dollar text-[8px]"></i>
                      <p className="text-[9px] font-bold">Pay on delivery available</p>
                    </div>
                  </div>
                </div>

                {product.bestOffers && (
                  <div className="space-y-3">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                      Best Offers
                      <i className="fa-solid fa-tags text-zinc-300 text-[8px]"></i>
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {product.bestOffers.map((offer, idx) => (
                        <div key={idx} className="p-3 border border-zinc-100 rounded-lg bg-white hover:border-black transition-all group cursor-default">
                          <p className="text-[9px] font-black uppercase tracking-widest mb-0.5 group-hover:text-emerald-600 transition-colors">{offer.title}</p>
                          <p className="text-[8px] text-zinc-500 font-medium leading-tight">{offer.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Compact Specifications */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-8">
                  {product.richSpecifications && (
                    <div className="space-y-4">
                      <h4 className="text-[9px] font-black uppercase tracking-[0.3em] border-b border-zinc-50 pb-2">Technical Specs</h4>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                        {product.richSpecifications.map((spec, idx) => (
                          <div key={idx} className="flex justify-between items-center py-1">
                            <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">{spec.label}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-900">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <button onClick={() => handleShare('facebook')} className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-50 hover:text-blue-600 hover:border-blue-600 transition-all text-xs"><i className="fa-brands fa-facebook-f"></i></button>
                  <button onClick={() => handleShare('twitter')} className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-50 hover:text-sky-400 hover:border-sky-400 transition-all text-xs"><i className="fa-brands fa-x-twitter"></i></button>
                  <button onClick={() => handleShare('copy')} className={`flex-grow flex items-center justify-center gap-2 py-2 text-[8px] font-bold uppercase tracking-widest border transition-all ${copySuccess ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-50 hover:border-black'}`}>{copySuccess ? 'Copied' : 'Copy Link'}</button>
                </div>
              </div>
            </div>

            <div className="space-y-3 pb-10">
              <div className="flex flex-col sm:flex-row gap-2">
                <button onClick={() => dispatch(addToCart({ productId: product.id, size: selectedSize, color: selectedColor, quantity }))} className="flex-grow bg-white text-black border border-black py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-50 transition-all">Add to Bag</button>
                <button onClick={handleBuyNow} className="flex-grow bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-xl">Buy Now</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <section className="mt-24 pt-24 border-t border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-20">
          <div className="lg:col-span-1 space-y-8">
            <div className="space-y-4">
              <span className="text-vogue-500 text-[10px] font-bold uppercase tracking-[0.5em]">Collective Feedback</span>
              <h2 className="text-4xl font-serif font-bold tracking-tight">Community Reviews</h2>
              <div className="flex items-center gap-6">
                <span className="text-5xl font-black">{product.rating.toFixed(1)}</span>
                <div>
                  <div className="flex text-black text-sm mb-1">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`fa-solid fa-star ${i < Math.floor(product.rating) ? 'text-black' : 'text-zinc-100'}`}></i>
                    ))}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{reviews.length} Verified Reviews</p>
                </div>
              </div>
            </div>
            <RatingHistogram rating={product.rating} reviewsCount={reviews.length} />
            <button
              onClick={() => setIsWritingReview(!isWritingReview)}
              className="bg-black text-white px-10 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-3 shadow-xl"
            >
              <i className={`fa-solid ${isWritingReview ? 'fa-xmark' : 'fa-pen-nib'} text-xs`}></i>
              {isWritingReview ? 'Cancel Review' : 'Write a Review'}
            </button>
          </div>

          <div className="lg:col-span-2">
            {isWritingReview && (
              <div className="mb-20 p-10 bg-gray-50 border border-gray-100 rounded-sm animate-in slide-in-from-top duration-500">
                <form onSubmit={submitReview} className="space-y-8 max-w-2xl">
                  {/* Review form content */}
                  <div className="space-y-4">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-vogue-500">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} type="button" onClick={() => setNewReview(prev => ({ ...prev, rating: star }))} className={`text-xl transition-colors ${newReview.rating >= star ? 'text-black' : 'text-gray-200'}`}><i className="fa-solid fa-star"></i></button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-vogue-500">Comment</label>
                    <textarea required rows={4} value={newReview.comment} onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))} placeholder="Share your experience..." className="w-full bg-white border border-gray-200 p-5 text-sm outline-none focus:border-black transition-all resize-none" />
                  </div>
                  <button type="submit" className="bg-black text-white px-12 py-5 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl">Submit Review</button>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {reviews.map(review => (
                <div key={review.id} className="space-y-6 group animate-in fade-in duration-500">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold uppercase tracking-tight">{review.userName}</h4>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">{review.date}</p>
                    </div>
                    <div className="flex text-black text-[9px]">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`fa-solid fa-star ${i < review.rating ? 'text-black' : 'text-gray-100'}`}></i>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 font-light italic leading-relaxed">"{review.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Brand Partners Section */}
      <section className="mt-24 py-20 border-t border-gray-100">
        <div className="text-center mb-12">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-vogue-500 mb-2 block">The Heritage Collective</span>
          <h2 className="text-3xl font-serif font-bold tracking-tight">Our Premium Brand Partners</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
          {['Pepe Jeans', 'Jockey', 'Turtle', 'Loman'].map(brand => (
            <div key={brand} className="flex items-center justify-center h-32 border border-gray-100 hover:border-black hover:bg-white transition-all group">
              <span className="text-lg font-bold uppercase tracking-[0.3em] group-hover:scale-105 transition-transform">{brand}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Related Products Section */}
      <section className="mt-12 pt-20 border-t border-gray-100">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-vogue-500 text-[10px] font-bold uppercase tracking-[0.5em]">You May Also Like</span>
            <div className="h-px flex-grow bg-gray-100"></div>
          </div>
          <h2 className="text-4xl font-serif font-bold tracking-tight mb-4">Complete The Look</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {loadingRelated ? [...Array(4)].map((_, i) => <ProductSkeleton key={i} />) : relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
