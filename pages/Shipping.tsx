
import React from 'react';

const Shipping: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-24 animate-in fade-in duration-700">
      <header className="text-center mb-20">
        <h1 className="text-5xl font-serif font-bold tracking-tight mb-4">Shipping & Delivery</h1>
        <p className="text-gray-500 uppercase tracking-widest text-[10px] font-bold">Premium Pan-India Logistics</p>
      </header>

      <div className="space-y-16">
        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-8 border-b border-gray-100 pb-4">Our Commitment</h2>
          <p className="text-lg font-light text-gray-600 leading-relaxed italic font-serif">
            "We believe the wait for premium fashion should be as brief as possible. That's why we partner with only the most reliable logistics networks to ensure your GS curation reaches you in pristine condition."
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="p-8 bg-gray-50 border border-gray-100">
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4">Standard Delivery</h3>
            <p className="text-sm text-gray-500 mb-6 font-light">Available for over 15,000 pincodes across India.</p>
            <div className="flex justify-between items-end">
              <span className="text-2xl font-bold font-serif">3 - 5 Days</span>
              <span className="text-[10px] font-bold uppercase text-vogue-500">₹150 or FREE over ₹5,000</span>
            </div>
          </div>
          <div className="p-8 border border-black bg-white">
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4">Express Collective</h3>
            <p className="text-sm text-gray-500 mb-6 font-light">Available in major metro cities (Mumbai, Bengaluru, Delhi, etc.)</p>
            <div className="flex justify-between items-end">
              <span className="text-2xl font-bold font-serif">1 - 2 Days</span>
              <span className="text-[10px] font-bold uppercase text-black">₹350 Flat Rate</span>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-4">Good to Know</h2>
          <ul className="space-y-6 text-gray-600 text-sm font-light">
            <li className="flex gap-4">
              <span className="text-black font-bold">01.</span>
              <p>Orders placed before 2:00 PM IST are typically dispatched on the same business day.</p>
            </li>
            <li className="flex gap-4">
              <span className="text-black font-bold">02.</span>
              <p>All items in a single order will be shipped together in one consolidated premium GS box.</p>
            </li>
            <li className="flex gap-4">
              <span className="text-black font-bold">03.</span>
              <p>You will receive a real-time tracking link via SMS and Email as soon as your package leaves our warehouse.</p>
            </li>
            <li className="flex gap-4">
              <span className="text-black font-bold">04.</span>
              <p>A signature may be required upon delivery to ensure your package arrives safely.</p>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Shipping;
