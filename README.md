# ✨ ELARIX — Full-Stack E-Commerce Store

### A Modern Beauty & Skincare Shopping Experience

**🌐 Live Website:** https://elarix-ecommerce.onrender.com

**💻 GitHub Repository:** https://github.com/jeevitharamesh1223-coder/elarix-ecommerce

---

## 📖 About the Project

**ELARIX** is a full-stack e-commerce web application designed to provide a seamless, secure, and user-friendly online shopping experience for beauty, makeup, and skincare products.

The application combines an elegant, responsive frontend with a robust backend REST API and a persistent relational database.

ELARIX provides secure user authentication, product browsing, category filtering, shopping cart management, wishlist functionality, Cash on Delivery checkout, order history, and a role-protected administrator dashboard.

Built using **React.js, Node.js, Express.js, Sequelize, and PostgreSQL**, ELARIX demonstrates modern full-stack development, database integration, security practices, and cloud deployment.

The application is publicly deployed on **Render**, using **Supabase PostgreSQL** for production data and **Supabase Storage** for product image uploads.

> **Live Demo:** https://elarix-ecommerce.onrender.com
>
> The application uses Render's free hosting tier, so the first request may take a little longer after inactivity.

---

## 🎯 Project Objective

The objective of ELARIX is to develop a complete e-commerce application that enables customers to browse and purchase beauty products while providing administrators with tools to manage products, inventory, customers, and orders.

The project demonstrates:

- Full-stack web application development
- Responsive frontend design
- REST API development and integration
- JWT-based user authentication
- Role-based authorization
- Database design and management
- Shopping cart and checkout workflows
- Inventory and order management
- Automated testing and security verification
- Git and GitHub version control
- Cloud deployment using Render and Supabase

---

## 🚀 Key Features

### 👤 Customer Features

- User registration and secure login
- JWT-based authentication
- Customer profile management
- Product listings with detailed product information
- Makeup and skincare category browsing
- Product search functionality
- Category and subcategory filtering
- Product sorting by price and rating
- Shopping cart with quantity management
- Wishlist with persistent browser storage
- Responsive shopping experience
- Shipping address validation
- Cash on Delivery checkout
- Order confirmation
- Order history through My Orders
- Order and payment status tracking

### 🛡️ Administrator Features

- Secure administrator login
- Role-based access control
- Protected admin dashboard
- Business overview and statistics
- Product creation, editing, and deletion
- Inventory and stock management
- Customer order management
- Order status updates
- Payment and delivery status management
- Revenue, order, product, and customer metrics

### 🔐 Security Features

- JWT authentication and protected API routes
- Password hashing using bcrypt
- Customer and administrator role separation
- Restricted administrative endpoints
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
| ORM | Sequelize |
| Production Database | PostgreSQL (Supabase) |
| Local Database | SQLite |
| Authentication | JWT, bcrypt |
| API Architecture | REST API |
| Image Storage | Supabase Storage |
| Version Control | Git, GitHub |
| PWA Support | Service Worker, Web App Manifest |
| Cloud Hosting | Render |
| Database Hosting | Supabase |

---

## 🏗️ System Architecture

ELARIX follows a client-server architecture.

**React Frontend → Express REST API → Sequelize → PostgreSQL Database**

### Architecture Components

**1. Frontend — React.js**

The React frontend provides the customer shopping interface and administrator dashboard.

It manages product browsing, shopping cart interactions, wishlist functionality, checkout forms, and account pages.

**2. Backend — Node.js and Express.js**

The Express backend handles API requests, authentication, authorization, product operations, checkout validation, and order management.

**3. Database — PostgreSQL and SQLite**

Supabase PostgreSQL serves as the production database for customer accounts, products, inventory, and orders.

SQLite is supported for local development.

**4. Authentication — JWT**

JWT protects authenticated customer and administrator operations.

Role-based authorization prevents regular customers from accessing administrative functionality.

**5. File Storage — Supabase Storage**

Supabase Storage supports product image uploads.

**6. Production Hosting — Render**

Render hosts the Node.js application. In unified production mode, Express serves the compiled React frontend alongside the backend REST API.

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

The backend contains the application routes, database configuration, business logic, and database initialization scripts.

---

## ⚙️ Installation and Setup

### Prerequisites

Ensure the following tools are installed:

- Node.js and npm
- Git
- Visual Studio Code or another code editor

### Step 1: Clone the Repository

```bash
git clone https://github.com/jeevitharamesh1223-coder/elarix-ecommerce.git
cd elarix-ecommerce
```

### Step 2: Install Dependencies and Build

From the project root, run:

```bash
npm run build
```

The unified build script installs the required dependencies and generates the production frontend bundle.

### Step 3: Configure Environment Variables

Configure the backend environment using the project's environment example or hosting dashboard.

For production, the following variables are used:

```dotenv
NODE_ENV=production
PORT=5000

DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/postgres

JWT_SECRET=replace_with_a_secure_random_secret

SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=replace_with_private_service_role_key
SUPABASE_STORAGE_BUCKET=elarix-uploads

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_with_a_secure_admin_password
```

For local SQLite development, the application also supports settings such as:

```dotenv
SQLITE_STORAGE_PATH=./backend/elarix.sqlite
UPLOADS_DIR=./backend/uploads
BACKUP_DIR=./backend/backups
```

**Important:** Never commit real database passwords, JWT secrets, Supabase service role keys, administrator credentials, SQLite databases, or backup files to GitHub.

### Step 4: Start the Application

```bash
npm start
```

The application should be accessible locally at:

http://localhost:5000

Backend health check:

http://localhost:5000/api/health

### Step 5: Frontend Development Mode

For frontend development:

```bash
cd frontend
npm run dev
```

The Vite development server normally runs at:

http://localhost:5173

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

ELARIX supports a complete Cash on Delivery shopping workflow.

1. Customer registers or logs into ELARIX.
2. Customer browses makeup and skincare products.
3. Customer selects products and adds them to the shopping cart.
4. Customer updates product quantities.
5. Customer reviews the cart and proceeds to checkout.
6. Customer enters shipping information.
7. Backend validates product prices, quantities, stock availability, and shipping details.
8. Customer places a Cash on Delivery order.
9. Order details are stored in the database.
10. Product inventory is updated.
11. Customer views the order through My Orders.
12. Administrator manages order fulfillment and delivery status.

---

## 🛡️ Admin Dashboard

ELARIX includes a role-protected administrator dashboard.

### Dashboard Overview

The dashboard provides business metrics such as:

- Total revenue
- Total orders
- Total products
- Total customers

### Product Management

Administrators can:

- Add new products
- Edit existing products
- Update product prices
- Manage inventory
- Delete products

### Order Management

Administrators can:

- View customer orders
- Update order status
- Manage payment status
- Track delivery progress

Administrative operations are restricted through backend authorization checks.

---

## 🧪 Testing and Verification

ELARIX has undergone automated backend, end-to-end API, and security verification in the local test environment.

| Test Suite | Passed | Failed |
|---|---:|---:|
| Full-stack end-to-end and security suite | 50 | 0 |
| Local production verification suite | 38 | 0 |
| **Total** | **88** | **0** |

### Verified Test Scenarios

- Customer registration and login
- JWT authentication
- Customer profile updates
- Product catalog and category filtering
- Shopping cart and wishlist logic
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

**Testing Result: 88 automated checks passed with zero reported failures in the local environment.**

These results represent local automated verification. They do not constitute a complete production security audit or full live end-to-end test.

---

## ☁️ Production Deployment

### Deployment Status: Successfully Deployed

**Live Website:** https://elarix-ecommerce.onrender.com

ELARIX is deployed on Render and connected to Supabase PostgreSQL.

### Production Infrastructure

| Component | Service |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Application Hosting | Render |
| Database | Supabase PostgreSQL |
| Image Storage | Supabase Storage |
| Source Code Hosting | GitHub |
| HTTPS | Render-managed HTTPS |

### Deployment Process

1. Push the project source code to GitHub.
2. Connect the GitHub repository to Render.
3. Create a Render Web Service.
4. Configure the production build command.
5. Configure the application start command.
6. Set secure production environment variables.
7. Connect the application to Supabase PostgreSQL.
8. Configure Supabase Storage.
9. Initialize the production database and product catalog.
10. Deploy and verify the public website.

### Production Build Command

```bash
npm run build
```

### Production Start Command

```bash
npm start
```

### Live Application

https://elarix-ecommerce.onrender.com

The application has been successfully deployed and the public homepage has been verified to load.

Final production testing of customer checkout and administrator workflows is recommended before full release sign-off.

**Note:** Render's free hosting tier may cause a short startup delay after inactivity.

---

## 📱 Responsive Design

ELARIX is designed to provide a consistent shopping experience across desktop, tablet, and mobile devices.

Responsive components include:

- Navigation bar
- Product listing grids
- Category pages
- Product detail pages
- Shopping cart
- Checkout forms
- Customer account pages
- Administrator dashboard

---



## 🔮 Future Enhancements

Potential future improvements include:

- Online payment gateway integration
- Product ratings and customer reviews
- Email notifications for order confirmation
- Discount coupons and promotional offers
- Advanced product recommendations
- Enhanced sales analytics and downloadable reports
- Shipment tracking integration
- Additional product categories
- Improved product image management

---

## 🎓 Academic Project

**Project Title:** ELARIX — Full-Stack E-Commerce Store

**Project Category:** Full-Stack Web Development

**Application Domain:** Beauty, Makeup & Skincare E-Commerce

**Purpose:** Academic project demonstrating secure authentication, database-driven product management, shopping cart functionality, checkout processing, order management, administrative controls, automated testing, and production deployment.

### Assignment Requirements

| Requirement | Implementation |
|---|---|
| Build a full-fledged e-commerce application | ELARIX full-stack shopping platform |
| Implement JWT authentication and authorization | JWT authentication and role-based access control |
| Create product listings, shopping cart, and checkout | Product catalog, cart, wishlist, and COD checkout |
| Develop an admin dashboard for managing products and orders | Protected admin dashboard with product and order management |
| Deploy the application for production use | Render hosting with Supabase PostgreSQL |

All five required components have been implemented. Final live workflow verification is recommended.

---

## 📌 Project Links

**🌐 Live Demo:** https://elarix-ecommerce.onrender.com

**💻 GitHub Repository:** https://github.com/jeevitharamesh1223-coder/elarix-ecommerce

---

## 📄 Conclusion

ELARIX demonstrates the development of a modern full-stack e-commerce application with secure JWT authentication, product management, shopping cart and wishlist functionality, Cash on Delivery checkout, order history, and administrator controls.

The project integrates frontend engineering, backend REST API development, database operations, inventory management, security verification, and cloud deployment into a complete e-commerce solution.

ELARIX has been successfully deployed using **Render and Supabase PostgreSQL**, making the application accessible through a public HTTPS website.

The project showcases practical full-stack web development skills and fulfills the core implementation requirements of an academic e-commerce application.
