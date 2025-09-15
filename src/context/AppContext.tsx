
import React, { createContext, useContext, useEffect, useState } from 'react';
import { MenuItem, Order, OrderItem, Category, Bill, KitchenDisplayItem } from '../types';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  where,
  getDocs,
  setDoc
} from 'firebase/firestore';

interface AppContextType {
  categories: Category[];
  menuItems: MenuItem[];
  orders: Order[];
  bills: Bill[];
  kitchenOrders: KitchenDisplayItem[];
  addOrder: (order: Omit<Order, 'id' | 'orderTime'>) => string;
  updateOrder: (orderId: string, updates: Partial<Order>) => Promise<void>;
  updateOrderItemStatus: (orderId: string, itemId: string, status: OrderItem['status']) => void;
  updateKitchenOrderStatus: (orderId: string, status: 'pending' | 'in-progress' | 'ready') => void;
  getOrdersByStatus: (status: Order['status']) => Order[];
  getOrdersByType: (type: Order['type']) => Order[];
  generateBill: (orderId: string, generatedBy: string, paymentMethod: Bill['paymentMethod']) => Bill;
  getTodaysRevenue: () => number;
  getActiveOrders: () => Order[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock data
const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Appetizers',
    description: 'Start your meal right',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '2',
    name: 'Main Course',
    description: 'Hearty and delicious',
    image: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '3',
    name: 'Desserts',
    description: 'Sweet endings',
    image: 'https://images.pexels.com/photos/1126728/pexels-photo-1126728.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '4',
    name: 'Beverages',
    description: 'Refreshing drinks',
    image: 'https://images.pexels.com/photos/338713/pexels-photo-338713.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];

const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Chicken Wings',
    description: 'Spicy buffalo wings with ranch dressing',
    price: 12.99,
    category: 'Appetizers',
    image: 'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: true,
    prepTime: 15
  },
  {
    id: '2',
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with parmesan and croutons',
    price: 9.99,
    category: 'Appetizers',
    image: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: true,
    prepTime: 10
  },
  {
    id: '3',
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon with seasonal vegetables',
    price: 24.99,
    category: 'Main Course',
    image: 'https://images.pexels.com/photos/725992/pexels-photo-725992.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: true,
    prepTime: 25
  },
  {
    id: '4',
    name: 'Beef Steak',
    description: 'Premium ribeye steak cooked to perfection',
    price: 32.99,
    category: 'Main Course',
    image: 'https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: true,
    prepTime: 30
  },
  {
    id: '5',
    name: 'Chocolate Cake',
    description: 'Rich chocolate cake with vanilla ice cream',
    price: 7.99,
    category: 'Desserts',
    image: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: true,
    prepTime: 5
  },
  {
    id: '6',
    name: 'Fresh Juice',
    description: 'Freshly squeezed orange juice',
    price: 4.99,
    category: 'Beverages',
    image: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=400',
    available: true,
    prepTime: 3
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [orders, setOrders] = useState<Order[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [kitchenOrders, setKitchenOrders] = useState<KitchenDisplayItem[]>([]);

  // Real-time Firestore listeners
  useEffect(() => {
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Order));
    });
    const unsubBills = onSnapshot(collection(db, 'bills'), (snapshot) => {
      setBills(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Bill));
    });
    const unsubKitchen = onSnapshot(collection(db, 'kitchenOrders'), (snapshot) => {
      setKitchenOrders(snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        // Firestore stores dates as Timestamps, convert if needed
        return {
          ...data,
          id: docSnap.id,
          orderTime: data.orderTime && data.orderTime.toDate ? data.orderTime.toDate() : data.orderTime
        } as unknown as KitchenDisplayItem;
      }));
    });
    return () => {
      unsubOrders();
      unsubBills();
      unsubKitchen();
    };
  }, []);


  const addOrder = (orderData: Omit<Order, 'id' | 'orderTime'>): string => {
    const orderTime = new Date();
    const newOrder: Omit<Order, 'id'> = {
      ...orderData,
      orderTime,
    };
    const ref = collection(db, 'orders');
    addDoc(ref, newOrder).then((docRef) => {
      // Add to kitchen display if confirmed
      if (orderData.status === 'confirmed') {
        const kitchenItem: Omit<KitchenDisplayItem, 'orderId'> & { orderId: string } = {
          orderId: docRef.id,
          orderNumber: `#${docRef.id.slice(-4)}`,
          tableNumber: orderData.tableNumber,
          customerName: orderData.customerName,
          items: orderData.items,
          orderTime,
          estimatedTime: orderData.estimatedTime || 30,
          priority: orderData.type === 'dine-in' ? 'high' : 'medium',
          status: 'pending',
          kitchenNotes: orderData.kitchenNotes,
        };
        setDoc(doc(db, 'kitchenOrders', docRef.id), kitchenItem);
      }
    });
    // Return a placeholder, actual id will be from Firestore
    return '';
  };


  const updateOrder = async (orderId: string, updates: Partial<Order>) => {
    const ref = doc(db, 'orders', orderId);
    await updateDoc(ref, updates);
  };


  const updateOrderItemStatus = async (orderId: string, itemId: string, status: OrderItem['status']) => {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDocs(query(collection(db, 'orders'), where('__name__', '==', orderId)));
    if (!orderSnap.empty) {
      const order = orderSnap.docs[0].data() as Order;
      const updatedItems = order.items.map(item =>
        item.id === itemId ? { ...item, status } : item
      );
      updateDoc(orderRef, { items: updatedItems });
    }
  };


  const updateKitchenOrderStatus = (orderId: string, status: 'pending' | 'in-progress' | 'ready') => {
    const ref = doc(db, 'kitchenOrders', orderId);
    updateDoc(ref, { status });
    // Update main order status
    if (status === 'ready') {
      updateOrder(orderId, { status: 'ready' });
    } else if (status === 'in-progress') {
      updateOrder(orderId, { status: 'preparing' });
    }
  };


  const getOrdersByStatus = (status: Order['status']) => {
    return orders.filter(order => order.status === status);
  };


  const getOrdersByType = (type: Order['type']) => {
    return orders.filter(order => order.type === type);
  };


  const generateBill = (orderId: string, generatedBy: string, paymentMethod: Bill['paymentMethod']): Bill => {
    const order = orders.find(o => o.id === orderId);
    if (!order) throw new Error('Order not found');

    const subtotal = order.items.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
    const taxRate = 0.18; // 18% GST
    const taxAmount = subtotal * taxRate;
    const serviceCharge = subtotal * 0.1; // 10% service charge
    const total = subtotal + taxAmount + serviceCharge;

    const bill: Omit<Bill, 'id'> = {
      orderId,
      items: order.items,
      subtotal,
      taxRate,
      taxAmount,
      serviceCharge,
      total,
      generatedAt: new Date(),
      generatedBy,
      paymentMethod,
      customerDetails: {
        name: order.customerName,
        phone: order.customerPhone,
        address: order.customerAddress,
        tableNumber: order.tableNumber,
      },
    };

    addDoc(collection(db, 'bills'), bill);
    updateOrder(orderId, { paymentStatus: 'paid', status: 'completed' });
    return { ...bill, id: '' } as Bill;
  };

  const getTodaysRevenue = (): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return bills
      .filter(bill => bill.generatedAt >= today)
      .reduce((sum, bill) => sum + bill.total, 0);
  };

  const getActiveOrders = (): Order[] => {
    return orders.filter(order => 
      ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
    );
  };

  return (
    <AppContext.Provider value={{
      categories: mockCategories,
      menuItems: mockMenuItems,
      orders,
      bills,
      kitchenOrders,
      addOrder,
      updateOrder,
      updateOrderItemStatus,
      updateKitchenOrderStatus,
      getOrdersByStatus,
      getOrdersByType,
      generateBill,
      getTodaysRevenue,
      getActiveOrders,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};