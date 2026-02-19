
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const TrackOrder: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setTrackingData({
        status: 'In Transit',
        location: 'Mumbai Sorting Hub',
        lastUpdate: 'Oct 14, 2023 11:30 AM',
        estimatedDelivery: 'Oct 16, 2023',
        courier: 'Express Collective',
        steps: [
          { label: 'Order Confirmed', date: 'Oct 12, 10:30 AM', completed: true },
          { label: 'Handpicked & Quality Checked', date: 'Oct 12, 02:45 PM', completed: true },
          { label: 'Shipped from Hub', date: 'Oct 13, 09:00 AM', completed: true, active: true },
          { label: 'Out for Local Delivery', date: 'Pending', completed: false },
          { label: 'Delivered', date: 'Expected Oct 16', completed: false },
        ]
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-12 py-24 animate-in fade-in duration-1000">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-24 space-y-4">
          <span className="text-vogue-500 text-[10px] font-bold uppercase tracking-[0.5em] block">Logistics Dashboard</span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tighter">Track Your Curations.</h1>
          <p className="text-gray-400 font-light max-w-lg mx-auto leading-relaxed">
            Monitor the journey of your curated pieces from our heritage warehouse to your doorstep.
          </p>
        </header>

        {!trackingData ? (
          <div className="relative group">
            <div className="absolute -inset-4 bg-vogue-50 -z-10 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity blur-2xl"></div>
            <div className="bg-white border border-gray-100 p-12 lg:p-20 rounded-sm shadow-sm">
              <form onSubmit={handleTrack} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
                <div className="group">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-vogue-500 mb-3 transition-colors group-focus-within:text-black">Order Identifier</label>
                  <input 
                    required 
                    type="text" 
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full bg-transparent border-b border-gray-200 focus:border-black outline-none py-4 text-sm transition-all font-medium" 
                    placeholder="e.g. GS-88192" 
                  />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-vogue-500 mb-3 transition-colors group-focus-within:text-black">Billing Email Address</label>
                  <input 
                    required 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border-b border-gray-200 focus:border-black outline-none py-4 text-sm transition-all font-medium" 
                    placeholder="email@example.com" 
                  />
                </div>
                <div className="md:col-span-2 pt-6">
                  <button 
                    disabled={loading}
                    type="submit" 
                    className="w-full bg-black text-white py-6 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-zinc-900 transition-all flex items-center justify-center gap-4 active:scale-[0.98] shadow-2xl"
                  >
                    {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-magnifying-glass-location"></i>}
                    {loading ? 'Consulting Logistics...' : 'Locate Shipment'}
                  </button>
                </div>
              </form>
              <div className="mt-12 flex items-center justify-center gap-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <span>Real-time Sync</span>
                <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                <span>Secure Tracking</span>
                <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                <span>GS Concierge Linked</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-12 animate-in slide-up">
             <div className="grid grid-cols-1 lg:grid-cols-3 bg-zinc-950 text-white rounded-sm overflow-hidden shadow-2xl">
                <div className="p-12 border-b lg:border-b-0 lg:border-r border-white/5">
                    <p className="text-[10px] font-bold uppercase text-white/30 mb-4 tracking-widest">Current Phase</p>
                    <h3 className="text-4xl font-serif font-bold italic text-white tracking-tighter">{trackingData.status}</h3>
                    <p className="text-xs text-white/50 mt-4 font-light flex items-center gap-2">
                      <i className="fa-solid fa-location-dot text-[10px]"></i>
                      {trackingData.location}
                    </p>
                </div>
                <div className="p-12 border-b lg:border-b-0 lg:border-r border-white/5 bg-white/5">
                    <p className="text-[10px] font-bold uppercase text-white/30 mb-4 tracking-widest">Expectation</p>
                    <h3 className="text-4xl font-serif font-bold tracking-tighter">{trackingData.estimatedDelivery}</h3>
                    <p className="text-xs text-white/50 mt-4 font-light">Before EOD</p>
                </div>
                <div className="p-12 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-white/30 mb-4 tracking-widest">Carrier Partner</p>
                      <h3 className="text-xl font-bold uppercase tracking-widest">{trackingData.courier}</h3>
                    </div>
                    <Link to="/contact" className="text-[9px] font-bold uppercase tracking-widest text-vogue-500 hover:text-white transition-colors flex items-center gap-2 mt-8">
                      Need Assistance? Contact Concierge <i className="fa-solid fa-arrow-right-long"></i>
                    </Link>
                </div>
             </div>

             <div className="bg-white border border-gray-100 p-12 lg:p-20 rounded-sm">
                <div className="relative">
                  {/* Vertical Line */}
                  <div className="absolute top-0 bottom-0 left-6 md:left-1/2 w-px bg-gray-100 md:-translate-x-1/2"></div>
                  
                  <div className="space-y-24">
                    {trackingData.steps.map((step: any, idx: number) => (
                      <div key={idx} className={`relative flex flex-col md:flex-row items-start md:items-center gap-12 md:gap-0 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                        {/* Desktop Label Side */}
                        <div className="flex-1 hidden md:block text-right px-16">
                           {idx % 2 === 0 && (
                             <div className="space-y-1">
                               <h4 className={`text-[10px] font-bold uppercase tracking-widest ${step.completed ? 'text-black' : 'text-gray-300'}`}>{step.label}</h4>
                               <p className="text-[9px] text-gray-400 uppercase font-light tracking-tighter">{step.date}</p>
                             </div>
                           )}
                        </div>
                        
                        {/* Dot */}
                        <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-1000 ${step.completed ? 'bg-black border-black text-white shadow-xl' : 'bg-white border-gray-100 text-gray-200'}`}>
                          {step.completed ? (
                            <i className="fa-solid fa-check text-xs"></i>
                          ) : (
                            <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
                          )}
                          {step.active && <div className="absolute -inset-2 border border-black rounded-full animate-ping opacity-20"></div>}
                        </div>

                        {/* Mobile/Opposite Label Side */}
                        <div className="flex-1 px-10 md:px-16 text-left">
                           {(idx % 2 !== 0 || window.innerWidth < 768) && (
                             <div className="space-y-1">
                               <h4 className={`text-[10px] font-bold uppercase tracking-widest ${step.completed ? 'text-black' : 'text-gray-300'}`}>{step.label}</h4>
                               <p className="text-[9px] text-gray-400 uppercase font-light tracking-tighter">{step.date}</p>
                             </div>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
             </div>

             <div className="flex flex-col sm:flex-row justify-center gap-6 pt-12">
                <button 
                  onClick={() => setTrackingData(null)}
                  className="text-[10px] font-bold uppercase tracking-widest border border-gray-200 px-12 py-5 hover:border-black transition-all bg-white"
                >
                  Track Another Consignment
                </button>
                <Link to="/shop" className="text-[10px] font-bold uppercase tracking-widest bg-black text-white px-12 py-5 hover:bg-zinc-800 transition-all text-center">
                  Continue Shopping
                </Link>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
