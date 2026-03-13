import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { removeFromCartServer, updateQuantityServer, recalculateDiscounts, fetchCart } from '../store/cartSlice';
import { MOCK_COMBO_OFFERS } from '../constants';
import { SmartOfferWidget } from './ProductDetail';

const Cart: React.FC = () => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart.cart);
  const appliedCouponId = useAppSelector((state) => state.cart.appliedCouponId);
  const comboDiscount = useAppSelector((state) => state.cart.comboDiscount);
  const catalog = useAppSelector((state) => state.products.items);
  const navigate = useNavigate();

  React.useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  React.useEffect(() => {
    if (catalog.length > 0) {
      dispatch(recalculateDiscounts(catalog));
    }
  }, [cart, catalog, dispatch]);

  // Pre-compute prices once per cart/catalog change to avoid repeated .find() lookups
  const cartDetails = React.useMemo(() => cart.map(item => {
    const product = item.product || catalog.find(p => (p._id || p.id) === item.productId);
    let itemPrice = 0;
    let itemOriginalPrice = 0;
    if (product) {
      const variant = product.variants?.find((v: any) => v.color?.name === item.selectedColor);
      const sizeObj = variant?.sizes?.find((s: any) => s.size === item.selectedSize);
      itemPrice = sizeObj?.price || product.variants?.[0]?.sizes?.[0]?.price || product.price || 0;
      itemOriginalPrice = sizeObj?.originalPrice || product.variants?.[0]?.sizes?.[0]?.originalPrice || product.originalPrice || 0;
    }
    return { ...item, product, itemPrice, itemOriginalPrice };
  }), [cart, catalog]);

  const subtotal = React.useMemo(() => cartDetails.reduce((acc, item) => acc + item.itemPrice * item.quantity, 0), [cartDetails]);

  const totalMrp = React.useMemo(() => cartDetails.reduce((acc, item) => {
    return acc + (item.itemOriginalPrice || item.itemPrice) * item.quantity;
  }, 0), [cartDetails]);

  const bagDiscount = totalMrp - subtotal;

  const shipping = subtotal > 999 ? 0 : 150;

  const couponDiscount = 0; // Coupons are handled at Checkout
  const coupon = null;

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
          {cartDetails.map((item) => (
            <div key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-6 border-b border-gray-100 pb-8">
              <div className="w-32 aspect-[3/4] bg-gray-100 flex-shrink-0">
                <img
                  src={item?.product?.images?.[0] || 'https://via.placeholder.com/300x400?text=No+Image'}
                  className="w-full h-full object-cover"
                  alt={item?.product?.name || 'Product'}
                />
              </div>
              <div className="flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium">{item?.product?.name || 'Product'}</h3>
                    <button
                      onClick={() => dispatch(removeFromCartServer(item.id || item._id || ''))}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <i className="fa-regular fa-trash-can"></i>
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{item.product?.category && (typeof item.product.category === 'object' ? item.product.category.name : item.product.category)} • {item.product?.subcategory && (typeof item.product.subcategory === 'object' ? item.product.subcategory.name : item.product.subcategory)}</p>

                  {item.itemOriginalPrice > item.itemPrice && (
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-[9px] font-black bg-red-600 text-white px-2 py-0.5 uppercase tracking-widest">Offer Applied</span>
                      <span className="text-xs text-gray-300 line-through italic">₹{(item.itemOriginalPrice || 0).toLocaleString('en-IN')}</span>
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
                      onClick={() => dispatch(updateQuantityServer({ itemId: item.id || item._id || '', quantity: Math.max(1, item.quantity - 1) }))}
                      className="px-3 py-1 hover:bg-gray-50 transition-colors text-xs font-bold"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 text-xs font-bold">{item.quantity}</span>
                    <button
                      onClick={() => dispatch(updateQuantityServer({ itemId: item.id || item._id || '', quantity: item.quantity + 1 }))}
                      className="px-3 py-1 hover:bg-gray-50 transition-colors text-xs font-bold"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">₹{(item.itemPrice * item.quantity).toLocaleString('en-IN')}</p>
                    {item.itemOriginalPrice > item.itemPrice && (
                      <p className="text-[9px] font-bold text-red-600 uppercase tracking-widest">
                        Saved ₹{(((item.itemOriginalPrice - item.itemPrice) * item.quantity) || 0).toLocaleString('en-IN')}
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
                <span className="font-bold text-zinc-400 line-through">₹{(totalMrp || 0).toLocaleString('en-IN')}</span>
              </div>

              {bagDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Bag Discount</span>
                  <span>- ₹{(bagDiscount || 0).toLocaleString('en-IN')}</span>
                </div>
              )}

              {comboDiscount > 0 && (
                <div className="flex justify-between text-orange-600 font-bold">
                  <span>Combo Offer Reward</span>
                  <span>- ₹{(comboDiscount || 0).toLocaleString('en-IN')}</span>
                </div>
              )}

              {coupon && (
                <div className="flex justify-between text-orange-600 font-bold">
                  <span>Coupon ({coupon.code})</span>
                  <span>- ₹{(couponDiscount || 0).toLocaleString('en-IN')}</span>
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
                    <span className="text-2xl font-black tracking-tighter text-zinc-900">₹{(bagDiscount + comboDiscount + couponDiscount || 0).toLocaleString('en-IN')}</span>
                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Congratulations!</span>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-5 flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-widest">Total Amount</span>
                <div className="text-right">
                  <span className="text-2xl font-black tracking-tighter">₹{(finalTotal || 0).toLocaleString('en-IN')}</span>
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
