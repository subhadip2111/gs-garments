
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

export const CATEGORIES = ['Sarees', 'Blouses', 'Ethnic Wear', 'Luxe Collection'] as const;

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
    name: 'Sarees',
    id: 'Sarees',
    href: '/shop?category=Sarees',
    subcategories: [
      { name: 'Traditional', items: ['Banarasi Silk', 'Kanjeevaram Silk', 'Chanderi', 'Cotton Silk', 'Tant'] },
      { name: 'Modern', items: ['Chiffon', 'Georgette', 'Organza', 'Satin Silk', 'Net Sarees'] },
      { name: 'Specialty', items: ['Handloom', 'Printed', 'Embroidered', 'Party Wear', 'Daily Wear'] }
    ]
  },
  {
    name: 'Blouses',
    id: 'Blouses',
    href: '/shop?category=Blouses',
    subcategories: [
      { name: 'Styles', items: ['Designer Blouses', 'Readymade', 'Sleeveless', 'Padded', 'Backless'] },
      { name: 'Work', items: ['Embroidered', 'Zari Work', 'Sequined', 'Printed', 'Plain Silk'] }
    ]
  },
  {
    name: 'Ethnic Wear',
    id: 'Ethnic Wear',
    href: '/shop?category=Ethnic Wear',
    subcategories: [
      { name: 'Suits & Sets', items: ['Kurtas & Suits', 'Salwar Kameez', 'Anarkali Sets', 'Sharara Sets'] },
      { name: 'Bottoms', items: ['Leggings', 'Palazzos', 'Skirts', 'Petticoats'] },
      { name: 'Occasion', items: ['Lehenga Choli', 'Gowns', 'Ethnic Jackets'] }
    ]
  },
  {
    name: 'Luxe',
    id: 'Luxe Collection',
    href: '/shop?category=Luxe Collection',
    subcategories: [
      { name: 'Premium', items: ['Handloom Silk', 'Bridal Collection', 'Boutique Designs'] }
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

// export const MOCK_PRODUCTS: Product[] = [
//   {
//     id: 'saree-banarasi-1',
//     name: 'Handwoven Banarasi Silk Saree',
//     brand: 'GS Heritage',
//     category: 'Sarees',
//     subcategory: 'Traditional',
//     price: 12999,
//     originalPrice: 18999,
//     description: 'A timeless Banarasi silk saree with gold zari work. A true masterpiece of craftsmanship.',
//     images: ['https://images.unsplash.com/photo-1678705730064-a7ecbab4b3fb?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
//     sizes: ['Onesize'],
//     colors: ['Red & Gold'],
//     rating: 5.0,
//     reviewsCount: 45,
//     stock: { 'Onesize': 5 },
//     isTrending: true,
//     sku: 'GS-W-SR-001',
//     fabric: 'Pure Silk',
//     materialAndCare: ['Dry Clean Only', 'Store in a muslin cloth'],
//     specifications: ['Gold Zari Border', '5.5 Meters Length']
//   },
//   {
//     id: 'saree-kanjeevaram-1',
//     name: 'Traditional Kanjeevaram Silk Saree',
//     brand: 'GS Heritage',
//     category: 'Sarees',
//     subcategory: 'Traditional',
//     price: 15499,
//     originalPrice: 21999,
//     description: 'Authentic Kanjeevaram silk saree from the weavers of Kanchipuram. Rich border and deep colors.',
//     images: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=1200'],
//     sizes: ['Onesize'],
//     colors: ['Mustard & Maroon'],
//     rating: 4.9,
//     reviewsCount: 28,
//     stock: { 'Onesize': 3 },
//     isNewArrival: true,
//     sku: 'GS-W-SR-002',
//     fabric: 'Pure Mulberry Silk',
//     materialAndCare: ['Dry Clean Only'],
//     specifications: ['Temple Border', 'Silk Mark Certified']
//   },
//   {
//     id: 'saree-chiffon-1',
//     name: 'Pastel Pink Chiffon Saree',
//     brand: 'GS Modern',
//     category: 'Sarees',
//     subcategory: 'Modern',
//     price: 3499,
//     originalPrice: 4999,
//     description: 'Lightweight and elegant chiffon saree with delicate silver borders. Perfect for evening parties.',
//     images: ['https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=1200'],
//     sizes: ['Onesize'],
//     colors: ['Pastel Pink'],
//     rating: 4.7,
//     reviewsCount: 112,
//     stock: { 'Onesize': 20 },
//     isTrending: true,
//     sku: 'GS-W-SR-003',
//     fabric: 'Premium Chiffon',
//     materialAndCare: ['Hand Wash cold', 'Steam iron only'],
//     specifications: ['Lightweight', 'Silver Sequin Work']
//   },
//   {
//     id: 'blouse-designer-1',
//     name: 'Embroidered Velvet Blouse',
//     brand: 'GS Boutique',
//     category: 'Blouses',
//     subcategory: 'Styles',
//     price: 2499,
//     originalPrice: 3999,
//     description: 'Bespoke velvet blouse with intricate heavy embroidery on back and sleeves.',
//     images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=1200'],
//     sizes: ['34', '36', '38', '40'],
//     colors: ['Deep Wine'],
//     rating: 4.8,
//     reviewsCount: 64,
//     stock: { '36': 10, '38': 15 },
//     isBestSeller: true,
//     sku: 'GS-W-BL-001',
//     fabric: 'Micro Velvet',
//     materialAndCare: ['Dry Clean Only'],
//     specifications: ['Padded', 'Back Hook Closure', 'Hand Embroidery']
//   },
//   {
//     id: 'blouse-silk-1',
//     name: 'Readymade Raw Silk Blouse',
//     brand: 'GS Boutique',
//     category: 'Blouses',
//     subcategory: 'Work',
//     price: 1299,
//     originalPrice: 1999,
//     description: 'Classic raw silk blouse with gold piping. Versatile piece that goes with any saree.',
//     images: ['https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&q=80&w=1200'],
//     sizes: ['32', '34', '36', '38', '40', '42'],
//     colors: ['Gold', 'Black', 'Red'],
//     rating: 4.6,
//     reviewsCount: 850,
//     stock: { '34': 50, '36': 45, '38': 30 },
//     isBestSeller: true,
//     sku: 'GS-W-BL-002',
//     fabric: 'Banglori Raw Silk',
//     materialAndCare: ['Cold Machine Wash'],
//     specifications: ['Elbow Length Sleeves', 'Princess Cut']
//   },
//   {
//     id: 'ethnic-anarkali-1',
//     name: 'Floral Printed Silk Anarkali',
//     brand: 'GS Boutique',
//     category: 'Ethnic Wear',
//     subcategory: 'Suits & Sets',
//     price: 4999,
//     originalPrice: 7999,
//     description: 'A graceful floor-length silk anarkali with delicate floral prints and matching dupatta.',
//     images: ['https://images.unsplash.com/photo-1598501022229-39773bc25e8c?auto=format&fit=crop&q=80&w=1200'],
//     sizes: ['S', 'M', 'L', 'XL'],
//     colors: ['Sage Green'],
//     rating: 4.8,
//     reviewsCount: 156,
//     stock: { 'M': 10, 'L': 8 },
//     sku: 'GS-W-AK-101',
//     fabric: 'Artificial Silk',
//     materialAndCare: ['Dry Clean Only'],
//     specifications: ['Flared Hem', 'Round Neck', 'Zari Work']
//   },
//   {
//     id: 'saree-organza-1',
//     name: 'Floral Organza Party Saree',
//     brand: 'GS Modern',
//     category: 'Sarees',
//     subcategory: 'Modern',
//     price: 4299,
//     originalPrice: 6499,
//     description: 'Dreamy organza saree with hand-painted floral motifs and scalloped edges.',
//     images: ['https://images.unsplash.com/photo-1610484826967-09c5720778c7?auto=format&fit=crop&q=80&w=1200'],
//     sizes: ['Onesize'],
//     colors: ['Ivory Floral'],
//     rating: 4.9,
//     reviewsCount: 42,
//     stock: { 'Onesize': 8 },
//     isTrending: true,
//     sku: 'GS-W-SR-004',
//     fabric: 'Pure Organza',
//     materialAndCare: ['Dry Clean Only'],
//     specifications: ['Hand Painted', 'Scalloped Border']
//   }
// ];

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
      imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=2400&auto=format&fit=crop',
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
      imageUrl: 'https://images.pexels.com/photos/28943611/pexels-photo-28943611.jpeg',
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
        }
      ]
    }
  ]
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'saree-pexels-1',
    name: 'Royal Red Bridal Silk Saree',
    brand: 'GS Heritage',
    category: 'Sarees',
    subcategory: 'Bridal',
    price: 18999,
    originalPrice: 25999,
    description:
      'Luxurious bridal silk saree crafted with intricate zari weaving and rich traditional patterns.',
    images: [
      'https://images.pexels.com/photos/15181108/pexels-photo-15181108.jpeg',
      'https://images.pexels.com/photos/20319222/pexels-photo-20319222.jpeg',
      'https://images.pexels.com/photos/13192040/pexels-photo-13192040.jpeg',
      'https://images.pexels.com/photos/9419006/pexels-photo-9419006.jpeg',
    ],
    sizes: ['Onesize'],
    colors: ['Royal Red'],
    rating: 4.9,
    reviewsCount: 78,
    stock: { Onesize: 4 },
    isTrending: true,
    sku: 'GS-W-SR-101',
    fabric: 'Pure Silk',
    materialAndCare: ['Dry Clean Only', 'Store in cotton wrap'],
    specifications: ['Heavy Zari Work', '5.5 Meter Length', 'Blouse Included'],
  },
  {
    id: 'saree-pexels-2',
    name: 'Pastel Green Designer Saree',
    brand: 'GS Modern',
    category: 'Sarees',
    subcategory: 'Designer',
    price: 7499,
    originalPrice: 10999,
    description:
      'Elegant pastel saree designed for receptions and festive gatherings.',
    images: [
      'https://images.pexels.com/photos/9418783/pexels-photo-9418783.jpeg',
      'https://images.pexels.com/photos/29049398/pexels-photo-29049398.jpeg',
      'https://images.pexels.com/photos/11822276/pexels-photo-11822276.jpeg',
      'https://images.pexels.com/photos/28428034/pexels-photo-28428034.jpeg',
    ],
    sizes: ['Onesize'],
    colors: ['Pastel Green'],
    rating: 4.7,
    reviewsCount: 112,
    stock: { Onesize: 12 },
    isNewArrival: true,
    sku: 'GS-W-SR-102',
    fabric: 'Soft Georgette',
    materialAndCare: ['Dry Clean Recommended'],
    specifications: ['Light Embroidery', 'Scalloped Border'],
  },
  {
    id: 'saree-pexels-3',
    name: 'Traditional Yellow Silk Saree',
    brand: 'GS Heritage',
    category: 'Sarees',
    subcategory: 'Traditional',
    price: 12999,
    originalPrice: 17999,
    description:
      'Classic yellow silk saree with temple border and rich woven motifs.',
    images: [
      'https://images.pexels.com/photos/9419006/pexels-photo-9419006.jpeg',
      'https://images.pexels.com/photos/15181108/pexels-photo-15181108.jpeg',
      'https://images.pexels.com/photos/1684724/pexels-photo-1684724.jpeg',
      'https://images.pexels.com/photos/13192040/pexels-photo-13192040.jpeg',
    ],
    sizes: ['Onesize'],
    colors: ['Mustard Yellow'],
    rating: 4.8,
    reviewsCount: 54,
    stock: { Onesize: 6 },
    sku: 'GS-W-SR-103',
    fabric: 'Kanchipuram Silk',
    materialAndCare: ['Dry Clean Only'],
    specifications: ['Temple Border', 'Gold Zari Pallu'],
  },
  {
    id: 'saree-pexels-4',
    name: 'Elegant Ivory Party Saree',
    brand: 'GS Modern',
    category: 'Sarees',
    subcategory: 'Party Wear',
    price: 5999,
    originalPrice: 8499,
    description:
      'Graceful ivory saree perfect for evening events and celebrations.',
    images: [
      'https://images.pexels.com/photos/29049398/pexels-photo-29049398.jpeg',
      'https://images.pexels.com/photos/11822276/pexels-photo-11822276.jpeg',
      'https://images.pexels.com/photos/9418783/pexels-photo-9418783.jpeg',
      'https://images.pexels.com/photos/1684724/pexels-photo-1684724.jpeg',
    ],
    sizes: ['Onesize'],
    colors: ['Ivory'],
    rating: 4.6,
    reviewsCount: 39,
    stock: { Onesize: 10 },
    sku: 'GS-W-SR-104',
    fabric: 'Organza',
    materialAndCare: ['Dry Clean Only'],
    specifications: ['Floral Detailing', 'Lightweight Fabric'],
  },
  {
    id: 'saree-pexels-5',
    name: 'Maroon Wedding Banarasi Saree',
    brand: 'GS Heritage',
    category: 'Sarees',
    subcategory: 'Wedding',
    price: 21999,
    originalPrice: 28999,
    description:
      'Premium Banarasi saree with heavy gold zari ideal for weddings.',
    images: [
      'https://images.pexels.com/photos/20319222/pexels-photo-20319222.jpeg',
      'https://images.pexels.com/photos/15181108/pexels-photo-15181108.jpeg',
      'https://images.pexels.com/photos/9419006/pexels-photo-9419006.jpeg',
      'https://images.pexels.com/photos/13192040/pexels-photo-13192040.jpeg',
    ],
    sizes: ['Onesize'],
    colors: ['Maroon'],
    rating: 5.0,
    reviewsCount: 23,
    stock: { Onesize: 3 },
    isBestSeller: true,
    sku: 'GS-W-SR-105',
    fabric: 'Banarasi Silk',
    materialAndCare: ['Dry Clean Only'],
    specifications: ['Heavy Bridal Work', 'Rich Pallu Design'],
  }
];
