
import React from 'react';
import { Link } from 'react-router-dom';

const Returns: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-24 animate-in fade-in duration-700">
      <header className="text-center mb-20">
        <h1 className="text-5xl font-serif font-bold tracking-tight mb-4">Returns & Exchanges</h1>
        <p className="text-gray-500 uppercase tracking-widest text-[10px] font-bold">Hassle-Free Satisfaction Guarantee</p>
      </header>

      <div className="space-y-16">
        <section className="bg-gray-50 p-12 text-center">
          <h2 className="text-2xl font-serif font-bold italic mb-6">Our "Love It or Swap It" Policy</h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-2xl mx-auto font-light mb-10">
            We want you to be completely satisfied with your purchase. If a garment from our collective doesn't meet your expectations or fit perfectly, we offer an easy 7-day return and exchange window.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/contact" className="bg-black text-white px-10 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors">Start a Return</Link>
            <Link to="/track-order" className="bg-transparent border border-gray-200 px-10 py-4 text-[10px] font-bold uppercase tracking-widest hover:border-black transition-colors">Check Order Status</Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="text-4xl text-gray-200 mb-6"><i className="fa-solid fa-calendar-check"></i></div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4">7 Day Window</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-light">Returns must be initiated within 7 days of delivery.</p>
          </div>
          <div className="text-center">
            <div className="text-4xl text-gray-200 mb-6"><i className="fa-solid fa-tag"></i></div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4">Original Condition</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-light">Items must be unworn, unwashed, with all original brand tags intact.</p>
          </div>
          <div className="text-center">
            <div className="text-4xl text-gray-200 mb-6"><i className="fa-solid fa-truck-ramp-box"></i></div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4">Free Reverse Pickup</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-light">We'll arrange a complimentary pickup from your address for all returns.</p>
          </div>
        </section>

        <section className="space-y-8 pt-8 border-t border-gray-100">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-4">Non-Returnable Items</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['Innerwear (Jockey, Lux Cozi, etc.)', 'Accessories (Socks, Mask)', 'Items on Final Clearance Sale', 'Personalized or Altered Garments'].map((item, i) => (
              <div key={i} className="flex items-center gap-4 text-sm text-gray-500 font-light">
                <i className="fa-solid fa-xmark text-red-500 text-xs"></i>
                {item}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 italic mt-6">Due to hygiene and logistics constraints, these items cannot be returned unless delivered in a damaged condition.</p>
        </section>
      </div>
    </div>
  );
};

export default Returns;
