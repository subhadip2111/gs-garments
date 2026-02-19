# GS Garments API Endpoints (Node.js & Express)

This document specifies the RESTful API endpoints for the GS Garments backend.

## 1. Authentication (`/api/auth`)
Uses JWT (JSON Web Tokens) for session management.

- **POST `/register`**: Create a new account.
    - **Body**: `{ email, password, fullName, mobile }`
- **POST `/login`**: Authenticate and receive a JWT.
    - **Body**: `{ email, password }`
    - **Response**: `{ token, user: { id, email, fullName, role } }`
- **GET `/profile`**: Get current user data.
    - **Header**: `Authorization: Bearer <TOKEN>`
- **PUT `/address`**: Add or update a shipping address.
    - **Header**: `Authorization: Bearer <TOKEN>`
    - **Body**: `{ label, fullName, mobile, street, city, pincode, isDefault }`

---

## 2. Catalog (`/api/products`)
Public access for browsing.

- **GET `/`**: Fetch all products with query parameters.
    - **Query**: `?category=Men&subcategory=Jeans&sort=price_asc&limit=20`
- **GET `/:id`**: Fetch details for a specific product including reviews.
- **GET `/trending`**: Fetch products flagged as `isTrending`.
- **GET `/new-arrivals`**: Fetch products flagged as `isNewArrival`.

---

## 3. Orders (`/api/orders`)
Protected routes requiring login.

- **POST `/`**: Place a new order.
    - **Header**: `Authorization: Bearer <TOKEN>`
    - **Body**: 
        ```json
        {
          "items": [{ "productId": "...", "quantity": 1, "size": "M" }],
          "shippingAddress": { ... },
          "paymentMethod": "COD",
          "couponCode": "FASHION10"
        }
        ```
- **GET `/me`**: Fetch all orders placed by the authenticated user.
- **GET `/:id`**: Fetch specific order details (must be owner or admin).
- **PATCH `/:id/cancel`**: Cancel an order (if status is 'Processing').

---

## 4. Administration (`/api/admin`)
Requires `role: 'admin'`.

- **POST `/products`**: Add a new product to the catalog.
- **PATCH `/orders/:id/status`**: Update order status (e.g., 'Shipped').
- **GET `/stats`**: Get overview of sales and inventory.

---

## 5. Middleware Requirements
1. **`authMiddleware`**: Verifies JWT from the `Authorization` header.
2. **`adminMiddleware`**: Ensures the authenticated user has administrative privileges.
3. **`validateRequest`**: Schema-based validation (using Joi or Zod) for incoming request bodies.
