
import React from 'react';

const Sustainability: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-700">
      <section className="bg-[#f2f0eb] py-32 px-4">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-green-700 mb-6">Our Commitment</span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8 text-gray-900 tracking-tighter">Fashion that gives back.</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            By 2026, our goal is to become climate-positive. We aren't just minimizing harm; we're actively regenerating the communities we work with.
          </p>
        </div>
      </section>

      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-32">
          {[
            { metric: '100%', label: 'Organic Cotton', detail: 'Sourced from rain-fed farms in Vidarbha.' },
            { metric: 'Zero', label: 'Harmful Dyes', detail: 'Only natural vegetable dyes or REACH-certified agents.' },
            { metric: '400+', label: 'Karigars', detail: 'Livelihoods supported through fair-trade practices.' },
            { metric: '80%', label: 'Water Recycled', detail: 'In our dying units, preventing groundwater pollution.' },
          ].map((item, idx) => (
            <div key={idx} className="border-l border-gray-100 pl-8">
              <span className="text-4xl font-serif font-bold block mb-2">{item.metric}</span>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-4">{item.label}</h4>
              <p className="text-sm text-gray-500 leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-20 items-center">
          <div className="lg:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000&auto=format&fit=crop" 
              className="w-full aspect-square object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-1000" 
              alt="Sustainable fabric"
            />
          </div>
          <div className="lg:w-1/2 space-y-8">
            <h2 className="text-3xl font-serif font-bold">Circular Fashion</h2>
            <p className="text-gray-500 leading-loose">
              We offer a 'Revive' program where you can send your old VOGUE garments back to us. We repair, upcycle, or recycle the fibers, and you receive store credit. We believe a garment's life shouldn't end in a landfill.
            </p>
            <button className="bg-black text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-green-800 transition-colors">Learn More About Revive</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sustainability;
