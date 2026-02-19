
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { MOCK_PRODUCTS } from '../constants';

const Checkout: React.FC = () => {
  const { cart, user } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mobile, setMobile] = useState(user?.user_metadata?.mobile || '');
  const [mobileError, setMobileError] = useState('');

  if (cart.length === 0) {
    navigate('/shop');
    return null;
  }

  const subtotal = cart.reduce((acc, item) => {
    const product = MOCK_PRODUCTS.find(p => p.id === item.productId);
    return acc + (product?.price || 0) * item.quantity;
  }, 0);
  const total = subtotal + (subtotal > 5000 ? 0 : 150);

  const validateMobile = (num: string) => {
    if (!num) return 'Mobile number is required for order updates.';
    if (!/^[6-9]\d{9}$/.test(num)) return 'Please enter a valid 10-digit Indian number.';
    return '';
  };

  const handleProceedToPayment = () => {
    const error = validateMobile(mobile);
    if (error) {
      setMobileError(error);
      return;
    }
    setMobileError('');
    setStep(2);
  };

  const handlePlaceOrder = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(`Order placed successfully! Tracking details sent to ${mobile} via SMS.`);
      navigate('/profile');
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-16">
        <div className="lg:w-2/3">
          {/* Progress Section... */}
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
                  <input type="text" className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none" placeholder="Aditi" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2">Last Name</label>
                  <input type="text" className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none" placeholder="Sharma" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2">Mobile Number (India)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400 text-sm font-medium">+91</span>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => {
                        setMobile(e.target.value);
                        if (mobileError) setMobileError(validateMobile(e.target.value));
                      }}
                      className={`w-full border ${mobileError ? 'border-red-500 bg-red-50/30' : 'border-gray-200'} pl-12 p-3 text-sm focus:border-black outline-none transition-all`}
                      placeholder="9876543210"
                    />
                  </div>
                  {mobileError && <p className="text-[10px] text-red-500 mt-1 font-bold uppercase tracking-widest">{mobileError}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2">Flat / House No. / Building</label>
                  <input type="text" className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none" placeholder="B-102, Green Meadows" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2">Locality / City</label>
                  <input type="text" className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none" placeholder="Bandra West, Mumbai" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2">Pin Code</label>
                  <input type="text" className="w-full border border-gray-200 p-3 text-sm focus:border-black outline-none" placeholder="400050" />
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
                <label className="flex items-center p-4 border border-black cursor-pointer bg-gray-50">
                  <input type="radio" name="payment" defaultChecked className="w-4 h-4 accent-black mr-4" />
                  <div className="flex-grow flex justify-between items-center">
                    <span className="text-sm font-bold uppercase tracking-widest">UPI / QR Scan</span>
                    <div className="flex space-x-2 text-xl opacity-60">
                      <i className="fa-solid fa-qrcode"></i>
                    </div>
                  </div>
                </label>
                <label className="flex items-center p-4 border border-gray-200 cursor-pointer hover:border-black transition-colors">
                  <input type="radio" name="payment" className="w-4 h-4 accent-black mr-4" />
                  <div className="flex-grow flex justify-between items-center">
                    <span className="text-sm font-bold uppercase tracking-widest">Credit / Debit Card</span>
                    <div className="flex space-x-2 text-xl opacity-60">
                      <i className="fa-brands fa-cc-visa"></i>
                      <i className="fa-brands fa-cc-mastercard"></i>
                    </div>
                  </div>
                </label>
                <label className="flex items-center p-4 border border-gray-200 cursor-pointer hover:border-black transition-colors">
                  <input type="radio" name="payment" className="w-4 h-4 accent-black mr-4" />
                  <div className="flex-grow flex justify-between items-center">
                    <span className="text-sm font-bold uppercase tracking-widest">Cash on Delivery</span>
                  </div>
                </label>
              </div>

              <div className="flex space-x-4 pt-6">
                <button onClick={() => setStep(1)} className="text-xs font-bold uppercase tracking-widest underline">Back</button>
                <button
                  onClick={() => setStep(3)}
                  className="bg-black text-white px-12 py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
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
                    onClick={handlePlaceOrder}
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
              {cart.map(item => {
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
                <span className="text-gray-500">Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span>{subtotal > 5000 ? 'Free' : '₹150.00'}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-4">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
