export interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "waiter" | "kitchen" | "admin";
  tableNumber?: string;
}

export interface Notification {
  id: string;
  message: string;
  type: "success" | "error";
  timestamp: Date;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  prepTime: number; // in minutes
}

export interface OrderItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
  sugarPreference?: "sugar" | "sugarless"; // For beverage items
  spicyPreference?: "spicy" | "non-spicy"; // For main course items
  status: "pending" | "preparing" | "ready" | "served";
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  type: "dine-in" | "delivery";
  tableNumber?: string;
  items: OrderItem[];
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "completed"
    | "cancelled";
  total: number;
  tax: number;
  grandTotal: number;
  paymentMethod?: "cash" | "card" | "online" | "upi";
  paymentStatus: "pending" | "paid" | "partial" | "refunded";
  deliveryStatus?: "pending" | "delivered"; // Track if order has been delivered to customer
  orderTime: Date | string | { toDate: () => Date };
  completedTime?: Date;
  waiterId?: string;
  estimatedTime?: number; // in minutes
  draft?: boolean; // indicates if the order is a draft
  paused?: boolean; // Track if the order was paused from kitchen
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface Bill {
  id: string;
  orderId: string;
  items: OrderItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  serviceCharge?: number;
  discount?: number;
  total: number;
  generatedAt: Date | string | { toDate: () => Date };
  generatedBy: string;
  paymentMethod: "cash" | "card" | "online" | "upi";
  customerDetails: {
    name: string;
    phone: string;
    address?: string;
    tableNumber?: string;
  };
}

export interface KitchenDisplayItem {
  orderId: string;
  orderNumber: string;
  tableNumber?: string;
  customerName: string;
  items: OrderItem[];
  orderTime: Date;
  estimatedTime: number;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "ready";
  paused?: boolean; // Track if the order was paused and moved back to pending
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: "waiter" | "kitchen" | "admin" | "manager";
  isFrozen: boolean;
  dateJoined: string;
  password?: string; // Only used during creation, not stored in Firestore
  uid?: string; // Firebase Auth UID
  createdAt?: Date;
  updatedAt?: Date;
}
