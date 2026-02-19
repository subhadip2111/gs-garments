import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { placeOrder } from '../store/cartSlice';
import { useToast } from '../components/Toast';
import { MOCK_PRODUCTS, MOCK_COUPONS, MOCK_COMBO_OFFERS } from '../constants';
import { Order, CartItem } from '../types';

const Checkout: React.FC = () => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart.cart);
  const user = useAppSelector((state) => state.auth.user);
  const appliedCouponId = useAppSelector((state) => state.cart.appliedCouponId);
  const comboDiscount = useAppSelector((state) => state.cart.comboDiscount);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const buyNowItem = location.state?.buyNowItem as CartItem | undefined;
  const [step, setStep] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Shipment States
  const [shippingDetails, setShippingDetails] = useState({
    firstName: user?.user_metadata?.full_name?.split(' ')[0] || '',
    lastName: user?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
    mobile: user?.user_metadata?.mobile || '',
    addressLine1: '', // Flat/House/Building
    addressLine2: '', // Village/Moore
    city: '',
    pincode: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Pre-populate if user has saved addresses
  React.useEffect(() => {
    if (user?.user_metadata?.addresses?.length > 0) {
      const defaultAddr = user.user_metadata.addresses.find((addr: any) => addr.isDefault) || user.user_metadata.addresses[0];
      if (defaultAddr) {
        setShippingDetails(prev => ({
          ...prev,
          firstName: defaultAddr.fullName.split(' ')[0] || prev.firstName,
          lastName: defaultAddr.fullName.split(' ').slice(1).join(' ') || prev.lastName,
          mobile: defaultAddr.mobile || prev.mobile,
          addressLine1: defaultAddr.street || '',
          addressLine2: defaultAddr.village || '',
          city: defaultAddr.city || '',
          pincode: defaultAddr.pincode || ''
        }));
      }
    }
  }, [user]);

  if (!buyNowItem && cart.length === 0) {
    navigate('/shop');
    return null;
  }

  const itemsToPurchase = buyNowItem ? [buyNowItem] : cart;

  const subtotal = itemsToPurchase.reduce((acc, item) => {
    const product = MOCK_PRODUCTS.find(p => p.id === item.productId);
    return acc + (product?.price || 0) * item.quantity;
  }, 0);

  const totalMrp = itemsToPurchase.reduce((acc, item) => {
    const product = MOCK_PRODUCTS.find(p => p.id === item.productId);
    return acc + (product?.originalPrice || product?.price || 0) * item.quantity;
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

  const validateShipment = () => {
    const newErrors: { [key: string]: string } = {};

    if (!shippingDetails.firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!shippingDetails.lastName.trim()) newErrors.lastName = 'Last name is required.';

    if (!shippingDetails.mobile) {
      newErrors.mobile = 'Mobile number is required.';
    } else if (!/^[6-9]\d{9}$/.test(shippingDetails.mobile)) {
      newErrors.mobile = 'Enter a valid 10-digit number.';
    }

    if (!shippingDetails.addressLine1.trim()) newErrors.addressLine1 = 'Address is required.';
    if (!shippingDetails.city.trim()) newErrors.city = 'City/Locality is required.';

    if (!shippingDetails.pincode) {
      newErrors.pincode = 'Pincode is required.';
    } else if (!/^\d{6}$/.test(shippingDetails.pincode)) {
      newErrors.pincode = 'Enter a valid 6-digit pincode.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToPayment = () => {
    if (validateShipment()) {
      setStep(2);
      window.scrollTo(0, 0);
    } else {
      showToast("Please fill all required shipping details correctly.", "error");
    }
  };

  const handlePlaceOrder = () => {
    setLoading(true);

    // Create new order object
    const newOrder: Order = {
      id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      items: itemsToPurchase.map(item => ({
        ...item,
        priceAtPurchase: MOCK_PRODUCTS.find(p => p.id === item.productId)?.price || 0
      })),
      total: finalTotal,
      status: 'Processing',
      type: buyNowItem ? 'buy-now' : 'cart',
      appliedCoupon: appliedCouponId || undefined,
      discountAmount: comboDiscount + couponDiscount,
      shippingAddress: {
        fullName: `${shippingDetails.firstName} ${shippingDetails.lastName}`,
        mobile: shippingDetails.mobile,
        street: shippingDetails.addressLine1,
        village: shippingDetails.addressLine2,
        city: shippingDetails.city,
        pincode: shippingDetails.pincode,
        country: 'India'
      },
      deliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      trackingSteps: [
        { status: 'Order Accepted', description: 'Your order has been received and is being processed.', date: new Date().toLocaleString(), isCompleted: true },
        { status: 'Packed', description: 'Item has been quality checked and packed.', date: '', isCompleted: false },
        { status: 'Shipped', description: 'Parcel has been handed over to our courier partner.', date: '', isCompleted: false },
        { status: 'Out for Delivery', description: 'Our delivery executive is on the way to your location.', date: '', isCompleted: false },
        { status: 'Delivered', description: 'Parcel successfully delivered.', date: '', isCompleted: false },
      ]
    };

    setTimeout(() => {
      dispatch(placeOrder(newOrder)); // Persist to Redux
      setLoading(false);
      showToast("Order Placed Successfully", "success");
      navigate('/profile?tab=orders');
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-16">
        <div className="lg:w-2/3">
          {/* Progress Section */}
          <div className="flex items-center space-x-4 mb-12 overflow-x-auto">
            <div className={`flex items-center space-x-2 whitespace-nowrap ${step >= 1 ? 'text-black font-bold' : 'text-gray-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-black bg-black text-white' : 'border-gray-200'}`}>1</span>
              <span className="text-[10px] uppercase tracking-widest">Shipping</span>
            </div>
            <div className="w-8 border-t border-gray-200"></div>
            <div className={`flex items-center space-x-2 whitespace-nowrap ${step >= 2 ? 'text-black font-bold' : 'text-gray-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-black bg-black text-white' : 'border-gray-200'}`}>2</span>
              <span className="text-[10px] uppercase tracking-widest">Payment</span>
            </div>
            <div className="w-8 border-t border-gray-200"></div>
            <div className={`flex items-center space-x-2 whitespace-nowrap ${step >= 3 ? 'text-black font-bold' : 'text-gray-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-black bg-black text-white' : 'border-gray-200'}`}>3</span>
              <span className="text-[10px] uppercase tracking-widest">Review</span>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <h2 className="text-2xl font-serif font-bold tracking-tight">Shipping Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2">First Name</label>
                  <input
                    type="text"
                    value={shippingDetails.firstName}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, firstName: e.target.value })}
                    className={`w-full border ${errors.firstName ? 'border-red-500 bg-red-50/20' : 'border-gray-200'} p-3 text-sm focus:border-black outline-none transition-all`}
                    placeholder="Aditi"
                  />
                  {errors.firstName && <p className="text-[10px] text-red-500 mt-1 font-bold uppercase tracking-widest">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2">Last Name</label>
                  <input
                    type="text"
                    value={shippingDetails.lastName}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, lastName: e.target.value })}
                    className={`w-full border ${errors.lastName ? 'border-red-500 bg-red-50/20' : 'border-gray-200'} p-3 text-sm focus:border-black outline-none transition-all`}
                    placeholder="Sharma"
                  />
                  {errors.lastName && <p className="text-[10px] text-red-500 mt-1 font-bold uppercase tracking-widest">{errors.lastName}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2">Mobile Number (India)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400 text-sm font-medium">+91</span>
                    <input
                      type="tel"
                      value={shippingDetails.mobile}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setShippingDetails({ ...shippingDetails, mobile: val });
                      }}
                      className={`w-full border ${errors.mobile ? 'border-red-500 bg-red-50/20' : 'border-gray-200'} pl-12 p-3 text-sm focus:border-black outline-none transition-all`}
                      placeholder="9876543210"
                    />
                  </div>
                  {errors.mobile && <p className="text-[10px] text-red-500 mt-1 font-bold uppercase tracking-widest">{errors.mobile}</p>}
                </div>
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2">Flat / House No. / Building</label>
                    <input
                      type="text"
                      value={shippingDetails.addressLine1}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, addressLine1: e.target.value })}
                      className={`w-full border ${errors.addressLine1 ? 'border-red-500 bg-red-50/20' : 'border-gray-200'} p-3 text-sm focus:border-black outline-none transition-all`}
                      placeholder="B-102, Green Meadows"
                    />
                    {errors.addressLine1 && <p className="text-[10px] text-red-500 mt-1 font-bold uppercase tracking-widest">{errors.addressLine1}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2">Village / Moore</label>
                    <input
                      type="text"
                      value={shippingDetails.addressLine2}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, addressLine2: e.target.value })}
                      className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none"
                      placeholder="Asoda (Optional)"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2">Locality / City</label>
                  <input
                    type="text"
                    value={shippingDetails.city}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                    className={`w-full border ${errors.city ? 'border-red-500 bg-red-50/20' : 'border-gray-200'} p-3 text-sm focus:border-black outline-none transition-all`}
                    placeholder="Bandra West, Mumbai"
                  />
                  {errors.city && <p className="text-[10px] text-red-500 mt-1 font-bold uppercase tracking-widest">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2">Pincode</label>
                  <input
                    type="text"
                    value={shippingDetails.pincode}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    className={`w-full border ${errors.pincode ? 'border-red-500 bg-red-50/20' : 'border-gray-200'} p-3 text-sm focus:border-black outline-none transition-all`}
                    placeholder="400050"
                  />
                  {errors.pincode && <p className="text-[10px] text-red-500 mt-1 font-bold uppercase tracking-widest">{errors.pincode}</p>}
                </div>
              </div>
              <button
                onClick={handleProceedToPayment}
                className="bg-black text-white px-12 py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
              >
                Proceed to Payment
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <h2 className="text-2xl font-serif font-bold tracking-tight">Payment Method</h2>
              <div className="space-y-4">
                <label className="flex items-center p-6 border-2 border-black cursor-pointer bg-zinc-50 rounded-xl shadow-sm">
                  <input type="radio" name="payment" defaultChecked className="w-4 h-4 accent-black mr-4" />
                  <div className="flex-grow flex justify-between items-center">
                    <div>
                      <span className="text-sm font-bold uppercase tracking-widest block">Cash on Delivery</span>
                      <span className="text-[10px] text-zinc-400 font-medium mt-1 block uppercase tracking-tighter">Pay securely when your package arrives</span>
                    </div>
                    <div className="flex space-x-2 text-2xl opacity-40">
                      <i className="fa-solid fa-hand-holding-dollar"></i>
                    </div>
                  </div>
                </label>
              </div>

              <div className="p-4 bg-zinc-100/50 rounded-lg flex gap-3 items-start">
                <i className="fa-solid fa-circle-info text-zinc-400 mt-1 text-xs"></i>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold leading-relaxed">
                  Note: Digital payment methods are currently disabled for maintenance. We only accept Cash on Delivery at this time.
                </p>
              </div>

              <div className="flex space-x-6 pt-6">
                <button onClick={() => setStep(1)} className="text-xs font-bold uppercase tracking-widest underline underline-offset-4 hover:text-zinc-600 transition-colors">Back</button>
                <button
                  onClick={() => setStep(3)}
                  className="bg-black text-white px-16 py-5 text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl rounded-full"
                >
                  Review Order
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <h2 className="text-2xl font-serif font-bold tracking-tight">Final Review</h2>
              <div className="p-6 bg-gray-50 space-y-4">
                <p className="text-xs text-gray-500 leading-relaxed uppercase tracking-tighter">
                  By clicking 'Place Order', you agree to our Terms of Service and Privacy Policy.
                  Shipment will be handled by our premium pan-India logistics partners.
                </p>
                <div className="flex space-x-4">
                  <button onClick={() => setStep(2)} className="text-xs font-bold uppercase tracking-widest underline">Back</button>
                  <button
                    disabled={loading}
                    onClick={() => setShowConfirmModal(true)}
                    className="flex-grow bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Place Order'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white border border-gray-100 p-8 sticky top-24">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">Bag Summary</h3>
            <div className="space-y-4 mb-8">
              {itemsToPurchase.map(item => {
                const product = MOCK_PRODUCTS.find(p => p.id === item.productId);
                return (
                  <div key={`${item.productId}-${item.selectedSize}`} className="flex justify-between text-sm">
                    <span className="text-gray-500">{product?.name} x{item.quantity}</span>
                    <span className="font-semibold">₹{((product?.price || 0) * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Total MRP</span>
                <span className="font-bold text-zinc-400 line-through">₹{totalMrp.toLocaleString('en-IN')}</span>
              </div>

              {bagDiscount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600 font-bold">
                  <span>Bag Discount</span>
                  <span>- ₹{bagDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {comboDiscount > 0 && (
                <div className="flex justify-between text-sm text-orange-600 font-bold">
                  <span>Combo Discount</span>
                  <span>-₹{comboDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {coupon && (
                <div className="flex justify-between text-sm text-orange-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
              </div>

              {(comboDiscount + couponDiscount) > 0 && (
                <div className="mt-6 py-4 px-4 bg-zinc-950 rounded-2xl border border-zinc-800 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <i className="fa-solid fa-gift text-2xl text-orange-400"></i>
                  </div>
                  <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-1 leading-none">Checkout Reward</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black tracking-tighter text-white">₹{(comboDiscount + couponDiscount).toLocaleString('en-IN')} OFF</span>
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Applied</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-6 mt-4 border-t border-gray-100">
                <span className="text-xs font-black uppercase tracking-widest">Total</span>
                <div className="text-right">
                  <span className="text-2xl font-black tracking-tighter text-zinc-900">₹{finalTotal.toLocaleString('en-IN')}</span>
                  <p className="text-[8px] text-zinc-400 uppercase tracking-widest mt-1">Inc. of all taxes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowConfirmModal(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                <i className="fa-solid fa-shopping-bag text-zinc-400"></i>
              </div>
              <h3 className="text-xl font-serif font-bold mb-2">Confirm Your Order</h3>
              <p className="text-sm text-zinc-500 mb-8">
                Are you sure you want to place this order for <span className="font-bold text-black">₹{finalTotal.toLocaleString('en-IN')}</span>?
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    handlePlaceOrder();
                  }}
                  disabled={loading}
                  className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all rounded-full"
                >
                  {loading ? 'Processing...' : 'Yes, Confirm Order'}
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
                >
                  No, Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
