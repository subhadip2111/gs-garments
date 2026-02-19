
import { Product, Review, HomeConfig } from './types';

export const CATEGORIES = ['Men', 'Women', 'Kids', 'Accessories'] as const;

export const LAUNCH_PROMOS = [
  { id: 'p1', code: 'GSLAUNCH25', discount: '25% OFF', description: 'On your first order from the Heritage Collection' },
  { id: 'p2', code: 'FREESHIP', discount: 'FREE DELIVERY', description: 'Complimentary shipping on all launch items' },
  { id: 'p3', code: 'HERITAGE10', discount: 'EXTRA 10% OFF', description: 'When you buy 2 or more items from the same brand' }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    userId: 'u1',
    userName: 'Rahul M.',
    rating: 5,
    date: 'Oct 12, 2023',
    comment: 'The quality of the denim is exceptional. Pepe Jeans never disappoints with the fit. Highly recommended for daily wear.',
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=60&w=200'],
    helpfulCount: 24
  },
  {
    id: 'r2',
    userId: 'u2',
    userName: 'Anjali S.',
    rating: 4,
    date: 'Nov 05, 2023',
    comment: 'Very comfortable, but the color is slightly darker than the pictures. Still, a great purchase!',
    helpfulCount: 12
  },
  {
    id: 'r3',
    userId: 'u3',
    userName: 'Vikram K.',
    rating: 5,
    date: 'Dec 01, 2023',
    comment: 'Perfect delivery speed. The packaging was premium. GS is now my go-to for branded wear.',
    helpfulCount: 45
  }
];

export const MOCK_PRODUCTS: Product[] = [
  // --- MEN (40 Items) ---
  ...Array.from({ length: 40 }, (_, i): Product => {
    const subcats = [
      'Topwear', 'Bottomwear', 'Jeans', 'Casual Shirts', 'Formal Shirts', 'T-shirts', 'Outerwear', 'Knitwear', 'Activewear', 'Accessories',
      'Topwear', 'Bottomwear', 'Jeans', 'Casual Shirts', 'Formal Shirts', 'T-shirts', 'Outerwear', 'Knitwear', 'Activewear', 'Accessories',
      'Topwear', 'Bottomwear', 'Jeans', 'Casual Shirts', 'Formal Shirts', 'T-shirts', 'Outerwear', 'Knitwear', 'Activewear', 'Accessories',
      'Topwear', 'Bottomwear', 'Jeans', 'Casual Shirts', 'Formal Shirts', 'T-shirts', 'Outerwear', 'Knitwear', 'Activewear', 'Accessories'
    ];
    const names = [
      'Heritage Denim Trucker', 'Slim-Fit Chinos', 'Distressed Indigo Jeans', 'Checked Flannel Shirt', 'Oxford Button-Down', 'Graphic Street Tee', 'Quilted Puffer Jacket', 'Merino Wool Cardigan', 'Performance Joggers', 'Leather Flight Bag',
      'Linen Utility Overshirt', 'Corduroy Trousers', 'Dark Wash Selvedge', 'Micro-Print Casual Shirt', 'Slim Formal Shirt', 'Oversized Cotton Tee', 'Technical Windbreaker', 'Cable Knit Jumper', 'Compression Tights', 'Classic Wayfarer',
      'Minimalist Hoodie', 'Pleated Dress Pants', 'White Slim-Fit Jeans', 'Safari Canvas Shirt', 'Egyptian Cotton Formal', 'Vintage Washed Tee', 'Leather Biker Jacket', 'Cashmere Crewneck', 'Racerback Active Tank', 'Braided Suede Belt',
      'Denim Shacket', 'Relaxed Fit Cargos', 'Black Tapered Jeans', 'Grandad Collar Shirt', 'Textured Tuxedo Shirt', 'Heavyweight Pocket Tee', 'Wool Blend Overcoat', 'Half-Zip Pullover', 'Sweat-Wick Shorts', 'Luxury Chronograph'
    ];
    return {
      id: `men-${i}`,
      name: names[i] || `Men Elite Item ${i}`,
      category: 'Men' as const,
      subcategory: subcats[i] || 'Topwear',
      price: 1500 + Math.floor(Math.random() * 8000),
      originalPrice: 2000 + Math.floor(Math.random() * 10000),
      description: 'A masterpiece of contemporary menswear, designed for longevity and effortless sophistication.',
      images: [
        [
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1591047134402-3143c683884e?q=80&w=1000&auto=format&fit=crop'
        ],
        [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000&auto=format&fit=crop'
        ],
        [
          'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop'
        ]
      ][i % 3],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Charcoal', 'Naval Blue', 'Sand', 'Burgundy', 'Black'],
      rating: 4.2 + (Math.random() * 0.8),
      reviewsCount: Math.floor(Math.random() * 3000),
      stock: { S: 10, M: 20, L: 20, XL: 10 },
      isTrending: i % 4 === 0,
      isBestSeller: i % 5 === 0,
      isNewArrival: i % 3 === 0,
      fabric: 'Premium Heritage Blend',
      specifications: ['Internal storage pockets', 'Reinforced seams', 'Signature branding']
    };
  }),

  // --- WOMEN (40 Items) ---
  ...Array.from({ length: 40 }, (_, i): Product => {
    const subcats = [
      'Tops', 'Bottoms', 'Jeans', 'Dresses', 'Saree', 'Casual Shirts', 'Outerwear', 'Knitwear', 'Activewear', 'Accessories',
      'Tops', 'Bottoms', 'Jeans', 'Dresses', 'Saree', 'Casual Shirts', 'Outerwear', 'Knitwear', 'Activewear', 'Accessories',
      'Tops', 'Bottoms', 'Jeans', 'Dresses', 'Saree', 'Casual Shirts', 'Outerwear', 'Knitwear', 'Activewear', 'Accessories',
      'Tops', 'Bottoms', 'Jeans', 'Dresses', 'Saree', 'Casual Shirts', 'Outerwear', 'Knitwear', 'Activewear', 'Accessories'
    ];
    const names = [
      'Silk Camisole', 'High-Rise Trousers', 'Flare Blue Jeans', 'Velvet Evening Gown', 'Handwoven Banarasi Saree', 'Linen Blend Oversize Shirt', 'Classic Trench Coat', 'Cashmere Shawl Collar', 'Sculpt Active Leggings', 'Quilted Gold-Chain Bag',
      'Chiffon Blouse', 'Pleated Midi Skirt', 'Straight Leg Denim', 'Floral Wrap Dress', 'Silk Kanjeevaram Saree', 'Checked Picnic Shirt', 'Wool Blend Pea Coat', 'Knitted Turtleneck', 'Seamless Sports Bra', 'Pointed Suede Heels',
      'Peplum Lace Top', 'Wide Leg Culottes', 'White Skinny Jeans', 'Satin Slip Dress', 'Embroidered Chiffon Saree', 'Denim Boyfriend Shirt', 'Faux Fur Glam Coat', 'Waffle Knit Cardigan', 'High-Impact Crop Top', 'Pearl Statement Necklace',
      'Bell-Sleeve Top', 'Cargo Utility Skirt', 'Ripped Mom Jeans', 'Maxi Tiered Dress', 'Linen Handloom Saree', 'Pinstripe Work Shirt', 'Leather Moto Jacket', 'Ribbed Sweater Set', 'Yoga Flow Jumpsuit', 'Crystal Evening Clutch'
    ];
    return {
      id: `women-${i}`,
      name: names[i] || `Women Luxe Item ${i}`,
      category: 'Women' as const,
      subcategory: subcats[i] || 'Tops',
      price: 2000 + Math.floor(Math.random() * 12000),
      originalPrice: 3000 + Math.floor(Math.random() * 15000),
      description: 'An embodiment of grace and modern femininity. Each piece is curated to tell a unique story of elegance.',
      images: [
        [
          'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000&auto=format&fit=crop'
        ],
        [
          'https://images.unsplash.com/photo-1612336307429-8a898d10e223?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1551163943-3f6a855d1153?q=80&w=1000&auto=format&fit=crop'
        ],
        [
          'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1000&auto=format&fit=crop'
        ]
      ][i % 3],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Champagne', 'Emerald', 'Ruby', 'Midnight', 'Ivory'],
      rating: 4.4 + (Math.random() * 0.6),
      reviewsCount: Math.floor(Math.random() * 2500),
      stock: { S: 15, M: 25, L: 15 },
      isTrending: i % 3 === 0,
      isBestSeller: i % 4 === 0,
      isNewArrival: i % 2 === 0,
      fabric: 'Luxury Textile Mix',
      specifications: ['Artisan crafted', 'Sustainable materials', 'Precision tailoring']
    };
  }),

  // --- KIDS (40 Items) ---
  ...Array.from({ length: 40 }, (_, i): Product => {
    const subcats = [
      'Topwear', 'Bottomwear', 'Tops', 'Jeans', 'Dresses', 'Sets', 'Outerwear', 'Activewear', 'Accessories', 'Footwear',
      'Topwear', 'Bottomwear', 'Tops', 'Jeans', 'Dresses', 'Sets', 'Outerwear', 'Activewear', 'Accessories', 'Footwear',
      'Topwear', 'Bottomwear', 'Tops', 'Jeans', 'Dresses', 'Sets', 'Outerwear', 'Activewear', 'Accessories', 'Footwear',
      'Topwear', 'Bottomwear', 'Tops', 'Jeans', 'Dresses', 'Sets', 'Outerwear', 'Activewear', 'Accessories', 'Footwear'
    ];
    const names = [
      'Organic Cotton Hoodie', 'Soft Fleece Joggers', 'Graphic Animal Tee', 'Comfy Stretch Jeans', 'Floral Party Frock', 'Denim Dungaree Set', 'Waterproof Rain Mac', 'Sports Training Jersey', 'Beanie & Scarf Set', 'Light-up Sneakers',
      'Plaid Button-Down', 'Corduroy Trousers', 'Ruffled Collar Top', 'Tapered Denim Pants', 'Tiered Sun Dress', 'Tracksuit Twin Set', 'Padded Winter Parka', 'Gymnastics Leotard', 'Superhero Cape Pack', 'Canvas High-Tops',
      'Breton Stripe Tee', 'Cargo Play Shorts', 'Cartoon Motif Top', 'Skater Fit Jeans', 'Polka Dot Gown', 'Pyjama Party Set', 'Varsity Letterman Jacket', 'Swim Rash Guard', 'Character Backpack', 'Leather School Shoes',
      'Henley Knit Top', 'Chino Shorts', 'Butterfly Wing Top', 'Acid Wash Jeans', 'Tulle Princess Dress', 'Summer Holiday Set', 'Light Denim Jacket', 'Active Mesh Shorts', 'Sun Hat & Goggles', 'Velcro Sport Sandals'
    ];
    return {
      id: `kids-${i}`,
      name: names[i] || `Kids Play Item ${i}`,
      category: 'Kids' as const,
      subcategory: subcats[i] || 'Topwear',
      price: 800 + Math.floor(Math.random() * 4000),
      originalPrice: 1200 + Math.floor(Math.random() * 5000),
      description: 'Designed for the next generation of curators. Durable, soft, and ready for every adventure.',
      images: [
        [
          'https://images.unsplash.com/photo-1519238263530-99bbe197c90b?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1519457431-7551af2d81f1?q=80&w=1000&auto=format&fit=crop'
        ],
        [
          'https://images.unsplash.com/photo-1514090704330-a387f7976865?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1560506840-ec1820027f31?q=80&w=1000&auto=format&fit=crop'
        ],
        [
          'https://images.unsplash.com/photo-1533512930330-4ac257c86793?q=80&w=1000&auto=format&fit=crop'
        ]
      ][i % 3],
      sizes: ['2Y', '4Y', '6Y', '8Y', '10Y'],
      colors: ['Sunshine Yellow', 'Mint', 'Bubblegum', 'Sky', 'Navy'],
      rating: 4.5 + (Math.random() * 0.5),
      reviewsCount: Math.floor(Math.random() * 800),
      stock: { '4Y': 15, '6Y': 15 },
      isTrending: i % 4 === 0,
      isBestSeller: i % 6 === 0,
      isNewArrival: i % 3 === 0,
      fabric: '100% Cotton Comfort',
      specifications: ['Machine washable', 'Tear-resistant', 'Hypoallergenic']
    };
  })
];

export const HOME_CONFIG: HomeConfig = {
  sections: [
    {
      type: 'banner',
      imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2400&auto=format&fit=crop',
      title: 'Refined \n Essentials.',
      subtitle: 'Established 2012 — The Global Collective',
      description: 'A curated house of iconic labels. From high-performance activewear to timeless tailored linen.',
      ctaText: 'Shop The Collection',
      ctaLink: '/shop',
      secondaryCtaText: "The Men's Edit",
      secondaryCtaLink: '/shop?category=Men',
      badge: 'Launch Special: Free Shipping'
    },
    {
      type: 'spotlight',
      title: 'The Indigo Heritage \n Launch Event',
      subtitle: 'Limited Time Curation',
      description: 'Celebrate the launch of our updated Heritage Collection. For the next 48 hours, enjoy exclusive access to archive releases and commemorative pricing.',
      imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1200&auto=format&fit=crop',
      promoId: 'p1',
      brandName: 'PEPE'
    },
    {
      type: 'ai-concierge',
      title: 'Meet Your \n Personal Stylist.',
      subtitle: 'Intelligent Curation',
      description: '"Bespoke fashion guidance for the soul. Our concierge uses heritage data and real-time trends to refine your narrative."',
      imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200&auto=format&fit=crop'
    },
    {
      type: 'banner',
      imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2400&auto=format&fit=crop',
      title: 'The Modern \n Curator.',
      subtitle: 'Spring Summer 2026 Collection',
      ctaText: 'Explore Lookbook',
      ctaLink: '/shop?tag=SS26',
      badge: 'New Season'
    },
    {
      type: 'brands',
      title: 'Iconic Partners.',
      subtitle: 'The Pillars of Excellence',
      brands: [
        {
          name: 'Pepe Jeans',
          imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=1200',
          description: 'London Heritage',
          link: '/shop?brand=Pepe',
          tagline: 'London Heritage'
        },
        {
          name: 'Turtle Signature',
          imageUrl: 'https://images.unsplash.com/photo-1594932224828-b4b059b6ff0f?auto=format&fit=crop&q=80&w=1200',
          description: 'Refined Formals',
          link: '/shop?brand=Turtle',
          tagline: 'Refined Formals'
        },
        {
          name: 'JOCKEY',
          imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=1200',
          description: 'Everlasting Comfort',
          link: '/shop?brand=Jockey',
          tagline: 'Everlasting Comfort'
        }
      ]
    }
  ]
};
