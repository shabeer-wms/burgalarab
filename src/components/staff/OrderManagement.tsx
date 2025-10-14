import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { MenuItem, OrderItem, Order } from '../../types';

import { Plus, Minus, X, Search, CreditCard, Banknote, Smartphone, Globe, Receipt, Loader2, Printer } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';


interface OrderManagementProps {
  tableNumber?: string;
  setSelectedTable?: React.Dispatch<React.SetStateAction<string>>;
  onCartUpdate?: (items: OrderItem[]) => void;
  onFunctionsUpdate?: (functions: {
    sendToKitchen: () => void;
    payNow: () => void;
    payLater: () => void;
    clearCart: () => void;
    updateQuantity: (itemId: string, change: number) => void;
    updateSpecialInstructions: (itemId: string, instructions: string) => void;
    updateSugarPreference: (itemId: string, preference: "sugar" | "sugarless") => void;
    updateSpicyPreference: (itemId: string, preference: "spicy" | "non-spicy") => void;
    validateCustomerDetails: () => boolean;
  }) => void;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ 
  tableNumber, 
  setSelectedTable, 
  onCartUpdate, 
  onFunctionsUpdate 
}) => {
  const { menuItems, categories, addOrder, generateBill, showNotification } = useApp();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    vehicleNumber: '',
  });
  const [orderType, setOrderType] = useState<'dine-in' | 'delivery'>('dine-in');




  const [qrForOrderId, setQrForOrderId] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const getItemsPerPage = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      // Tablet devices and iPad Pro: 768px to 1279px (md to lg breakpoints)
      if (width >= 768 && width < 1280) {
        return 9;
      }
      // Desktop and larger: 1280px and above - New Order page shows 10 cards
      return 10;
    }
    return 8;
  };
  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage());

  // Payment dialog states
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPaymentMethodDialog, setShowPaymentMethodDialog] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'card' | 'upi' | 'online'>('cash');
  
  // Function to get payment icon
  const getPaymentIcon = (method: 'cash' | 'card' | 'upi' | 'online') => {
    switch (method) {
      case 'cash': return <Banknote className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'upi': return <Smartphone className="w-4 h-4" />;
      case 'online': return <Globe className="w-4 h-4" />;
      default: return <Banknote className="w-4 h-4" />;
    }
  };
  
  // Format date for bill
  const formatDate = (date: Date | string | { toDate: () => Date }) => {
    let dateObj: Date;
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'object' && date !== null && 'toDate' in date) {
      dateObj = (date as { toDate: () => Date }).toDate();
    } else {
      dateObj = new Date(date as string);
    }
    return dateObj.toLocaleDateString();
  };
  
  // Format time for bill
  const formatTime = (date: Date | string | { toDate: () => Date }) => {
    let dateObj: Date;
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'object' && date !== null && 'toDate' in date) {
      dateObj = (date as { toDate: () => Date }).toDate();
    } else {
      dateObj = new Date(date as string);
    }
    return dateObj.toLocaleTimeString();
  };
  
  // Generate bill HTML for printing
  const generateBillHTML = (bill: any) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill - ${bill.id}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .total { border-top: 1px solid #000; padding-top: 10px; margin-top: 10px; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Hotel Management</h2>
          <p>Bill No: ${bill.id}</p>
          <p>Date: ${formatDate(bill.generatedAt)}</p>
          <p>Time: ${formatTime(bill.generatedAt)}</p>
        </div>
        
        <div>
          <p><strong>Customer:</strong> ${bill.customerDetails?.name || 'N/A'}</p>
          <p><strong>Phone:</strong> ${bill.customerDetails?.phone || 'N/A'}</p>
          ${bill.customerDetails?.tableNumber ? `<p><strong>Table:</strong> ${bill.customerDetails.tableNumber}</p>` : ''}
        </div>
        
        <div style="margin: 20px 0;">
          <h3>Items</h3>
          ${bill.items.map((item: any) => `
            <div class="item">
              <span>${item.quantity} x ${item.menuItem.name}</span>
              <span>$${(item.menuItem.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
          
          <div style="border-top: 1px solid #ddd; margin-top: 10px; padding-top: 10px;">
            <div class="item">
              <span>Subtotal</span>
              <span>$${bill.subtotal.toFixed(2)}</span>
            </div>
            ${bill.serviceCharge ? `
            <div class="item">
              <span>Service Charge (10%)</span>
              <span>$${bill.serviceCharge.toFixed(2)}</span>
            </div>` : ''}
            <div class="item">
              <span>Tax (18%)</span>
              <span>$${bill.taxAmount.toFixed(2)}</span>
            </div>
            <div class="total">
              <span>Total</span>
              <span>$${bill.total.toFixed(2)}</span>
            </div>
            <div class="item" style="margin-top: 10px;">
              <span>Payment Method</span>
              <span style="text-transform: uppercase;">${bill.paymentMethod}</span>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for dining with us!</p>
          <p>Generated by: ${bill.generatedBy}</p>
        </div>
      </body>
      </html>
    `;
  };
  
  // Function to print the bill
  const printBill = (bill: any) => {
    const billContent = generateBillHTML(bill);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(billContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const [selectedTableState, setSelectedTableState] = useState<string>(tableNumber || '');
  const selectedTable = tableNumber || selectedTableState;
  const updateSelectedTable = setSelectedTable || setSelectedTableState;
  const [showTablePicker, setShowTablePicker] = useState(false);





  // Update cart in waiter dashboard
  useEffect(() => {
    if (onCartUpdate) {
      onCartUpdate(orderItems);
    }
  }, [orderItems, onCartUpdate]);

  // Responsive items per page - 9 for tablets/iPad Pro, 10 for desktop
  useEffect(() => {
    const handleResize = () => setItemsPerPage(getItemsPerPage());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm]);

  // Update cart functions in waiter dashboard
  useEffect(() => {
    // Expose up-to-date cart/order helper functions to parent (WaiterDashboard)
    if (onFunctionsUpdate) {
      onFunctionsUpdate({
        sendToKitchen: pushToKitchen,
        payNow: async () => {
          await handlePaymentOptionSelected('now');
        },
        payLater: async () => {
          await handlePaymentOptionSelected('later');
        },
        clearCart: () => {
          setOrderItems([]);
        },
        updateQuantity,
        updateSpecialInstructions,
        updateSugarPreference,
        updateSpicyPreference,
        validateCustomerDetails: () => {
          if (orderType === 'delivery') {
            return (
              customerDetails.name.trim() !== '' &&
              customerDetails.phone.trim() !== '' &&
              customerDetails.vehicleNumber.trim() !== ''
            );
          } else {
            return selectedTable !== '';
          }
        }
      });
    }
  // Include all state & fns referenced so closures are fresh (prevents stale cart for Pay Later)
  }, [onFunctionsUpdate, orderItems, orderType, customerDetails.name, customerDetails.phone, customerDetails.vehicleNumber, selectedTable]);

  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const isAvailable = item.available;
    return matchesCategory && matchesSearch && isAvailable;
  });

  // Pagination calculations
  const totalItems = filteredMenuItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMenuItems = filteredMenuItems.slice(startIndex, endIndex);

  // Handle page navigation
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const addToOrder = (menuItem: MenuItem) => {
    const existingItem = orderItems.find(item => item.menuItem.id === menuItem.id);
    
    if (existingItem) {
      setOrderItems(prev => prev.map(item => 
        item.menuItem.id === menuItem.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newOrderItem: OrderItem = {
        id: `${menuItem.id}-${Date.now()}`,
        menuItem,
        quantity: 1,
        status: 'pending',
        // Set default sugar preference for beverages
        ...(menuItem.category.toLowerCase() === 'beverages' && { sugarPreference: 'sugar' as const }),
        // Set default spicy preference for main courses
        ...(menuItem.category.toLowerCase() === 'main courses' && { spicyPreference: 'non-spicy' as const })
      };
      setOrderItems(prev => [...prev, newOrderItem]);
    }
  };

  const updateQuantity = (itemId: string, change: number) => {
    setOrderItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + change;
        return newQuantity <= 0 
          ? null 
          : { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean) as OrderItem[]);
  };

  const updateSpecialInstructions = (itemId: string, instructions: string) => {
    setOrderItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, specialInstructions: instructions }
        : item
    ));
  };

  const updateSugarPreference = (itemId: string, preference: "sugar" | "sugarless") => {
    setOrderItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, sugarPreference: preference }
        : item
    ));
  };

  const updateSpicyPreference = (itemId: string, preference: "spicy" | "non-spicy") => {
    setOrderItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, spicyPreference: preference }
        : item
    ));
  };

  // Wrapper functions to track modifications
  const updateCustomerDetails = (field: string, value: string) => {
    setCustomerDetails(prev => ({ ...prev, [field]: value }));
  };

  const clearCustomerDetails = () => {
    setCustomerDetails({
      name: '',
      phone: '',
      vehicleNumber: '',
    });
    // Also clear the selected table - ensure both local and parent state are cleared
    setSelectedTableState('');
    if (setSelectedTable) {
      setSelectedTable('');
    }
  };

  const updateOrderType = (type: 'dine-in' | 'delivery') => {
    setOrderType(type);
  };



  const calculateTotal = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
    const tax = subtotal * 0.18; // 18% GST
    return { subtotal, tax, total: subtotal + tax };
  };



  const pushToKitchen = async () => {
    if (orderItems.length === 0) {
      showNotification('Please add items to the order before sending to kitchen', 'error');
      return;
    }

    // Validate customer details including table/vehicle number
    if (orderType === 'delivery') {
      if (customerDetails.name.trim() === '') {
        showNotification('Please enter customer name for delivery orders', 'error');
        return;
      }
      if (customerDetails.phone.trim() === '') {
        showNotification('Please enter customer phone number for delivery orders', 'error');
        return;
      }
      if (customerDetails.vehicleNumber.trim() === '') {
        showNotification('Please enter vehicle number for delivery orders', 'error');
        return;
      }
    } else {
      // For dine-in orders, check if table is selected
      if (!selectedTable) {
        showNotification('Please select a table number for dine-in orders', 'error');
        return;
      }
    }

    // Show payment dialog instead of directly sending order
    setShowPaymentDialog(true);
  };

  // Common function to create an order - this consolidates the order creation logic
  const createOrder = async (paymentStatus: 'pending' | 'paid', paymentMethod?: 'cash' | 'card' | 'upi' | 'online') => {
    try {
      setIsProcessingPayment(true);
      
      const { subtotal, tax, total } = calculateTotal();
      
      // Build order object without undefined fields
  // All new orders (pay now or pay later) start as 'confirmed' so they appear immediately
  // in the Confirmed column for both waiter and kitchen dashboards.
  const initialStatus: Order['status'] = 'confirmed';
      const order: Omit<Order, 'id' | 'orderTime'> = {
        customerId: `CUST-${Date.now()}`,
        customerName: customerDetails.name || 'Walk-in Customer',
        customerPhone: customerDetails.phone || '',
        type: orderType,
        items: orderItems,
        status: initialStatus,
        total: subtotal,
        tax,
        grandTotal: total,
        paymentStatus: paymentStatus,
        estimatedTime: Math.max(...orderItems.map(item => item.menuItem.prepTime)) + 10,
      };
      
      // Add payment method only if provided (for paid orders)
      if (paymentMethod) {
        order.paymentMethod = paymentMethod;
      }
      
      // Add optional fields only if they have values
      if (orderType === 'dine-in' && selectedTable) {
        order.tableNumber = selectedTable;
      }
      
      if (orderType === 'delivery' && customerDetails.vehicleNumber) {
        order.customerAddress = customerDetails.vehicleNumber;
      }
      
      if (user?.id) {
        order.waiterId = user.id;
      }
      
      // Add the order to the system
      const newOrderId = await addOrder(order);
      
      // Generate bill for paid orders
      if (paymentStatus === 'paid' && paymentMethod) {
        await generateBill(newOrderId, user?.name || 'Unknown Staff', paymentMethod);
      }
      
      // Return the new order ID for tracking
      return newOrderId;
    } catch (error) {
      // Return a mock ID to prevent further errors
      return `ORDER-${Date.now()}`;
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Function to process payment with selected payment method
  const processPayment = async (paymentMethod: 'cash' | 'card' | 'upi' | 'online') => {
    try {
      // Create order with paid status and payment method
      const newOrderId = await createOrder('paid', paymentMethod);
      
      // Close dialog
      setShowPaymentMethodDialog(false);
      
      // Clear all fields for new customer
      setOrderItems([]);
      setCustomerDetails({ name: '', phone: '', vehicleNumber: '' });
      
      // Show QR for tracking (optional)
      setQrForOrderId(newOrderId);
      
    } catch (error) {
      // Silently handle errors
      setShowPaymentMethodDialog(false);
      
      // Clear all fields for new customer
      setOrderItems([]);
      setCustomerDetails({ name: '', phone: '', vehicleNumber: '' });
    }
  };

  const handlePaymentOptionSelected = async (paymentOption: 'now' | 'later') => {
    // Prevent multiple submissions
    if (isProcessingPayment) {
      return;
    }
    
    if (paymentOption === 'now') {
      // Just show payment method dialog without creating order yet
      setShowPaymentDialog(false);
      setShowPaymentMethodDialog(true);
      return;
    }
    
    try {
      // Create order with pending payment status
      const newOrderId = await createOrder('pending');
      
      // Hide payment dialog
      setShowPaymentDialog(false);
      
      // Clear all fields for new customer
      setOrderItems([]);
      setCustomerDetails({ name: '', phone: '', vehicleNumber: '' });
      
      // Show QR modal for tracking (optional)
      setQrForOrderId(newOrderId);
      
    } catch (error) {
      // Silently handle errors
      setShowPaymentDialog(false);
      
      // Clear all fields for new customer
      setOrderItems([]);
      setCustomerDetails({ name: '', phone: '', vehicleNumber: '' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Customer Details - Desktop First */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <h3 className="text-title-large lg:text-title-medium">Customer Details</h3>
            {/* Order Type Toggle - Desktop Only */}
            <div className="hidden lg:flex space-x-2">
              <button
                onClick={() => updateOrderType('dine-in')}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
                  orderType === 'dine-in' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                }`}
              >
                Dine-in
              </button>
              <button
                onClick={() => updateOrderType('delivery')}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
                  orderType === 'delivery' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                }`}
              >
                Delivery
              </button>
            </div>
          </div>
          <button
            onClick={clearCustomerDetails}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Clear customer details"
          >
            <X className="w-5 h-5 lg:w-4 lg:h-4" />
          </button>
        </div>
        
        {/* Mobile Order Type Toggle */}
        <div className="flex space-x-2 lg:hidden mb-4">
          <button
            onClick={() => updateOrderType('dine-in')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              orderType === 'dine-in' 
                ? 'bg-primary-600 text-white' 
                : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
            }`}
          >
            Dine-in
          </button>
          <button
            onClick={() => updateOrderType('delivery')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              orderType === 'delivery' 
                ? 'bg-primary-600 text-white' 
                : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
            }`}
          >
            Delivery
          </button>
        </div>

        {/* Desktop: All inputs in one row */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-4">
          <input
            type="text"
            placeholder="Customer Name *"
            value={customerDetails.name}
            onChange={(e) => updateCustomerDetails('name', e.target.value)}
            className="input-field text-sm py-2"
          />
          <input
            type="tel"
            placeholder={orderType === 'delivery' ? "Phone Number *" : "Phone Number"}
            value={customerDetails.phone}
            onChange={(e) => updateCustomerDetails('phone', e.target.value)}
            className="input-field text-sm py-2"
          />
          {orderType === 'delivery' ? (
            <input
              type="text"
              placeholder="Vehicle Number *"
              value={customerDetails.vehicleNumber}
              onChange={(e) => updateCustomerDetails('vehicleNumber', e.target.value)}
              className="input-field text-sm py-2"
            />
          ) : (
            <button
              type="button"
              className="w-full px-4 py-2 border border-primary-200 rounded-xl bg-primary-50 text-primary-700 font-medium hover:bg-primary-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-left"
              onClick={() => setShowTablePicker(true)}
            >
              {selectedTable ? `Table: ${selectedTable}` : 'Select Table'}
            </button>
          )}
        </div>

        {/* Mobile: Stacked inputs */}
        <div className="grid grid-cols-1 gap-4 lg:hidden">
          <input
            type="text"
            placeholder="Customer Name *"
            value={customerDetails.name}
            onChange={(e) => updateCustomerDetails('name', e.target.value)}
            className="input-field"
          />
          <input
            type="tel"
            placeholder={orderType === 'delivery' ? "Phone Number *" : "Phone Number"}
            value={customerDetails.phone}
            onChange={(e) => updateCustomerDetails('phone', e.target.value)}
            className="input-field"
          />
        </div>
        
        {/* Mobile-specific delivery/dine-in options */}
        {orderType === 'delivery' && (
          <div className="mt-4 lg:hidden">
            <input
              type="text"
              placeholder="Vehicle Number"
              value={customerDetails.vehicleNumber}
              onChange={(e) => updateCustomerDetails('vehicleNumber', e.target.value)}
              className="input-field"
            />
          </div>
        )}
        {orderType === 'dine-in' && (
          <div className="mt-4 lg:hidden">
            <button
              type="button"
              className="w-full px-4 py-4 border border-primary-200 rounded-xl bg-primary-50 text-primary-700 font-medium hover:bg-primary-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 text-left"
              onClick={() => setShowTablePicker(true)}
            >
              {selectedTable ? `Selected Table: ${selectedTable}` : 'Select Table'}
            </button>
          </div>
        )}
      </div>

      <div className="w-full h-full">
        {/* Menu Items */}
        <div className="w-full space-y-6">



        {/* Table Picker Dialog */}
        {showTablePicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-4 w-[260px] h-[320px] max-w-full flex flex-col mx-4">
              <h3 className="text-title-medium lg:text-sm mb-2 text-center">Select Table Number</h3>
              <div className="grid grid-cols-5 gap-2 mb-2 overflow-y-auto flex-1" style={{maxHeight: '200px'}}>
                {[...Array(100)].map((_, i) => (
                  <button
                    key={i+1}
                    className={`rounded-lg px-2 py-2 text-xs font-medium border lg:text-[10px] lg:px-1.5 lg:py-1.5 ${selectedTable === String(i+1) ? 'bg-primary-600 text-white' : 'bg-surface-100 text-surface-700 hover:bg-surface-200'}`}
                    onClick={() => updateSelectedTable(String(i+1))}
                  >
                    {i+1}
                  </button>
                ))}
              </div>
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  className="btn-outlined px-3 py-1 text-xs lg:px-2 lg:py-1 lg:text-[10px]"
                  onClick={() => setShowTablePicker(false)}
                >Cancel</button>
                <button
                  className="btn-primary px-3 py-1 text-xs lg:px-2 lg:py-1 lg:text-[10px]"
                  onClick={() => setShowTablePicker(false)}
                >Select</button>
              </div>
            </div>
          </div>
        )}

          {/* Menu Section */}
          <div className="mb-6">
            {/* Centered Menu Header with Lines */}
            <div className="flex items-center justify-center mb-4 lg:mb-3">
              <div className="flex-1 h-px bg-surface-300"></div>
              <h3 className="text-title-large lg:text-title-medium font-bold text-surface-900 px-6 lg:px-4">MENU</h3>
              <div className="flex-1 h-px bg-surface-300"></div>
            </div>
            
            {/* Search Bar - Responsive Width */}
            <div className="mb-4 lg:mb-3">
              <div className="relative w-full">
                <Search className="w-5 h-5 lg:w-4 lg:h-4 text-surface-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search menu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-surface-200 rounded-xl text-body-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 lg:py-2 lg:text-sm lg:pl-8"
                />
              </div>
            </div>
            
            {/* Category Filter Chips */}
            <div className="overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style dangerouslySetInnerHTML={{ __html: `.overflow-x-auto::-webkit-scrollbar { display: none; }` }} />
              <div className="flex space-x-2 min-w-max">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedCategory === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  All Categories
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedCategory === category.name ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Menu Items Grid with Pagination */}
          <div className="relative">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {paginatedMenuItems.map(item => {
              const existingItem = orderItems.find(orderItem => orderItem.menuItem.id === item.id);
              const isSelected = existingItem && existingItem.quantity > 0;
              const isOutOfStock = !item.available;
              
              return (
                <div 
                  key={item.id} 
                  className={`card transition-all duration-200 text-left p-0 flex flex-col h-full ${
                    isOutOfStock 
                      ? 'bg-red-100 border-red-300 cursor-not-allowed opacity-70' 
                      : isSelected 
                        ? 'bg-green-100 border-green-300 hover:bg-green-150 hover:shadow-elevation-4' 
                        : 'hover:shadow-elevation-4'
                  }`}
                  onClick={() => item.available && addToOrder(item)}
                  style={{ cursor: item.available ? 'pointer' : 'not-allowed' }}
                >
                {/* Card Content - Main body */}
                <div className="flex-1 p-4 lg:p-3">
                  <div className="relative mb-4 lg:mb-3">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-32 lg:h-24 object-cover rounded-xl lg:rounded-lg"
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full lg:text-[10px] lg:px-1.5 lg:py-0.5">
                      {item.prepTime}min
                    </div>
                  </div>
                  <div className="space-y-2 lg:space-y-1">
                    <h4 className="text-title-medium lg:text-sm lg:font-medium">{item.name}</h4>
                    <p className="text-body-small text-surface-600 lg:text-xs lg:line-clamp-2">{item.description}</p>
                    {!item.available && (
                      <span className="chip chip-error text-xs lg:text-[10px] lg:px-1.5 lg:py-0.5">Out of Stock</span>
                    )}
                  </div>
                </div>

                {/* Card Footer - Price and quantity controls */}
                <div className="border-t border-surface-100 bg-surface-50 px-4 py-3 lg:px-3 lg:py-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-title-medium font-semibold text-primary-600 lg:text-sm">
                      OMR {item.price.toFixed(2)}
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      {/* Quantity controls */}
                      {(() => {
                        const existingItem = orderItems.find(orderItem => orderItem.menuItem.id === item.id);
                        const quantity = existingItem?.quantity || 0;
                        
                        if (quantity > 0) {
                          return (
                            <div 
                              className="flex items-center space-x-1 bg-primary-50 rounded-lg p-1 lg:p-0.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateQuantity(existingItem!.id, -1);
                                }}
                                className="w-6 h-6 lg:w-5 lg:h-5 bg-white text-primary-600 rounded-md flex items-center justify-center hover:bg-surface-50"
                              >
                                <Minus className="w-3 h-3 lg:w-2.5 lg:h-2.5" />
                              </button>
                              <span className="text-sm font-medium text-primary-700 min-w-[20px] text-center lg:text-xs lg:min-w-[16px]">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToOrder(item);
                                }}
                                className="w-6 h-6 lg:w-5 lg:h-5 bg-white text-primary-600 rounded-md flex items-center justify-center hover:bg-surface-50"
                              >
                                <Plus className="w-3 h-3 lg:w-2.5 lg:h-2.5" />
                              </button>
                            </div>
                          );
                        } else {
                          return (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                addToOrder(item);
                              }}
                              disabled={!item.available}
                              className="btn-primary p-2 min-w-0 lg:p-1.5"
                            >
                              <Plus className="w-4 h-4 lg:w-3 lg:h-3" />
                            </button>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </div>
                </div>
              );
            })}
            </div>

            {/* Simple Pagination Controls (Previous / Next) */}
            {totalPages > 1 && (
              <div className="flex items-center justify-end mt-8 pb-8 sm:pb-12 md:pb-6">
                <div className="flex items-center">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 mr-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                    title="Previous page"
                  >
                    <span className="material-icons">chevron_left</span>
                  </button>

                  <div className="text-sm text-gray-600 mr-3">
                    Page {currentPage} of {totalPages}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                    title="Next page"
                  >
                    <span className="material-icons">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>


      </div>
    </div>

      {/* QR Code Modal */}
      {qrForOrderId && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-primary-600 to-secondary-600 text-white flex items-center justify-between">
              <h3 className="text-title-large">Track Your Order</h3>
              <button
                className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center"
                onClick={() => setQrForOrderId(null)}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-center">
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-2xl border border-surface-200 shadow-elevation-1">
                  <QRCodeCanvas value={`${window.location.origin}/track.html?order=${qrForOrderId}`} size={220} includeMargin={false} />
                </div>
              </div>
              <p className="text-body-medium text-surface-700">Scan to view live order status</p>
              <div className="bg-surface-50 border border-surface-200 rounded-xl p-3 text-left">
                <p className="text-body-small text-surface-600 break-all">Link: {`${window.location.origin}/track.html?order=${qrForOrderId}`}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Options Dialog */}
      {showPaymentDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-elevation-3 w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b border-surface-200">
              <h3 className="text-title-large">Choose Payment Option</h3>
              <button
                onClick={() => {
                  if (!isProcessingPayment) {
                    setShowPaymentDialog(false);
                    setIsProcessingPayment(false); // Reset processing state when dialog is closed
                  }
                }}
                disabled={isProcessingPayment}
                className={`p-2 rounded-lg transition-colors ${
                  isProcessingPayment 
                    ? 'cursor-not-allowed opacity-50' 
                    : 'hover:bg-surface-50'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-body-medium text-surface-700 text-center mb-6">
                {isProcessingPayment 
                  ? 'Processing your order, please wait...' 
                  : 'How would the customer like to handle payment?'
                }
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => handlePaymentOptionSelected('now')}
                  disabled={isProcessingPayment}
                  className={`w-full p-4 rounded-xl transition-colors text-body-large font-medium ${
                    isProcessingPayment
                      ? 'bg-surface-300 text-surface-500 cursor-not-allowed'
                      : 'bg-primary-500 hover:bg-primary-600 text-white'
                  }`}
                >
                  {isProcessingPayment ? '⏳ Processing...' : '💳 Pay Now'}
                </button>
                
                <button
                  onClick={() => handlePaymentOptionSelected('later')}
                  disabled={isProcessingPayment}
                  className={`w-full p-4 rounded-xl transition-colors text-body-large font-medium border ${
                    isProcessingPayment
                      ? 'bg-surface-200 text-surface-500 border-surface-300 cursor-not-allowed'
                      : 'bg-surface-100 hover:bg-surface-200 text-surface-900 border-surface-300'
                  }`}
                >
                  {isProcessingPayment ? '⏳ Processing...' : '⏰ Pay Later'}
                </button>
              </div>
              
              <div className="mt-6 p-4 bg-surface-50 rounded-xl">
                <p className="text-body-small text-surface-600 text-center">
                  Order total: ${calculateTotal().total.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Payment Method Dialog (Billing Dialog) */}
      {showPaymentMethodDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            {/* Loading Overlay */}
            {isProcessingPayment && (
              <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-lg">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-2" />
                  <p className="text-body-medium text-surface-600">Generating Bill...</p>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between p-6 border-b border-surface-200">
              <h3 className="text-title-large">Generate Bill</h3>
              <button
                onClick={() => {
                  if (!isProcessingPayment) {
                    setShowPaymentMethodDialog(false);
                    setIsProcessingPayment(false);
                  }
                }}
                disabled={isProcessingPayment}
                className={`p-2 rounded-lg transition-colors ${
                  isProcessingPayment 
                    ? 'cursor-not-allowed opacity-50' 
                    : 'hover:bg-surface-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Order Details */}
              <div>
                <h4 className="text-title-medium mb-2">Order Details</h4>
                <p className="text-body-medium text-surface-600">
                  {customerDetails.name} • {customerDetails.phone}
                </p>
                {orderType === 'dine-in' && selectedTable && (
                  <p className="text-body-medium text-surface-600">Table {selectedTable}</p>
                )}
              </div>

              {/* Items */}
              <div>
                <h4 className="text-title-medium mb-2">Items</h4>
                <div className="space-y-2">
                  {orderItems.map(item => (
                    <div key={item.id} className="flex justify-between text-body-medium">
                      <span>{item.quantity}x {item.menuItem.name}</span>
                      <span>${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bill Calculation */}
              <div className="border-t border-surface-200 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${calculateTotal().subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Charge (10%):</span>
                  <span>${(calculateTotal().subtotal * 0.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (18%):</span>
                  <span>${calculateTotal().tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-surface-200 pt-2 flex justify-between font-medium text-title-medium">
                  <span>Total:</span>
                  <span>${calculateTotal().total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className={isProcessingPayment ? 'opacity-50 pointer-events-none' : ''}>
                <h4 className="text-title-medium mb-3">Payment Method</h4>
                <div className="grid grid-cols-2 gap-2">
                  {(['cash', 'card', 'upi', 'online'] as const).map(method => (
                    <button
                      key={method}
                      onClick={() => setSelectedPaymentMethod(method)}
                      disabled={isProcessingPayment}
                      className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${
                        selectedPaymentMethod === method
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-surface-300 hover:bg-surface-50'
                      } ${isProcessingPayment ? 'cursor-not-allowed' : ''}`}
                    >
                      {getPaymentIcon(method)}
                      <span className="capitalize">{method}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => processPayment(selectedPaymentMethod)}
                  disabled={isProcessingPayment || !selectedPaymentMethod}
                  className={`w-full flex items-center justify-center space-x-2 min-h-[48px] ${
                    isProcessingPayment || !selectedPaymentMethod
                      ? 'bg-surface-300 text-surface-500 cursor-not-allowed' 
                      : 'btn-primary'
                  }`}
                >
                  {isProcessingPayment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Receipt className="w-4 h-4" />
                  )}
                  <span>{isProcessingPayment ? 'Processing Payment...' : 'Complete Payment'}</span>
                </button>
                
                <button
                  onClick={() => {
                    const bill = {
                      id: `BILL-${Date.now()}`,
                      orderId: `ORDER-${Date.now()}`,
                      items: orderItems,
                      subtotal: calculateTotal().subtotal,
                      taxRate: 0.18,
                      taxAmount: calculateTotal().tax,
                      serviceCharge: calculateTotal().subtotal * 0.1,
                      total: calculateTotal().total,
                      generatedAt: new Date(),
                      generatedBy: user?.name || 'Unknown',
                      paymentMethod: selectedPaymentMethod,
                      customerDetails: {
                        name: customerDetails.name,
                        phone: customerDetails.phone,
                        address: orderType === 'delivery' ? customerDetails.vehicleNumber : undefined,
                        tableNumber: orderType === 'dine-in' ? selectedTable : undefined,
                      },
                    };
                    printBill(bill);
                  }}
                  className="w-full btn-secondary flex items-center justify-center space-x-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Invoice</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Saved Order Details Modal
// Rendered inline by React when selectedSavedOrder is set

export default OrderManagement;
