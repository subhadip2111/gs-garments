
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { LAUNCH_PROMOS, NAV_ITEMS_STRUCTURE } from '../constants';

const Navbar: React.FC = () => {
  const { cart, wishlist, user } = useApp();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = NAV_ITEMS_STRUCTURE;

  const handleProtectedNavigation = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth', { state: { from: { pathname: path } } });
    } else {
      navigate(path);
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 shadow-sm font-sans">
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

      <nav className="w-full bg-white/95 backdrop-blur-md pt-1 pb-2 border-b border-gray-100">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="text-4xl font-serif font-bold tracking-tighter text-black hover:opacity-80 transition-opacity">GS</Link>

            <div className="hidden md:flex h-full items-center">
              {navItems.map((item) => (
                <div
                  key={item.name}
                  className="h-full group flex items-center"
                  onMouseEnter={() => setHoveredCategory(item.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <Link
                    to={item.href}
                    className="px-6 h-full flex items-center text-[13px] font-bold uppercase tracking-[0.15em] text-[#282c3f] border-b-4 border-transparent hover:border-vogue-600 transition-all"
                  >
                    {item.name}
                  </Link>

                  {/* Megamenu Dropdown */}
                  <div className={`absolute top-full left-0 w-full bg-white shadow-2xl transition-all duration-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible border-t border-gray-100 z-[60] py-10 overflow-hidden`}>
                    <div className="max-w-7xl mx-auto px-8 grid grid-cols-4 gap-12">
                      {item.subcategories.map((sub) => (
                        <div key={sub.name} className="space-y-4">
                          <h4 className="text-[13px] font-bold text-vogue-600 uppercase tracking-wider">{sub.name}</h4>
                          <div className="flex flex-col space-y-2">
                            {sub.items.map((subItem) => (
                              <Link
                                key={subItem}
                                to={`${item.href}&subcategory=${subItem}`}
                                className="text-[12px] text-[#535766] hover:text-[#282c3f] hover:font-bold transition-all"
                              >
                                {subItem}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-8 text-black">
              {/* Search Bar (Myntra Style) */}
              <div className="hidden lg:flex items-center bg-[#f5f5f6] px-4 py-2 rounded-md w-80 group focus-within:bg-white focus-within:ring-1 focus-within:ring-gray-200 transition-all">
                <i className="fa-solid fa-magnifying-glass text-gray-400 text-sm"></i>
                <input
                  type="text"
                  placeholder="Search for products, brands and more"
                  className="bg-transparent border-none outline-none px-4 text-[12px] w-full text-gray-600 placeholder:text-gray-400"
                  onFocus={() => setSearchOpen(true)}
                />
              </div>

              <div className="flex items-center space-x-6">

                <Link to="/profile" onClick={(e) => handleProtectedNavigation(e, '/profile')} className="hover:text-vogue-600 transition-colors flex flex-col items-center gap-1 relative">
                  <i className="fa-regular fa-user text-lg"></i>
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Profile</span>
                  {user && <span className="absolute top-0 right-1 w-2 h-2 bg-green-500 rounded-full border border-white"></span>}
                </Link>

                <Link to="/wishlist" onClick={(e) => handleProtectedNavigation(e, '/wishlist')} className="hover:text-vogue-600 transition-colors flex flex-col items-center gap-1 relative">
                  <i className="fa-regular fa-heart text-lg"></i>
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Wishlist</span>
                  {wishlist.length > 0 && (
                    <span className="absolute -top-1 -right-2 bg-vogue-600 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                      {wishlist.length}
                    </span>
                  )}
                </Link>

                <Link to="/cart" className="hover:text-vogue-600 transition-colors flex flex-col items-center gap-1 relative">
                  <i className="fa-solid fa-bag-shopping text-lg"></i>
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Bag</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-vogue-600 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
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
                        {['Men', 'Women', 'Kids', 'Accessories'].map((cat) => (
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
