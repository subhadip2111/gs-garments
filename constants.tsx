
import { Product, Review, HomeConfig, Coupon, ComboOffer } from './types';

export const MOCK_COUPONS: Coupon[] = [
  { id: 'c1', code: 'HI-FASHION', discountType: 'percentage', discountValue: 10, minPurchase: 1000, description: '10% OFF on orders above ₹1000' },
  { id: 'c2', code: 'GS-FIRST', discountType: 'fixed', discountValue: 200, minPurchase: 1999, description: 'Flat ₹200 OFF on orders above ₹1999' },
  { id: 'c3', code: 'LUXE-GS', discountType: 'percentage', discountValue: 15, minPurchase: 4999, description: '15% OFF on luxury collection above ₹4999' }
];

export const MOCK_COMBO_OFFERS: ComboOffer[] = [
  { id: 'combo1', threshold: 2000, discount: 200, label: 'Style Pioneer Reward', description: 'Get ₹200 OFF on orders above ₹2000' },
  { id: 'combo2', threshold: 3500, discount: 450, label: 'Heritage Elite Reward', description: 'Get ₹450 OFF on orders above ₹3500' },
  { id: 'combo3', threshold: 5000, discount: 750, label: 'Global Sovereign Reward', description: 'Get ₹750 OFF on orders above ₹5000' }
];

export const CATEGORIES = ['Men', 'Women', 'Kids', 'Accessories'] as const;

export interface NavStructure {
  name: string;
  id: string;
  href: string;
  subcategories: {
    name: string;
    items: string[];
  }[];
}

export const NAV_ITEMS_STRUCTURE: NavStructure[] = [
  {
    name: 'Men',
    id: 'Men',
    href: '/shop?category=Men',
    subcategories: [
      { name: 'Topwear', items: ['T-shirts', 'Casual Shirts', 'Formal Shirts', 'Sweatshirts', 'Jackets'] },
      { name: 'Bottomwear', items: ['Jeans', 'Casual Trousers', 'Formal Trousers', 'Shorts', 'Track Pants'] },
      { name: 'Footwear', items: ['Casual Shoes', 'Sports Shoes', 'Formal Shoes', 'Sneakers', 'Sandals'] },
      { name: 'Accessories', items: ['Belts', 'Watches', 'Wallets', 'Sunglasses', 'Bags'] }
    ]
  },
  {
    name: 'Women',
    id: 'Women',
    href: '/shop?category=Women',
    subcategories: [
      { name: 'Indian & Fusion Wear', items: ['Kurtas & Suits', 'Sarees', 'Ethnic Wear', 'Leggings & Salwars', 'Skirts'] },
      { name: 'Western Wear', items: ['Dresses', 'Tops', 'Tshirts', 'Jeans', 'Trousers & Capris'] },
      { name: 'Footwear', items: ['Flats', 'Heels', 'Casual Shoes', 'Sports Shoes', 'Boots'] },
      { name: 'Lingerie & Sleepwear', items: ['Bra', 'Briefs', 'Sleepwear', 'Shapewear', 'Camisoles'] }
    ]
  },
  {
    name: 'Kids',
    id: 'Kids',
    href: '/shop?category=Kids',
    subcategories: [
      { name: 'Boys Clothing', items: ['T-Shirts', 'Shirts', 'Shorts', 'Jeans', 'Trousers'] },
      { name: 'Girls Clothing', items: ['Dresses', 'Tops', 'Tshirts', 'Clothing Sets', 'Lehenga Choli'] },
      { name: 'Infants', items: ['Bodysuits', 'Clothing Sets', 'Tshirts & Tops', 'Dresses', 'Sleepwear'] },
      { name: 'Kids Footwear', items: ['Casual Shoes', 'Flipflops', 'Sports Shoes', 'Flats', 'Sandals'] }
    ]
  },
  {
    name: 'Essentials',
    id: 'Accessories',
    href: '/shop?category=Accessories',
    subcategories: [
      { name: 'Grooming', items: ['Fragrances', 'Hair Care', 'Skin Care', 'Beard Care', 'Bath & Body'] },
      { name: 'Gadgets', items: ['Smart Wearables', 'Headphones', 'Speakers', 'Power Banks', 'Mobile Accessories'] }
    ]
  }
];

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
  // --- MEN ---
  {
    id: 'men-jeans-1',
    name: 'Stretchable Slim Fit Blue Jeans',
    brand: 'Levis',
    category: 'Men',
    subcategory: 'Jeans',
    price: 2499,
    originalPrice: 4999,
    description: 'Classic slim fit blue jeans with a comfortable stretch. Perfect for casual outings.',
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=1200'],
    sizes: ['30', '32', '34', '36'],
    colors: ['Deep Blue'],
    rating: 4.5,
    reviewsCount: 850,
    stock: { '30': 20, '32': 25, '34': 15 },
    isTrending: true,
    sku: 'GS-M-JN-001',
    fabric: '98% Cotton, 2% Elastane',
    materialAndCare: ['Machine Wash cold', 'Do not bleach'],
    specifications: ['Slim Fit', 'Mid-Rise', '5-Pocket Design']
  },
  {
    id: 'men-kurta-1',
    name: 'Embroidered Cotton Kurta',
    brand: 'Manyavar',
    category: 'Men',
    subcategory: 'Kurta',
    price: 3999,
    originalPrice: 5999,
    description: 'Elegant white cotton kurta with intricate embroidery on the neck and cuffs.',
    images: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=1200'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White'],
    rating: 4.8,
    reviewsCount: 320,
    stock: { 'S': 10, 'M': 15, 'L': 10, 'XL': 5 },
    isNewArrival: true,
    sku: 'GS-M-KR-001',
    fabric: '100% Cotton',
    materialAndCare: ['Hand Wash recommended', 'Dry Clean Only'],
    specifications: ['Mandarin Collar', 'Long Sleeves', 'Side Slits']
  },
  {
    id: 'men-shirt-1',
    name: 'Premium White Formal Shirt',
    brand: 'Van Heusen',
    category: 'Men',
    subcategory: 'Shirts',
    price: 1899,
    originalPrice: 2999,
    description: 'Crisp white formal shirt made from high-quality Egyptian cotton.',
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=1200'],
    sizes: ['38', '40', '42', '44'],
    colors: ['White'],
    rating: 4.6,
    reviewsCount: 1200,
    stock: { '38': 30, '40': 40, '42': 35, '44': 20 },
    isBestSeller: true,
    sku: 'GS-M-SH-001',
    fabric: '100% Egyptian Cotton',
    materialAndCare: ['Warm Machine Wash', 'Iron while damp'],
    specifications: ['Regular Fit', 'Classic Collar', 'Single Cuff']
  },
  {
    id: 'men-panjabi-1',
    name: 'Royal Silk Panjabi',
    brand: 'Fabindia',
    category: 'Men',
    subcategory: 'Panjabi',
    price: 5499,
    originalPrice: 7999,
    description: 'A luxurious silk panjabi with subtle self-patterns, ideal for weddings and festivals.',
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=1200'],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Maroon'],
    rating: 4.9,
    reviewsCount: 150,
    stock: { 'M': 8, 'L': 12, 'XL': 10, 'XXL': 5 },
    isTrending: true,
    sku: 'GS-M-PJ-001',
    fabric: 'Pure Silk',
    materialAndCare: ['Dry Clean Only'],
    specifications: ['Hidden Placket', 'Premium Lining', 'Handmade Buttons']
  },
  {
    id: 'men-tshirt-1',
    name: 'Classic Black Crew Neck T-Shirt',
    brand: 'GS Essentials',
    category: 'Men',
    subcategory: 'T-shirts',
    price: 799,
    originalPrice: 1299,
    description: 'Essential everyday black t-shirt made from breathable organic cotton.',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=1200'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black'],
    rating: 4.4,
    reviewsCount: 2500,
    stock: { 'S': 50, 'M': 100, 'L': 100 },
    isBestSeller: true,
    sku: 'GS-M-TS-001',
    fabric: '100% Organic Cotton',
    materialAndCare: ['Machine Wash cold', 'Tumble dry low'],
    specifications: ['Regular Fit', 'Soft Hand Feel']
  },
  {
    id: 'men-blazer-1',
    name: 'Classic Navy Velvet Blazer',
    brand: 'Raymond',
    category: 'Men',
    subcategory: 'Outerwear',
    price: 7999,
    originalPrice: 10999,
    description: 'A sophisticated navy velvet blazer for evening galas and ceremonies.',
    images: ['https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?auto=format&fit=crop&q=80&w=1200'],
    sizes: ['38', '40', '42', '44'],
    colors: ['Navy Blue'],
    rating: 4.7,
    reviewsCount: 45,
    stock: { '40': 5, '42': 10 },
    sku: 'GS-M-BZ-001',
    fabric: 'Premium Velvet',
    materialAndCare: ['Dry Clean Only'],
    specifications: ['Peak Lapel', 'Slim Fit', 'Satin Lining']
  },
  {
    id: 'men-chinos-1',
    name: 'Slim Fit Khaki Chinos',
    brand: 'Zara',
    category: 'Men',
    subcategory: 'Bottomwear',
    price: 2299,
    originalPrice: 3499,
    description: 'Versatile khaki chinos crafted from breathable cotton twill.',
    images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=1200'],
    sizes: ['30', '32', '34', '36'],
    colors: ['Khaki'],
    rating: 4.5,
    reviewsCount: 432,
    stock: { '32': 20, '34': 15 },
    sku: 'GS-M-CH-001',
    fabric: '98% Cotton, 2% Elastane',
    materialAndCare: ['Machine Wash Cold', 'Tumble Dry Low'],
    specifications: ['Slim Fit', 'Flat Front', 'Side Slant Pockets']
  },

  // --- WOMEN ---
  {
    id: 'women-saree-1',
    name: 'Handwoven Banarasi Silk Saree',
    brand: 'GS Heritage',
    category: 'Women',
    subcategory: 'Saree',
    price: 12999,
    originalPrice: 18999,
    description: 'A timeless Banarasi silk saree with gold zari work. A true masterpiece of craftsmanship.',
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200'],
    sizes: ['Onesize'],
    colors: ['Red & Gold'],
    rating: 5.0,
    reviewsCount: 45,
    stock: { 'Onesize': 5 },
    isTrending: true,
    sku: 'GS-W-SR-001',
    fabric: 'Pure Silk',
    materialAndCare: ['Dry Clean Only', 'Store in a muslin cloth'],
    specifications: ['Gold Zari Border', '5.5 Meters Length']
  },
  {
    id: 'women-dress-1',
    name: 'Satin Slip Evening Dress',
    brand: 'H&M',
    category: 'Women',
    subcategory: 'Dresses',
    price: 2999,
    originalPrice: 4499,
    description: 'Sleek and minimalist satin slip dress in a deep emerald green.',
    images: ['https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=1200'],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Emerald Green'],
    rating: 4.7,
    reviewsCount: 210,
    stock: { 'S': 10, 'M': 10 },
    isTrending: true,
    sku: 'GS-W-DR-001',
    fabric: 'Satin Polyester',
    materialAndCare: ['Hand Wash cold', 'Steam iron only'],
    specifications: ['Bodycon Fit', 'Adjustable Straps']
  },
  {
    id: 'women-kurti-1',
    name: 'Daily Wear Cotton Kurti',
    brand: 'BIBA',
    category: 'Women',
    subcategory: 'Kurtas',
    price: 1299,
    originalPrice: 1999,
    description: 'Comfortable cotton kurti with block print patterns, perfect for office or casual wear.',
    images: ['https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&q=80&w=1200'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Indigo'],
    rating: 4.5,
    reviewsCount: 1800,
    stock: { 'M': 30, 'L': 25 },
    isBestSeller: true,
    sku: 'GS-W-KR-001',
    fabric: '100% Cotton',
    materialAndCare: ['Machine Wash cold', 'Wash separately'],
    specifications: ['Straight Fit', '3/4th Sleeves']
  },
  {
    id: 'women-top-1',
    name: 'Floral Print Chiffon Top',
    brand: 'Zara',
    category: 'Women',
    subcategory: 'Tops',
    price: 1499,
    originalPrice: 2499,
    description: 'Light and airy chiffon top with a beautiful floral print and bell sleeves.',
    images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=1200'],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Pastel Pink'],
    rating: 4.3,
    reviewsCount: 600,
    stock: { 'S': 20, 'M': 15 },
    isNewArrival: true,
    sku: 'GS-W-TP-001',
    fabric: 'Chiffon',
    materialAndCare: ['Cold Machine Wash', 'Cool Iron'],
    specifications: ['Relaxed Fit', 'V-Neckline']
  },
  {
    id: 'women-anarkali-1',
    name: 'Floral Printed Silk Anarkali',
    brand: 'W',
    category: 'Women',
    subcategory: 'Kurtas',
    price: 4999,
    originalPrice: 7999,
    description: 'A graceful floor-lengthsilk anarkali with delicate floral prints.',
    images: ['https://images.unsplash.com/photo-1598501022229-39773bc25e8c?auto=format&fit=crop&q=80&w=1200'],
    sizes: ['M', 'L', 'XL'],
    colors: ['Sage Green'],
    rating: 4.8,
    reviewsCount: 156,
    stock: { 'M': 10, 'L': 8 },
    sku: 'GS-W-AK-101',
    fabric: 'Artificial Silk',
    materialAndCare: ['Dry Clean Only'],
    specifications: ['Flared Hem', 'Round Neck', 'Zari Work']
  },
  {
    id: 'women-jeans-1',
    name: 'High-Rise Skinny Fit Jeans',
    brand: 'Levis',
    category: 'Women',
    subcategory: 'Jeans',
    price: 3499,
    originalPrice: 4999,
    description: 'Classic high-rise skinny jeans in a versatile medium wash.',
    images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=1200'],
    sizes: ['26', '28', '30', '32'],
    colors: ['Medium Wash Blue'],
    rating: 4.4,
    reviewsCount: 742,
    stock: { '28': 15, '30': 20 },
    sku: 'GS-W-JN-001',
    fabric: '99% Cotton, 1% Elastane',
    materialAndCare: ['Machine Wash Cold', 'Do Not Bleach'],
    specifications: ['High-Rise', 'Skinny Fit', 'Stretchable']
  },

  // --- KIDS ---
  {
    id: 'kids-frock-1',
    name: 'Pink Tulle Party Frock',
    brand: 'Little Muffet',
    category: 'Kids',
    subcategory: 'Dresses',
    price: 2499,
    originalPrice: 3999,
    description: 'A beautiful layered tulle frock with a satin bow, perfect for birthdays.',
    images: ['https://images.unsplash.com/photo-1533512930330-4ac257c86793?auto=format&fit=crop&q=80&w=1200'],
    sizes: ['2Y', '4Y', '6Y', '8Y'],
    colors: ['Princess Pink'],
    rating: 4.9,
    reviewsCount: 120,
    stock: { '4Y': 15, '6Y': 10 },
    isTrending: true,
    sku: 'GS-K-DR-001',
    fabric: 'Net and Satin',
    materialAndCare: ['Hand Wash only', 'Steam iron layers'],
    specifications: ['Flare Fit', 'Cotton Lining']
  },
  {
    id: 'kids-tshirt-1',
    name: 'Animal Graphic Polo T-Shirt',
    brand: 'U.S. Polo Assn.',
    category: 'Kids',
    subcategory: 'T-shirts',
    price: 999,
    originalPrice: 1499,
    description: 'Durable cotton polo with a fun graphic for everyday play.',
    images: ['https://images.unsplash.com/photo-1519457431-7551af2d81f1?auto=format&fit=crop&q=80&w=1200'],
    sizes: ['2Y', '4Y', '6Y', '8Y'],
    colors: ['Ochre Yellow'],
    rating: 4.6,
    reviewsCount: 450,
    stock: { '4Y': 15, '6Y': 10 },
    isBestSeller: true,
    sku: 'GS-K-TS-001',
    fabric: '100% Cotton',
    materialAndCare: ['Machine Wash warm', 'Tumble dry low'],
    specifications: ['Regular Fit', 'Ribbed Collar']
  },
  {
    id: 'kids-kurta-set-1',
    name: 'Traditional Cotton Kurta Set',
    brand: 'Fabindia Kids',
    category: 'Kids',
    subcategory: 'Sets',
    price: 1899,
    originalPrice: 2499,
    description: 'A soft and breathable cotton kurta set for boys, perfect for festive occasions.',
    images: ['https://images.unsplash.com/photo-1610484826967-09c5720778c7?auto=format&fit=crop&q=80&w=1200'],
    sizes: ['2Y', '4Y', '6Y', '8Y'],
    colors: ['Turquoise'],
    rating: 4.8,
    reviewsCount: 89,
    stock: { '4Y': 10, '6Y': 10 },
    isNewArrival: true,
    sku: 'GS-K-KS-001',
    fabric: '100% Cotton',
    materialAndCare: ['Hand Wash Cold', 'Line Dry'],
    specifications: ['Comfort Fit', 'Elasticated Waist Pajama']
  }
];

export const OPEN_POSITIONS = [
  {
    title: 'Store Keeper',
    team: 'Operations',
    location: 'Chowrangi more, Joteghanashyam, West Bengal 721153',
    type: 'Full-time',
    salary: '₹15,000 - ₹20,000',
    responsibilities: [
      'Manage daily inventory inflow and outflow',
      'Maintain warehouse organization and cleanliness',
      'Perform regular stock audits and reconciliation',
      'Coordinate with the logistics team for timely dispatches'
    ]
  },
  {
    title: 'Photo Editor',
    team: 'Creative',
    location: 'Chowrangi more, Joteghanashyam, West Bengal 721153',
    type: 'Full-time',
    salary: '₹18,000 - ₹25,000',
    responsibilities: [
      'Retouch and edit high-quality product imagery',
      'Maintain color consistency across all digital assets',
      'Collaborate with photographers for creative direction',
      'Manage digital asset libraries and archival'
    ]
  },
  {
    title: 'Customer Support',
    team: 'Success',
    location: 'Chowrangi more, Joteghanashyam, West Bengal 721153',
    type: 'Full-time',
    salary: '₹12,000 - ₹18,000',
    responsibilities: [
      'Resolve customer queries via email, chat, and phone',
      'Manage order returns and exchange processes',
      'Coordinate with logistics for delivery tracking',
      'Collect and summarize customer feedback for product teams'
    ]
  },
  {
    title: 'Senior Fashion Designer',
    team: 'Design',
    location: 'Chowrangi more, Joteghanashyam, West Bengal 721153',
    type: 'Full-time',
    salary: '₹35,000 - ₹50,000',
    responsibilities: [
      'Conceptualize and design seasonal collections',
      'Create technical tech packs and material specifications',
      'Oversee sample development and fitting sessions',
      'Research global trends and translate them for the GS brand'
    ]
  },
  {
    title: 'E-commerce Manager',
    team: 'Operations',
    location: 'Chowrangi more, Joteghanashyam, West Bengal 721153',
    type: 'Full-time',
    salary: '₹25,000 - ₹40,000',
    responsibilities: [
      'Optimize online store performance and conversions',
      'Manage product listings and merchandising strategies',
      'Analyze sales data and generate performance reports',
      'Coordinate digital marketing campaigns with the creative team'
    ]
  },
];

export const HOME_CONFIG: HomeConfig = {
  sections: [
    {
      type: 'banner',
      imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2400&auto=format&fit=crop',
      title: 'Refined \n Essentials.',
      subtitle: 'Our New Brand Exclusive Premium Store \n Established 2012 — The Global Collective',
      description: 'A curated house of iconic labels. From high-performance activewear to timeless tailored linen.',
      ctaText: 'Shop The Collection',
      ctaLink: '/shop',
      secondaryCtaText: "The Men's Edit",
      secondaryCtaLink: '/shop?category=Men',
      badge: 'Launch Special: Free Shipping'
    },
    {
      type: 'banner',
      imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2400&auto=format&fit=crop',
      title: 'The Modern \n Curator.',
      subtitle: 'Our New Brand Exclusive Premium Store \n Spring Summer 2026 Collection',
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
