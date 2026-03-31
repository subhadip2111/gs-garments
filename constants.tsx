
import { Product, Review, HomeConfig, Coupon, ComboOffer } from './types';

export const MOCK_COUPONS: Coupon[] = [
  { id: 'c1', code: 'HI-FASHION', discountType: 'percentage', discountValue: 10, minOrderAmount: 1000, isActive: true, description: '10% OFF on orders above ₹1000' },
  { id: 'c2', code: 'GS-FIRST', discountType: 'fixed', discountValue: 200, minOrderAmount: 1999, isActive: true, description: 'Flat ₹200 OFF on orders above ₹1999' },
  { id: 'c3', code: 'LUXE-GS', discountType: 'percentage', discountValue: 15, minOrderAmount: 4999, isActive: true, description: '15% OFF on luxury collection above ₹4999' }
];

export const MOCK_COMBO_OFFERS: ComboOffer[] = [
  { id: 'combo1', threshold: 2000, discount: 200, label: 'Style Pioneer Reward', description: 'Get ₹200 OFF on orders above ₹2000' },
  { id: 'combo2', threshold: 3500, discount: 450, label: 'Heritage Elite Reward', description: 'Get ₹450 OFF on orders above ₹3500' },
  { id: 'combo3', threshold: 5000, discount: 750, label: 'Global Sovereign Reward', description: 'Get ₹750 OFF on orders above ₹5000' }
];

export const CATEGORIES = ['Sarees', 'Blouses', 'Ethnic Wear', 'Luxe Collection'] as const;

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
      imageUrl: 'https://images.pexels.com/photos/17312687/pexels-photo-17312687.jpeg',
      title: 'Eternal \n Elegance.',
      subtitle: 'Premium Handloom Sarees \n Established 2012 — The GS Heritage',
      description: 'Discover our exclusive collection of Banarasi, Kanjeevaram and Silk sarees. A celebration of Indian craftsmanship.',
      ctaText: 'Shop Sarees',
      ctaLink: '/shop?category=Sarees',
      secondaryCtaText: "The Blouse Edit",
      secondaryCtaLink: '/shop?category=Blouses',
      badge: 'Boutique Special: Free Custom Fitting'
    },
    {
      type: 'banner',
      imageUrl: 'https://images.pexels.com/photos/15181110/pexels-photo-15181110.jpeg',
      title: 'Modern \n Heritage.',
      subtitle: 'Exclusive Designer Blouses \n Spring Summer 2026 Collection',
      ctaText: 'Explore Collection',
      ctaLink: '/shop?category=Blouses',
      badge: 'New Season'
    },
    {
      type: 'brands',
      title: 'Curated Labels.',
      subtitle: 'Excellence in Every Thread',
      brands: [
        {
          name: 'GS Heritage',
          imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200',
          description: 'Timeless Silks',
          link: '/shop?brand=GS Heritage',
          tagline: 'Timeless Silks'
        },
        {
          name: 'GS Boutique',
          imageUrl: 'https://images.pexels.com/photos/27575174/pexels-photo-27575174.jpeg',
          description: 'Designer Ethnic',
          link: '/shop?brand=GS Boutique',
          tagline: 'Designer Ethnic'
        },
        {
          name: 'GS Traditional',
          imageUrl: 'https://images.pexels.com/photos/27118152/pexels-photo-27118152.jpeg',
          description: 'Contemporary Draping',
          link: '/shop?brand=GS Traditional',
          tagline: 'Contemporary Draping'
        },
        {
          name: 'GS Heritage',
          imageUrl: 'https://images.pexels.com/photos/12579915/pexels-photo-12579915.jpeg',
          description: 'Timeless Silks',
          link: '/shop?brand=GS Heritage',
          tagline: 'Timeless Silks'
        },
      ]
    }
  ]
};

