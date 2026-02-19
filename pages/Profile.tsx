
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { setUser } from '../store/authSlice';
import { placeOrder, cancelOrder } from '../store/cartSlice';
import { useToast } from '../components/Toast';
import { MOCK_PRODUCTS } from '../constants';
import ProductCard from '../components/ProductCard';
import { supabase } from '../services/supabase';
import { Address } from '../types';

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const wishlist = useAppSelector((state) => state.cart.wishlist);
  const catalog = useAppSelector((state) => state.products.items);
  const orders = useAppSelector((state) => state.cart.orders);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    dispatch(setUser(null));
    navigate('/auth');
  };
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'orders');

  // Platform Feedback State
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [platformRating, setPlatformRating] = useState(0);
  const [platformFeedbackText, setPlatformFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Cancellation State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const CANCEL_REASONS = [
    "Changed my mind",
    "Found a better price elsewhere",
    "Ordered by mistake",
    "Delivery time is too long",
    "Need to change shipping address"
  ];

  // Form State
  const [updating, setUpdating] = useState(false);
  const [updatingMobile, setUpdatingMobile] = useState(false);
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [mobileError, setMobileError] = useState('');

  // Address State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState<Omit<Address, 'id'>>({
    label: '',
    fullName: '',
    mobile: '',
    village: '',
    street: '',
    city: '',
    pincode: '',
    country: 'India',
    isDefault: false
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else {
      setFullName(user.user_metadata?.full_name || '');
      setMobile(user.user_metadata?.mobile || '');
      setAddresses(user.user_metadata?.addresses || []);
    }
  }, [user, navigate]);

  if (!user) return null;

  const wishlistProducts = catalog.filter(p => wishlist.includes(p.id));

  const userName = user.user_metadata?.full_name || user.email.split('@')[0];
  const userAvatar =
    user.user_metadata?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=f9f9f9&color=ff0000`;

  const validateMobile = (num: string) => {
    if (num && !/^[6-9]\d{9}$/.test(num)) {
      return "Please enter a valid 10-digit Indian mobile number.";
    }
    return "";
  };

  const handleUpdateMobile = async () => {
    const error = validateMobile(mobile);
    if (error) {
      setMobileError(error);
      return;
    }

    setUpdatingMobile(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { mobile: mobile }
      });
      if (error) throw error;
      alert("Mobile number updated successfully.");
      setMobileError("");
    } catch (err: any) {
      alert("Error updating mobile: " + err.message);
    } finally {
      setUpdatingMobile(false);
    }
  };

  const markAsDelivered = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const updatedOrder = {
      ...order,
      status: 'Delivered' as const,
      trackingSteps: order.trackingSteps.map(step => ({ ...step, isCompleted: true, date: step.date || new Date().toLocaleString() }))
    };
    // dispatch(placeOrder)
    dispatch(placeOrder(updatedOrder));
    showToast("Order status updated to Delivered", "success");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    setUpdating(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName
        }
      });

      if (error) throw error;
      alert("Profile updated successfully.");
    } catch (err: any) {
      alert("Error updating profile: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const persistAddresses = async (newAddresses: Address[]) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { addresses: newAddresses }
      });
      if (error) throw error;
      setAddresses(newAddresses);
    } catch (err: any) {
      alert("Error saving addresses: " + err.message);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    let newAddresses = [...addresses];

    if (editingAddress) {
      newAddresses = addresses.map(addr =>
        addr.id === editingAddress.id ? { ...addressForm, id: addr.id } : addr
      );
    } else {
      const newAddress: Address = {
        ...addressForm,
        id: Math.random().toString(36).substr(2, 9)
      };
      newAddresses.push(newAddress);
    }

    // Ensure only one default
    if (addressForm.isDefault) {
      newAddresses = newAddresses.map(addr => ({
        ...addr,
        isDefault: addr.id === (editingAddress ? editingAddress.id : newAddresses[newAddresses.length - 1].id)
      }));
    } else if (newAddresses.length === 1) {
      newAddresses[0].isDefault = true;
    }

    await persistAddresses(newAddresses);
    setIsAddressModalOpen(false);
    setEditingAddress(null);
    setAddressForm({ label: '', fullName: '', mobile: '', village: '', street: '', city: '', pincode: '', country: 'India', isDefault: false });
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    const newAddresses = addresses.filter(addr => addr.id !== id);
    if (newAddresses.length > 0 && !newAddresses.some(a => a.isDefault)) {
      newAddresses[0].isDefault = true;
    }
    await persistAddresses(newAddresses);
  };

  const handleSetDefault = async (id: string) => {
    const newAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    }));
    await persistAddresses(newAddresses);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header section... */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12">
        <div className="flex items-center space-x-6">
          <div className="relative group">
            <img src={`${userAvatar}`} className="w-24 h-24 rounded-full border-4 border-white shadow-xl group-hover:opacity-80 transition-opacity object-cover" alt={userName} />
            <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold uppercase bg-black/40 rounded-full">Change</button>
          </div>
          <div>
            <h1 className="text-4xl font-serif font-bold tracking-tight"> {userName.split(' ')[0]}</h1>
            <p className="text-gray-500 font-light">{user.email}</p>
          </div>
        </div>
        {!user.user_metadata?.mobile && (
          <div className="mt-6 md:mt-0 flex items-center p-4 bg-red-50 border-l-4 border-red-500 rounded-r shadow-sm animate-pulse">
            <i className="fa-solid fa-circle-exclamation text-red-500 mr-3"></i>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-red-900">Mobile Number Required</p>
              <p className="text-[9px] text-red-700 mt-0.5">Please add your Indian mobile number in settings to place orders.</p>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="ml-6 text-[9px] font-black uppercase tracking-widest underline hover:text-red-900 transition-colors"
            >
              Add Now
            </button>
          </div>
        )}
        <div className="cursor-pointer">
          <button
            onClick={handleLogout}
            className="mt-6 md:mt-0 px-6 py-3 text-base font-bold uppercase tracking-widest underline hover:text-red-500 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-16">
        <nav className="md:w-64 flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-4 md:space-y-4 border-b md:border-none border-gray-100 pb-4 md:pb-0 scroll-smooth no-scrollbar">
          {[
            { id: 'orders', label: 'Order History', icon: 'fa-box' },
            { id: 'wishlist', label: 'My Wishlist', icon: 'fa-heart' },
            { id: 'addresses', label: 'Saved Addresses', icon: 'fa-location-dot' },
            { id: 'settings', label: 'Account Settings', icon: 'fa-gear' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center space-x-4 text-[10px] font-bold uppercase tracking-[0.2em] px-6 py-4 border-2 transition-all duration-300 ${activeTab === tab.id ? 'bg-black text-white border-black shadow-xl scale-105 z-10' : 'bg-white text-gray-400 border-transparent hover:border-gray-100 hover:text-black'}`}
            >
              <i className={`fa-solid ${tab.icon} w-4 text-center`}></i>
              <span>{tab.label}</span>
            </button>
          ))}
          <div className="mt-12 p-8 bg-zinc-900 rounded-2xl border border-zinc-800 hidden md:block relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-zinc-800/50 rounded-full blur-3xl group-hover:bg-vogue-500/20 transition-all duration-700"></div>
            <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-4 relative z-10 transition-colors group-hover:text-vogue-400">Platform Feedback</h5>
            <p className="text-[11px] text-zinc-400 mb-8 font-serif leading-relaxed relative z-10">
              Your voice shapes the GS Garments narrative. Share your thoughts on our curated experience.
            </p>
            <button
              onClick={() => setIsFeedbackModalOpen(true)}
              className="w-full py-4 bg-white text-black text-[9px] font-black uppercase tracking-[0.2em] hover:bg-vogue-500 hover:text-white transition-all rounded-full shadow-2xl active:scale-95 relative z-10"
            >
              Rate Our Platform
            </button>
          </div>
        </nav>

        <div className="flex-grow">
          {activeTab === 'orders' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {orders.length > 0 ? (
                <div className="space-y-8">
                  {orders.map(order => (
                    <div key={order.id} className="bg-white border border-zinc-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-6 bg-zinc-50/50 border-b border-zinc-100 flex flex-wrap justify-between items-center gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Order Identity</p>
                          <p className="text-sm font-black tracking-tight">{order.id}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Placed On</p>
                          <p className="text-sm font-bold">{order.date}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total Amount</p>
                          <p className="text-sm font-black">₹{order.total.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                            <>
                              {order.status !== 'Out for Delivery' && (
                                <button
                                  onClick={() => {
                                    setSelectedOrderId(order.id);
                                    setIsCancelModalOpen(true);
                                  }}
                                  className="px-3 py-1 bg-white border border-red-200 text-red-500 text-[8px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
                                >
                                  Cancel Order
                                </button>
                              )}
                            </>
                          )}
                          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                            order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-black text-white'
                            }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                          <div className="space-y-6">
                            {order.items.map((item, idx) => {
                              const product = catalog.find(p => p.id === item.productId);
                              return (
                                <div key={idx} className="flex gap-4 group">
                                  <div className="w-20 aspect-[3/4] bg-zinc-100 rounded-lg overflow-hidden flex-shrink-0">
                                    <img src={product?.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={product?.name} />
                                  </div>
                                  <div className="flex-grow space-y-1">
                                    <h4 className="text-sm font-black tracking-tight group-hover:text-vogue-600 transition-colors uppercase">{product?.name}</h4>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Dimension: {item.selectedSize} | Qty: {item.quantity}</p>
                                    <p className="text-xs font-serif font-bold mt-2">₹{(item.priceAtPurchase || product?.price || 0).toLocaleString('en-IN')}</p>

                                    {order.status === 'Delivered' && (
                                      <div className="flex gap-4 mt-4">
                                        <button onClick={() => navigate(`/product/${item.productId}`)} className="text-[9px] font-black uppercase tracking-widest underline underline-offset-4 hover:text-black">Write Review</button>
                                        <button onClick={() => {
                                          const text = `I just received my ${product?.name} from GS Garments! The quality is amazing. #GSGarments #Fashion`;
                                          const url = window.location.origin + `#/product/${item.productId}`;
                                          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                                        }} className="text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-sky-500 flex items-center gap-1">
                                          <i className="fa-brands fa-twitter"></i> Share Experience
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="bg-zinc-50/30 p-8 rounded-2xl">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-black flex items-center gap-3">
                              Tracking Progress
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            </h4>
                            <div className="space-y-8 relative">
                              <div className="absolute left-1.5 top-2 bottom-2 w-[1px] bg-zinc-200"></div>
                              {order.trackingSteps.map((step, idx) => (
                                <div key={idx} className="relative pl-8 group">
                                  <div className={`absolute left-0 top-1 w-3 h-3 rounded-full border-2 bg-white transition-all duration-500 ${step.isCompleted ? 'bg-black border-black scale-110' : 'border-zinc-200 group-hover:border-zinc-400'}`}></div>
                                  <div className="space-y-1">
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${step.isCompleted ? 'text-black' : 'text-zinc-400'}`}>{step.status}</p>
                                    <p className="text-[9px] text-zinc-500 leading-relaxed font-medium">{step.description}</p>
                                    {step.date && <p className="text-[8px] text-zinc-400 font-bold uppercase mt-1 italic">{step.date}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="mt-10 pt-8 border-t border-zinc-100">
                              <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Estimated Arrival</span>
                                <span className="text-sm font-black tracking-tighter">{order.deliveryDate}</span>
                              </div>
                              <p className="text-[9px] text-zinc-400 leading-relaxed italic">
                                {order.type === 'cart'
                                  ? "Note: This is a collective shipment. All items in your curated bag will be delivered together."
                                  : "Note: This is a fast-track single shipment with priority fulfillment."
                                }
                              </p>
                              <div className="mt-8">
                                <button className="w-full py-4 border-2 border-black text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all rounded-full shadow-lg">
                                  Contact Concierge
                                </button>
                                <button className="w-full mt-3 py-4 text-[9px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black">
                                  Download Invoice (PDF)
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-sm">
                  <i className="fa-solid fa-clock-rotate-left text-4xl text-gray-200 mb-4"></i>
                  <p className="text-gray-400 text-sm font-light uppercase tracking-widest">No previous history found</p>
                  <button onClick={() => navigate('/shop')} className="mt-6 text-[10px] font-bold uppercase tracking-widest underline decoration-2 underline-offset-4 hover:text-black">Return to Store</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-8">
                <h2 className="text-lg font-bold uppercase tracking-widest">Curated Favorites</h2>
                <button
                  onClick={() => navigate('/wishlist')}
                  className="text-[10px] font-bold uppercase tracking-widest underline decoration-1 underline-offset-4 hover:text-vogue-600 transition-colors"
                >
                  View Full Page
                </button>
              </div>
              {wishlistProducts.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                  {wishlistProducts.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-sm">
                  <p className="text-gray-400 text-sm font-light uppercase tracking-widest">Your wishlist is looking empty</p>
                  <button onClick={() => navigate('/shop')} className="mt-4 text-[10px] font-bold uppercase tracking-widest underline decoration-2 underline-offset-4">Explore Brands</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-8">
                <h2 className="text-lg font-bold uppercase tracking-widest">Shipping Destinations</h2>
                <button
                  onClick={() => {
                    setEditingAddress(null);
                    setAddressForm({ label: '', fullName: '', mobile: '', village: '', street: '', city: '', pincode: '', country: 'India', isDefault: false });
                    setIsAddressModalOpen(true);
                  }}
                  className="bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
                >
                  <i className="fa-solid fa-plus mr-2"></i> Add New Address
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map(addr => (
                  <div key={addr.id} className={`group p-8 border-2 transition-all duration-300 relative overflow-hidden ${addr.isDefault ? 'border-black bg-white shadow-xl' : 'border-gray-100 hover:border-gray-200 bg-zinc-50/30'}`}>
                    {addr.isDefault && (
                      <div className="absolute top-0 right-0 bg-black text-white px-4 py-1.5 text-[8px] font-black uppercase tracking-widest">
                        Default Selection
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-1 bg-zinc-100 group-hover:bg-zinc-200 transition-colors">
                          {addr.label}
                        </span>
                      </div>
                      <div className="font-serif">
                        <p className="text-xl font-bold text-zinc-900">{addr.fullName}</p>
                        <p className="text-zinc-500 text-sm mt-2 leading-relaxed">
                          {addr.street}{addr.village ? `, ${addr.village}` : ''}<br />
                          {addr.city}, {addr.pincode}<br />
                          {addr.country}
                        </p>
                        <p className="text-[10px] font-bold text-zinc-400 mt-2 uppercase tracking-widest">Mobile: {addr.mobile}</p>
                      </div>
                    </div>

                    <div className="mt-8 flex items-center space-x-6 border-t border-zinc-100 pt-6">
                      <button
                        onClick={() => {
                          setEditingAddress(addr);
                          setAddressForm({ ...addr });
                          setIsAddressModalOpen(true);
                        }}
                        className="text-[9px] font-bold uppercase tracking-widest hover:text-vogue-600 transition-colors"
                      >
                        Edit Entry
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-[9px] font-bold uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
                      >
                        Delete
                      </button>
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefault(addr.id)}
                          className="ml-auto text-[9px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
                        >
                          Set as Default
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {addresses.length === 0 && (
                  <div className="col-span-full py-24 text-center border-2 border-dashed border-gray-100 rounded-sm bg-zinc-50/50">
                    <i className="fa-solid fa-map-location-dot text-4xl text-gray-200 mb-6"></i>
                    <p className="text-gray-400 text-sm font-light uppercase tracking-widest">No shipping addresses saved yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-lg font-bold uppercase tracking-widest border-b border-gray-100 pb-4 mb-8">Personal Details</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-3">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full border-b border-gray-200 focus:border-black outline-none py-3 text-sm transition-colors"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-3">Mobile Number (+91)</label>
                    <div className="flex items-end gap-4">
                      <div className="flex-grow">
                        <input
                          required
                          type="tel"
                          placeholder="9876543210"
                          value={mobile}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setMobile(val);
                            setMobileError(validateMobile(val));
                          }}
                          className={`w-full border-b ${mobileError ? 'border-red-500 bg-red-50/20' : 'border-gray-200'} focus:border-black outline-none py-3 text-sm transition-all`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleUpdateMobile}
                        disabled={updatingMobile || !!mobileError || !mobile}
                        className="flex-shrink-0 bg-black text-white px-6 py-3 text-[9px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {updatingMobile ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-cloud-arrow-up"></i>}
                        {updatingMobile ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                    {mobileError && <p className="text-[8px] text-red-500 mt-2 font-bold uppercase tracking-widest animate-in fade-in slide-in-from-left-2">{mobileError}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-3">Email Address</label>
                    <input type="email" readOnly defaultValue={user.email} className="w-full border-b border-gray-200 focus:border-black outline-none py-3 text-sm transition-colors opacity-50 cursor-not-allowed" />
                  </div>
                </div>

                {/* <button
                  type="submit"
                  disabled={updating}
                  className="w-full md:w-auto bg-black text-white px-12 py-5 text-[10px] uppercase font-bold tracking-[0.3em] hover:bg-zinc-800 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4"
                >
                  {updating && <i className="fa-solid fa-spinner animate-spin"></i>}
                  {updating ? 'Persisting Changes...' : 'Save All Updates'}
                </button> */}
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsAddressModalOpen(false)}></div>
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="text-xl font-serif font-bold">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
              <button onClick={() => setIsAddressModalOpen(false)} className="text-zinc-400 hover:text-black">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleSaveAddress} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">Label (e.g., Home)</label>
                  <input
                    required
                    type="text"
                    value={addressForm.label}
                    onChange={e => setAddressForm({ ...addressForm, label: e.target.value })}
                    className="w-full border-b-2 border-zinc-100 focus:border-black outline-none py-2 text-sm transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">Mobile Number</label>
                  <input
                    required
                    type="tel"
                    value={addressForm.mobile}
                    onChange={e => setAddressForm({ ...addressForm, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="w-full border-b-2 border-zinc-100 focus:border-black outline-none py-2 text-sm transition-colors"
                    placeholder="10-digit number"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">Street Address</label>
                  <input
                    required
                    type="text"
                    value={addressForm.street}
                    onChange={e => setAddressForm({ ...addressForm, street: e.target.value })}
                    className="w-full border-b-2 border-zinc-100 focus:border-black outline-none py-2 text-sm transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">Village / Moore</label>
                  <input
                    type="text"
                    value={addressForm.village}
                    onChange={e => setAddressForm({ ...addressForm, village: e.target.value })}
                    className="w-full border-b-2 border-zinc-100 focus:border-black outline-none py-2 text-sm transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">City</label>
                  <input
                    required
                    type="text"
                    value={addressForm.city}
                    onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full border-b-2 border-zinc-100 focus:border-black outline-none py-2 text-sm transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">Pincode</label>
                  <input
                    required
                    type="text"
                    value={addressForm.pincode}
                    onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    className="w-full border-b-2 border-zinc-100 focus:border-black outline-none py-2 text-sm transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">Country</label>
                  <input
                    required
                    type="text"
                    value={addressForm.country}
                    onChange={e => setAddressForm({ ...addressForm, country: e.target.value })}
                    className="w-full border-b-2 border-zinc-100 focus:border-black outline-none py-2 text-sm transition-colors"
                    defaultValue="India"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3 pt-4">
                <input
                  type="checkbox"
                  id="defaultAddress"
                  checked={addressForm.isDefault}
                  onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded accent-black"
                />
                <label htmlFor="defaultAddress" className="text-sm font-medium text-zinc-600">Set as default shipping address</label>
              </div>
              <div className="pt-8">
                <button type="submit" className="w-full bg-black text-white py-5 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl active:scale-95">
                  Securely Save Destination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancellation Reason Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setIsCancelModalOpen(false)}
          ></div>
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-zinc-100">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-circle-exclamation text-red-500 text-xl"></i>
              </div>
              <h3 className="text-xl font-serif font-bold mb-2">Cancel Your Order</h3>
              <p className="text-xs text-zinc-500 mb-8 uppercase tracking-widest font-bold">
                Tell us why you're cancelling
              </p>

              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation (optional)"
                className="w-full h-32 p-4 bg-zinc-50 border border-zinc-100 rounded-2xl mb-6 text-sm focus:border-black outline-none transition-all resize-none font-medium"
              ></textarea>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    if (selectedOrderId) {
                      dispatch(cancelOrder({ orderId: selectedOrderId, reason: cancelReason }));
                      showToast("Order Cancelled Successfully", "success");
                      setIsCancelModalOpen(false);
                      setCancelReason('');
                      setSelectedOrderId(null);
                    }
                  }}
                  className="w-full bg-red-600 text-white py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-700 transition-all rounded-full shadow-lg hvr-grow"
                >
                  Confirm Cancellation
                </button>
                <button
                  onClick={() => setIsCancelModalOpen(false)}
                  className="w-full py-4 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
                >
                  Changed My Mind
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Platform Feedback Modal */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-950/90 backdrop-blur-xl animate-in fade-in duration-500"
            onClick={() => {
              setIsFeedbackModalOpen(false);
              setFeedbackSubmitted(false);
            }}
          ></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
            {!feedbackSubmitted ? (
              <div className="p-12 text-center">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-vogue-500 via-zinc-900 to-vogue-500"></div>
                <h3 className="text-3xl font-serif font-bold mb-3 tracking-tight">The GS Experience</h3>
                <p className="text-[10px] text-zinc-400 mb-10 font-black uppercase tracking-[0.3em]">Rate your platform journey</p>

                <div className="flex justify-center gap-4 mb-10">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setPlatformRating(star)}
                      onClick={() => setPlatformRating(star)}
                      className="transition-all duration-300 hover:scale-125"
                    >
                      <i className={`fa-star text-3xl ${star <= platformRating ? 'fa-solid text-zinc-900' : 'fa-regular text-zinc-200'}`}></i>
                    </button>
                  ))}
                </div>

                <textarea
                  value={platformFeedbackText}
                  onChange={(e) => setPlatformFeedbackText(e.target.value)}
                  placeholder="Tell us about your curation experience..."
                  className="w-full h-40 p-6 bg-zinc-50 border border-zinc-100 rounded-3xl mb-8 text-sm focus:ring-2 focus:ring-zinc-900 focus:bg-white outline-none transition-all resize-none font-medium text-zinc-700"
                ></textarea>

                <div className="flex flex-col gap-4">
                  <button
                    disabled={platformRating === 0}
                    onClick={() => {
                      setFeedbackSubmitted(true);
                      showToast("Feedback Received - Thank You", "success");
                    }}
                    className="w-full bg-zinc-900 text-white py-5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-vogue-600 transition-all rounded-full shadow-2xl disabled:opacity-20 disabled:grayscale"
                  >
                    Submit My Review
                  </button>
                  <button
                    onClick={() => setIsFeedbackModalOpen(false)}
                    className="text-[9px] font-black uppercase tracking-widest text-zinc-300 hover:text-zinc-500 transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-16 text-center animate-in zoom-in-90 duration-500">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
                  <i className="fa-solid fa-check text-3xl text-emerald-500"></i>
                </div>
                <h3 className="text-3xl font-serif font-bold mb-4">Gratitude Sent</h3>
                <p className="text-sm text-zinc-500 mb-10 leading-relaxed max-w-xs mx-auto">
                  Your insights are the foundation of our evolution. Thank you for being part of the collective.
                </p>
                <button
                  onClick={() => {
                    setIsFeedbackModalOpen(false);
                    setFeedbackSubmitted(false);
                    setPlatformRating(0);
                    setPlatformFeedbackText('');
                  }}
                  className="px-12 py-4 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-black transition-all shadow-xl"
                >
                  Continue Journey
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
