
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
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  updateOrderItemStatus: (orderId: string, itemId: string, status: OrderItem['status']) => void;
  updateKitchenOrderStatus: (orderId: string, status: 'pending' | 'in-progress' | 'ready') => void;
  getOrdersByStatus: (status: Order['status']) => Order[];
  getOrdersByType: (type: Order['type']) => Order[];
  generateBill: (orderId: string, generatedBy: string, paymentMethod: Bill['paymentMethod']) => Bill;
  getTodaysRevenue: () => number;
  getActiveOrders: () => Order[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
}


const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [kitchenOrders, setKitchenOrders] = useState<KitchenDisplayItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);


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
        return {
          ...data,
          id: docSnap.id,
          orderTime: data.orderTime && data.orderTime.toDate ? data.orderTime.toDate() : data.orderTime
        } as unknown as KitchenDisplayItem;
      }));
    });
    const unsubMenu = onSnapshot(collection(db, 'menuItems'), (snapshot) => {
      setMenuItems(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as MenuItem));
    });
    return () => {
      unsubOrders();
      unsubBills();
      unsubKitchen();
      unsubMenu();
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


  const updateOrder = (orderId: string, updates: Partial<Order>) => {
    const ref = doc(db, 'orders', orderId);
    updateDoc(ref, updates);
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

  // Menu CRUD
  const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    await addDoc(collection(db, 'menuItems'), item);
  };
  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    await updateDoc(doc(db, 'menuItems', id), updates);
  };
  const deleteMenuItem = async (id: string) => {
    await updateDoc(doc(db, 'menuItems', id), { deleted: true }); // Soft delete, or use deleteDoc for hard delete
  };

  return (
    <AppContext.Provider value={{
      categories: [], // You can fetch categories from Firestore similarly if needed
      menuItems,
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
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
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