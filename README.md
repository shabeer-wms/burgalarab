# 🍽️ Restaurant Management System

A comprehensive, modern restaurant management system built with React, TypeScript, and Firebase. This application provides role-based dashboards for customers, waiters, kitchen staff, and administrators to streamline restaurant operations.

## ✨ Features

### 🎯 Multi-Role Dashboard System
- **Customer Dashboard**: Browse menu, place orders, and manage cart
- **Waiter Dashboard**: Take orders, manage tables, process payments
- **Kitchen Dashboard**: Real-time order management with kitchen display system
- **Admin Dashboard**: Complete restaurant oversight and management

### 🛍️ Order Management
- **Real-time Order Processing**: Live updates across all interfaces
- **Order Status Tracking**: From pending to completed with detailed status updates
- **Table Management**: Dine-in table assignment and tracking
- **Delivery Support**: Address management and delivery order processing
- **Kitchen Notes**: Special instructions and customizations

### 📋 Menu Management
- **Dynamic Menu System**: Add, edit, and manage menu items
- **Category Organization**: Appetizers, Main Course, Desserts, Beverages
- **Availability Control**: Real-time item availability management
- **Pricing Management**: Dynamic price updates
- **Preparation Time Tracking**: Kitchen efficiency monitoring

### 👥 Staff Management
- **Role-Based Access Control**: Customer, Waiter, Kitchen, Admin roles
- **Staff Registration**: Add and manage restaurant staff
- **Attendance Tracking**: Monitor staff presence
- **Performance Analytics**: Revenue and order tracking per staff member

### 🏨 Kitchen Display System
- **Real-time Order Display**: Live kitchen dashboard with order queue
- **Status Management**: In-progress, ready, completed order states
- **Timer Integration**: Preparation time monitoring
- **Item-level Tracking**: Individual menu item status updates
- **Visual Organization**: Color-coded priority system

### 💰 Billing & Payments
- **Automated Bill Generation**: PDF bill creation and printing
- **Multiple Payment Methods**: Cash, Card, Online, COD support
- **Tax Calculation**: Automatic tax computation
- **Receipt Management**: Digital receipt generation
- **Payment Status Tracking**: Pending, Paid, Refunded states

### 📊 Analytics & Reporting
- **Revenue Tracking**: Daily, weekly, monthly revenue reports
- **Order Analytics**: Order volume and trend analysis
- **Menu Performance**: Popular items and category insights
- **Staff Performance**: Individual performance metrics

## 🚀 Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful SVG icons
- **Vite** - Fast build tool and development server

### Backend & Database
- **Firebase** - Real-time database and authentication
- **Firestore** - NoSQL document database for real-time updates

### Development Tools
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

### Additional Libraries
- **file-saver** - File download functionality
- **qrcode.react** - QR code generation for orders
- **xlsx** - Excel export functionality
- **@fontsource/inter** - Modern typography

## 📱 User Roles & Permissions

### 🛒 Customer
- Browse menu by categories
- Add items to cart with customizations
- Place dine-in or delivery orders
- Track order status
- Make payments

### 👨‍💼 Waiter
- Take customer orders
- Manage table assignments
- Update order status
- Process payments and generate bills
- View daily revenue and statistics

### 👨‍🍳 Kitchen Staff
- View incoming orders in real-time
- Update order preparation status
- Manage individual item completion
- Kitchen timer integration
- Priority-based order management

### 🔧 Administrator
- Complete system oversight
- Manage menu items and categories
- Staff management and registration
- Order management and editing
- Analytics and reporting
- System configuration

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/restaurant-management.git
cd restaurant-management
```

2. **Install dependencies**
```bash
npm install
```

3. **Firebase Configuration**
Create a `src/firebase.ts` file with your Firebase configuration:
```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

4. **Start the development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
```

## 🎮 Usage

### Demo Login Credentials
The system includes demo accounts for testing:

- **Customer**: `customer@demo.com`
- **Waiter**: `waiter@demo.com`  
- **Kitchen**: `kitchen@demo.com`
- **Admin**: `admin@demo.com`

### Getting Started
1. Access the application through your web browser
2. Select your role from the login screen
3. Use the appropriate demo credentials
4. Explore the role-specific dashboard and features

### Customer Workflow
1. Browse the menu by category
2. Add desired items to cart
3. Choose order type (dine-in/delivery)
4. Fill in customer details
5. Complete payment and track order

### Staff Workflow
1. **Waiter**: Take orders → Submit to kitchen → Process payments
2. **Kitchen**: Receive orders → Update preparation status → Mark ready
3. **Admin**: Monitor all operations → Manage staff → Analyze performance

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── admin/           # Admin dashboard components
│   ├── customer/        # Customer interface components
│   ├── kitchen/         # Kitchen display system
│   ├── staff/           # Staff management components
│   ├── waiter/          # Waiter dashboard components
│   ├── Layout.tsx       # Main layout wrapper
│   └── Login.tsx        # Authentication component
├── context/             # React context providers
│   ├── AppContext.tsx   # Application state management
│   └── AuthContext.tsx  # Authentication context
├── types/               # TypeScript type definitions
│   └── index.ts         # Core type definitions
├── firebase.ts          # Firebase configuration
├── App.tsx              # Main application component
└── main.tsx             # Application entry point
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Tailwind Configuration
The project uses a custom Tailwind configuration with:
- Material Design color palette
- Custom typography scale
- Responsive breakpoints
- Component utilities

## 🧪 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Known Issues & Troubleshooting

### Common Issues
- **Firebase Connection**: Ensure Firebase configuration is correct
- **Build Errors**: Check TypeScript types and dependencies
- **Performance**: Large menu datasets may require pagination

### Performance Optimization
- Menu items are cached locally
- Real-time updates are optimized for specific collections
- Images are lazy-loaded for better performance

## 🔮 Future Enhancements

- [ ] Mobile app development (React Native)
- [ ] Advanced analytics dashboard
- [ ] Integration with POS systems
- [ ] Multi-restaurant support
- [ ] Inventory management
- [ ] Loyalty program integration
- [ ] Online payment gateway integration
- [ ] Push notifications
- [ ] Offline mode support
- [ ] Multi-language support

## 🏆 Acknowledgments

- React team for the amazing framework
- Firebase team for real-time database solutions
- Tailwind CSS for the utility-first approach
- Lucide for beautiful icons
- All contributors who helped improve this project

---

**Built with ❤️ for the restaurant industry**
