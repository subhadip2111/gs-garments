
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand & Socials */}
          <div className="space-y-8">
            <div>
              <h3 className="text-3xl font-serif font-bold mb-6 tracking-tighter">GS</h3>
              <p className="text-sm text-vogue-500 leading-relaxed font-light">
                Global Style Collective. A curated house of iconic labels and refined essentials, bringing high-performance craft to the modern wardrobe.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-black">Follow Our Journey</h4>
              <div className="flex items-center gap-6">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-vogue-500 hover:text-black hover:border-black transition-all duration-300 group"
                >
                  <i className="fa-brands fa-instagram text-lg group-hover:scale-110 transition-transform"></i>
                </a>
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-vogue-500 hover:text-black hover:border-black transition-all duration-300 group"
                >
                  <i className="fa-brands fa-facebook-f text-lg group-hover:scale-110 transition-transform"></i>
                </a>
                <a 
                  href="https://pinterest.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-vogue-500 hover:text-black hover:border-black transition-all duration-300 group"
                >
                  <i className="fa-brands fa-pinterest-p text-lg group-hover:scale-110 transition-transform"></i>
                </a>
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="lg:pl-10">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] mb-8 text-vogue-500">Concierge</h4>
            <ul className="space-y-4 text-[13px] text-gray-600 font-light">
              <li><Link to="/contact" className="hover:text-black transition-colors">Contact Us</Link></li>
              <li><Link to="/shipping" className="hover:text-black transition-colors">Shipping & Delivery</Link></li>
              <li><Link to="/returns" className="hover:text-black transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/track-order" className="hover:text-black transition-colors">Track Your Consignment</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] mb-8 text-vogue-500">The Collective</h4>
            <ul className="space-y-4 text-[13px] text-gray-600 font-light">
              <li><Link to="/about" className="hover:text-black transition-colors">Our Story</Link></li>
              <li><Link to="/careers" className="hover:text-black transition-colors">Careers</Link></li>
              <li><Link to="/sustainability" className="hover:text-black transition-colors">Sustainability Commitments</Link></li>
              <li><Link to="/privacy" className="hover:text-black transition-colors">Privacy & Security</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="bg-white p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-vogue-50 rounded-full -translate-y-1/2 translate-x-1/2 transition-transform duration-700 group-hover:scale-150"></div>
            <div className="relative z-10">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] mb-4 text-vogue-500">The GS Digest</h4>
              <p className="text-[12px] text-gray-500 mb-6 leading-relaxed font-light">Be the first to know about exclusive archive launches and seasonal curations.</p>
              <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Your preferred email" 
                  className="w-full bg-vogue-50 border-none px-4 py-4 text-[12px] focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-300"
                />
                <button className="w-full bg-black text-white text-[10px] uppercase font-bold tracking-[0.3em] py-4 hover:bg-zinc-800 transition-all active:scale-95 shadow-lg">Subscribe</button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-10">
            <p className="text-[9px] text-gray-400 uppercase tracking-widest">&copy; 2024 GS GLOBAL STYLE COLLECTIVE. BENGALURU, INDIA.</p>
            <div className="flex gap-6 text-[9px] font-bold uppercase tracking-widest text-vogue-500">
              <Link to="/privacy" className="hover:text-black">Terms</Link>
              <Link to="/privacy" className="hover:text-black">Privacy</Link>
              <Link to="/privacy" className="hover:text-black">Accessibility</Link>
            </div>
          </div>
          <div className="flex items-center gap-8 opacity-40 grayscale hover:opacity-100 transition-opacity">
            <i className="fa-brands fa-cc-visa text-2xl"></i>
            <i className="fa-brands fa-cc-mastercard text-2xl"></i>
            <i className="fa-brands fa-cc-apple-pay text-2xl"></i>
            <i className="fa-solid fa-qrcode text-2xl" title="UPI Enabled"></i>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
