# NØVA — Modern Luxury Fashion E-Commerce Platform

[![.NET 10](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![SQL Server 2022](https://img.shields.io/badge/SQL_Server-2022-CC292B?logo=microsoft-sql-server&logoColor=white)](https://www.microsoft.com/sql-server)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

> **"Everyday, Elevated."** — A production-ready, full-stack fashion e-commerce ecosystem inspired by Scandinavian minimalist luxury aesthetics. Built with ASP.NET Core 10 Clean Architecture and Next.js 16 App Router.

---

## 📑 Table of Contents
1. [Overview & Brand Identity](#-overview--brand-identity)
2. [Technology Stack](#-technology-stack)
3. [Architecture & System Design](#-architecture--system-design)
4. [Comprehensive Feature Guide](#-comprehensive-feature-guide)
   - [Storefront & Customer Experience](#1-storefront--customer-experience)
   - [Admin Management Portal](#2-admin-management-portal-brand-owner-suite)
   - [Backend Core & Domain Logic](#3-backend-core--domain-logic)
5. [Project Structure](#-project-structure)
6. [Local Development Setup](#-local-development-setup)
7. [Default Admin Credentials](#-default-admin-credentials)
8. [Docker & Production Deployment](#-docker--production-deployment)
9. [API Endpoints Reference](#-api-endpoints-reference)

---

## 💎 Overview & Brand Identity

**NØVA** is an enterprise-grade full-stack fashion e-commerce platform designed to offer high-end apparel brands an intuitive, fully autonomous store management experience. The storefront merges ultra-fast server-rendered modern web experiences with high-contrast typography, smooth micro-interactions, responsive layouts, and an owner-friendly administrative dashboard that eliminates reliance on developers for day-to-day operations.

---

## 🛠 Technology Stack

### Frontend Application
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Partial Prerendering / Dynamic Server Components)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom `@theme` tokens, glassmorphism backdrop blur, and dark mode support
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) for reactive, client-side cart and authentication states
- **Iconography**: [Lucide React](https://lucide.dev/)
- **Networking**: [Axios](https://axios-http.com/) with centralized base URL configuration and interceptors

### Backend Web API
- **Framework**: [ASP.NET Core 10](https://dotnet.microsoft.com/apps/aspnet) Web API (C# 13, Nullable Reference Types enabled)
- **Architecture**: **Clean Architecture** (Separation of Concerns: Domain, Application, Infrastructure, and API layers)
- **ORM**: [Entity Framework Core 10](https://learn.microsoft.com/ef/core/) with SQL Server provider
- **Data Validation**: [FluentValidation](https://fluentvalidation.net/)
- **Security & Identity**: ASP.NET Core Identity with role-based authorization (`Admin`, `Customer`), password hashing, and cookie/bearer security
- **Serialization**: `System.Text.Json` with cycle-breaking reference handling (`ReferenceHandler.IgnoreCycles`)
- **Static Assets Storage**: Persistent local disk storage with ASP.NET static file serving (`wwwroot/uploads`)

### Database & Infrastructure
- **Database Engine**: Microsoft SQL Server 2022 / SQL Server LocalDB (`(localdb)\mssqllocaldb`)
- **Containerization**: Docker multi-stage builds & Docker Compose orchestration
- **Data Protection**: Windows DPAPI / ASP.NET DataProtection key repository

---

## 🏛 Architecture & System Design

The backend is built following **Clean Architecture** principles to guarantee loose coupling, testability, and domain independence:

```
                  ┌────────────────────────────────────────┐
                  │       Presentation Layer (Next.js)     │
                  └───────────────────▲────────────────────┘
                                      │ HTTP / REST
                  ┌───────────────────▼────────────────────┐
                  │         Vini.Api (ASP.NET Core)        │
                  └───────────────────▲────────────────────┘
                                      │
            ┌─────────────────────────┴─────────────────────────┐
            │                                                   │
┌───────────▼───────────┐                           ┌───────────▼───────────┐
│   Vini.Application    │                           │  Vini.Infrastructure  │
│ - DTOs & Interfaces   │                           │ - EF Core DbContext   │
│ - Business Rules      │                           │ - Identity Provider   │
│ - Validators          │                           │ - Image File Storage  │
└───────────▲───────────┘                           └───────────▲───────────┘
            │                                                   │
            └─────────────────────────┬─────────────────────────┘
                                      │
                         ┌────────────▼────────────┐
                         │       Vini.Domain       │
                         │ - Core Entities         │
                         │ - Enums & Statuses      │
                         │ - Domain Exceptions     │
                         └─────────────────────────┘
```

---

## 🚀 Comprehensive Feature Guide

### 1. Storefront & Customer Experience

#### 🌟 Brand Header & Navigation
- **Centered Luxury Logo**: Minimalist typography logo for **NØVA** with letter-spaced Scandinavian styling (`tracking-[0.28em]`).
- **Left Navigation Links**: Instant links to Home, Winter Collection, Summer Collection, and a highlighted red **SALE** section.
- **Right Action Bar**: Direct login/admin portal link and shopping cart launcher.
- **Dynamic Reactive Cart Counter**: Red numeric badge on the shopping bag icon displaying current cart item count.
- **Mobile Drawer Menu**: Responsive collapsible slide-out drawer navigation for handheld devices.
- **Announcement Bar**: Customizable top header banner (e.g., "FREE SHIPPING ON ORDERS OVER 500 EGP") controlled directly via store settings.

#### 🎠 Hero Carousel Banner
- **Full-Width Immersion**: Responsive viewport hero banner supporting high-resolution campaign photography.
- **Glassmorphism Text Card**: Right-aligned translucent luxury card featuring custom season titles, subtitles, and call-to-action buttons.
- **Slide Controls**: Dual left/right circular glass buttons, animated indicator dots, and automatic 6-second auto-play that pauses on cursor hover.

#### 🖼 Curated Collections (Featured Lines)
- **3 Large Portrait Cards**: Aspect ratio 3:4 (height greater than width) dedicated to:
  1. *Winter Collection*
  2. *Summer Collection*
  3. *Offers & Sale*
- **Interactive Micro-Interactions**: Smooth scale zoom on hover (`scale-105`), dark gradient overlays for maximum legibility, and integrated "Shop Now" buttons with sliding arrows.

#### 🔍 Product Catalog & Discovery
- **Product Listing (`/products`)**: Filter by category, sale status, availability, and search by keywords.
- **Product Cards**: Displays product photo, badge ("New", "Sale"), product title, category, discounted price, and original strike-through price.

#### 🔎 Interactive Product Detail Page (PDP)
- **Multi-Image Gallery**: Displays high-resolution primary photo with selectable thumbnail carousel.
- **Cursor-Tracking Image Magnifier**: Hovering over the main product image activates a smooth **2.5x zoom lens** that calculates exact mouse percentage coordinates (`clientX`, `clientY`) for precision inspection of fabrics and details.
- **Variant Configurator**:
  - Interactive color selection circles with active border indicator.
  - Size buttons (e.g., S, M, L, XL, XXL) with dynamic availability checks.
  - Real-time SKU and price override resolution.
- **Inventory Safety**: Disables the "Add to Cart" button and displays "Out of Stock" if stock reaches zero.

#### 🛍 Reactive Shopping Cart
- **Persistent Cart State**: Powered by Zustand store and synced with backend session/user carts.
- **Quantity Adjustments**: Increment, decrement, and delete items with immediate subtotal recalculation.

#### 💳 Checkout & Egyptian Shipping Zones
- **Governorate-Based Shipping Calculator**: Select from Egyptian governorates (Cairo, Giza, Alexandria, Sharm El-Sheikh, Hurghada, Aswan, etc.) with automatic calculation of shipping rates and delivery estimates.
- **Free Shipping Threshold**: Automatically applies free shipping when cart subtotal exceeds the threshold configured in store settings (e.g., 500 EGP).
- **Cash on Delivery (COD)**: Seamless checkout workflow without requiring third-party payment gateways upfront.
- **Idempotency Protection**: Every checkout request includes a unique idempotency key to prevent accidental double-billing.

#### 📍 Self-Serve Public Order Tracking (`/track`)
- Track any order using **Order Number** and **Phone Number**.
- **Interactive Visual Timeline**: Step-by-step progress tracking across all order stages:
  1. `Order Created`
  2. `Preparing`
  3. `Prepared`
  4. `Shipment Added`
  5. `In Transit`
  6. `Delivered`

#### 💬 Floating WhatsApp Customer Support
- **Fixed Pulsing Button**: Bottom-right green WhatsApp action button with breathing animation ring.
- **Interactive Tooltip**: Appears on hover ("تحدث معنا على واتساب").
- **Dynamic Pre-Filled Message**: Automatically opens WhatsApp chat with brand phone number and custom Arabic greeting pre-loaded.

---

### 2. Admin Management Portal (Brand Owner Suite)

The administrative panel is located at `/admin` and secured via ASP.NET Core Identity with role-based policies (`[Authorize(Roles = "Admin")]`).

#### 📊 Dashboard Overview (`/admin`)
- Total Revenue, Total Orders, Active Products count, and Low-Stock warnings.
- Quick summary table of the most recent orders.

#### 📦 Product Management (`/admin/products`)
- **Product CRUD**: Create, edit, and archive products. Configure name, slug, description, fabric details, care instructions, base price, and promotional sale price.
- **Variant Management**: Add and manage variants with unique combinations of Size, Color, Stock Quantity, and auto-generated SKUs (`NOVA-xxxx`).
- **Product Image Uploader**:
  - Drag-and-drop or file selector supporting multiple images.
  - Stored permanently in server disk storage (`wwwroot/uploads/images`).
  - **Hover-to-Delete**: Red trash icon overlay on each image with confirmation prompt and disk deletion.

#### 🎛 Landing Page Manager (`/admin/landing-page`)
A zero-code visual content editor built specifically for non-technical brand owners:
- **Hero Carousel Editor**:
  - Upload/replace slide backgrounds.
  - Edit title, subtitle, CTA button label, and target URL.
  - Set text alignment (Right, Center, Left).
  - Add new slides or remove existing slides.
- **Curated Collections Editor**:
  - Customize the 3 large portrait cards (Winter, Summer, Offers).
  - Replace images on the fly, adjust titles, and change destination links.
- **WhatsApp Support Editor**:
  - Change the customer support phone number anytime.
  - Customize the automated greeting message.
  - One-click "Test WhatsApp Chat Now" button to verify before saving.

#### 📋 Orders & Fulfillment (`/admin/orders`)
- **Order Search & Filter**: Search by order number, customer name, or phone; filter by status.
- **Detailed Order Inspector**: View customer delivery address snapshot, phone numbers, delivery notes, and purchased items snapshot (immutable even if original product catalog changes).
- **Status Progression**: Validated state machine transitions with timestamped history and audit logs.
- **Printable Invoices (`/admin/orders/[orderNumber]/print`)**:
  - Clean, monochrome invoice layout tailored for standard A4 printing.
  - Includes NØVA branding, order metadata, customer billing/shipping details, itemized breakdown, shipping fee, subtotal, and support contact details.

#### ⚙️ Store Settings (`/admin/settings`)
- Configure store display name, support email, announcement banner text, default shipping fee, and free shipping subtotal threshold.

---

### 3. Backend Core & Domain Logic

- **Auditable & Soft-Deletable Entities**: Base entity pattern tracks `CreatedAt`, `UpdatedAt`, `CreatedBy`, `UpdatedBy`, `IsDeleted`, and `DeletedAt`.
- **Global Query Filters**: Automatically excludes soft-deleted products and categories from public storefront queries.
- **Concurrency Protection**: EF Core `RowVersion` timestamp tokens protect `ProductVariant` stock from race conditions during concurrent checkouts.
- **Order Snapshot Pattern**: `OrderItem` stores immutable snapshots of product name, image, SKU, color, size, and price at the exact moment of purchase.

---

## 📂 Project Structure

```
NOVA-STORE/
├── backend/
│   ├── src/
│   │   ├── Vini.Domain/             # Enterprise business entities, enums, domain exceptions
│   │   │   ├── Common/              # BaseEntity, AuditableEntity
│   │   │   ├── Entities/            # Product, Order, Cart, Category, StoreSettings, etc.
│   │   │   ├── Enums/               # OrderStatus, PaymentMethod, PaymentStatus
│   │   │   └── Exceptions/          # InsufficientStockException, DomainException
│   │   ├── Vini.Application/        # DTOs, interfaces, business validation
│   │   │   ├── Common/              # Result<T>, PaginatedList<T>
│   │   │   ├── DTOs/                # ProductSummaryDto, OrderDto, etc.
│   │   │   └── Interfaces/          # IApplicationDbContext, IImageStorageService, etc.
│   │   ├── Vini.Infrastructure/     # Persistence, EF Core migrations, external services
│   │   │   ├── Persistence/         # ApplicationDbContext, Entity configurations
│   │   │   ├── Identity/            # ApplicationUser, ApplicationRole
│   │   │   └── Services/            # LocalImageStorageService, ShippingCalculator
│   │   └── Vini.Api/                # Web API controllers, middleware, Program.cs
│   │       ├── Controllers/         # Catalog, Orders, Cart, AdminControllers
│   │       ├── DatabaseInitializer  # Seeder for admin, settings, catalog, shipping
│   │       └── wwwroot/uploads/     # Persistent uploaded product images
│   └── tests/
│       ├── Vini.UnitTests/          # Domain entity and calculator unit tests
│       └── Vini.IntegrationTests/   # API and EF Core integration tests
├── frontend/
│   ├── public/                      # Static logos, fonts, placeholders
│   │   └── images/logo/             # nova-logo.svg
│   └── src/
│       ├── app/                     # Next.js App Router pages
│       │   ├── page.tsx             # Storefront homepage
│       │   ├── layout.tsx           # Root layout with Header, Footer, WhatsApp
│       │   ├── globals.css          # Tailwind CSS v4 design tokens
│       │   ├── products/            # Catalog listing & detail ([slug]) pages
│       │   ├── cart/                # Shopping cart page
│       │   ├── checkout/            # Checkout with Egyptian shipping zones
│       │   ├── track/               # Public order tracking page
│       │   └── admin/               # Admin dashboard, products, landing-page, orders
│       ├── components/              # Reusable React components
│       │   ├── layout/              # Header, Footer, CartIcon
│       │   ├── home/                # HeroCarousel, FeaturedCollections
│       │   ├── product/             # ImageGallery (with zoom), ProductCard
│       │   └── common/              # WhatsAppButton
│       ├── services/                # CatalogService, OrderService
│       ├── store/                   # Zustand cartStore and authStore
│       └── types/                   # TypeScript catalog, order, and cart models
├── Dockerfile.backend               # Multi-stage Docker build for .NET 10 API
├── Dockerfile.frontend              # Multi-stage Docker build for Next.js 16
├── docker-compose.yml               # Complete orchestration (SQL Server + API + Web)
├── DEPLOYMENT.md                    # Production migration & deployment runbook
└── README.md                        # Documentation
```

---

## 💻 Local Development Setup

### Prerequisites
- [.NET 10.0 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js 20+ and npm](https://nodejs.org/)
- [SQL Server 2022 or LocalDB](https://learn.microsoft.com/sql/database-engine/configure-windows/sql-server-express-localdb)

### 1. Backend Setup
1. Open PowerShell and navigate to the API directory:
   ```powershell
   cd "backend\src\Vini.Api"
   ```
2. Verify connection string in `appsettings.Development.json` (defaults to `(localdb)\mssqllocaldb`):
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ViniDb_Dev;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
   }
   ```
3. Run the backend API:
   ```powershell
   dotnet run
   ```
   *The database schema will automatically migrate and seed default categories, products, Egyptian shipping zones, store settings, and the admin account on first run.*
   *API will listen on:* `http://localhost:5160`

### 2. Frontend Setup
1. In a new terminal, navigate to the frontend directory:
   ```powershell
   cd "frontend"
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Start the Next.js development server with Turbopack:
   ```powershell
   npm run dev
   ```
   *The storefront will be available at:* `http://localhost:3000`

---

## 🔑 Default Admin Credentials

When the database initializes, an administrator account is seeded automatically:

| Attribute | Value |
| :--- | :--- |
| **Login URL** | `http://localhost:3000/admin/login` |
| **Admin Email** | `admin@nova.store` (or `admin@vini.com`) |
| **Admin Password** | `Admin123!` |
| **Role** | `Admin` |

---

## 🐳 Docker & Production Deployment

To run the entire ecosystem in Docker containers:

```bash
# Build production Docker images
docker-compose build

# Start services in detached mode
docker-compose up -d
```

Services exposed:
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5160`
- **SQL Server 2022**: Port `1433`

For detailed production guidelines, SSL termination, and migration scripts, see [DEPLOYMENT.md](file:///d:/VINI/VINI%20ANti/DEPLOYMENT.md).

---

## 📡 API Endpoints Reference

### Public Storefront Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/catalog/products` | Paginated product list with search and filters |
| `GET` | `/api/catalog/products/{slug}` | Detailed product information with variants and images |
| `GET` | `/api/catalog/products/featured` | Curated featured products for homepage |
| `GET` | `/api/catalog/products/new-arrivals` | Latest arrivals for homepage |
| `GET` | `/api/catalog/categories` | Active catalog categories |
| `GET` | `/api/catalog/settings` | Public store configuration (banners, threshold, WhatsApp) |
| `POST` | `/api/orders` | Create a new order with items and delivery details |
| `GET` | `/api/orders/{orderNumber}/track` | Public order status and timeline history |

### Authenticated Admin Endpoints (`[Authorize(Roles = "Admin")]`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/products` | Manage products with pagination and status |
| `POST` | `/api/admin/products` | Create a new product |
| `PUT` | `/api/admin/products/{id}` | Update product details |
| `POST` | `/api/admin/products/{id}/images` | Upload image to persistent storage |
| `DELETE`| `/api/admin/products/{id}/images/{imgId}` | Delete product image and remove file from disk |
| `POST` | `/api/admin/products/{id}/variants` | Add new variant (color, size, SKU, stock) |
| `GET` | `/api/admin/orders` | List customer orders with search & filtering |
| `GET` | `/api/admin/orders/{id}` | Order details, customer snapshot, and items |
| `PUT` | `/api/admin/orders/{id}/status` | Transition order status with audit log |
| `GET` | `/api/admin/settings` | Retrieve all system and landing page settings |
| `PUT` | `/api/admin/settings` | Bulk update settings (Hero slides, cards, WhatsApp) |
| `POST` | `/api/admin/settings/upload-image` | Upload image for hero slides or collection cards |

---

## 📜 License
This project is proprietary and built exclusively for **NØVA**. All rights reserved. © 2026.
