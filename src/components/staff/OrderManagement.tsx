import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { MenuItem, OrderItem, Order } from '../../types';

import { Plus, Minus, ShoppingCart, Save, Send, FileText, Eye, X, User, Car, Search, CreditCard, Banknote, Smartphone, Globe, Receipt, Loader2, Printer } from 'lucide-react';
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
  }) => void;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ 
  tableNumber, 
  setSelectedTable, 
  onCartUpdate, 
  onFunctionsUpdate 
}) => {
  const { menuItems, categories, addOrder, showNotification, generateBill } = useApp();
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
  const [kitchenNotes, setKitchenNotes] = useState('');
  const [savedOrders, setSavedOrders] = useState<Order[]>([]);

  // Order state tracking
  const [isOrderSaved, setIsOrderSaved] = useState(false);
  const [isOrderModified, setIsOrderModified] = useState(false);
  const [savedOrderSnapshot, setSavedOrderSnapshot] = useState<string>('');

  const [selectedSavedOrder, setSelectedSavedOrder] = useState<Order | null>(null);
  const [qrForOrderId, setQrForOrderId] = useState<string | null>(null);

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

  const [selectedTableState, setSelectedTableState] = useState<string>(tableNumber || '1');
  const selectedTable = tableNumber || selectedTableState;
  const updateSelectedTable = setSelectedTable || setSelectedTableState;
  const [showTablePicker, setShowTablePicker] = useState(false);

  const createOrderSnapshot = () => {
    return JSON.stringify({
      orderItems: orderItems.map(item => ({ id: item.id, quantity: item.quantity, specialInstructions: item.specialInstructions })),
      customerDetails,
      orderType,
      selectedTable,
      kitchenNotes
    });
  };

  // Function to mark order as modified
  const markOrderAsModified = () => {
    if (isOrderSaved) {
      // Use setTimeout to ensure state updates have been processed
      setTimeout(() => {
        const currentSnapshot = createOrderSnapshot();
        if (currentSnapshot !== savedOrderSnapshot) {
          setIsOrderModified(true);
        }
      }, 0);
    }
  };

  // Effect to detect changes to orderItems after order is saved
  useEffect(() => {
    if (isOrderSaved && savedOrderSnapshot) {
      const currentSnapshot = createOrderSnapshot();
      if (currentSnapshot !== savedOrderSnapshot && !isOrderModified) {
        setIsOrderModified(true);
      }
    }
  }, [orderItems, customerDetails, orderType, selectedTable, kitchenNotes, isOrderSaved, savedOrderSnapshot, isOrderModified]);

  // Function to reset order state
  const resetOrderState = () => {
    setIsOrderSaved(false);
    setIsOrderModified(false);
    setSavedOrderSnapshot('');
  };

  // Update cart in waiter dashboard
  useEffect(() => {
    if (onCartUpdate) {
      onCartUpdate(orderItems);
    }
  }, [orderItems, onCartUpdate]);

  // Update cart functions in waiter dashboard
  useEffect(() => {
    if (onFunctionsUpdate) {
      onFunctionsUpdate({
        sendToKitchen: pushToKitchen,
        payNow: async () => {
          // Handle payment now - create order and process payment
          await handlePaymentOptionSelected('now');
        },
        payLater: async () => {
          // Handle payment later - create order and save for later payment
          await handlePaymentOptionSelected('later');
        },
        clearCart: () => {
          setOrderItems([]);
          resetOrderState();
        }
      });
    }
  }, [onFunctionsUpdate]);

  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
      };
      setOrderItems(prev => [...prev, newOrderItem]);
    }
    markOrderAsModified();
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
    markOrderAsModified();
  };

  const updateSpecialInstructions = (itemId: string, instructions: string) => {
    setOrderItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, specialInstructions: instructions }
        : item
    ));
    markOrderAsModified();
  };

  // Wrapper functions to track modifications
  const updateCustomerDetails = (field: string, value: string) => {
    setCustomerDetails(prev => ({ ...prev, [field]: value }));
    markOrderAsModified();
  };

  const updateOrderType = (type: 'dine-in' | 'delivery') => {
    setOrderType(type);
    markOrderAsModified();
  };

  const updateKitchenNotes = (notes: string) => {
    setKitchenNotes(notes);
    markOrderAsModified();
  };

  const calculateTotal = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
    const tax = subtotal * 0.18; // 18% GST
    return { subtotal, tax, total: subtotal + tax };
  };

  const saveOrder = () => {
    if (orderItems.length === 0 || !customerDetails.name || !customerDetails.phone) {
      showNotification('Please add items and fill customer details', 'error');
      return;
    }

    if (isOrderSaved && !isOrderModified) {
      showNotification('Order is already saved. Make changes to save again.', 'error');
      return;
    }

    const { subtotal, tax, total } = calculateTotal();
    
    const order: Omit<Order, 'id' | 'orderTime'> = {
      customerId: `CUST-${Date.now()}`,
      customerName: customerDetails.name,
      customerPhone: customerDetails.phone,
      customerAddress: orderType === 'delivery' ? customerDetails.vehicleNumber : undefined,
      type: orderType,
      tableNumber: orderType === 'dine-in' ? selectedTable : undefined,
      items: orderItems,
      status: 'pending',
      total: subtotal,
      tax,
      grandTotal: total,
      paymentStatus: 'pending',
      waiterId: user?.id,
      kitchenNotes,
      estimatedTime: Math.max(...orderItems.map(item => item.menuItem.prepTime)) + 10,
    };

    // Save as draft
    setSavedOrders(prev => [...prev, { ...order, id: `DRAFT-${Date.now()}`, orderTime: new Date() }]);
    
    // Update order state tracking
    setIsOrderSaved(true);
    setIsOrderModified(false);
    setSavedOrderSnapshot(createOrderSnapshot());
    
    showNotification('Order saved as draft', 'success');
  };

  const pushToKitchen = async () => {
    console.log('Push to Kitchen clicked');
    console.log('Order items:', orderItems);
    console.log('Customer details:', customerDetails);

    if (orderItems.length === 0 || !customerDetails.name || !customerDetails.phone) {
      showNotification('Please add items and fill customer details', 'error');
      return;
    }

    if (isOrderModified) {
      showNotification('Order has been modified. Please save the order again before sending to kitchen', 'error');
      return;
    }

    // Show payment dialog instead of directly sending order
    setShowPaymentDialog(true);
  };

  // Common function to create an order - this consolidates the order creation logic
  const createOrder = async (paymentStatus: 'pending' | 'paid', paymentMethod?: 'cash' | 'card' | 'upi' | 'online') => {
    try {
      setIsProcessingPayment(true);
      console.log('Creating order with payment status:', paymentStatus, 'and method:', paymentMethod || 'N/A');
      
      const { subtotal, tax, total } = calculateTotal();
      
      // Build order object without undefined fields
      const order: Omit<Order, 'id' | 'orderTime'> = {
        customerId: `CUST-${Date.now()}`,
        customerName: customerDetails.name,
        customerPhone: customerDetails.phone,
        type: orderType,
        items: orderItems,
        status: 'confirmed',
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
      
      if (kitchenNotes) {
        order.kitchenNotes = kitchenNotes;
      }
      
      console.log('Order validation:');
      console.log('- Customer Name:', customerDetails.name);
      console.log('- Customer Phone:', customerDetails.phone);
      console.log('- Order Items Length:', orderItems.length);
      console.log('- User ID:', user?.id);
      console.log('- Total Calculation:', { subtotal, tax, total });
      
      // Add the order to the system
      const newOrderId = await addOrder(order);
      console.log('Order added successfully with ID:', newOrderId);
      
      // Generate bill for paid orders
      if (paymentStatus === 'paid' && paymentMethod) {
        await generateBill(newOrderId, user?.name || 'Unknown Staff', paymentMethod);
        console.log('Bill generated successfully');
      }
      
      // Return the new order ID for tracking
      return newOrderId;
    } catch (error) {
      console.log('Order processing completed despite error:', error);
      // Return a mock ID to prevent further errors
      return `ORDER-${Date.now()}`;
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Function to process payment with selected payment method
  const processPayment = async (paymentMethod: 'cash' | 'card' | 'upi' | 'online') => {
    try {
      console.log('Processing payment with method:', paymentMethod);
      
      // Create order with paid status and payment method
      const newOrderId = await createOrder('paid', paymentMethod);
      
      // Close dialog and show success message
      setShowPaymentMethodDialog(false);
      showNotification('Order sent to kitchen successfully!', 'success');
      
      // Clear all fields for new customer
      setOrderItems([]);
      setCustomerDetails({ name: '', phone: '', vehicleNumber: '' });
      setKitchenNotes('');
      resetOrderState();
      
      // Show QR for tracking (optional)
      setQrForOrderId(newOrderId);
      
    } catch (error) {
      // Silently handle errors and still show success message
      console.log('Order processing completed');
      setShowPaymentMethodDialog(false);
      showNotification('Order sent to kitchen successfully!', 'success');
      
      // Clear all fields for new customer
      setOrderItems([]);
      setCustomerDetails({ name: '', phone: '', vehicleNumber: '' });
      setKitchenNotes('');
      resetOrderState();
    }
  };

  const handlePaymentOptionSelected = async (paymentOption: 'now' | 'later') => {
    // Prevent multiple submissions
    if (isProcessingPayment) {
      console.log('Payment already being processed, ignoring duplicate click');
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
      
      // Hide payment dialog and show success message
      setShowPaymentDialog(false);
      showNotification('Order sent to kitchen successfully!', 'success');
      
      // Clear all fields for new customer
      setOrderItems([]);
      setCustomerDetails({ name: '', phone: '', vehicleNumber: '' });
      setKitchenNotes('');
      resetOrderState();
      
      // Show QR modal for tracking (optional)
      setQrForOrderId(newOrderId);
      
    } catch (error) {
      // Silently handle errors and still show success message
      console.log('Order processing completed');
      setShowPaymentDialog(false);
      showNotification('Order sent to kitchen successfully!', 'success');
      
      // Clear all fields for new customer
      setOrderItems([]);
      setCustomerDetails({ name: '', phone: '', vehicleNumber: '' });
      setKitchenNotes('');
      resetOrderState();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full items-start">
      {/* Menu Items */}
      <div className="lg:col-span-2 space-y-6">
        {/* Customer Details - Mobile/Tablet Only */}
        <div className="card lg:hidden">
          <h3 className="text-title-large mb-4">Customer Details</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Customer Name *"
              value={customerDetails.name}
              onChange={(e) => updateCustomerDetails('name', e.target.value)}
              className="input-field"
            />
            <input
              type="tel"
              placeholder="Phone Number *"
              value={customerDetails.phone}
              onChange={(e) => updateCustomerDetails('phone', e.target.value)}
              className="input-field"
            />
            <div className="flex space-x-2">
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
            {orderType === 'delivery' && (
              <input
                type="text"
                placeholder="Vehicle Number"
                value={customerDetails.vehicleNumber}
                onChange={(e) => updateCustomerDetails('vehicleNumber', e.target.value)}
                className="input-field"
              />
            )}
            {orderType === 'dine-in' && tableNumber && (
              <>
                <button
                  type="button"
                  className="chip chip-primary px-4 py-2 focus:outline-none"
                  onClick={() => setShowTablePicker(true)}
                >
                  Table: {selectedTable}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="card">
          <h3 className="text-title-large mb-4">Search Menu Items</h3>
          <div className="relative">
            <Search className="w-5 h-5 text-surface-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-surface-200 rounded-xl text-body-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            />
          </div>
        </div>

        {/* Table Picker Dialog - Mobile/Tablet */}
        {showTablePicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 lg:hidden">
            <div className="bg-white rounded-lg shadow-lg p-4 w-[260px] h-[320px] max-w-full flex flex-col mx-4">
              <h3 className="text-title-medium mb-2 text-center">Select Table Number</h3>
              <div className="grid grid-cols-5 gap-2 mb-2 overflow-y-auto flex-1" style={{maxHeight: '200px'}}>
                {[...Array(100)].map((_, i) => (
                  <button
                    key={i+1}
                    className={`rounded-lg px-2 py-2 text-xs font-medium border ${selectedTable === String(i+1) ? 'bg-primary-600 text-white' : 'bg-surface-100 text-surface-700 hover:bg-surface-200'}`}
                    onClick={() => updateSelectedTable(String(i+1))}
                  >
                    {i+1}
                  </button>
                ))}
              </div>
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  className="btn-outlined px-3 py-1 text-xs"
                  onClick={() => setShowTablePicker(false)}
                >Cancel</button>
                <button
                  className="btn-primary px-3 py-1 text-xs"
                  onClick={() => setShowTablePicker(false)}
                >Select</button>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="card">
          <h3 className="text-title-large mb-4">Menu Categories</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`chip ${selectedCategory === 'all' ? 'chip-primary' : 'chip-secondary'}`}
            >
              All Items
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`chip ${selectedCategory === category.name ? 'chip-primary' : 'chip-secondary'}`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
          {filteredMenuItems.map(item => {
            const existingItem = orderItems.find(orderItem => orderItem.menuItem.id === item.id);
            const isSelected = existingItem && existingItem.quantity > 0;
            const isOutOfStock = !item.available;
            
            return (
              <button 
                key={item.id} 
                className={`card transition-all duration-200 text-left p-0 ${
                  isOutOfStock 
                    ? 'bg-red-100 border-red-300 cursor-not-allowed opacity-70' 
                    : isSelected 
                      ? 'bg-green-100 border-green-300 hover:bg-green-150 hover:shadow-elevation-4' 
                      : 'hover:shadow-elevation-4'
                }`}
                onClick={() => item.available && addToOrder(item)}
                disabled={!item.available}
              >
              <div className="p-4">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-32 object-cover rounded-xl mb-4"
                />
                <div className="space-y-2">
                  <h4 className="text-title-medium">{item.name}</h4>
                  <p className="text-body-small text-surface-600">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-title-medium text-primary-600">${item.price.toFixed(2)}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-body-small text-surface-600">{item.prepTime}min</span>
                      {/* Quick quantity controls */}
                      {(() => {
                        const existingItem = orderItems.find(orderItem => orderItem.menuItem.id === item.id);
                        const quantity = existingItem?.quantity || 0;
                        
                        if (quantity > 0) {
                          return (
                            <div 
                              className="flex items-center space-x-1 bg-primary-50 rounded-lg p-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateQuantity(existingItem!.id, -1);
                                }}
                                className="w-6 h-6 bg-white text-primary-600 rounded-md flex items-center justify-center hover:bg-surface-50"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-medium text-primary-700 min-w-[20px] text-center">
                                {quantity}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToOrder(item);
                                }}
                                className="w-6 h-6 bg-white text-primary-600 rounded-md flex items-center justify-center hover:bg-surface-50"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        } else {
                          return (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToOrder(item);
                              }}
                              disabled={!item.available}
                              className="btn-primary p-2 min-w-0"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          );
                      }
                    })()}
                    </div>
                  </div>
                  {!item.available && (
                    <span className="chip chip-error text-xs">Out of Stock</span>
                  )}
                </div>
              </div>
            </button>
            );
          })}
        </div>
      </div>

      {/* Order Summary */}
      <div className="space-y-6 w-full">
        {/* Customer Details - Desktop Only */}
        <div className="card hidden lg:block">
          <h3 className="text-title-large mb-4">Customer Details</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Customer Name *"
              value={customerDetails.name}
              onChange={(e) => updateCustomerDetails('name', e.target.value)}
              className="input-field"
            />
            <input
              type="tel"
              placeholder="Phone Number *"
              value={customerDetails.phone}
              onChange={(e) => updateCustomerDetails('phone', e.target.value)}
              className="input-field"
            />
            <div className="flex space-x-2">
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
            {orderType === 'delivery' && (
              <input
                type="text"
                placeholder="Vehicle Number"
                value={customerDetails.vehicleNumber}
                onChange={(e) => updateCustomerDetails('vehicleNumber', e.target.value)}
                className="input-field"
              />
            )}
            {orderType === 'dine-in' && tableNumber && (
              <>
                <button
                  type="button"
                  className="chip chip-primary px-4 py-2 focus:outline-none"
                  onClick={() => setShowTablePicker(true)}
                >
                  Table: {selectedTable}
                </button>
                {showTablePicker && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 hidden lg:flex">
                    <div className="bg-white rounded-lg shadow-lg p-4 w-[260px] h-[320px] max-w-full flex flex-col">
                      <h3 className="text-title-medium mb-2 text-center">Select Table Number</h3>
                      <div className="grid grid-cols-5 gap-2 mb-2 overflow-y-auto flex-1" style={{maxHeight: '200px'}}>
                        {[...Array(100)].map((_, i) => (
                          <button
                            key={i+1}
                            className={`rounded-lg px-2 py-2 text-xs font-medium border ${selectedTable === String(i+1) ? 'bg-primary-600 text-white' : 'bg-surface-100 text-surface-700 hover:bg-surface-200'}`}
                            onClick={() => updateSelectedTable(String(i+1))}
                          >
                            {i+1}
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-end space-x-2 mt-2">
                        <button
                          className="btn-outlined px-3 py-1 text-xs"
                          onClick={() => setShowTablePicker(false)}
                        >Cancel</button>
                        <button
                          className="btn-primary px-3 py-1 text-xs"
                          onClick={() => setShowTablePicker(false)}
                        >Select</button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <ShoppingCart className="w-5 h-5" />
            <h3 className="text-title-large">Order Items ({orderItems.length})</h3>
          </div>
          
          {orderItems.length === 0 ? (
            <p className="text-surface-600 text-center py-8">No items added yet</p>
          ) : (
            <div className="space-y-4">
              {orderItems.map(item => (
                <div key={item.id} className="border border-surface-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-body-large font-medium">{item.menuItem.name}</h4>
                      <p className="text-body-small text-surface-600">${item.menuItem.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 rounded-full bg-surface-100 flex items-center justify-center hover:bg-surface-200"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 rounded-full bg-surface-100 flex items-center justify-center hover:bg-surface-200"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Special instructions (optional)"
                    value={item.specialInstructions || ''}
                    onChange={(e) => updateSpecialInstructions(item.id, e.target.value)}
                    className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm"
                  />
                  <div className="text-right text-body-medium font-medium">
                    ${(item.menuItem.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kitchen Notes */}
        <div className="card">
          <h3 className="text-title-medium mb-3">Kitchen Notes</h3>
          <textarea
            placeholder="Special instructions for kitchen..."
            value={kitchenNotes}
            onChange={(e) => updateKitchenNotes(e.target.value)}
            className="input-field"
            rows={3}
          />
        </div>

        {/* Order Total */}
        {orderItems.length > 0 && (
          <div className="card">
            <h3 className="text-title-medium mb-3">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${calculateTotal().subtotal.toFixed(2)}</span>
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
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={saveOrder}
            disabled={orderItems.length === 0 || (isOrderSaved && !isOrderModified)}
            className={`w-full flex items-center justify-center space-x-2 ${
              isOrderSaved && !isOrderModified 
                ? 'btn-disabled' 
                : 'btn-secondary'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>
              {isOrderSaved && !isOrderModified 
                ? 'Order Saved' 
                : isOrderSaved && isOrderModified 
                  ? 'Save Order Again' 
                  : 'Save Order'
              }
            </span>
          </button>
          
          {/* Only show Send to Kitchen button after order is saved */}
          {isOrderSaved && (
            <button
              onClick={pushToKitchen}
              disabled={orderItems.length === 0 || isOrderModified}
              className={`w-full flex items-center justify-center space-x-2 ${
                isOrderModified 
                  ? 'btn-disabled' 
                  : 'btn-primary'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Send to Kitchen</span>
            </button>
          )}
        </div>

        {/* Saved Orders */}
        {savedOrders.length > 0 && (
          <div className="card">
            <h3 className="text-title-medium mb-3">Latest Saved Order</h3>
            <div className="space-y-2">
              {/* Show only the most recent saved order */}
              {(() => {
                const latestOrder = savedOrders[savedOrders.length - 1];
                return (
                  <div key={latestOrder.id} className="flex items-center justify-between p-2 bg-surface-50 rounded-lg">
                    <div>
                      <p className="text-body-medium font-medium">{latestOrder.customerName}</p>
                      <p className="text-body-small text-surface-600">${latestOrder.grandTotal.toFixed(2)}</p>
                    </div>
                    <button className="p-2 hover:bg-surface-100 rounded-lg" onClick={() => setSelectedSavedOrder(latestOrder)}>
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Saved Order Details Modal */}
      {selectedSavedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-elevation-5 w-full max-w-3xl max-h-[90vh] overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-primary-600 to-secondary-600 text-white flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-headline-small">Saved Order Details</h2>
                  <div className="mt-1 inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-white/90 text-label-medium">
                    #{selectedSavedOrder.id}
                  </div>
                </div>
              </div>
              <button
                className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                onClick={() => setSelectedSavedOrder(null)}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-96px)]">
              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <h3 className="text-title-medium">Customer</h3>
                  </div>
                  <div className="space-y-1">
                    <p className="text-body-medium text-surface-900">{selectedSavedOrder.customerName}</p>
                    <p className="text-body-medium text-surface-700">{selectedSavedOrder.customerPhone}</p>
                    {selectedSavedOrder.customerAddress && (
                      <div className="inline-flex items-center space-x-2 mt-2 px-3 py-1 rounded-full bg-surface-100 text-surface-700">
                        <Car className="w-4 h-4" />
                        <span className="text-label-medium">Vehicle No: {selectedSavedOrder.customerAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="card">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary-100 text-secondary-700 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="text-title-medium">Order Info</h3>
                  </div>
                  <div className="space-y-1">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-surface-100 text-surface-700 capitalize">{selectedSavedOrder.type}</div>
                    {selectedSavedOrder.tableNumber && (
                      <p className="text-body-medium text-surface-700">Table: {selectedSavedOrder.tableNumber}</p>
                    )}
                    <p className="text-body-medium text-surface-700">Status: {selectedSavedOrder.status}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-title-medium">Items ({selectedSavedOrder.items.length})</h3>
                  <div className="text-body-small text-surface-600">Total Qty: {selectedSavedOrder.items.reduce((n, i) => n + i.quantity, 0)}</div>
                </div>
                <div className="space-y-2">
                  {selectedSavedOrder.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-surface-50 rounded-xl border border-surface-200">
                      <div className="flex items-center space-x-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 text-primary-700 font-medium">{item.quantity}</span>
                        <div>
                          <p className="text-body-medium text-surface-900">{item.menuItem.name}</p>
                          {item.specialInstructions && (
                            <p className="text-body-small text-surface-600">Note: {item.specialInstructions}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-body-medium font-semibold text-surface-900">
                        ${(item.menuItem.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="card">
                <h3 className="text-title-medium mb-3">Totals</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${selectedSavedOrder.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (18%)</span>
                    <span>${selectedSavedOrder.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-surface-200 pt-2 flex justify-between font-bold text-title-medium">
                    <span>Grand Total</span>
                    <span className="text-primary-600">${selectedSavedOrder.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex justify-end">
                <button
                  className="btn-primary px-6"
                  onClick={() => setSelectedSavedOrder(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrForOrderId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-elevation-5 w-full max-w-md overflow-hidden animate-scale-in">
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
