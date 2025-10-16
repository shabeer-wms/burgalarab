# 🍽️ Restaurant Management System - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Architecture](#project-architecture)
4. [Frontend Structure](#frontend-structure)
5. [Backend Structure](#backend-structure)
6. [Database Schema](#database-schema)
7. [Authentication & Authorization](#authentication--authorization)
8. [Role-Based Access Control](#role-based-access-control)
9. [Feature Modules](#feature-modules)
10. [Component Documentation](#component-documentation)
11. [State Management](#state-management)
12. [API Integration](#api-integration)
13. [Deployment Guide](#deployment-guide)
14. [Development Workflow](#development-workflow)

---

## Project Overview

### Description
A comprehensive, full-stack restaurant management system built with React, TypeScript, and Firebase. The application provides role-based dashboards for **Admin**, **Waiter**, and **Kitchen Staff** to streamline restaurant operations with real-time order processing, menu management, staff management, and billing capabilities.

---

## Team & Contributors

| Role/Module           | Name(s)                   |
|---------------------- |---------------------------|
| Project Lead          | Sayed Shahloob P          |
| Frontend Lead         | Ayra Riyas                |
| Backend Lead          | Minhaj                    |
| Admin Module          | Ayra Riyas,Sharin         |
| Kitchen Module        | Sahal, Nishana            |
| Waiter Module         | Minhaj, Dishan            |
| Login Module          | Archana                   |

---

### Key Features
- ✅ **Multi-role dashboard system** (Admin, Waiter, Kitchen)
- ✅ **Real-time order management** with live updates
- ✅ **Kitchen Display System (KDS)** for order preparation
- ✅ **Menu management** with categories and availability control
- ✅ **Staff management** with role-based permissions
- ✅ **Billing & payment processing** with multiple payment methods
- ✅ **Analytics & reporting** with revenue tracking
- ✅ **Firebase Authentication** for secure login
- ✅ **Firestore database** for real-time data synchronization

### Target Users
1. **Restaurant Administrators** - Complete oversight and management
2. **Waiters** - Order taking, table management, billing
3. **Kitchen Staff** - Order preparation and status updates

---

## Technology Stack

### Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI library for building interactive interfaces |
| **TypeScript** | 5.5.3 | Type-safe JavaScript for better development |
| **Vite** | 7.1.5 | Fast build tool and development server |
| **Tailwind CSS** | 3.4.1 | Utility-first CSS framework for styling |
| **React Router DOM** | 7.9.4 | Client-side routing and navigation |
| **Lucide React** | 0.344.0 | Modern SVG icon library |

### Backend & Database
| Technology | Version | Purpose |
|------------|---------|---------|
| **Firebase** | 12.2.1 | Backend-as-a-Service platform |
| **Firestore** | - | NoSQL real-time database |
| **Firebase Auth** | - | User authentication system |
| **Firebase Analytics** | - | Application analytics |

### Additional Libraries
| Library | Purpose |
|---------|---------|
| **file-saver** | Download bills and reports as files |
| **qrcode.react** | Generate QR codes for orders |
| **xlsx** | Export data to Excel format |
| **recharts** | Data visualization and charts |
| **@fontsource/inter** | Modern typography |

### Development Tools
- **ESLint** - Code quality and linting
- **PostCSS** - CSS processing and optimization
- **Autoprefixer** - CSS vendor prefixing

---

## Project Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Application                       │
│                  (React + TypeScript)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Admin     │  │    Waiter    │  │   Kitchen    │     │
│  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Context API (State Management)               │  │
│  │  • AuthContext - User authentication                  │  │
│  │  • AppContext - Global app state                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      Firebase Backend                        │
├─────────────────────────────────────────────────────────────┤
│  • Firebase Authentication (User login/logout)               │
│  • Firestore Database (Real-time data sync)                  │
│  • Firebase Analytics (Usage tracking)                       │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
restaurent-managent-6/
├── public/                      # Static assets
│   └── track.html              # Order tracking page
├── src/
│   ├── components/             # React components
│   │   ├── admin/             # Admin dashboard components
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminSettings.tsx
│   │   │   └── components/
│   │   │       ├── AdminMenu.tsx
│   │   │       ├── AdminOrders.tsx
│   │   │       ├── AdminOverview.tsx
│   │   │       ├── AdminSidebar.tsx
│   │   │       ├── AdminStaff.tsx
│   │   │       └── ImageUpload.tsx
│   │   ├── kitchen/           # Kitchen staff components
│   │   │   ├── KitchenDashboard.tsx
│   │   │   ├── KitchenDisplaySystem.tsx
│   │   │   ├── components/
│   │   │   │   ├── BottomNavigation.tsx
│   │   │   │   ├── KitchenHeader.tsx
│   │   │   │   ├── KitchenMenu.tsx
│   │   │   │   ├── KitchenOrderCard.tsx
│   │   │   │   ├── KitchenSettingsPage.tsx
│   │   │   │   ├── OrderSection.tsx
│   │   │   │   ├── SidebarNavigation.tsx
│   │   │   │   └── StatusCounters.tsx
│   │   │   └── theme/
│   │   │       ├── colors.ts
│   │   │       └── layout.ts
│   │   ├── waiter/            # Waiter components
│   │   │   ├── WaiterDashboard.tsx
│   │   │   ├── WaiterBillingPage.tsx
│   │   │   ├── WaiterOrderStatusPage.tsx
│   │   │   └── WaiterSettings.tsx
│   │   ├── staff/             # Shared staff components
│   │   │   ├── BillingPayments.tsx
│   │   │   ├── OrderManagement.tsx
│   │   │   └── OrderStatusManagement.tsx
│   │   └── shared/            # Shared components
│   │       ├── ConfirmationDialog.tsx
│   │       ├── Layout.tsx
│   │       ├── Login.tsx
│   │       ├── RoleSelection.tsx
│   │       └── SnackBar.tsx
│   ├── context/               # React Context providers
│   │   ├── AppContext.tsx    # Global state management
│   │   └── AuthContext.tsx   # Authentication state
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/                 # Utility functions
│   │   ├── clearDatabase.ts
│   │   ├── imageUpload.ts
│   │   ├── navigationStyles.ts
│   │   └── seedMenuItems.ts
│   ├── App.tsx               # Root application component
│   ├── firebase.ts           # Firebase configuration
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── eslint.config.js          # ESLint configuration
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── postcss.config.js        # PostCSS configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite build configuration
```

---

## Frontend Structure

### Component Hierarchy

```
App (Root Component)
├── ErrorBoundary
│   └── Error handling wrapper
├── AuthProvider (Context)
│   └── AppProvider (Context)
│       └── Router
│           ├── Login
│           └── Layout
│               ├── Admin Dashboard
│               │   ├── AdminSidebar
│               │   ├── AdminOverview
│               │   ├── AdminOrders
│               │   ├── AdminMenu
│               │   ├── AdminStaff
│               │   └── AdminSettings
│               ├── Waiter Dashboard
│               │   ├── OrderManagement
│               │   ├── WaiterOrderStatusPage
│               │   ├── WaiterBillingPage
│               │   └── WaiterSettings
│               └── Kitchen Dashboard
│                   ├── KitchenDisplaySystem
│                   ├── KitchenHeader
│                   ├── StatusCounters
│                   ├── OrderSection
│                   └── KitchenOrderCard
```

### Core Components

#### 1. **App.tsx** - Root Application Component
**Purpose:** Main application entry point with error boundary and routing

**Key Features:**
- Error boundary for graceful error handling
- Conditional rendering based on authentication
- Role-based dashboard routing
- Loading state management
- Global notification system

**Code Structure:**
```typescript
- ErrorBoundary class component
- AppContent functional component
- User authentication check
- Role-based dashboard rendering
- Snackbar notification integration
```

#### 2. **Login Component** (`src/components/shared/Login.tsx`)
**Purpose:** User authentication interface

**Features:**
- Email/password authentication
- Demo credentials support
- Staff authentication via Firebase
- Phone number to email conversion for staff login
- Error handling and validation

**Login Credentials:**
- Admin: `admin@pro.com` / `admin123`
- Demo Customer: `customer@demo.com` / `demo123`
- Staff: Phone number or email with Firebase password

#### 3. **Layout Component** (`src/components/shared/Layout.tsx`)
**Purpose:** Common layout wrapper for all dashboards

**Features:**
- Consistent header/navigation
- Role-based styling
- Responsive design
- Logout functionality

---

## Backend Structure

### Firebase Configuration

**File:** `src/firebase.ts`

```typescript
// Firebase Services Used:
1. Firebase App - Core initialization
2. Firestore - Real-time database
3. Firebase Auth - User authentication
4. Firebase Analytics - Usage tracking
```

**Configuration:**
```typescript
{
  apiKey: "AIzaSyAlLz1bWFwiv3TTe7xqY6q2QU67jTZVRI8"
  authDomain: "hotel-manager-8c1fe.firebaseapp.com"
  projectId: "hotel-manager-8c1fe"
  storageBucket: "hotel-manager-8c1fe.firebasestorage.app"
  messagingSenderId: "515333293848"
  appId: "1:515333293848:web:4f1a425b701fb839dac06d"
  measurementId: "G-84BBQ0WRN8"
}
```

### Firestore Collections

#### Collection: `menuItems`
**Purpose:** Store restaurant menu items

```typescript
{
  id: string                    // Unique identifier
  name: string                  // Item name
  description: string           // Item description
  price: number                 // Price in currency
  category: string              // Category (Appetizers, Main Course, etc.)
  image: string                 // Image URL
  available: boolean            // Availability status
  prepTime: number             // Preparation time in minutes
}
```

#### Collection: `orders`
**Purpose:** Store customer orders

```typescript
{
  id: string                    // Unique order ID
  customerId: string            // Customer ID
  customerName: string          // Customer name
  customerPhone: string         // Contact number
  customerAddress?: string      // Delivery address (optional)
  type: "dine-in" | "delivery" // Order type
  tableNumber?: string          // Table number (for dine-in)
  items: OrderItem[]           // Array of ordered items
  status: OrderStatus          // Order status
  total: number                // Subtotal
  tax: number                  // Tax amount
  grandTotal: number           // Final total
  paymentMethod?: PaymentMethod // Payment type
  paymentStatus: PaymentStatus // Payment state
  deliveryStatus?: string      // Delivery tracking
  orderTime: Timestamp         // Order creation time
  completedTime?: Timestamp    // Completion time
  waiterId?: string            // Assigned waiter ID
  estimatedTime?: number       // Estimated prep time
  draft?: boolean              // Draft order flag
  paused?: boolean             // Kitchen pause flag
}
```

#### Collection: `staff`
**Purpose:** Store staff member information

```typescript
{
  id: string                    // Unique staff ID
  name: string                  // Full name
  email: string                 // Email address
  phoneNumber: string           // Contact number
  role: StaffRole              // Role (waiter/kitchen/admin/manager)
  isFrozen: boolean            // Account status
  dateJoined: string           // Join date
  uid?: string                 // Firebase Auth UID
  createdAt?: Timestamp        // Account creation
  updatedAt?: Timestamp        // Last update
}
```

#### Collection: `bills`
**Purpose:** Store billing information

```typescript
{
  id: string                    // Bill ID
  orderId: string               // Associated order ID
  items: OrderItem[]           // Billed items
  subtotal: number             // Subtotal amount
  taxRate: number              // Tax percentage
  taxAmount: number            // Calculated tax
  serviceCharge?: number       // Service charge
  discount?: number            // Discount amount
  total: number                // Final amount
  generatedAt: Timestamp       // Bill generation time
  generatedBy: string          // Staff who generated
  paymentMethod: PaymentMethod // Payment type
  customerDetails: {
    name: string
    phone: string
    address?: string
    tableNumber?: string
  }
}
```

#### Collection: `ratings`
**Purpose:** Store customer ratings

```typescript
{
  id: string                    // Rating ID
  orderId: string               // Associated order ID
  rating: number               // 1-5 stars
  customerName: string         // Customer name
  timestamp: Timestamp         // Rating time
  createdAt: string            // Creation date
  reviewText?: string          // Optional review
}
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐         ┌─────────────┐
│   STAFF     │         │  MENUITEM   │
├─────────────┤         ├─────────────┤
│ id (PK)     │         │ id (PK)     │
│ name        │         │ name        │
│ email       │    ┌────│ category    │
│ role        │    │    │ price       │
│ isFrozen    │    │    │ available   │
└─────────────┘    │    └─────────────┘
       │           │           │
       │           │           │
       │ (creates) │           │ (contains)
       │           │           │
       ↓           │           ↓
┌─────────────┐   │    ┌─────────────┐
│   ORDERS    │───┘    │ ORDER_ITEM  │
├─────────────┤        ├─────────────┤
│ id (PK)     │←───────│ id (PK)     │
│ waiterId(FK)│        │ menuItem    │
│ customerId  │        │ quantity    │
│ status      │        │ status      │
│ type        │        │ preferences │
│ total       │        └─────────────┘
└─────────────┘
       │
       │ (generates)
       ↓
┌─────────────┐
│    BILLS    │
├─────────────┤
│ id (PK)     │
│ orderId(FK) │
│ total       │
│ payment     │
└─────────────┘
       │
       │ (receives)
       ↓
┌─────────────┐
│   RATINGS   │
├─────────────┤
│ id (PK)     │
│ orderId(FK) │
│ rating      │
│ review      │
└─────────────┘
```

---

## Authentication & Authorization

### Authentication Flow

```
┌──────────────┐
│ Login Screen │
└──────┬───────┘
       │
       ↓
┌──────────────────────────────┐
│ Validate Credentials         │
│ • Admin: Fixed credentials   │
│ • Staff: Firebase Auth       │
│ • Demo: Hardcoded test users │
└──────┬───────────────────────┘
       │
       ↓
┌──────────────────────────────┐
│ Check Account Status         │
│ • Is account frozen?         │
│ • Valid role assigned?       │
└──────┬───────────────────────┘
       │
       ↓
┌──────────────────────────────┐
│ Create Session               │
│ • Store user in localStorage │
│ • Set AuthContext state      │
└──────┬───────────────────────┘
       │
       ↓
┌──────────────────────────────┐
│ Redirect to Dashboard        │
│ • Admin → AdminDashboard     │
│ • Waiter → WaiterDashboard   │
│ • Kitchen → KitchenDashboard │
└──────────────────────────────┘
```

### AuthContext API

**File:** `src/context/AuthContext.tsx`

**State:**
```typescript
{
  user: User | null        // Current authenticated user
  isLoading: boolean       // Authentication check in progress
}
```

**Methods:**
```typescript
login(email: string, password: string, staff: Staff[]): Promise<boolean>
// Authenticates user and sets session

logout(): void
// Clears session and redirects to login
```

**User Object:**
```typescript
interface User {
  id: string
  name: string
  email: string
  role: "customer" | "waiter" | "kitchen" | "admin"
  tableNumber?: string
}
```

---

## Role-Based Access Control

### Role Definitions

#### 1. **Admin Role**
**Access Level:** Full system access

**Capabilities:**
- ✅ View all orders across the restaurant
- ✅ Manage menu items (add, edit, delete)
- ✅ Manage staff accounts (create, update, freeze)
- ✅ View analytics and reports
- ✅ Access all billing information
- ✅ Configure system settings
- ✅ Monitor kitchen operations
- ✅ Override order statuses

**Dashboard Sections:**
1. **Overview** - Revenue, orders, analytics
2. **Orders** - All restaurant orders
3. **Menu** - Menu item management
4. **Staff** - Staff account management
5. **Settings** - System configuration

**Code Location:** `src/components/admin/AdminDashboard.tsx`

#### 2. **Waiter Role**
**Access Level:** Order management and billing

**Capabilities:**
- ✅ Create new orders for customers
- ✅ Manage assigned table orders
- ✅ View order status updates
- ✅ Process payments and generate bills
- ✅ View personal revenue statistics
- ❌ Cannot access other waiters' orders
- ❌ Cannot manage menu items
- ❌ Cannot manage staff accounts

**Dashboard Sections:**
1. **New Order** - Take customer orders
2. **Order Status** - Track order progress
3. **Billing** - Process payments
4. **Settings** - Personal settings

**Code Location:** `src/components/waiter/WaiterDashboard.tsx`

#### 3. **Kitchen Role**
**Access Level:** Order preparation only

**Capabilities:**
- ✅ View incoming orders in real-time
- ✅ Update order preparation status
- ✅ Mark individual items as complete
- ✅ Pause/resume order preparation
- ✅ View order priority and timing
- ❌ Cannot create orders
- ❌ Cannot view billing information
- ❌ Cannot manage menu or staff

**Dashboard Sections:**
1. **Pending Orders** - New orders to prepare
2. **In Progress** - Currently cooking
3. **Ready Orders** - Completed orders
4. **Settings** - Kitchen preferences

**Code Location:** `src/components/kitchen/KitchenDashboard.tsx`

### Permission Matrix

| Feature | Admin | Waiter | Kitchen |
|---------|-------|--------|---------|
| View all orders | ✅ | ❌ | ✅ |
| Create orders | ✅ | ✅ | ❌ |
| Update order status | ✅ | ✅ | ✅ |
| Cancel orders | ✅ | ✅ | ❌ |
| Add menu items | ✅ | ❌ | ❌ |
| Edit menu items | ✅ | ❌ | ❌ |
| Delete menu items | ✅ | ❌ | ❌ |
| Add staff | ✅ | ❌ | ❌ |
| Edit staff | ✅ | ❌ | ❌ |
| Freeze staff | ✅ | ❌ | ❌ |
| Generate bills | ✅ | ✅ | ❌ |
| View analytics | ✅ | Limited | ❌ |
| Process payments | ✅ | ✅ | ❌ |

---

## Feature Modules

### 1. Order Management System

**Overview:** Complete order lifecycle management from creation to completion

**Order States:**
```
Pending → Confirmed → Preparing → Ready → Completed
                                        ↓
                                    Cancelled
```

**Components:**
- `OrderManagement.tsx` - Create and manage orders
- `WaiterOrderStatusPage.tsx` - Track order progress
- `KitchenDisplaySystem.tsx` - Kitchen order view
- `AdminOrders.tsx` - Admin order oversight

**Features:**
- Real-time order synchronization
- Table assignment for dine-in
- Delivery address management
- Special instructions per item
- Order item customization (sugar, spice preferences)
- Kitchen notes
- Estimated preparation time
- Order priority management

**Order Flow:**
```
1. Waiter creates order
   ↓
2. Order sent to kitchen (status: confirmed)
   ↓
3. Kitchen accepts (status: preparing)
   ↓
4. Kitchen marks items ready (status: ready)
   ↓
5. Waiter delivers to customer
   ↓
6. Payment processed
   ↓
7. Order completed (status: completed)
```

### 2. Kitchen Display System (KDS)

**Overview:** Real-time kitchen order management interface

**File:** `src/components/kitchen/KitchenDisplaySystem.tsx`

**Features:**
- Live order queue with real-time updates
- Visual order cards with item details
- Timer for preparation tracking
- Color-coded priority system
- Item-level status tracking
- Pause/resume functionality
- Sound notifications for new orders

**Order Card Information:**
- Order number and table
- Customer name
- Order time and elapsed time
- Item list with quantities
- Special instructions
- Preparation status per item

**Status Management:**
```typescript
Pending    → Gray background, awaiting start
In-Progress → Yellow background, currently cooking
Ready      → Green background, ready for pickup
```

**Kitchen Workflow:**
```
1. New order appears in "Pending" section
2. Kitchen staff taps "Start Cooking"
3. Order moves to "In Progress"
4. Staff marks individual items complete
5. When all items ready, order moves to "Ready"
6. Waiter picks up and delivers
```

### 3. Menu Management

**Overview:** Dynamic menu item management system

**File:** `src/components/admin/components/AdminMenu.tsx`

**Features:**
- Add new menu items
- Edit existing items
- Delete menu items
- Image upload for items
- Category organization
- Availability toggle
- Price management
- Preparation time setting

**Categories:**
1. Appetizers
2. Main Course
3. Grill / BBQ
4. Rice Dishes
5. Sandwiches & Shawarma
6. Burgers
7. Seafood
8. Desserts
9. Beverages
10. Breakfast

**Menu Item Form Fields:**
```typescript
{
  name: string           // Item name
  description: string    // Detailed description
  price: number         // Price in currency
  category: string      // Category selection
  image: string         // Image URL or upload
  available: boolean    // Availability status
  prepTime: number      // Minutes to prepare
}
```

### 4. Staff Management

**Overview:** Staff account creation and management

**File:** `src/components/admin/components/AdminStaff.tsx`

**Features:**
- Create staff accounts
- Firebase authentication integration
- Role assignment
- Account freeze/unfreeze
- Staff performance tracking
- View order history per staff

**Staff Creation Process:**
```
1. Admin enters staff details
2. System creates Firebase Auth account
3. Account credentials emailed to staff
4. Staff can login with email/password or phone
5. Account appears in staff list
```

**Staff Roles:**
- **Waiter** - Takes orders, manages tables, processes bills
- **Kitchen** - Prepares food, updates order status
- **Admin** - Full system access
- **Manager** - Similar to admin (future expansion)

**Account States:**
- **Active** - Can login and use system
- **Frozen** - Account locked, cannot login

### 5. Billing & Payments

**Overview:** Automated billing with multiple payment methods

**File:** `src/components/waiter/WaiterBillingPage.tsx`

**Features:**
- Automatic bill generation from orders
- Multiple payment methods
- Tax calculation (18% default)
- Service charge option
- Discount application
- PDF bill download
- Receipt printing
- Payment tracking

**Payment Methods:**
- Cash
- Card (Credit/Debit)
- Online (UPI, Wallets)
- Cash on Delivery (COD)

**Bill Structure:**
```typescript
{
  items: OrderItem[]        // Ordered items
  subtotal: number          // Sum of items
  taxRate: 18%              // Tax percentage
  taxAmount: number         // Calculated tax
  serviceCharge?: number    // Optional service charge
  discount?: number         // Discount amount
  total: number            // Final payable amount
  paymentMethod: string    // Payment type
  customerDetails: {}      // Customer info
}
```

**Billing Workflow:**
```
1. Order status becomes "ready"
2. Waiter navigates to Billing page
3. Selects order to bill
4. Reviews items and amounts
5. Applies discounts if needed
6. Selects payment method
7. Generates bill
8. Downloads/prints receipt
9. Order marked as completed
```

### 6. Analytics & Reporting

**Overview:** Business intelligence and performance tracking

**File:** `src/components/admin/components/AdminOverview.tsx`

**Metrics Tracked:**
- **Revenue Analytics**
  - Today's revenue
  - Weekly revenue
  - Monthly revenue
  - Revenue by payment method
  
- **Order Analytics**
  - Total orders
  - Orders by status
  - Orders by type (dine-in/delivery)
  - Average order value
  
- **Menu Performance**
  - Popular items
  - Category distribution
  - Item availability stats
  
- **Staff Performance**
  - Orders per waiter
  - Revenue per waiter
  - Average service time

**Visualizations:**
- Revenue trend charts (Recharts)
- Order distribution pie charts
- Category performance bars
- Staff comparison graphs

---

## Component Documentation

### Admin Components

#### AdminDashboard.tsx
**Purpose:** Main admin interface with tabbed navigation

**Props:** None (uses context)

**State:**
```typescript
activeTab: 'overview' | 'orders' | 'menu' | 'staff' | 'settings'
```

**Features:**
- Sidebar navigation
- Tab-based content switching
- Responsive layout (desktop/mobile)
- User info display
- Logout functionality

**Usage:**
```tsx
<AdminDashboard />
```

#### AdminOverview.tsx
**Purpose:** Dashboard overview with analytics

**Props:**
```typescript
{
  orders: Order[]
  menuItems: MenuItem[]
  staff: Staff[]
  ratings: Rating[]
}
```

**Displays:**
- Revenue statistics
- Order counts and trends
- Popular menu items
- Staff performance
- Recent ratings

#### AdminMenu.tsx
**Purpose:** Menu item management interface

**Props:**
```typescript
{
  categories: string[]
}
```

**Actions:**
- Add menu item
- Edit menu item
- Delete menu item
- Toggle availability
- Upload item image

#### AdminStaff.tsx
**Purpose:** Staff account management

**Features:**
- Staff list view
- Add new staff
- Edit staff details
- Freeze/unfreeze accounts
- Delete staff (with confirmation)

#### AdminOrders.tsx
**Purpose:** View and manage all restaurant orders

**Props:**
```typescript
{
  orders: Order[]
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>
}
```

**Features:**
- Filter by status
- Search orders
- Update order status
- View order details
- Cancel orders

### Waiter Components

#### WaiterDashboard.tsx
**Purpose:** Main waiter interface with order management

**State:**
```typescript
activeTab: 'orders' | 'status' | 'billing' | 'settings'
selectedTable: string
cartItems: OrderItem[]
```

**Features:**
- Multi-tab interface
- Shopping cart for new orders
- Order status tracking
- Billing interface
- Personal settings

**Unique Features:**
- Ready order notifications with sound
- Cart management (add/remove/modify items)
- Table assignment
- Customer details capture
- Special instructions per item
- Sugar/spice preferences

#### WaiterOrderStatusPage.tsx
**Purpose:** Track all assigned order statuses

**Features:**
- Real-time order updates
- Filter by status (confirmed, preparing, ready)
- Order details view
- Time tracking
- Notification for ready orders

#### WaiterBillingPage.tsx
**Purpose:** Process payments and generate bills

**Features:**
- Ready orders list
- Payment method selection
- Bill preview
- Download bill as PDF
- Mark order as completed
- Revenue statistics

### Kitchen Components

#### KitchenDisplaySystem.tsx
**Purpose:** Real-time kitchen order display

**State:**
```typescript
orders: KitchenDisplayItem[]
filter: 'all' | 'pending' | 'in-progress' | 'ready'
sortBy: 'time' | 'priority'
```

**Features:**
- Real-time order synchronization
- Three-section layout (Pending, In Progress, Ready)
- Timer for each order
- Item-level status tracking
- Pause/resume functionality
- Sound notifications
- Priority-based sorting

**Order Card Structure:**
```tsx
<KitchenOrderCard
  order={order}
  onUpdateStatus={updateStatus}
  onUpdateItemStatus={updateItemStatus}
/>
```

#### KitchenOrderCard.tsx
**Purpose:** Individual order display card

**Props:**
```typescript
{
  order: KitchenDisplayItem
  onUpdateStatus: (orderId, status) => void
  onUpdateItemStatus: (orderId, itemId, status) => void
}
```

**Displays:**
- Order number and table
- Customer name
- Order time and timer
- Item list with status
- Special instructions
- Action buttons

### Shared Components

#### Login.tsx
**Purpose:** User authentication interface

**Features:**
- Email/password input
- Remember me checkbox
- Demo credentials info
- Error messages
- Loading state

**Authentication Logic:**
```typescript
1. Check admin credentials
2. Check demo users
3. Check staff in Firebase
4. Support phone number login
5. Verify account not frozen
6. Create session
```

#### SnackBar.tsx
**Purpose:** Toast notifications

**Props:**
```typescript
{
  message: string
  type: 'success' | 'error'
  show: boolean
  onClose: () => void
}
```

**Usage:**
```tsx
<SnackBar
  message="Order created successfully"
  type="success"
  show={true}
  onClose={() => setShow(false)}
/>
```

#### ConfirmationDialog.tsx
**Purpose:** Confirm destructive actions

**Props:**
```typescript
{
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
}
```

---

## State Management

### Context Architecture

#### AppContext
**File:** `src/context/AppContext.tsx`

**Purpose:** Global application state and business logic

**State:**
```typescript
{
  menuItems: MenuItem[]
  staff: Staff[]
  orders: Order[]
  bills: Bill[]
  kitchenOrders: KitchenDisplayItem[]
  ratings: Rating[]
  notification: Notification | null
  categories: Category[]
}
```

**Methods:**
```typescript
// Menu Management
addMenuItem(item: Omit<MenuItem, 'id'>): Promise<void>
updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<void>
deleteMenuItem(id: string): Promise<void>

// Staff Management
addStaff(staff: Omit<Staff, 'id'> & {password: string}): Promise<void>
updateStaff(id: string, updates: Partial<Staff>): Promise<void>
deleteStaff(id: string): Promise<void>
authenticateStaff(phoneOrEmail: string, password: string): Promise<Staff | null>

// Order Management
addOrder(order: Omit<Order, 'id' | 'orderTime'>): Promise<string>
updateOrder(orderId: string, updates: Partial<Order>): Promise<void>
updateOrderItemStatus(orderId: string, itemId: string, status): void
updateKitchenOrderStatus(orderId: string, status, paused?): void
getOrdersByStatus(status: Order['status']): Order[]
getOrdersByType(type: Order['type']): Order[]
getActiveOrders(): Order[]

// Billing
generateBill(orderId: string, generatedBy: string, paymentMethod): Promise<Bill>
getTodaysRevenue(): number

// Notifications
showNotification(message: string, type: 'success' | 'error'): void
hideNotification(): void
```

**Real-time Synchronization:**
```typescript
// Firestore listeners
useEffect(() => {
  const unsubscribeMenuItems = onSnapshot(
    collection(db, 'menuItems'),
    (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setMenuItems(items)
    }
  )

  // Similar listeners for orders, staff, bills, ratings
  
  return () => {
    unsubscribeMenuItems()
    // Cleanup other listeners
  }
}, [])
```

#### AuthContext
**File:** `src/context/AuthContext.tsx`

**Purpose:** User authentication state

**State:**
```typescript
{
  user: User | null
  isLoading: boolean
}
```

**Methods:**
```typescript
login(email: string, password: string, staff: Staff[]): Promise<boolean>
logout(): void
```

**Session Management:**
```typescript
// Store user in localStorage
localStorage.setItem('user', JSON.stringify(user))

// Restore on app load
useEffect(() => {
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    setUser(JSON.parse(storedUser))
  }
  setIsLoading(false)
}, [])
```

---

## API Integration

### Firebase Firestore Operations

#### Create Document
```typescript
await addDoc(collection(db, 'orders'), {
  customerId: user.id,
  customerName: name,
  items: cartItems,
  status: 'pending',
  orderTime: new Date(),
  // ... other fields
})
```

#### Update Document
```typescript
await updateDoc(doc(db, 'orders', orderId), {
  status: 'confirmed',
  waiterId: user.id
})
```

#### Delete Document
```typescript
await deleteDoc(doc(db, 'menuItems', itemId))
```

#### Query Documents
```typescript
const q = query(
  collection(db, 'orders'),
  where('status', '==', 'pending'),
  where('waiterId', '==', user.id)
)

const snapshot = await getDocs(q)
const orders = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}))
```

#### Real-time Listener
```typescript
const unsubscribe = onSnapshot(
  collection(db, 'orders'),
  (snapshot) => {
    snapshot.docChanges().forEach(change => {
      if (change.type === 'added') {
        // Handle new order
      }
      if (change.type === 'modified') {
        // Handle updated order
      }
      if (change.type === 'removed') {
        // Handle deleted order
      }
    })
  }
)

// Cleanup
return () => unsubscribe()
```

### Firebase Authentication

#### Create User
```typescript
const userCredential = await createUserWithEmailAndPassword(
  auth,
  email,
  password
)
const uid = userCredential.user.uid

// Store additional info in Firestore
await setDoc(doc(db, 'staff', staffId), {
  uid,
  name,
  email,
  role,
  // ... other fields
})
```

#### Sign In
```typescript
await signInWithEmailAndPassword(auth, email, password)
```

#### Sign Out
```typescript
await signOut(auth)
```

---

## Deployment Guide

### Prerequisites
- Node.js 16+ installed
- Firebase project created
- Git repository (optional)

### Local Development Setup

1. **Clone Repository**
```bash
git clone <repository-url>
cd restaurent-managent-6
```

2. **Install Dependencies**
```bash
npm install
```

3. **Configure Firebase**
- Create Firebase project at https://console.firebase.google.com
- Enable Authentication (Email/Password)
- Create Firestore database
- Copy configuration to `src/firebase.ts`

4. **Run Development Server**
```bash
npm run dev
```

5. **Access Application**
```
http://localhost:5173
```

### Production Build

1. **Build for Production**
```bash
npm run build
```

2. **Preview Production Build**
```bash
npm run preview
```

### Firebase Hosting Deployment

1. **Install Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**
```bash
firebase login
```

3. **Initialize Firebase**
```bash
firebase init
# Select Hosting
# Choose your Firebase project
# Public directory: dist
# Single-page app: Yes
# GitHub deploys: Optional
```

4. **Deploy**
```bash
npm run build
firebase deploy
```

### Environment Variables

Create `.env` file:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Update `firebase.ts`:
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ... use environment variables
}
```

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Menu items - read by all, write by admin only
    match /menuItems/{itemId} {
      allow read: if true;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/staff/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Orders - read/write by authenticated users
    match /orders/{orderId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null && 
                       get(/databases/$(database)/documents/staff/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Staff - admin only
    match /staff/{staffId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/staff/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Bills - read/write by authenticated
    match /bills/{billId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    
    // Ratings - read by all, create by authenticated
    match /ratings/{ratingId} {
      allow read: if true;
      allow create: if request.auth != null;
    }
  }
}
```

---

## Development Workflow

### Code Structure Best Practices

1. **Component Organization**
   - One component per file
   - Group related components in folders
   - Use index.ts for exports

2. **TypeScript Usage**
   - Define interfaces in `types/index.ts`
   - Use strict type checking
   - Avoid `any` type

3. **State Management**
   - Use Context for global state
   - Use local state for component-specific data
   - Memoize expensive computations

4. **Styling**
   - Use Tailwind utility classes
   - Define custom classes in `index.css`
   - Responsive design first

### Testing Strategy

1. **Manual Testing Checklist**
   - [ ] Login with all user roles
   - [ ] Create, edit, delete menu items
   - [ ] Place dine-in and delivery orders
   - [ ] Update order status from kitchen
   - [ ] Generate and download bills
   - [ ] Test real-time synchronization
   - [ ] Test on mobile devices

2. **Test Accounts**
   ```
   Admin: admin@pro.com / admin123
   Staff: Create via admin panel
   ```

### Common Tasks

#### Add New Menu Category
1. Update `defaultCategories` in `AppContext.tsx`
2. Add category to `AdminMenu.tsx` categories array
3. Update category interface if needed

#### Add New Staff Role
1. Update `StaffRole` type in `types/index.ts`
2. Add role to staff creation form
3. Update permission checks in components
4. Add new dashboard if needed

#### Modify Order Status Flow
1. Update `Order['status']` type
2. Modify status update logic in `AppContext.tsx`
3. Update UI in dashboard components
4. Update kitchen display system

### Troubleshooting

#### Firebase Connection Issues
```typescript
// Check Firebase initialization
console.log('Firebase App:', app.name)
console.log('Firestore:', db.type)
```

#### Authentication Failures
- Verify Firebase Auth is enabled
- Check staff account not frozen
- Confirm correct email/password
- Clear localStorage and retry

#### Real-time Updates Not Working
- Check Firestore rules allow reads
- Verify onSnapshot listeners active
- Check network connectivity
- Refresh browser

#### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite

# Rebuild
npm run build
```

---

## Conclusion

This restaurant management system provides a complete solution for managing restaurant operations with:

- **Role-based access control** for Admin, Waiter, and Kitchen staff
- **Real-time order synchronization** across all interfaces
- **Comprehensive menu management** with categories and availability
- **Automated billing** with multiple payment methods
- **Kitchen display system** for efficient order preparation
- **Analytics and reporting** for business insights
- **Firebase backend** for scalability and real-time updates

The system is built with modern technologies (React, TypeScript, Firebase) and follows best practices for maintainability and scalability.

### Future Enhancements
- Customer mobile app for self-ordering
- Inventory management
- Employee attendance tracking
- Advanced analytics with AI insights
- Multi-restaurant support
- Online payment gateway integration
- SMS/Email notifications
- Table reservation system
- Loyalty program management

### Support & Contact
For technical support or feature requests, please contact the development team or create an issue in the repository.

---

**Last Updated:** October 16, 2025  
**Version:** 1.0.0  
**Author:** Restaurant Management Team
