
import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setQuickViewProduct } from '../store/uiSlice';
import { addToCart } from '../store/cartSlice';
import { Link, useNavigate } from 'react-router-dom';

const QuickViewModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const quickViewProduct = useAppSelector((state) => state.ui.quickViewProduct);
  const user = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (quickViewProduct) {
      setSelectedSize(quickViewProduct.sizes[0]);
      setSelectedColor(quickViewProduct.colors[0]);
      setQuantity(1);
      setActiveImg(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const handleClose = () => dispatch(setQuickViewProduct(null));

  const handleIncrement = () => setQuantity(q => q + 1);
  const handleDecrement = () => setQuantity(q => Math.max(1, q - 1));

  const handleAddToCart = () => {
    // Allow guest adding to bag
    dispatch(addToCart({ productId: quickViewProduct.id, size: selectedSize, color: selectedColor, quantity }));
    handleClose();
  };

  const currentTotal = quickViewProduct.price * quantity;

  const discountPercentage = quickViewProduct.originalPrice
    ? Math.round(((quickViewProduct.originalPrice - quickViewProduct.price) / quickViewProduct.originalPrice) * 100)
    : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose}></div>

      <div className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-500 rounded-sm">
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 z-10 w-12 h-12 flex items-center justify-center text-gray-400 hover:text-black transition-all bg-vogue-50 rounded-full hover:bg-vogue-100"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        <div className="md:w-1/2 bg-vogue-50 relative group">
          <div className="aspect-[3/4] overflow-hidden">
            <img
              src={quickViewProduct.images[activeImg]}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              alt={quickViewProduct.name}
            />
          </div>
          {quickViewProduct.images.length > 1 && (
            <div className="flex p-4 gap-3 overflow-x-auto bg-white/95 backdrop-blur-sm border-t border-gray-100 no-scrollbar">
              {quickViewProduct.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-16 h-20 flex-shrink-0 border-2 transition-all ${activeImg === i ? 'border-black scale-105 shadow-md' : 'border-transparent opacity-40 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="Gallery thumbnail" />
                </button>
              ))}
            </div>
          )}
          <div className="absolute top-6 left-6 flex flex-col gap-2">
            <span className="bg-black text-white text-[8px] font-bold px-3 py-1 uppercase tracking-[0.3em]">Quick View Selection</span>
            {discountPercentage && (
              <span className="bg-red-600 text-white text-[8px] font-black px-3 py-1 uppercase tracking-widest self-start">
                Save {discountPercentage}%
              </span>
            )}
          </div>
        </div>

        <div className="md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-between bg-white">
          <div className="space-y-10">
            <header className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-vogue-500">{quickViewProduct.subcategory}</span>
                <div className="flex items-center gap-1.5 text-black text-[9px]">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`fa-solid fa-star ${i < Math.floor(quickViewProduct.rating) ? 'text-black' : 'text-gray-100'}`}></i>
                    ))}
                  </div>
                  <span className="font-bold text-gray-400">({quickViewProduct.rating})</span>
                </div>
              </div>
              <h2 className="text-3xl lg:text-4xl font-serif font-bold tracking-tight leading-tight">{quickViewProduct.name}</h2>
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold tracking-tighter text-black">₹{quickViewProduct.price.toLocaleString('en-IN')}</span>
                  {quickViewProduct.originalPrice && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-vogue-500 line-through font-light italic font-serif opacity-50">₹{quickViewProduct.originalPrice.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
                {discountPercentage && (
                  <span className="text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-50 px-2 py-1 border border-red-100">
                    {discountPercentage}% OFF
                  </span>
                )}
              </div>
            </header>

            <div className="space-y-8">
              {/* Color Selection */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-vogue-500">Curated Color</h4>
                <div className="flex gap-4">
                  {quickViewProduct.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                      className={`w-6 h-6 rounded-full border ring-offset-4 transition-all ${selectedColor === color ? 'ring-2 ring-black scale-110' : 'border-gray-200 hover:scale-105'}`}
                      style={{ backgroundColor: color.toLowerCase().replace(' ', '') }}
                    ></button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-vogue-500">Heritage Fit</h4>
                <div className="grid grid-cols-4 gap-2">
                  {quickViewProduct.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 text-[10px] font-bold border transition-all ${selectedSize === size ? 'bg-black text-white border-black shadow-lg' : 'border-gray-100 hover:border-black text-gray-400 hover:text-black'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Enhanced Quantity Selector */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-vogue-500">Order Quantity</h4>
                <div className="flex items-center w-36 border border-gray-200 group focus-within:border-black transition-colors">
                  <button
                    onClick={handleDecrement}
                    className="w-12 h-12 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-black transition-all"
                  >
                    <i className="fa-solid fa-minus text-[10px]"></i>
                  </button>
                  <span className="flex-grow text-center text-xs font-black">{quantity}</span>
                  <button
                    onClick={handleIncrement}
                    className="w-12 h-12 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-black transition-all"
                  >
                    <i className="fa-solid fa-plus text-[10px]"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 space-y-6">
            <div className="flex justify-between items-end border-b border-gray-50 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-vogue-500">Subtotal Selection</span>
              <span className="text-xl font-serif font-bold italic">₹{currentTotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                className="w-full bg-black text-white py-6 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3"
              >
                <i className="fa-solid fa-bag-shopping"></i>
                Add {quantity > 1 ? `${quantity} Items` : 'to Bag'}
              </button>
              <Link
                to={`/product/${quickViewProduct.id}`}
                onClick={handleClose}
                className="block w-full text-center text-[9px] font-bold uppercase tracking-[0.4em] py-4 text-vogue-500 hover:text-black hover:bg-vogue-50 transition-all border border-transparent hover:border-vogue-100"
              >
                View Curated Details <i className="fa-solid fa-arrow-right-long ml-2"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
