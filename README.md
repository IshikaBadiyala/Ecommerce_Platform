# BUYNEST — Full-Stack E-Commerce Platform

A full-stack e-commerce web application built using the MERN stack (MongoDB, Express.js, React, Node.js). BUYNEST allows users to browse catalog products, filter by categories, manage a shopping cart and wishlist, place orders, and manage their accounts.

---

## Features

- **Product Catalog:** Browse products across Clothing, Accessories, Electronics, and Home Decor with category filters, dynamic pricing, and stock status.
- **Search & Filter:** Live keyword search and responsive category navigation.
- **Cart & Wishlist:** Real-time cart calculations, quantity updates, and wishlist toggling.
- **Authentication:** User registration, credentials login with bcrypt password hashing, and secure JWT-based session management.
- **Checkout & Orders:** Order placement flow with complete order details and delivery status tracking.
- **Responsive Design:** Mobile-friendly UI styled with Tailwind CSS.

---

## Tech Stack

### Frontend
- **React.js (v18)** with **Vite**
- **React Router DOM (v6)** for navigation
- **Tailwind CSS** for UI styling
- **Lucide React** for icons
- **Axios** for API requests

### Backend
- **Node.js** & **Express.js** REST API
- **MongoDB Atlas** with **Mongoose** ODM
- **JWT (JSON Web Tokens)** & **bcryptjs** for authentication & password security
- **Razorpay** SDK integration for payments

---

## Project Structure

```
Ecommerce_Platform/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # UI components (Navbar, ProductCard, SearchBar, etc.)
│   │   ├── context/        # Cart, Wishlist, and Auth Context providers
│   │   ├── pages/          # Application views (Home, Cart, Checkout, Auth, Orders)
│   │   └── services/       # Axios API client
│   └── package.json
├── server/                 # Backend Node/Express API
│   ├── config/             # Database and payment configurations
│   ├── controllers/        # Route controllers (auth, product, cart, order)
│   ├── models/             # Mongoose schemas (User, Product, Order, Cart)
│   ├── routes/             # Express API endpoints
│   └── server.js           # Server entry point
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas database connection URI

### 1. Backend Setup
```bash
cd server
npm install
npm run dev
```
The server will start on `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
The frontend will start on `http://localhost:5173`.

---

## Team & Contributors

- **Amit Thakur** (`amit0918`) – Frontend: Navbar & navigation
- **Aiuesh Kumar** (`aiueshkumar510`) – Frontend: Product cards & catalog UI
- **Gurnoor** (`GurnoorKamboj`) – Backend: Login authentication
- **Ishika Badiyala** (`IshikaBadiyala`) – Backend: Database schema & models
