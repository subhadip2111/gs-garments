
export interface VariantSize {
  size: string;
  quantity: number;
  price: number;
  originalPrice?: number;
}

export interface ProductVariant {
  color: { name: string; hex: string; images: string[] };
  sizes: VariantSize[];
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  sku?: string;
  brand?: string | { id: string; name: string; _id?: string };
  category: string | { id: string; name: string; _id?: string };
  subcategory: string | { id: string; name: string; category?: string; _id?: string };
  price?: number;
  originalPrice?: number;
  description: string;
  images: string[];
  variants: ProductVariant[];
  fabric?: string;
  specifications?: string[];
  rating: number;
  reviewsCount: number;
  isTrending?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  materialAndCare?: string[];
  sizeAndFit?: string[];
  createdAt?: string;
  updatedAt?: string;
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
  id?: string;
  _id?: string;
  productId: string;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  priceAtPurchase?: number; // Capture price at time of order
  product?: Product; // Populated product data from backend
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
  altMobile?: string;
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
  _id?: string;
  orderId?: string;
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
  shippingAddress?: {
    fullName: string;
    mobile: string;
    altMobile?: string;
    street: string;
    village?: string;
    city: string;
    pincode: string;
    country: string;
  };
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
