import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { MenuItem, OrderItem, Order } from '../../types';
import { Plus, Minus, ShoppingCart, Save, Send, FileText, Eye } from 'lucide-react';

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
    address: '',
  });
  const [orderType, setOrderType] = useState<'dine-in' | 'delivery'>('dine-in');
  const [kitchenNotes, setKitchenNotes] = useState('');
  const [savedOrders, setSavedOrders] = useState<Order[]>([]);

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
      customerAddress: customerDetails.address,
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

  const pushToKitchen = () => {
    if (orderItems.length === 0 || !customerDetails.name || !customerDetails.phone) {
      alert('Please add items and fill customer details');
      return;
    }

    const { subtotal, tax, total } = calculateTotal();
    
    const order: Omit<Order, 'id' | 'orderTime'> = {
      customerId: `CUST-${Date.now()}`,
      customerName: customerDetails.name,
      customerPhone: customerDetails.phone,
      customerAddress: customerDetails.address,
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

    addOrder(order);
    
    // Clear form
    setOrderItems([]);
    setCustomerDetails({ name: '', phone: '', address: '' });
    setKitchenNotes('');
    
    alert('Order sent to kitchen!');
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
              <textarea
                placeholder="Delivery Address"
                value={customerDetails.address}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, address: e.target.value }))}
                className="input-field"
                rows={2}
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
                  <button className="p-2 hover:bg-surface-100 rounded-lg">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
