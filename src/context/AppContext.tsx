import React, { createContext, useContext, useEffect, useState } from "react";
import {
  MenuItem,
  Order,
  OrderItem,
  Category,
  Bill,
  KitchenDisplayItem,
  Staff,
  Rating
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

interface AppContextType {
  categories: Category[];
  menuItems: MenuItem[];
  staff: Staff[];
  orders: Order[];
  bills: Bill[];
  kitchenOrders: KitchenDisplayItem[];
  ratings: Rating[];
  
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
    name: 'Grill / BBQ',
    description: 'Grilled and barbecued specialties',
    image: 'https://images.pexels.com/photos/675951/pexels-photo-675951.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '4',
    name: 'Rice Dishes',
    description: 'Rice-based meals',
    image: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '5',
    name: 'Sandwiches & Shawarma',
    description: 'Sandwiches and shawarma wraps',
    image: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '6',
    name: 'Burgers',
    description: 'Juicy burgers',
    image: 'https://images.pexels.com/photos/1639566/pexels-photo-1639566.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '7',
    name: 'Seafood',
    description: 'Fresh seafood dishes',
    image: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '8',
    name: 'Desserts',
    description: 'Sweet endings',
    image: 'https://images.pexels.com/photos/1126728/pexels-photo-1126728.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '9',
    name: 'Beverages',
    description: 'Refreshing drinks',
    image: 'https://images.pexels.com/photos/338713/pexels-photo-338713.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '10',
    name: 'Breakfast',
    description: 'Morning meals',
    image: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [kitchenOrders, setKitchenOrders] = useState<KitchenDisplayItem[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Real-time Firestore listeners
  useEffect(() => {
    // Menu items listener
    const unsubMenuItems = onSnapshot(collection(db, "menuItems"), async (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as MenuItem));
      setMenuItems(items);
      // Removed auto-seeding logic. Menu will stay empty if all items are deleted.
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
          // Removed debug log: Raw bill data
          
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
          
          // Removed debug log: Processed bill
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

    // Ratings listener
    const unsubRatings = onSnapshot(collection(db, "ratings"), (snapshot) => {
      setRatings(
        snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : 
                      typeof data.timestamp === 'string' ? new Date(data.timestamp) : new Date(),
          } as Rating;
        })
      );
    });

    return () => {
      unsubMenuItems();
      unsubStaff();
      unsubOrders();
      unsubBills();
      unsubKitchen();
      unsubRatings();
    };
  }, []);

  const addOrder = async (

    orderData: Omit<Order, "id" | "orderTime">
  ): Promise<string> => {
    const orderTime = new Date();

    // Get the latest order to determine the next order number
    const ref = collection(db, "orders");
    const q = query(ref);
    const snapshot = await getDocs(q);
    let maxOrderNum = 0;
    snapshot.forEach(docSnap => {
      const id = docSnap.id;
      // Check if id matches ORDXXX format
      const match = id.match(/^ORD(\d{3,})$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxOrderNum) maxOrderNum = num;
      }
    });
    const nextOrderNum = maxOrderNum + 1;
    const newOrderId = `ORD${nextOrderNum.toString().padStart(3, "0")}`;

    const newOrder: Omit<Order, "id"> = {
      ...orderData,
      orderTime,
    };
    await setDoc(doc(db, "orders", newOrderId), newOrder);

    // Add to kitchen display if confirmed
    if (orderData.status === "confirmed") {
      const kitchenItem: Omit<KitchenDisplayItem, "orderId"> & {
        orderId: string;
      } = {
        orderId: newOrderId,
        orderNumber: `${newOrderId}`,
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
      await setDoc(doc(db, "kitchenOrders", newOrderId), kitchenItem);
    }
    return newOrderId;
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

  const updateKitchenOrderStatus = async (
    orderId: string,
    status: "pending" | "in-progress" | "ready",
    paused?: boolean
  ) => {
    try {
      // Update kitchen document first
      const ref = doc(db, "kitchenOrders", orderId);
      const updateData: Partial<KitchenDisplayItem> = { status };
      if (paused !== undefined) updateData.paused = paused;
      await updateDoc(ref, updateData as Partial<Record<string, unknown>>);

      // Map kitchen status to order status
      const order = orders.find(o => o.id === orderId);
      if (!order) return; // nothing else to do if not yet in local state

      if (status === 'ready') {
        if (order.paymentStatus === 'paid') {
          await updateOrder(orderId, { status: 'completed', paused: false });
        } else {
          await updateOrder(orderId, { status: 'ready', paused: false });
        }
      } else if (status === 'in-progress') {
        await updateOrder(orderId, { status: 'preparing', paused: false });
      } else if (status === 'pending') {
        // If explicitly paused, reflect that; otherwise revert to confirmed (waiting to start)
        await updateOrder(orderId, { status: paused ? 'confirmed' : 'confirmed', paused: !!paused });
      }
    } catch (err) {
      console.error('Failed to update kitchen/order status:', err);
      try {
        showNotification('Failed to update status. Please retry.', 'error');
      } catch (_) {
        // ignore if notification unavailable
      }
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
      let order = orders.find((o) => o.id === orderId);
      if (!order) {
        // Fetch order directly from Firestore if not found locally
        const orderDoc = await getDocs(query(collection(db, "orders"), where("__name__", "==", orderId)));
        if (!orderDoc.empty) {
          order = { ...orderDoc.docs[0].data(), id: orderId } as Order;
        } else {
          throw new Error(`Order with ID ${orderId} not found`);
        }
      }

      console.log('Generating bill for order:', order);

      const subtotal = order.items.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
      const taxRate = 0.05; // 5% GST
      const taxAmount = subtotal * taxRate;
      const total = subtotal + taxAmount;

      const billData: Omit<Bill, 'id'> = {
        orderId,
        items: order.items,
        subtotal,
        taxRate,
        taxAmount,
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

      // After billing, mark payment paid. Preserve or advance order status logically.
      // If order already reached 'ready' or beyond, move to 'completed'. Otherwise keep its current progress (e.g., confirmed/preparing) but do not regress.
      const currentStatus = order.status;
      let nextStatus: Order['status'] = currentStatus;
      if (['ready', 'completed'].includes(currentStatus)) {
        nextStatus = 'completed';
      }
      await updateOrder(orderId, { paymentStatus: 'paid', status: nextStatus });
      console.log(`Order status updated after payment to ${nextStatus}`);

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
      // Always use only the numeric phone number for auth and Firestore
      let plainPhoneNumber = staffData.phoneNumber.replace(/^(IND|SAU|OMN)-/, "");

      // Check if phone number already exists in staff collection
      const existingStaffQuery = query(
        collection(db, "staff"),
        where("phoneNumber", "==", plainPhoneNumber)
      );
      const existingStaffSnapshot = await getDocs(existingStaffQuery);
      
      if (!existingStaffSnapshot.empty) {
        throw new Error("PHONE_NUMBER_EXISTS");
      }

      // Generate custom staff ID with EMP prefix for all roles
      const prefix = 'EMP';
      
      // Get all existing staff to determine next number
      const staffSnapshot = await getDocs(collection(db, "staff"));
      let maxStaffNum = 0;
      
      staffSnapshot.forEach(docSnap => {
        const id = docSnap.id;
        if (id.startsWith(prefix)) {
          const match = id.match(/^EMP(\d{3,})$/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxStaffNum) maxStaffNum = num;
          }
        }
      });
      
      const nextStaffNum = maxStaffNum + 1;
      const newStaffId = `${prefix}${nextStaffNum.toString().padStart(3, "0")}`;

      // Create Firebase Auth user with the generated email
      const userCredential = await createUserWithEmailAndPassword(auth, staffData.email, staffData.password);
      const uid = userCredential.user.uid;

      // Prepare staff data for Firestore (without password)
      const { password, ...staffWithoutPassword } = staffData;
      const staffDoc = {
        ...staffWithoutPassword,
        phoneNumber: plainPhoneNumber, // Store only numeric phone
        countryCode: staffData.countryCode || "IND", // Store country code separately
        uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save staff to Firestore with custom ID
      await setDoc(doc(db, "staff", newStaffId), staffDoc);
      
      console.log("Staff member created successfully with custom ID:", newStaffId, "and email:", staffData.email);
    } catch (error: any) {
      console.error("Error adding staff:", error);
      
      // Check for specific error types
      if (error.message === "PHONE_NUMBER_EXISTS") {
        throw new Error("PHONE_NUMBER_EXISTS");
      }
      
      // Handle Firebase Auth errors
      if (error.code === "auth/email-already-in-use") {
        throw new Error("PHONE_NUMBER_EXISTS");
      }
      
      if (error.code === "auth/invalid-email") {
        throw new Error("Invalid phone number format");
      }
      
      if (error.code === "auth/weak-password") {
        throw new Error("Password is too weak. Please use at least 6 characters.");
      }
      
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
        ratings,
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