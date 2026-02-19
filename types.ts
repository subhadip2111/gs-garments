
export interface Product {
  id: string;
  name: string;
  category: 'Men' | 'Women' | 'Kids' | 'Accessories';
  subcategory: string;
  price: number;
  originalPrice?: number;
  description: string;
  images: string[];
  sizes: string[];
  colors: string[];
  rating: number;
  reviewsCount: number;
  stock: { [size: string]: number };
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isTrending?: boolean;
  sku?: string;
  brand?: string;
  fabric?: string;
  sizeAndFit?: string[];
  materialAndCare?: string[];
  specifications?: string[];
  richSpecifications?: { label: string; value: string }[];
  priceDetails?: { mrp: number; discount: number; sellingPrice: number };
  bestOffers?: { title: string; description: string }[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
  helpfulCount?: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  priceAtPurchase?: number; // Capture price at time of order
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  addresses: Address[];
  orders: Order[];
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  mobile: string;
  village?: string;
  street: string;
  city: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase: number;
  description: string;
}

export interface ComboOffer {
  id: string;
  threshold: number;
  discount: number;
  label: string;
  description: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'Processing' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  type: 'cart' | 'buy-now';
  trackingSteps: {
    status: string;
    description: string;
    date: string;
    isCompleted: boolean;
  }[];
  deliveryDate: string;
  appliedCoupon?: string;
  discountAmount?: number;
}

export type AuthMode = 'login' | 'signup' | 'forgot-password';

export interface BannerConfig {
  type: 'banner';
  imageUrl: string;
  title: string;
  subtitle: string;
  description?: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  badge?: string;
}

export interface SpotlightConfig {
  type: 'spotlight';
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  promoId: string;
  brandName?: string;
}

export interface GridConfig {
  type: 'grid';
  title: string;
  subtitle: string;
  filter: 'trending' | 'new' | 'best-seller' | 'category';
  category?: string;
  viewAllLink: string;
}

export interface BrandsConfig {
  type: 'brands';
  title: string;
  subtitle: string;
  brands: {
    name: string;
    imageUrl: string;
    description: string;
    link: string;
    tagline: string;
  }[];
}

export type HomeSection = BannerConfig | SpotlightConfig | GridConfig | BrandsConfig;

export interface HomeConfig {
  sections: HomeSection[];
}
