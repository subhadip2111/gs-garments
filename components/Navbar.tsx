
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store';
import { LAUNCH_PROMOS, NAV_ITEMS_STRUCTURE } from '../constants';

const Navbar: React.FC = () => {
  const cart = useAppSelector((state) => state.cart.cart);
  const wishlist = useAppSelector((state) => state.cart.wishlist);
  const user = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleProtectedNavigation = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth', { state: { from: { pathname: path } } });
    } else {
      navigate(path);
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 shadow-sm font-sans bg-white">
      {/* Promo Bar */}
      <div className="w-full bg-zinc-950 text-white py-2 overflow-hidden whitespace-nowrap relative border-b border-white/5">
        <div className="animate-infinite-scroll inline-block">
          {LAUNCH_PROMOS?.map((promo, idx) => (
            <span key={idx} className="mx-12 text-[9px] font-black uppercase tracking-[0.4em]">
              {promo.discount}: Use Code <span className="text-emerald-400">{promo.code}</span> — {promo.description}
            </span>
          ))}
          {LAUNCH_PROMOS?.map((promo, idx) => (
            <span key={`dup-${idx}`} className="mx-12 text-[9px] font-black uppercase tracking-[0.4em]">
              {promo.discount}: Use Code <span className="text-emerald-400">{promo.code}</span> — {promo.description}
            </span>
          ))}
        </div>
      </div>

      <nav className="relative w-full border-b border-zinc-100 px-4 md:px-8 lg:px-12 h-20 flex items-center justify-between">
        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden w-10 h-10 flex items-center justify-center text-zinc-900"
        >
          <i className="fa-solid fa-bars-staggered text-xl"></i>
        </button>

        {/* Logo */}
        <Link to="/" className="text-3xl md:text-4xl font-serif font-bold tracking-tighter text-black">GS</Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center h-full ml-8">
          {NAV_ITEMS_STRUCTURE.map((item) => (
            <div
              key={item.name}
              className="h-full group flex items-center"
              onMouseEnter={() => setHoveredCategory(item.name)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <Link
                to={item.href}
                className="px-6 h-full flex items-center text-[12px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-black transition-colors"
              >
                {item.name}
              </Link>

              {/* Megamenu UI (Condensed) */}
              <div className="absolute top-full left-0 w-full bg-white shadow-2xl transition-all duration-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible border-t border-zinc-100 z-[60] py-12">
                <div className="max-w-[1400px] mx-auto px-12 grid grid-cols-4 gap-12">
                  {item.subcategories.map((sub) => (
                    <div key={sub.name} className="space-y-6">
                      <h4 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em]">{sub.name}</h4>
                      <div className="flex flex-col space-y-3">
                        {sub.items.map((subItem) => (
                          <Link
                            key={subItem}
                            to={`${item.href}&subcategory=${subItem}`}
                            className="text-[13px] font-medium text-zinc-600 hover:text-black transition-colors"
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

        {/* Action Icons */}
        <div className="flex items-center gap-4 md:gap-8">
          <button onClick={() => setSearchOpen(true)} className="w-10 h-10 flex items-center justify-center text-zinc-900 hover:scale-110 transition-transform">
            <i className="fa-solid fa-magnifying-glass text-lg"></i>
          </button>

          <Link to="/wishlist" onClick={(e) => handleProtectedNavigation(e, '/wishlist')} className="w-10 h-10 flex items-center justify-center text-zinc-900 hover:scale-110 transition-transform relative">
            <i className="fa-regular fa-heart text-xl"></i>
            {wishlist.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-zinc-900 rounded-full"></span>}
          </Link>

          <Link to="/cart" className="w-10 h-10 flex items-center justify-center text-zinc-900 hover:scale-110 transition-transform relative">
            <i className="fa-solid fa-bag-shopping text-xl"></i>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-zinc-900 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-black">
                {cartCount}
              </span>
            )}
          </Link>

          <Link to="/profile" onClick={(e) => handleProtectedNavigation(e, '/profile')} className="hidden sm:flex w-10 h-10 items-center justify-center text-zinc-900 hover:scale-110 transition-transform">
            <i className="fa-regular fa-user text-xl"></i>
          </Link>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <aside className="absolute top-0 left-0 w-[80%] max-w-sm h-full bg-white shadow-2xl animate-in slide-in-from-left duration-500 overflow-y-auto">
            <div className="p-8 space-y-12">
              <div className="flex justify-between items-center">
                <span className="text-3xl font-serif font-bold tracking-tighter">GS Archive</span>
                <button onClick={() => setIsMobileMenuOpen(false)}><i className="fa-solid fa-xmark text-xl"></i></button>
              </div>

              <div className="space-y-8">
                {NAV_ITEMS_STRUCTURE.map((item) => (
                  <div key={item.name} className="space-y-4">
                    <Link to={item.href} className="text-xl font-serif font-bold italic text-zinc-900 block">{item.name}</Link>
                    <div className="grid grid-cols-1 gap-2 pl-4">
                      {item.subcategories.map(sub => (
                        <div key={sub.name} className="py-2">
                          <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest block mb-2">{sub.name}</span>
                          <div className="flex flex-col gap-2">
                            {sub.items.slice(0, 3).map(i => (
                              <Link key={i} to={`${item.href}&subcategory=${i}`} className="text-sm text-zinc-500 font-medium">{i}</Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-12 border-t border-zinc-100 space-y-6">
                <Link to="/profile" className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-zinc-900">
                  <i className="fa-regular fa-user text-lg"></i>
                  My Account
                </Link>
                <Link to="/track-order" className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-zinc-900">
                  <i className="fa-solid fa-map-location-dot text-lg"></i>
                  Track Order
                </Link>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Search Modal remains similar but styled */}
      {searchOpen && (
        <div className="fixed inset-0 z-[110] flex items-start justify-center pt-24 px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSearchOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-4 border-b border-zinc-100 pb-6 mb-8">
              <i className="fa-solid fa-magnifying-glass text-zinc-300"></i>
              <input
                type="text"
                placeholder="Search the archives..."
                className="flex-1 bg-transparent outline-none text-xl font-serif italic"
                autoFocus
              />
              <button onClick={() => setSearchOpen(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="space-y-8">
              <div>
                <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-300 mb-4">Quick Links</h4>
                <div className="flex flex-wrap gap-2">
                  {['Sarees', 'Blouses', 'Bridal', 'GS Heritage'].map(t => (
                    <button key={t} className="px-4 py-2 rounded-full bg-zinc-50 text-xs font-bold hover:bg-zinc-900 hover:text-white transition-all">{t}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
