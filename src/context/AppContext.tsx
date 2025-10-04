import React, { createContext, useContext, useEffect, useState } from "react";
import {
  MenuItem,
  Order,
  OrderItem,
  Category,
  Bill,
  KitchenDisplayItem,
  Staff
} from "../types";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  where,
  getDocs,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { seedMenuItems } from "../utils/seedMenuItems";

interface AppContextType {
  categories: Category[];
  menuItems: MenuItem[];
  staff: Staff[];
  orders: Order[];
  bills: Bill[];
  kitchenOrders: KitchenDisplayItem[];
  
  // Notification system
  notification: { message: string; type: "success" | "error" } | null;
  showNotification: (message: string, type: "success" | "error") => void;
  hideNotification: () => void;

  // Menu management functions
  addMenuItem: (menuItem: Omit<MenuItem, "id">) => Promise<void>;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;

  // Staff management functions
  addStaff: (staff: Omit<Staff, "id" | "uid"> & { password: string }) => Promise<void>;
  updateStaff: (id: string, updates: any) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  authenticateStaff: (phoneOrEmail: string, password: string) => Promise<Staff | null>;

  addOrder: (order: Omit<Order, "id" | "orderTime">) => Promise<string>;
  updateOrder: (orderId: string, updates: Partial<Order>) => Promise<void>;

  updateOrderItemStatus: (
    orderId: string,
    itemId: string,
    status: OrderItem["status"]
  ) => void;
  updateKitchenOrderStatus: (
    orderId: string,
    status: "pending" | "in-progress" | "ready",
    paused?: boolean
  ) => void;
  getOrdersByStatus: (status: Order["status"]) => Order[];
  getOrdersByType: (type: Order["type"]) => Order[];
  generateBill: (
    orderId: string,
    generatedBy: string,
    paymentMethod: Bill["paymentMethod"]
  ) => Promise<Bill>;
  getTodaysRevenue: () => number;
  getActiveOrders: () => Order[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Default categories
const defaultCategories: Category[] = [
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [kitchenOrders, setKitchenOrders] = useState<KitchenDisplayItem[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Real-time Firestore listeners
  useEffect(() => {
    // Menu items listener
    const unsubMenuItems = onSnapshot(collection(db, "menuItems"), async (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as MenuItem));
      setMenuItems(items);
      
      // If no menu items exist, seed with sample data
      if (items.length === 0) {
        console.log("No menu items found, seeding with sample data...");
        try {
          await seedMenuItems();
        } catch (error) {
          console.error("Error seeding menu items:", error);
        }
      }
    });

    // Staff listener
    const unsubStaff = onSnapshot(collection(db, "staff"), (snapshot) => {
      setStaff(
        snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Staff))
      );
    });

    const unsubOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      setOrders(
        snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Order))
      );
    });
    const unsubBills = onSnapshot(collection(db, "bills"), (snapshot) => {
      const processedBills = snapshot.docs.map((doc) => {
        try {
          const data = doc.data();
          console.log("Raw bill data:", doc.id, data);
          
          // Ensure all required fields have default values
          const processedBill = {
            id: doc.id,
            orderId: data.orderId || 'unknown',
            items: data.items || [],
            subtotal: data.subtotal || 0,
            taxRate: data.taxRate || 0,
            taxAmount: data.taxAmount || 0,
            serviceCharge: data.serviceCharge || 0,
            total: data.total || 0,
            generatedAt: data.generatedAt?.toDate ? data.generatedAt.toDate() : 
                      typeof data.generatedAt === 'string' ? new Date(data.generatedAt) : new Date(),
            generatedBy: data.generatedBy || 'unknown',
            paymentMethod: data.paymentMethod || 'cash',
            customerDetails: {
              name: data.customerDetails?.name || 'Unknown',
              phone: data.customerDetails?.phone || 'N/A',
              address: data.customerDetails?.address,
              tableNumber: data.customerDetails?.tableNumber
            }
          };
          
          console.log("Processed bill:", processedBill);
          return processedBill as Bill;
        } catch (error) {
          console.error("Error processing bill:", doc.id, error);
          // Return a minimal valid bill to prevent app crashes
          return {
            id: doc.id,
            orderId: 'error',
            items: [],
            subtotal: 0,
            taxRate: 0,
            taxAmount: 0,
            total: 0,
            generatedAt: new Date(),
            generatedBy: 'error',
            paymentMethod: 'cash',
            customerDetails: {
              name: 'Error processing bill',
              phone: 'N/A'
            }
          } as Bill;
        }
      });
      
      setBills(processedBills);
    });
    const unsubKitchen = onSnapshot(
      collection(db, "kitchenOrders"),
      (snapshot) => {
        setKitchenOrders(
          snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            // Firestore stores dates as Timestamps, convert if needed
            return {
              ...data,
              id: docSnap.id,
              orderTime:
                data.orderTime && data.orderTime.toDate
                  ? data.orderTime.toDate()
                  : data.orderTime,
            } as unknown as KitchenDisplayItem;
          })
        );
      }
    );
    return () => {
      unsubMenuItems();
      unsubStaff();
      unsubOrders();
      unsubBills();
      unsubKitchen();
    };
  }, []);

  const addOrder = async (
    orderData: Omit<Order, "id" | "orderTime">
  ): Promise<string> => {
    const orderTime = new Date();
    const newOrder: Omit<Order, "id"> = {
      ...orderData,
      orderTime,
    };
    const ref = collection(db, "orders");
    const docRef = await addDoc(ref, newOrder);
    // Add to kitchen display if confirmed
    if (orderData.status === "confirmed") {
      const kitchenItem: Omit<KitchenDisplayItem, "orderId"> & {
        orderId: string;
      } = {
        orderId: docRef.id,
        orderNumber: `#${docRef.id.slice(-4)}`,
        customerName: orderData.customerName,
        items: orderData.items,
        orderTime,
        estimatedTime: orderData.estimatedTime || 30,
        priority: orderData.type === "dine-in" ? "high" : "medium",
        status: "pending",
      };
      
      // Add optional fields only if they have values
      if (orderData.tableNumber) {
        kitchenItem.tableNumber = orderData.tableNumber;
      }
      
      if (orderData.kitchenNotes) {
        kitchenItem.kitchenNotes = orderData.kitchenNotes;
      }
      
      await setDoc(doc(db, "kitchenOrders", docRef.id), kitchenItem);
    }
    return docRef.id;
  };


  const updateOrder = async (orderId: string, updates: Partial<Order>) => {
    const ref = doc(db, 'orders', orderId);
    await updateDoc(ref, updates);
  };

  const updateOrderItemStatus = async (
    orderId: string,
    itemId: string,
    status: OrderItem["status"]
  ) => {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDocs(
      query(collection(db, "orders"), where("__name__", "==", orderId))
    );
    if (!orderSnap.empty) {
      const order = orderSnap.docs[0].data() as Order;
      const updatedItems = order.items.map((item) =>
        item.id === itemId ? { ...item, status } : item
      );
      updateDoc(orderRef, { items: updatedItems });
    }
  };

  const updateKitchenOrderStatus = (
    orderId: string,
    status: "pending" | "in-progress" | "ready",
    paused?: boolean
  ) => {
    // Use a properly typed partial of KitchenDisplayItem so lint rules don't flag `any`
    const updateData: Partial<KitchenDisplayItem> = { status };
    if (paused !== undefined) {
      updateData.paused = paused;
    }

    const ref = doc(db, "kitchenOrders", orderId);
    updateDoc(ref, updateData as Partial<Record<string, unknown>>);
    
    // Update main order status based on kitchen status
    if (status === 'ready') {
      // Check if payment is already made for this order
      const order = orders.find(o => o.id === orderId);
      if (order?.paymentStatus === 'paid') {
        // If payment is already made, mark as completed
        updateOrder(orderId, { status: 'completed', paused: false });
      } else {
        // If payment is pending, mark as ready
        updateOrder(orderId, { status: 'ready', paused: false });
      }
    } else if (status === 'in-progress') {
      updateOrder(orderId, { status: 'preparing', paused: false });
    } else if (status === 'pending' && paused) {
      // When paused, change main order status back to confirmed and mark as paused
      updateOrder(orderId, { status: 'confirmed', paused: true });
    }
  };


  const getOrdersByStatus = (status: Order["status"]) => {
    return orders.filter((order) => order.status === status);
  };


  const getOrdersByType = (type: Order["type"]) => {
    return orders.filter((order) => order.type === type);
  };


  const generateBill = async (
    orderId: string,
    generatedBy: string,
    paymentMethod: Bill["paymentMethod"]
  ): Promise<Bill> => {
    try {
      const order = orders.find((o) => o.id === orderId);
      if (!order) {
        throw new Error(`Order with ID ${orderId} not found`);
      }

      console.log('Generating bill for order:', order);

      const subtotal = order.items.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
      const taxRate = 0.18; // 18% GST
      const taxAmount = subtotal * taxRate;
      const serviceCharge = subtotal * 0.1; // 10% service charge
      const total = subtotal + taxAmount + serviceCharge;

      const billData: Omit<Bill, 'id'> = {
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
        },
      };

      // Add optional fields only if they have values
      if (order.customerAddress) {
        billData.customerDetails.address = order.customerAddress;
      }
      
      if (order.tableNumber) {
        billData.customerDetails.tableNumber = order.tableNumber;
      }

      console.log('Bill data to be saved:', billData);

      // Add bill to Firebase
      const billRef = await addDoc(collection(db, 'bills'), billData);
      console.log('Bill saved with ID:', billRef.id);

      // Update order status to confirmed so it goes to kitchen
      await updateOrder(orderId, { paymentStatus: 'paid', status: 'confirmed' });
      console.log('Order status updated to confirmed - sent to kitchen');

      // Also update kitchen order status to confirmed for kitchen display
      try {
        const kitchenRef = doc(db, "kitchenOrders", orderId);
        await updateDoc(kitchenRef, { status: 'confirmed' });
        console.log('Kitchen order status updated to confirmed');
      } catch (kitchenError) {
        console.log('Kitchen order may not exist or already updated:', kitchenError);
      }

      const completeBill: Bill = { ...billData, id: billRef.id };
      return completeBill;
    } catch (error) {
      console.error('Error generating bill:', error);
      throw new Error(`Failed to generate bill: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getTodaysRevenue = (): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return bills
      .filter((bill) => bill.generatedAt >= today)
      .reduce((sum, bill) => sum + bill.total, 0);
  };

  const getActiveOrders = (): Order[] => {
    return orders.filter(order => 
      ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
    );
  };

  // Menu management functions
  const addMenuItem = async (menuItemData: Omit<MenuItem, "id">): Promise<void> => {
    try {
      const menuItem = {
        ...menuItemData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDoc(collection(db, "menuItems"), menuItem);
    } catch (error) {
      console.error("Error adding menu item:", error);
      throw error;
    }
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>): Promise<void> => {
    try {
      const updateData = { ...updates, updatedAt: new Date() };
      await updateDoc(doc(db, "menuItems", id), updateData);
    } catch (error) {
      console.error("Error updating menu item:", error);
      throw error;
    }
  };

  const deleteMenuItem = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "menuItems", id));
    } catch (error) {
      console.error("Error deleting menu item:", error);
      throw error;
    }
  };

  // Staff management functions
  const addStaff = async (staffData: Omit<Staff, "id" | "uid"> & { password: string }): Promise<void> => {
    try {
      // Create Firebase Auth user with the generated email
      const userCredential = await createUserWithEmailAndPassword(auth, staffData.email, staffData.password);
      const uid = userCredential.user.uid;

      // Prepare staff data for Firestore (without password)
      const { password, ...staffWithoutPassword } = staffData;
      const staffDoc = {
        ...staffWithoutPassword,
        uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save staff to Firestore
      await addDoc(collection(db, "staff"), staffDoc);
      
      console.log("Staff member created successfully with auto-generated email:", staffData.email);
    } catch (error) {
      console.error("Error adding staff:", error);
      throw error;
    }
  };

  const updateStaff = async (id: string, updates: any): Promise<void> => {
    try {
      const { phoneChanged, oldEmail, ...staffUpdates } = updates;
      
      // If phone number changed, we need to update Firebase Auth email as well
      if (phoneChanged && oldEmail && staffUpdates.email) {
        // Find the staff member's Firebase Auth user and update email
        const staffMember = staff.find(s => s.id === id);
        if (staffMember?.uid) {
          try {
            // Note: In a real app, you'd need to handle this differently since
            // updateEmail requires the user to be currently signed in.
            // This is a simplified approach - in production, you might need
            // to delete the old user and create a new one, or use Admin SDK
            console.log(`Phone changed: updating email from ${oldEmail} to ${staffUpdates.email}`);
            
            // Update Firestore first
            const updateData = { ...staffUpdates, updatedAt: new Date() };
            await updateDoc(doc(db, "staff", id), updateData);
            
            console.log("Staff email updated in Firestore for phone change");
          } catch (authError) {
            console.error("Error updating Firebase Auth email:", authError);
            // Still update Firestore even if Auth update fails
            const updateData = { ...staffUpdates, updatedAt: new Date() };
            await updateDoc(doc(db, "staff", id), updateData);
          }
        }
      } else {
        const updateData = { ...staffUpdates, updatedAt: new Date() };
        await updateDoc(doc(db, "staff", id), updateData);
      }
    } catch (error) {
      console.error("Error updating staff:", error);
      throw error;
    }
  };

  const deleteStaff = async (id: string): Promise<void> => {
    try {
      // Find the staff member to get their UID
      const staffMember = staff.find(s => s.id === id);
      
      // Delete from Firestore first
      await deleteDoc(doc(db, "staff", id));
      
      // Also delete from Firebase Auth if UID exists
      if (staffMember?.uid) {
        try {
          // Note: In a real production app, you'd need Firebase Admin SDK to delete users
          // This is a simplified approach - the user account will remain in Auth
          // but won't be able to access the system since Firestore record is deleted
          console.log(`Staff member deleted from Firestore. Auth UID ${staffMember.uid} should be cleaned up with Admin SDK.`);
        } catch (authError) {
          console.error("Error deleting from Firebase Auth:", authError);
        }
      }
      
      console.log("Staff member deleted successfully");
      
    } catch (error) {
      console.error("Error deleting staff:", error);
      throw error;
    }
  };

  const authenticateStaff = async (phoneOrEmail: string, password: string): Promise<Staff | null> => {
    try {
      // Check if input looks like a phone number (digits only or digits with common separators)
      const isPhoneNumber = /^[\d\s\-\(\)\+]+$/.test(phoneOrEmail.trim());
      
      let emailToUse = phoneOrEmail;
      if (isPhoneNumber) {
        // Clean phone number (remove spaces, dashes, etc.) and convert to email format
        const cleanPhone = phoneOrEmail.replace(/[\s\-\(\)\+]/g, '');
        emailToUse = `${cleanPhone}@gmail.com`;
      }

      // Sign in with Firebase Auth using the email (generated or provided)
      const userCredential = await signInWithEmailAndPassword(auth, emailToUse, password);
      const uid = userCredential.user.uid;

      // Find the staff member in Firestore
      const staffMember = staff.find(s => s.uid === uid);
      
      if (staffMember) {
        // Check if the user is frozen
        if (staffMember.isFrozen) {
          throw new Error("Account is frozen. Please contact administrator.");
        }
        return staffMember;
      } else {
        throw new Error("Staff member not found in database");
      }
    } catch (error) {
      console.error("Error authenticating staff:", error);
      return null;
    }
  };

  // Notification functions
  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  return (
    <AppContext.Provider value={{
        categories: defaultCategories,
        menuItems,
        staff,
        orders,
        bills,
        kitchenOrders,
        notification,
        showNotification,
        hideNotification,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        addStaff,
        updateStaff,
        deleteStaff,
        authenticateStaff,
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
};export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};