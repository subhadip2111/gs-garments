
import React from 'react';

const OurStory: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-700">
      {/* Hero */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2000&auto=format&fit=crop" 
          alt="GS Collective" 
          className="absolute inset-0 w-full h-full object-cover grayscale"
        />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative text-center px-4">
          <h1 className="text-white text-5xl md:text-8xl font-serif font-bold mb-4 tracking-tighter">The GS Story</h1>
          <p className="text-white/60 text-lg uppercase tracking-[0.4em] max-w-2xl mx-auto font-light">Curation Meets Excellence</p>
        </div>
      </section>

      {/* Narrative */}
      <section className="py-32 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-vogue-500 mb-10">SINCE 2012</h2>
        <p className="text-3xl font-serif italic text-gray-800 leading-snug mb-16">
          "GS was founded on a simple premise: Why should premium global fashion be a luxury? We brought together iconic brands like Pepe Jeans and Jockey to create a single home for the modern shopper."
        </p>
        <div className="space-y-8 text-vogue-500 text-lg leading-relaxed text-justify font-light">
          <p>
            Started as a boutique concept in Bangalore, Global Style (GS) quickly evolved into India's most trusted fashion collective. Our vision was to move away from the 'everything-store' model and focus on a curated selection of brands that define quality.
          </p>
          <p>
            Today, GS represents a bridge between high-street global trends and local everyday comfort. Whether it's the sharp tailoring of Turtle or the essential reliability of Lux Cozi, we ensure every product in our collective meets a gold standard of craftsmanship.
          </p>
        </div>
      </section>

      {/* Values Grid */}
      <section className="bg-gray-50 py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
            <div>
              <span className="text-5xl font-serif italic text-black/10 mb-8 block">01</span>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-6">Unrivaled Authenticity</h3>
              <p className="text-sm text-vogue-500 leading-relaxed font-light">
                Every stitch, every label. We deal directly with brand manufacturers, eliminating middle-men to guarantee 100% original products.
              </p>
            </div>
            <div>
              <span className="text-5xl font-serif italic text-black/10 mb-8 block">02</span>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-6">Smart Curation</h3>
              <p className="text-sm text-vogue-500 leading-relaxed font-light">
                We don't stock everything. We stock the best. Our team of stylists hand-selects items from each brand's catalog that fit the contemporary Indian lifestyle.
              </p>
            </div>
            <div>
              <span className="text-5xl font-serif italic text-black/10 mb-8 block">03</span>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-6">Customer Centricity</h3>
              <p className="text-sm text-vogue-500 leading-relaxed font-light">
                Fashion should be effortless. From our AI-powered style advice to our lightning-fast returns, we make sure your experience is as premium as the clothes you wear.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OurStory;
