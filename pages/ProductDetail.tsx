
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MOCK_PRODUCTS, LAUNCH_PROMOS, MOCK_REVIEWS } from '../constants';
import { useApp } from '../App';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import { getRelatedPairings } from '../services/gemini';
import { Product, Review } from '../types';
import Product360View from '../components/Product360View';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlist, setSharedProduct, setIsStyleAssistantOpen, userStyleProfile, user } = useApp();

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

  // AI Recommendations State
  const [aiCuratedPairings, setAiCuratedPairings] = useState<Product[]>([]);
  const [stylingReason, setStylingReason] = useState<string>('');
  const [loadingPairings, setLoadingPairings] = useState(false);

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

      // Trigger AI Pairings
      fetchAiPairings(product);
    }
  }, [product, id]);

  const fetchAiPairings = async (currentProd: Product) => {
    setLoadingPairings(true);
    const result = await getRelatedPairings(currentProd, MOCK_PRODUCTS, userStyleProfile);
    if (result && result.recommendedIds) {
      const recommended = MOCK_PRODUCTS.filter(p => result.recommendedIds.includes(p.id));
      setAiCuratedPairings(recommended);
      setStylingReason(result.stylingReason);
    } else {
      setAiCuratedPairings(MOCK_PRODUCTS.filter(p => p.id !== currentProd.id).slice(0, 4));
    }
    setLoadingPairings(false);
  };

  const handleHelpful = (reviewId: string) => {
    setReviews(prev => prev.map(r =>
      r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r
    ));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
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

  if (!product) {
    return (
      <div className="py-40 text-center">
        <h2 className="text-2xl font-serif mb-4">Product not found.</h2>
        <button onClick={() => navigate('/shop')} className="underline">Back to Shop</button>
      </div>
    );
  }

  const handleConsultStylist = () => {
    setSharedProduct(product);
    setIsStyleAssistantOpen(true);
  };

  const handleBuyNow = () => {
    addToCart(product.id, selectedSize, selectedColor, quantity);
    navigate('/checkout');
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
  const savingsAmount = product.originalPrice ? product.originalPrice - product.price : 0;

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

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
        {/* Gallery */}
        <div className="lg:w-[60%]">
          <div className="flex flex-col-reverse lg:flex-row gap-6">
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible no-scrollbar">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveImg(i); setIs360Active(false); }}
                  className={`flex-shrink-0 w-16 lg:w-20 aspect-[3/4] overflow-hidden transition-all duration-300 border-2 ${activeImg === i && !is360Active ? 'border-black scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`${product.name} view ${i + 1}`} />
                </button>
              ))}
              {product.images.length > 3 && (
                <button
                  onClick={() => setIs360Active(true)}
                  className={`flex-shrink-0 w-16 lg:w-20 aspect-[3/4] flex flex-col items-center justify-center gap-2 border-2 transition-all ${is360Active ? 'border-black bg-black text-white shadow-md' : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-black hover:text-black'}`}
                >
                  <i className="fa-solid fa-rotate text-lg"></i>
                  <span className="text-[8px] font-bold uppercase tracking-widest">360° View</span>
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
                    <button onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }} className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-110 transition-all"><i className={`${isWishlisted ? 'fa-solid text-red-500' : 'fa-regular'} fa-heart text-xl`}></i></button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="lg:w-[40%]">
          <div className="lg:sticky lg:top-24 flex flex-col space-y-8">
            <header>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-vogue-500">{product.subcategory}</span>
                {product.isBestSeller && (<span className="bg-black text-white text-[8px] font-bold px-2 py-0.5 uppercase tracking-widest">Bestseller</span>)}
              </div>
              <h1 className="text-4xl xl:text-5xl font-serif font-bold tracking-tight mb-4 leading-tight">{product.name}</h1>
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 mb-8 px-0.5">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black uppercase tracking-[0.25em] text-gray-400">Ref. Identity</span>
                  <span className="text-[10px] font-bold text-black border-b border-black/5 pb-1">{product.sku || 'GS-PROD-NAV'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black uppercase tracking-[0.25em] text-gray-400">Material Composition</span>
                  <span className="text-[10px] font-bold text-vogue-600 uppercase tracking-wider">{product.fabric || 'Heritage Textile'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-black tracking-tighter">₹{product.price.toLocaleString('en-IN')}</span>
                  {product.originalPrice && (
                    <div className="flex items-center gap-3">
                      <span className="text-lg text-gray-300 line-through font-light italic">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                      {discountPercentage && (
                        <span className="bg-black text-white text-[9px] font-black px-3 py-1 rounded-sm uppercase tracking-[0.2em]">
                          -{discountPercentage}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </header>

            <div className="space-y-10 py-10 border-y border-gray-100/60">
              <div>
                <div className="flex justify-between items-center mb-5">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Dimension Selection</h4>
                  <button onClick={() => setShowSizeGuide(true)} className="text-[9px] font-bold uppercase tracking-widest text-vogue-600 hover:text-black transition-colors flex items-center gap-2">
                    <i className="fa-solid fa-ruler-horizontal text-[10px]"></i>
                    <span className="underline underline-offset-4">Size Guide</span>
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {product.sizes.map(size => (
                    <button key={size} onClick={() => setSelectedSize(size)} className={`py-4 text-[10px] font-black border transition-all duration-500 ${selectedSize === size ? 'bg-black text-white border-black shadow-2xl scale-[1.02] z-10' : 'hover:border-stone-400 text-gray-400 hover:text-stone-800'}`}>{size}</button>
                  ))}
                </div>
              </div>

              {/* Product Specifications - Premium Detail Section */}
              {product.specifications && (
                <div className="pt-10 border-t border-gray-100/50">
                  <div className="flex items-center gap-4 mb-6">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-black">Technical Specifications</h4>
                    <div className="h-[1px] flex-grow bg-gradient-to-r from-gray-100 to-transparent"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5">
                    {product.specifications.map((spec, idx) => (
                      <div key={idx} className="flex items-start gap-4 group cursor-default">
                        <div className="w-1 h-1 rounded-full bg-vogue-300 mt-2 transition-all duration-500 group-hover:scale-[1.5] group-hover:bg-vogue-600"></div>
                        <span className="text-[11px] text-gray-500 font-medium leading-relaxed tracking-tight group-hover:text-black transition-colors duration-300 italic sm:not-italic">{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => addToCart(product.id, selectedSize, selectedColor, quantity)} className="flex-grow bg-white text-black border border-black py-5 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-gray-50 transition-all">Add to Bag</button>
                <button onClick={handleBuyNow} className="flex-grow bg-black text-white py-5 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-xl">Buy Now</button>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-vogue-500 mb-4">Share with the World</p>
              <div className="flex items-center gap-3">
                <button onClick={() => handleShare('facebook')} className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-100 hover:text-blue-600 hover:border-blue-600 transition-all"><i className="fa-brands fa-facebook-f text-sm"></i></button>
                <button onClick={() => handleShare('twitter')} className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-100 hover:text-sky-400 hover:border-sky-400 transition-all"><i className="fa-brands fa-x-twitter text-sm"></i></button>
                <button onClick={() => handleShare('copy')} className={`flex-grow flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold uppercase tracking-widest border transition-all ${copySuccess ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-100 hover:border-black'}`}>{copySuccess ? 'Copied' : 'Copy Link'}</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <section className="mt-24 pt-24 border-t border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <div className="space-y-4">
            <span className="text-vogue-500 text-[10px] font-bold uppercase tracking-[0.5em]">Collective Feedback</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">Community Reviews</h2>
            <div className="flex items-center gap-4">
              <div className="flex text-black text-sm">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className={`fa-solid fa-star ${i < Math.floor(product.rating) ? 'text-black' : 'text-gray-100'}`}></i>
                ))}
              </div>
              <span className="text-sm font-bold">{product.rating} / 5.0</span>
              <span className="text-sm text-gray-400 font-light">({reviews.length} Reviews)</span>
            </div>
          </div>
          <button
            onClick={() => setIsWritingReview(!isWritingReview)}
            className="bg-black text-white px-10 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-3 shadow-xl"
          >
            <i className={`fa-solid ${isWritingReview ? 'fa-xmark' : 'fa-pen-nib'} text-xs`}></i>
            {isWritingReview ? 'Cancel Review' : 'Write a Review'}
          </button>
        </div>

        {isWritingReview && (
          <div className="mb-20 p-10 bg-gray-50 border border-gray-100 rounded-sm animate-in slide-in-from-top duration-500">
            <form onSubmit={submitReview} className="space-y-8 max-w-2xl">
              <div className="space-y-4">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-vogue-500">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                      className={`text-xl transition-colors ${newReview.rating >= star ? 'text-black' : 'text-gray-200'}`}
                    >
                      <i className="fa-solid fa-star"></i>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-vogue-500">Comment</label>
                <textarea
                  required
                  rows={4}
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Share your experience with this heritage piece..."
                  className="w-full bg-white border border-gray-200 p-5 text-sm outline-none focus:border-black transition-all resize-none"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-vogue-500">Visual Evidence</label>
                <div className="flex flex-wrap gap-4">
                  {newReview.images.map((img, i) => (
                    <div key={i} className="relative w-20 h-20 border border-gray-100 group">
                      <img src={img} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewReview(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                        className="absolute -top-2 -right-2 bg-black text-white w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <i className="fa-solid fa-xmark text-[10px]"></i>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:text-black hover:border-black transition-all"
                  >
                    <i className="fa-solid fa-camera text-xl mb-1"></i>
                    <span className="text-[8px] font-bold uppercase">Upload</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              <button type="submit" className="bg-black text-white px-12 py-5 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl">
                Submit Collective Feedback
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
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
              <p className="text-sm text-gray-600 font-light italic leading-relaxed">
                "{review.comment}"
              </p>
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2">
                  {review.images.map((img, i) => (
                    <div key={i} className="w-16 h-16 bg-gray-50 overflow-hidden border border-gray-100">
                      <img src={img} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                    </div>
                  ))}
                </div>
              )}
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <button
                  onClick={() => handleHelpful(review.id)}
                  className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-vogue-500 hover:text-black transition-colors"
                >
                  <i className="fa-regular fa-thumbs-up"></i>
                  Helpful ({review.helpfulCount || 0})
                </button>
                <span className="text-[9px] font-bold uppercase tracking-widest text-vogue-100 group-hover:text-vogue-500 transition-colors">Verified Collector</span>
              </div>
            </div>
          ))}
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

      {/* AI-Powered Curated Pairings Section */}
      <section className="mt-12 pt-20 border-t border-gray-100">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-vogue-500 text-[10px] font-bold uppercase tracking-[0.5em]">GS Intelligence</span>
            <div className="h-px flex-grow bg-gray-100"></div>
          </div>
          <h2 className="text-4xl font-serif font-bold tracking-tight mb-4">Curated Pairings</h2>
          {stylingReason && !loadingPairings && (
            <p className="text-sm text-gray-500 font-light italic border-l-2 border-vogue-500 pl-4 max-w-2xl animate-fade-in">
              "{stylingReason}"
            </p>
          )}
        </div>

        {loadingPairings ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {aiCuratedPairings.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductDetail;
