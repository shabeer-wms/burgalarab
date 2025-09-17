import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { MenuItem, OrderItem, Order } from '../../types';

import { Plus, Minus, ShoppingCart, Save, Send, FileText, Eye, X, User, Car } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';


interface OrderManagementProps {
  tableNumber?: string;
  setSelectedTable?: React.Dispatch<React.SetStateAction<string>>;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ tableNumber, setSelectedTable }) => {
  const { menuItems, categories, addOrder } = useApp();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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

  const [selectedTableState, setSelectedTableState] = useState<string>(tableNumber || '1');
  const selectedTable = tableNumber || selectedTableState;
  const updateSelectedTable = setSelectedTable || setSelectedTableState;
  const [showTablePicker, setShowTablePicker] = useState(false);

  // Utility function to create order snapshot for comparison
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

  const filteredMenuItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

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
      alert('Please add items and fill customer details');
      return;
    }

    if (isOrderSaved && !isOrderModified) {
      alert('Order is already saved. Make changes to save again.');
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
    
    alert('Order saved as draft');
  };

  const pushToKitchen = async () => {
    console.log('Push to Kitchen clicked');
    console.log('Order items:', orderItems);
    console.log('Customer details:', customerDetails);
    console.log('Is order saved:', isOrderSaved);
    console.log('Is order modified:', isOrderModified);

    if (orderItems.length === 0 || !customerDetails.name || !customerDetails.phone) {
      alert('Please add items and fill customer details');
      return;
    }

    if (!isOrderSaved) {
      alert('Please save the order first before sending to kitchen');
      return;
    }

    if (isOrderModified) {
      alert('Order has been modified since saving. Please save the order again before sending to kitchen');
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
      status: 'confirmed',
      total: subtotal,
      tax,
      grandTotal: total,
      paymentStatus: 'pending',
      waiterId: user?.id,
      kitchenNotes,
      estimatedTime: Math.max(...orderItems.map(item => item.menuItem.prepTime)) + 10,
    };

    console.log('Order to be sent:', order);

    try {
      const newOrderId = await addOrder(order);
      console.log('Order added successfully with ID:', newOrderId);
      // Show QR modal for tracking
      setQrForOrderId(newOrderId);
      
      // Clear form after showing QR
      setOrderItems([]);
      setCustomerDetails({ name: '', phone: '', vehicleNumber: '' });
      setKitchenNotes('');
      resetOrderState();
      
      alert('Order sent to kitchen successfully!');
    } catch (error) {
      console.error('Error sending order to kitchen:', error);
      alert('Failed to send order to kitchen. Please try again.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Menu Items */}
      <div className="lg:col-span-2 space-y-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredMenuItems.map(item => (
            <div key={item.id} className="card hover:shadow-elevation-4 transition-all duration-200">
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
                    <button
                      onClick={() => addToOrder(item)}
                      disabled={!item.available}
                      className="btn-primary p-2 min-w-0"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {!item.available && (
                  <span className="chip chip-error text-xs">Out of Stock</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="space-y-6">
        {/* Customer Details */}
        <div className="card">
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
            {orderType === 'delivery' && (
              <input
                type="text"
                placeholder="Vehicle Number"
                value={customerDetails.vehicleNumber}
                onChange={(e) => updateCustomerDetails('vehicleNumber', e.target.value)}
                className="input-field"
              />
            )}
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
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
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
                : 'btn-outlined'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>
              {isOrderSaved && !isOrderModified ? 'Order Saved' : 'Save Order'}
            </span>
          </button>
          <button
            onClick={pushToKitchen}
            disabled={orderItems.length === 0 || !isOrderSaved || isOrderModified}
            className={`w-full flex items-center justify-center space-x-2 ${
              !isOrderSaved || isOrderModified 
                ? 'btn-disabled' 
                : 'btn-primary'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>
              {!isOrderSaved 
                ? 'Save First' 
                : isOrderModified 
                  ? 'Save Changes First' 
                  : 'Send to Kitchen'
              }
            </span>
          </button>
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
    </div>
  );
};

// Saved Order Details Modal
// Rendered inline by React when selectedSavedOrder is set

export default OrderManagement;
