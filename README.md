# ✨ ELARIX — Full-Stack E-Commerce Store

### A Modern Beauty & Skincare Shopping Experience

ELARIX is a full-stack e-commerce web application designed to provide a seamless, secure, and user-friendly online shopping experience for beauty, makeup, and skincare products.

The application includes secure JWT authentication, product browsing, category filtering, shopping cart management, wishlist functionality, Cash on Delivery checkout, order tracking, and a role-protected admin dashboard.

Built with **React.js, Node.js, Express.js, and SQLite**, ELARIX combines an elegant, responsive frontend with a reliable REST API and persistent database.

---

## 🎯 Project Objective

The objective of ELARIX is to develop a complete e-commerce application that allows customers to browse and purchase products while providing administrators with the tools to manage products, inventory, customers, and orders.

The project demonstrates full-stack web development, REST API integration, database management, JWT-based authentication, role-based authorization, and production deployment preparation.

## 🚀 Key Features

### 👤 Customer Features

- User registration and secure login
- JWT-based authentication
- Profile management
- Product listings and detailed product information
- Makeup and skincare category browsing
- Product search, filtering, and price sorting
- Shopping cart with quantity management
- Wishlist with persistent browser storage
- Responsive shopping experience
- Shipping address validation
- Cash on Delivery checkout
- Order confirmation
- Order history through My Orders
- Order and payment status tracking

### 🛡️ Admin Features

- Secure administrator login
- Role-based access control
- Admin dashboard with business metrics
- Product creation, editing, and deletion
- Inventory and stock management
- Customer order management
- Order status updates
- Payment and delivery status management
- Revenue, order, product, and customer statistics

### 🔐 Security Features

- JWT authentication and protected API routes
- Password hashing using bcrypt
- Customer and administrator role separation
- Restricted access to administrative endpoints
- Customer order ownership verification
- Server-side input validation
- Server-authoritative checkout pricing
- Stock validation and overselling prevention
- Duplicate checkout submission protection
- Environment-based secret management
- Structured API error handling

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Vite |
| Styling | CSS, Responsive Web Design |
| Backend | Node.js, Express.js |
| Database | SQLite |
| Authentication | JWT, bcrypt |
| API Architecture | REST API |
| Version Control | Git, GitHub |
| PWA Support | Service Worker, Web App Manifest |
| Deployment | Node.js hosting with persistent storage |

---

## 🏗️ System Architecture

The application follows a client-server architecture:

**React Frontend → Express REST API → SQLite Database**

1. The React frontend provides the shopping interface.
2. Express handles API requests, authentication, authorization, and business logic.
3. SQLite stores product information, customer accounts, and orders.
4. JWT protects authenticated customer and administrator operations.
5. The backend validates checkout totals and updates product inventory.
6. In unified production mode, Express serves the compiled React application alongside the REST API.

---

## 📂 Project Structure

The main project directories include:

```text
elarix-ecommerce/
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── config/
│   ├── routes/
│   ├── scripts/
│   ├── index.js
│   └── package.json
│
├── package.json
├── .gitignore
└── README.md
```

---

## ⚙️ Installation and Setup

### Prerequisites

- Node.js and npm
- Git
- A code editor such as Visual Studio Code

### 1. Clone the Repository

```bash
git clone https://github.com/jeevitharamesh1223-coder/elarix-ecommerce.git
cd elarix-ecommerce
```

### 2. Install Dependencies and Build

From the project root:

```bash
npm run build
```

The unified build script installs the required dependencies and generates the production frontend bundle.

### 3. Configure Environment Variables

Configure the backend environment using the project's environment example or hosting dashboard.

Example:

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=replace_with_a_new_secure_random_secret
SQLITE_STORAGE_PATH=./backend/elarix.sqlite
UPLOADS_DIR=./backend/uploads
BACKUP_DIR=./backend/backups
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_with_a_new_secure_password
```

**Security note:** Never commit real credentials, production secrets, SQLite databases, or backup files to GitHub.

### 4. Start the Application

```bash
npm start
```

The application should be available locally at:

```text
http://localhost:5000
```

Backend health check:

```text
http://localhost:5000/api/health
```

### 5. Frontend Development Mode

For frontend development:

```bash
cd frontend
npm run dev
```

The Vite development server normally runs at:

```text
http://localhost:5173
```

The backend must also be running for API-dependent functionality.

---

## 🔗 REST API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend and database status |
| GET | `/api/products` | Retrieve product catalog |
| GET | `/api/products/:id` | Retrieve product details |
| POST | `/api/orders` | Create customer order |
| GET | `/api/orders/:id` | Retrieve an authorized order |
| GET | `/api/orders/myorders` | Retrieve customer order history |
| GET | `/api/admin/metrics` | Retrieve admin dashboard statistics |

Additional authentication, profile, product management, and order fulfillment endpoints are implemented in the backend route modules.

---

## 🛒 Shopping and Checkout Workflow

1. Customer registers or logs into ELARIX.
2. Customer browses makeup and skincare products.
3. Products are added to the shopping cart.
4. Customer updates quantities and reviews the cart.
5. Customer enters shipping information at checkout.
6. Backend validates product prices, quantities, stock, and shipping details.
7. Customer places a Cash on Delivery order.
8. Order details are stored in the database.
9. Product stock is updated.
10. Customer views the order through My Orders.
11. Administrator manages fulfillment and delivery status.

---

## 🧪 Testing and Verification

ELARIX has undergone automated backend, end-to-end API, and security verification.

| Test Suite | Passed | Failed |
|---|---:|---:|
| Full-stack end-to-end and security suite | 50 | 0 |
| Local production verification suite | 38 | 0 |
| **Total** | **88** | **0** |

### Verified Test Scenarios

- Customer registration and login
- JWT authentication
- Profile updates
- Product catalog and filtering
- Cart and wishlist logic
- Shipping address validation
- Cash on Delivery order creation
- Server-side pricing validation
- Stock decrement and overselling protection
- Order confirmation and history
- Admin authentication and authorization
- Product management
- Order fulfillment
- Customer order access restrictions
- Forged and missing JWT rejection
- Duplicate checkout request prevention
- Production asset serving and SPA routing

**Result: 88 automated checks passed with zero reported failures in the local test environment.**

Public cloud deployment and public-domain verification are separate from these local test results.

---

## ☁️ Deployment

ELARIX supports unified production hosting, where Express serves both the React frontend and backend API.

For production hosting:

- Build the application using `npm run build`.
- Start the server using `npm start`.
- Configure production environment variables.
- Provide persistent storage for SQLite and uploaded images.
- Enable HTTPS and secure authentication settings.
- Configure database backups.
- Verify customer and admin workflows using the deployed HTTPS domain.

**Deployment status:** Local production verification completed. Public cloud deployment pending.

---

## 📱 Responsive Design

ELARIX is designed for desktop, tablet, and mobile shopping experiences, with responsive product grids, navigation, product details, shopping cart, and account pages.

---

## 🔮 Future Enhancements

- Online payment gateway integration
- Product ratings and customer reviews
- Email notifications for orders
- Discount coupons and promotional offers
- Advanced product recommendations
- Sales analytics and downloadable reports
- Shipment tracking integration

---

## 🎓 Academic Project

**Project Title:** ELARIX — Full-Stack E-Commerce Store

**Project Category:** Full-Stack Web Development

**Application Domain:** Beauty, Makeup & Skincare E-Commerce

**Purpose:** Academic project demonstrating secure authentication, database-driven product management, shopping cart functionality, checkout, order management, administrative controls, and deployment.

---

## 📌 Repository

**GitHub:** https://github.com/jeevitharamesh1223-coder/elarix-ecommerce

---

## 📄 Conclusion

ELARIX demonstrates the development of a modern full-stack e-commerce application with secure authentication, product management, shopping cart functionality, checkout processing, order history, and administrator controls.

The project integrates frontend development, backend API engineering, database operations, security testing, and production deployment preparation into a complete e-commerce solution.
