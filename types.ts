
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
  fabric?: string;
  specifications?: string[];
}

export interface Message {
  role: 'ai' | 'user';
  text: string;
  attachedProduct?: Product;
  type?: 'text' | 'styling-tip' | 'weather-alert';
}

export interface StyleProfile {
  aesthetic: string;
  preferredColors: string[];
  sizePreference: 'Slim' | 'Regular' | 'Oversized';
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
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  addresses: Address[];
  orders: Order[];
  styleProfile?: StyleProfile;
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
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

export interface AISectionConfig {
  type: 'ai-concierge';
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
}

export type HomeSection = BannerConfig | SpotlightConfig | GridConfig | BrandsConfig | AISectionConfig;

export interface HomeConfig {
  sections: HomeSection[];
}
