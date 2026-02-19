# GS Garments Data Schema (MongoDB & Node.js)

This document outlines the Mongoose schemas for the GS Garments backend.

## 1. Product Schema
```javascript
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, enum: ['Men', 'Women', 'Kids', 'Accessories'], required: true },
  subcategory: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  description: { type: String, required: true },
  images: [{ type: String }],
  sizes: [{ type: String }],
  colors: [{ type: String }],
  fabric: { type: String },
  specifications: [{ type: String }],
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  stock: { type: Map, of: Number }, // e.g., { "M": 10, "L": 5 }
  isTrending: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
```

---

## 2. User Schema
```javascript
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed
  fullName: { type: String, required: true },
  mobile: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  addresses: [{
    label: String,
    fullName: String,
    mobile: String,
    street: String,
    village: String,
    city: String,
    pincode: String,
    country: { type: String, default: 'India' },
    isDefault: { type: Boolean, default: false }
  }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
```

---

## 3. Order Schema
```javascript
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true }, // e.g., ORD-ABC123
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true },
    selectedSize: String,
    selectedColor: String,
    priceAtPurchase: Number
  }],
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    fullName: String,
    mobile: String,
    street: String,
    village: String,
    city: String,
    pincode: String,
    country: String
  },
  status: { 
    type: String, 
    enum: ['Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Processing'
  },
  paymentMethod: { type: String, default: 'COD' },
  appliedCoupon: String,
  discountAmount: { type: Number, default: 0 },
  deliveryDate: String,
  trackingSteps: [{
    status: String,
    description: String,
    date: { type: Date, default: Date.now },
    isCompleted: { type: Boolean, default: false }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
```
