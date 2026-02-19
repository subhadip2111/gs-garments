
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../App';
import { MOCK_PRODUCTS } from '../constants';
import ProductCard from '../components/ProductCard';
import { supabase } from '../services/supabase';
import { Address } from '../types';

const Profile: React.FC = () => {
  const { user, wishlist, logout, products } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'orders');

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
    street: '',
    city: '',
    zip: '',
    country: '',
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

  const catalog = products.length > 0 ? products : MOCK_PRODUCTS;
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
    setAddressForm({ label: '', fullName: '', street: '', city: '', zip: '', country: '', isDefault: false });
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
            onClick={logout}
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
        </nav>

        <div className="flex-grow">
          {activeTab === 'orders' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-sm">
                <i className="fa-solid fa-clock-rotate-left text-4xl text-gray-200 mb-4"></i>
                <p className="text-gray-400 text-sm font-light uppercase tracking-widest">No previous history found</p>
                <button onClick={() => navigate('/shop')} className="mt-6 text-[10px] font-bold uppercase tracking-widest underline decoration-2 underline-offset-4 hover:text-black">Return to Store</button>
              </div>
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
                    setAddressForm({ label: '', fullName: '', street: '', city: '', zip: '', country: '', isDefault: false });
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
                          {addr.street}<br />
                          {addr.city}, {addr.zip}<br />
                          {addr.country}
                        </p>
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
                            setMobile(e.target.value);
                            setMobileError(validateMobile(e.target.value));
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
                  <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">Full Name</label>
                  <input
                    required
                    type="text"
                    value={addressForm.fullName}
                    onChange={e => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    className="w-full border-b-2 border-zinc-100 focus:border-black outline-none py-2 text-sm transition-colors"
                  />
                </div>
              </div>
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
                  <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">ZIP Code</label>
                  <input
                    required
                    type="text"
                    value={addressForm.zip}
                    onChange={e => setAddressForm({ ...addressForm, zip: e.target.value })}
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
    </div>
  );
};

export default Profile;
