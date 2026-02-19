
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { LAUNCH_PROMOS } from '../constants';

const Navbar: React.FC = () => {
  const { cart, wishlist, user, setIsStyleAssistantOpen } = useApp();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleProtectedNavigation = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth', { state: { from: { pathname: path } } });
    } else {
      navigate(path);
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 shadow-sm">
      <div className="w-full bg-zinc-950 text-white py-2.5 overflow-hidden whitespace-nowrap relative border-b border-white/5">
        <div className="animate-infinite-scroll inline-block">
          {LAUNCH_PROMOS?.map((promo, idx) => (
            <span key={idx} className="mx-12 text-[9px] font-bold uppercase tracking-[0.4em]">
              {promo.discount}: Use Code <span className="text-vogue-500">{promo.code}</span> — {promo.description}
            </span>
          ))}
          {LAUNCH_PROMOS?.map((promo, idx) => (
            <span key={`dup-${idx}`} className="mx-12 text-[9px] font-bold uppercase tracking-[0.4em]">
              {promo.discount}: Use Code <span className="text-vogue-500">{promo.code}</span> — {promo.description}
            </span>
          ))}
        </div>
      </div>

      <nav className="w-full bg-white/95 backdrop-blur-md pt-1 pb-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-4xl font-serif font-bold tracking-tighter text-black hover:opacity-80 transition-opacity">GS</Link>

            <div className="hidden md:flex space-x-12 text-[10px] font-black uppercase tracking-[0.3em] text-black">
              <Link to="/shop" className="hover:text-vogue-600 transition-colors">New Arrivals</Link>
              <Link to="/shop?category=Women" className="hover:text-vogue-600 transition-colors">Women</Link>
              <Link to="/shop?category=Men" className="hover:text-vogue-600 transition-colors">Men</Link>
              <Link to="/shop?category=Accessories" className="hover:text-vogue-600 transition-colors">Essentials</Link>
            </div>

            <div className="flex items-center space-x-10 text-black">
              <button
                onClick={() => setIsStyleAssistantOpen(true)}
                className="hover:scale-110 transition-transform group relative"
                title="Style Concierge"
              >
                <i className="fa-solid fa-wand-magic-sparkles text-lg"></i>
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-black rounded-full animate-ping group-hover:hidden"></span>
              </button>
              <button onClick={() => setSearchOpen(!searchOpen)} className="hover:scale-110 transition-transform">
                <i className="fa-solid fa-magnifying-glass text-lg"></i>
              </button>
              <Link to="/profile" onClick={(e) => handleProtectedNavigation(e, '/profile')} className="hover:scale-110 transition-transform relative">
                <i className="fa-regular fa-user text-lg"></i>
                {user && <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></span>}
              </Link>
              <Link to="/wishlist" onClick={(e) => handleProtectedNavigation(e, '/wishlist')} className="hover:scale-110 transition-transform relative">
                <i className="fa-regular fa-heart text-lg"></i>
                {wishlist.length > 0 && (
                  <span className="absolute -top-3 -right-3 bg-black text-white text-[8px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-white">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="hover:scale-110 transition-transform relative">
                <i className="fa-solid fa-bag-shopping text-lg"></i>
                {cartCount > 0 && (
                  <span className="absolute -top-3 -right-3 bg-black text-white text-[8px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {searchOpen && (
          <div className="fixed inset-0 z-[70] flex items-start justify-center pt-24 px-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setSearchOpen(false)}
            ></div>

            {/* Compact Search Modal */}
            <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 slide-in-from-top-8 duration-300">
              {/* Immersive Accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-vogue-500 via-zinc-950 to-vogue-500"></div>

              <div className="p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <i className="fa-solid fa-magnifying-glass text-zinc-400 text-xl"></i>
                  <input
                    type="text"
                    placeholder="Search brands, styles, essentials..."
                    className="flex-1 text-2xl font-serif bg-transparent outline-none text-zinc-900 placeholder:text-zinc-300"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setSearchOpen(false);
                        navigate('/shop');
                      }
                      if (e.key === 'Escape') {
                        setSearchOpen(false);
                      }
                    }}
                  />
                  <button
                    onClick={() => setSearchOpen(false)}
                    className="text-zinc-400 hover:text-black transition-colors"
                  >
                    <i className="fa-solid fa-xmark text-xl"></i>
                  </button>
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4">Trending Now</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Pepe Jeans', 'Loman', 'Sustainable', 'Essentials', 'New Arrivals'].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => {
                            setSearchOpen(false);
                            navigate('/shop');
                          }}
                          className="px-4 py-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-sm font-medium text-zinc-600 transition-colors border border-zinc-100"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4">Categories</h3>
                      <div className="space-y-3">
                        {['Men', 'Women', 'Accessories'].map((cat) => (
                          <Link
                            key={cat}
                            to={`/shop?category=${cat}`}
                            onClick={() => setSearchOpen(false)}
                            className="block text-lg font-serif text-zinc-800 hover:text-vogue-600 hover:translate-x-1 transition-all"
                          >
                            {cat}
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <Link to="/track-order" onClick={() => setSearchOpen(false)} className="block text-sm font-medium text-zinc-500 hover:text-black">Track Order</Link>
                        <Link to="/wishlist" onClick={() => setSearchOpen(false)} className="block text-sm font-medium text-zinc-500 hover:text-black">View Wishlist</Link>
                        <Link to="/profile" onClick={() => setSearchOpen(false)} className="block text-sm font-medium text-zinc-500 hover:text-black">My Account</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-50/50 px-8 py-4 border-t border-zinc-100 flex justify-between items-center">
                <span className="text-[10px] text-zinc-400 font-medium">ESC to close</span>
                <span className="text-[10px] text-zinc-400 font-medium tracking-widest uppercase">Global Search 2.0</span>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
