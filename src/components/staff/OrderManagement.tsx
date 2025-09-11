import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { MenuItem, OrderItem, Order } from '../../types';
import { Plus, Minus, ShoppingCart, Save, Send, Eye, X, QrCode } from 'lucide-react';
import QRCode from 'qrcode';

interface OrderManagementProps {
  tableNumber?: string;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ tableNumber }) => {
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

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

    const { subtotal, tax, total } = calculateTotal();
    
    const order: Omit<Order, 'id' | 'orderTime'> = {
      customerId: `CUST-${Date.now()}`,
      customerName: customerDetails.name,
      customerPhone: customerDetails.phone,
      vehicleNumber: customerDetails.vehicleNumber,
      type: orderType,
      tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
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
    alert('Order saved as draft');
  };

  const pushToKitchen = async () => {
    if (orderItems.length === 0 || !customerDetails.name || !customerDetails.phone) {
      alert('Please add items and fill customer details');
      return;
    }

    const { subtotal, tax, total } = calculateTotal();
    
    const order: Omit<Order, 'id' | 'orderTime'> = {
      customerId: `CUST-${Date.now()}`,
      customerName: customerDetails.name,
      customerPhone: customerDetails.phone,
      vehicleNumber: customerDetails.vehicleNumber,
      type: orderType,
      tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
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

    const orderId = addOrder(order);
    
    // Generate QR code and show modal
    await generateQRCode(orderId);
    setTrackingOrder({ ...order, id: orderId, orderTime: new Date() });
    setShowQRModal(true);
    
    // Clear form
    setOrderItems([]);
    setCustomerDetails({ name: '', phone: '', vehicleNumber: '' });
    setKitchenNotes('');
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
    setShowOrderModal(false);
  };

  const generateQRCode = async (orderId: string) => {
    try {
      // Generate tracking URL - in a real app, this would be your domain
      const trackingURL = `${window.location.origin}/track-order/${orderId}`;
      const qrDataURL = await QRCode.toDataURL(trackingURL, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataURL(qrDataURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const closeQRModal = () => {
    setShowQRModal(false);
    setQrCodeDataURL('');
    setTrackingOrder(null);
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
              onChange={(e) => setCustomerDetails(prev => ({ ...prev, name: e.target.value }))}
              className="input-field"
            />
            <input
              type="tel"
              placeholder="Phone Number *"
              value={customerDetails.phone}
              onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
              className="input-field"
            />
            {orderType === 'delivery' && (
              <input
                type="text"
                placeholder="Vehicle Number"
                value={customerDetails.vehicleNumber}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                className="input-field"
              />
            )}
            <div className="flex space-x-2">
              <button
                onClick={() => setOrderType('dine-in')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  orderType === 'dine-in' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                }`}
              >
                Dine-in
              </button>
              <button
                onClick={() => setOrderType('delivery')}
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
              <div className="chip chip-primary">Table: {tableNumber}</div>
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
            onChange={(e) => setKitchenNotes(e.target.value)}
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
            disabled={orderItems.length === 0}
            className="w-full btn-outlined flex items-center justify-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Order</span>
          </button>
          <button
            onClick={pushToKitchen}
            disabled={orderItems.length === 0}
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Send to Kitchen</span>
          </button>
        </div>

        {/* Saved Orders */}
        {savedOrders.length > 0 && (
          <div className="card">
            <h3 className="text-title-medium mb-3">Saved Orders ({savedOrders.length})</h3>
            <div className="space-y-2">
              {savedOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-2 bg-surface-50 rounded-lg">
                  <div>
                    <p className="text-body-medium font-medium">{order.customerName}</p>
                    <p className="text-body-small text-surface-600">${order.grandTotal.toFixed(2)}</p>
                  </div>
                  <button 
                    onClick={() => viewOrderDetails(order)}
                    className="p-2 hover:bg-surface-100 rounded-lg"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-title-large">Order Details</h3>
              <button
                onClick={closeOrderModal}
                className="p-2 hover:bg-surface-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-body-small text-surface-600">Order ID</p>
                  <p className="text-body-medium font-medium">#{selectedOrder.id.slice(-6)}</p>
                </div>
                <div>
                  <p className="text-body-small text-surface-600">Status</p>
                  <p className="text-body-medium font-medium capitalize">{selectedOrder.status}</p>
                </div>
                <div>
                  <p className="text-body-small text-surface-600">Customer</p>
                  <p className="text-body-medium font-medium">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-body-small text-surface-600">Phone</p>
                  <p className="text-body-medium font-medium">{selectedOrder.customerPhone}</p>
                </div>
                <div>
                  <p className="text-body-small text-surface-600">Order Type</p>
                  <p className="text-body-medium font-medium capitalize">{selectedOrder.type}</p>
                </div>
                {selectedOrder.tableNumber && (
                  <div>
                    <p className="text-body-small text-surface-600">Table</p>
                    <p className="text-body-medium font-medium">{selectedOrder.tableNumber}</p>
                  </div>
                )}
                {selectedOrder.vehicleNumber && (
                  <div>
                    <p className="text-body-small text-surface-600">Vehicle Number</p>
                    <p className="text-body-medium font-medium">{selectedOrder.vehicleNumber}</p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-title-medium mb-3">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-body-medium font-medium">{item.menuItem.name}</p>
                        <p className="text-body-small text-surface-600">${item.menuItem.price.toFixed(2)} each</p>
                        {item.specialInstructions && (
                          <p className="text-body-small text-surface-500 italic">
                            Note: {item.specialInstructions}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-body-medium font-medium">Qty: {item.quantity}</p>
                        <p className="text-body-medium font-medium">
                          ${(item.menuItem.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kitchen Notes */}
              {selectedOrder.kitchenNotes && (
                <div>
                  <h4 className="text-title-medium mb-2">Kitchen Notes</h4>
                  <p className="text-body-medium p-3 bg-surface-50 rounded-lg">
                    {selectedOrder.kitchenNotes}
                  </p>
                </div>
              )}

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-body-medium">Subtotal:</span>
                    <span className="text-body-medium">${selectedOrder.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-medium">Tax:</span>
                    <span className="text-body-medium">${selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-title-medium font-medium">
                    <span>Total:</span>
                    <span>${selectedOrder.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Order Time */}
              <div>
                <p className="text-body-small text-surface-600">Order Time</p>
                <p className="text-body-medium">
                  {(() => {
                    let date: Date;
                    if (selectedOrder.orderTime instanceof Date) {
                      date = selectedOrder.orderTime;
                    } else if (
                      typeof selectedOrder.orderTime === 'object' &&
                      selectedOrder.orderTime !== null &&
                      'toDate' in selectedOrder.orderTime &&
                      typeof (selectedOrder.orderTime as { toDate?: unknown }).toDate === 'function'
                    ) {
                      date = (selectedOrder.orderTime as { toDate: () => Date }).toDate();
                    } else {
                      date = new Date(selectedOrder.orderTime as string);
                    }
                    return date.toLocaleString();
                  })()}
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={closeOrderModal}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && trackingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-title-large">Order Tracking QR Code</h3>
              <button
                onClick={closeQRModal}
                className="p-2 hover:bg-surface-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-4">
              <div className="flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6 mr-2" />
                <span className="text-body-large font-medium">Scan to Track Order</span>
              </div>

              {/* QR Code */}
              {qrCodeDataURL && (
                <div className="flex justify-center">
                  <img 
                    src={qrCodeDataURL} 
                    alt="Order Tracking QR Code" 
                    className="border-2 border-surface-200 rounded-lg"
                  />
                </div>
              )}

              {/* Order Info */}
              <div className="bg-surface-50 rounded-lg p-4 space-y-2">
                <p className="text-body-medium">
                  <strong>Order ID:</strong> #{trackingOrder.id.slice(-6)}
                </p>
                <p className="text-body-medium">
                  <strong>Customer:</strong> {trackingOrder.customerName}
                </p>
                <p className="text-body-medium">
                  <strong>Total:</strong> ${trackingOrder.grandTotal.toFixed(2)}
                </p>
                <p className="text-body-small text-surface-600">
                  Customer can scan this QR code to track their order status
                </p>
              </div>

              {/* Instructions */}
              <div className="text-left bg-blue-50 rounded-lg p-4">
                <h4 className="text-body-medium font-medium mb-2 text-blue-800">
                  Instructions for Customer:
                </h4>
                <ul className="text-body-small text-blue-700 space-y-1">
                  <li>• Scan the QR code with your phone camera</li>
                  <li>• Or use any QR code scanner app</li>
                  <li>• View real-time order status updates</li>
                  <li>• Get notifications when order is ready</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={closeQRModal}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
