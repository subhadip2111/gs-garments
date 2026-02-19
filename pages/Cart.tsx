
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { MOCK_PRODUCTS, MOCK_COUPONS, MOCK_COMBO_OFFERS } from '../constants';
import { SmartOfferWidget } from './ProductDetail';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateCartQuantity, appliedCouponId, comboDiscount } = useApp();
  const navigate = useNavigate();

  const cartDetails = cart.map(item => {
    const product = MOCK_PRODUCTS.find(p => p.id === item.productId);
    return { ...item, product };
  });

  const subtotal = cartDetails.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);

  const totalMrp = cartDetails.reduce((acc, item) => {
    return acc + (item.product?.originalPrice || item.product?.price || 0) * item.quantity;
  }, 0);

  const bagDiscount = totalMrp - subtotal;

  const shipping = subtotal > 5000 ? 0 : 150;

  const coupon = MOCK_COUPONS.find(c => c.id === appliedCouponId);
  let couponDiscount = 0;
  if (coupon) {
    if (coupon.discountType === 'percentage') {
      couponDiscount = Math.round((subtotal - comboDiscount) * coupon.discountValue / 100);
    } else {
      couponDiscount = coupon.discountValue;
    }
  }

  const finalTotal = subtotal + shipping - comboDiscount - couponDiscount;

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-40 text-center">
        <h2 className="text-3xl font-serif font-bold mb-6">Your shopping bag is empty</h2>
        <p className="text-gray-500 mb-8">Items added to your bag will appear here.</p>
        <Link to="/shop" className="bg-black text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold mb-12">Shopping Bag</h1>

      <div className="flex flex-col lg:flex-row gap-16">
        {/* Items List */}
        <div className="lg:w-2/3 space-y-8">
          {cartDetails.map((item, idx) => (
            <div key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-6 border-b border-gray-100 pb-8">
              <div className="w-32 aspect-[3/4] bg-gray-100 flex-shrink-0">
                <img src={item.product?.images[0]} className="w-full h-full object-cover" alt={item.product?.name} />
              </div>
              <div className="flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium">{item.product?.name}</h3>
                    <button
                      onClick={() => removeFromCart(item.productId, item.selectedSize, item.selectedColor)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <i className="fa-regular fa-trash-can"></i>
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{item.product?.category} • {item.product?.subcategory}</p>

                  {item.product?.originalPrice && (
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-[9px] font-black bg-red-600 text-white px-2 py-0.5 uppercase tracking-widest">Offer Applied</span>
                      <span className="text-xs text-gray-300 line-through italic">₹{item.product.originalPrice.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="mt-4 flex gap-6 text-xs uppercase font-bold tracking-widest text-gray-500">
                    <span>Size: <span className="text-black">{item.selectedSize}</span></span>
                    <span>Color: <span className="text-black">{item.selectedColor}</span></span>
                  </div>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <div className="flex items-center border border-gray-200">
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.selectedSize, item.selectedColor, -1)}
                      className="px-3 py-1 hover:bg-gray-50 transition-colors text-xs font-bold"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 text-xs font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.selectedSize, item.selectedColor, 1)}
                      className="px-3 py-1 hover:bg-gray-50 transition-colors text-xs font-bold"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}</p>
                    {item.product?.originalPrice && (
                      <p className="text-[9px] font-bold text-red-600 uppercase tracking-widest">
                        Saved ₹{((item.product.originalPrice - item.product.price) * item.quantity).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:w-1/3">
          <div className="bg-gray-50 p-8 sticky top-24 border border-gray-100">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-6">Order Summary</h2>
            <div className="mb-6">
              <SmartOfferWidget currentTotal={subtotal} />
            </div>

            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Total MRP</span>
                <span className="font-bold text-zinc-400 line-through">₹{totalMrp.toLocaleString('en-IN')}</span>
              </div>

              {bagDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Bag Discount</span>
                  <span>- ₹{bagDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {comboDiscount > 0 && (
                <div className="flex justify-between text-orange-600 font-bold">
                  <span>Combo Offer Reward</span>
                  <span>- ₹{comboDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {coupon && (
                <div className="flex justify-between text-orange-600 font-bold">
                  <span>Coupon ({coupon.code})</span>
                  <span>- ₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Shipping</span>
                <span className="font-semibold">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>

              {bagDiscount + comboDiscount + couponDiscount > 0 && (
                <div className="py-4 px-4 bg-orange-50 border border-orange-100 rounded-xl shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-5 transform rotate-12 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-fire text-3xl text-orange-600"></i>
                  </div>
                  <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-2 mb-1">
                    <i className="fa-solid fa-sparkles animate-pulse"></i>
                    Total Bag Savings
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black tracking-tighter text-zinc-900">₹{(bagDiscount + comboDiscount + couponDiscount).toLocaleString('en-IN')}</span>
                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Congratulations!</span>
                  </div>
                </div>
              )}

              {bagDiscount + comboDiscount + couponDiscount > 0 && (
                <div className="py-4 px-4 bg-orange-50 border border-orange-100 rounded-xl shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-5 transform rotate-12 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-fire text-3xl text-orange-600"></i>
                  </div>
                  <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-2 mb-1">
                    <i className="fa-solid fa-sparkles animate-pulse"></i>
                    Your Fashion Savings
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black tracking-tighter text-zinc-900">₹{(bagDiscount + comboDiscount + couponDiscount).toLocaleString('en-IN')}</span>
                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Saved so far</span>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-5 flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-widest">Total Amount</span>
                <div className="text-right">
                  <span className="text-2xl font-black tracking-tighter">₹{finalTotal.toLocaleString('en-IN')}</span>
                  <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Inc. of all taxes</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all mb-4 shadow-xl"
            >
              Secure Checkout
            </button>
            <p className="text-[10px] text-gray-400 text-center uppercase tracking-tighter">
              <i className="fa-solid fa-lock mr-2"></i> Encrypted Secure Payments
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
