# Overview

DreamPOS is a Point of Sale (POS) system built as a web application that integrates with WooCommerce stores. The application enables cashiers to process sales transactions, manage inventory, track customers, and generate reports through a modern, responsive interface. It features both online and offline capabilities with local caching for products and customers.

The system uses a full-stack architecture with React for the frontend, Express.js for the backend API, and PostgreSQL with Drizzle ORM for data persistence. The application supports barcode scanning, multiple payment methods, receipt printing, and real-time synchronization with WooCommerce stores.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**React with TypeScript and Vite**: The client application is built using React 18 with TypeScript for type safety. Vite serves as the build tool and development server, providing fast hot module replacement and optimized production builds.

**UI Component Library**: The application uses shadcn/ui components built on Radix UI primitives, providing accessible and customizable UI components. Tailwind CSS handles styling with a custom design system using CSS variables for theming support (light/dark modes).

**State Management**: The application uses Zustand for global state management with persistence middleware for user authentication and settings. React Query (@tanstack/react-query) manages server state, caching, and data synchronization.

**Routing**: Wouter provides client-side routing as a lightweight alternative to React Router. The application includes routes for Dashboard, POS, Products, Customers, Inventory, Reports, and Settings.

**Form Handling**: React Hook Form with Zod validation manages form state and validation throughout the application.

## Backend Architecture

**Express.js Server**: The backend uses Express.js with TypeScript, running in ESM (ES Module) mode. The server handles API requests, authentication, and serves the React application in production.

**API Structure**: RESTful API endpoints are organized by resource (products, customers, orders, settings). The server acts as a proxy layer between the frontend and WooCommerce API, adding authentication, caching, and business logic.

**Request Logging**: Custom middleware logs all API requests with timing information, capturing method, path, status code, duration, and response data (truncated to 80 characters).

**Error Handling**: The application includes error handling middleware and Vite runtime error overlay for development.

## Data Storage

**PostgreSQL with Drizzle ORM**: The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The schema is defined in TypeScript using Drizzle's schema builder.

**Neon Serverless Driver**: Database connection uses @neondatabase/serverless for serverless-compatible PostgreSQL connections.

**Database Schema**:
- `pos_settings`: Stores WooCommerce API credentials and POS configuration
- `pos_orders`: Local order tracking before sync to WooCommerce
- `cached_products`: Local cache of WooCommerce products
- `cached_customers`: Local cache of WooCommerce customers  
- `user_sessions`: Authentication session management

**Memory Storage Fallback**: The application includes an in-memory storage implementation (MemStorage) as a fallback or testing alternative to PostgreSQL.

**Local Caching Strategy**: Client-side caching uses localStorage with TTL (time-to-live) management for offline support. The LocalStorageCache class handles cache operations with automatic expiration.

## Authentication & Authorization

**Session-Based Authentication**: User authentication uses session tokens stored in cookies with secure HTTP-only flags. JWT tokens are used for API authentication.

**WooCommerce API Authentication**: The application connects to WooCommerce using Basic Authentication with consumer key and secret. Credentials are encrypted and stored in the database.

**Permission System**: Settings include granular permissions for products, orders, customers, and inventory management.

## External Dependencies

**WooCommerce REST API v3**: Primary integration point for product catalog, customer data, and order management. The application implements a WooCommerceAPI class that handles authentication and API requests.

**Third-Party Services**:
- Neon Database: Serverless PostgreSQL hosting
- Replit: Development environment with custom Vite plugins for cartographer and dev banner

**Key NPM Packages**:
- Frontend: React, React Query, Zustand, Wouter, shadcn/ui, Radix UI
- Backend: Express, Drizzle ORM, Axios, jsonwebtoken
- Build Tools: Vite, TypeScript, Tailwind CSS, esbuild
- Validation: Zod, drizzle-zod

**API Client Design**: The WooCommerceClient class in `/client/src/lib/woocommerce.ts` provides typed methods for all WooCommerce operations (getProducts, getCustomers, createOrder, etc.). It includes search functionality with support for barcode lookups and SKU searches.

**Offline Capability**: The application caches products and customers locally to enable POS operations when network connectivity is limited. Orders are stored locally and synced to WooCommerce when connection is restored.

**Receipt Printing**: The application includes a thermal receipt component designed for 80mm receipt printers, with support for custom store branding and order details.