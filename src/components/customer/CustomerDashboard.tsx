import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { MenuItem, OrderItem } from '../../types';
import { Plus, Minus, ShoppingCart, MapPin, Phone, CreditCard, Banknote, X } from 'lucide-react';

const CustomerDashboard: React.FC = () => {
  const { categories, menuItems, addOrder } = useApp();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<'dine-in' | 'delivery'>('dine-in');
  const [customerDetails, setCustomerDetails] = useState({
    name: user?.name || '',
    phone: '',
    address: '',
    paymentMethod: 'cash' as 'cash' | 'card' | 'online' | 'cod'
  });
  const [showCheckout, setShowCheckout] = useState(false);

  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const addToCart = (menuItem: MenuItem) => {
    const existingItem = cart.find(item => item.menuItem.id === menuItem.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.menuItem.id === menuItem.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newOrderItem: OrderItem = {
        id: Date.now().toString(),
        menuItem,
        quantity: 1,
        status: 'pending'
      };
      setCart([...cart, newOrderItem]);
    }
  };

  const removeFromCart = (itemId: string) => {
    const existingItem = cart.find(item => item.menuItem.id === itemId);
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(item => 
        item.menuItem.id === itemId 
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    } else {
      setCart(cart.filter(item => item.menuItem.id !== itemId));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  };

  const getTax = () => {
    return getCartTotal() * 0.1; // 10% tax
  };

  const getGrandTotal = () => {
    return getCartTotal() + getTax();
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;

    const orderId = addOrder({
      customerId: user?.id || '',
      customerName: customerDetails.name,
      customerPhone: customerDetails.phone,
      customerAddress: orderType === 'delivery' ? customerDetails.address : undefined,
      type: orderType,
      items: cart,
      status: 'pending',
      total: getCartTotal(),
      tax: getTax(),
      grandTotal: getGrandTotal(),
      paymentMethod: customerDetails.paymentMethod,
      paymentStatus: 'pending'
    });

    alert(`Order #${orderId} placed successfully!`);
    setCart([]);
    setShowCheckout(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-headline-medium text-surface-900">Order Menu</h1>
          <p className="text-body-large text-surface-600 mt-1">Choose your favorite dishes</p>
        </div>
        <button
          onClick={() => setShowCheckout(true)}
          className="flex items-center space-x-3 bg-primary-600 text-white px-6 py-4 rounded-2xl hover:bg-primary-700 transition-all duration-200 shadow-elevation-2 hover:shadow-elevation-3 relative"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="text-label-large">Cart</span>
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-error-500 text-white text-label-small w-6 h-6 rounded-full flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      {/* Order Type Selection */}
      <div className="bg-white rounded-3xl shadow-elevation-2 p-6">
        <h2 className="text-title-large text-surface-900 mb-4">Order Type</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setOrderType('dine-in')}
            className={`flex-1 px-6 py-4 rounded-2xl font-medium transition-all duration-200 ${
              orderType === 'dine-in'
                ? 'bg-primary-600 text-white shadow-elevation-2'
                : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
            }`}
          >
            Dine In
          </button>
          <button
            onClick={() => setOrderType('delivery')}
            className={`flex-1 px-6 py-4 rounded-2xl font-medium transition-all duration-200 ${
              orderType === 'delivery'
                ? 'bg-primary-600 text-white shadow-elevation-2'
                : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
            }`}
          >
            Home Delivery
          </button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="bg-white rounded-3xl shadow-elevation-2 p-6">
        <h2 className="text-title-large text-surface-900 mb-4">Categories</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-5 py-3 rounded-full text-label-large font-medium transition-all duration-200 ${
              selectedCategory === 'All'
                ? 'bg-primary-600 text-white shadow-elevation-2'
                : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-5 py-3 rounded-full text-label-large font-medium transition-all duration-200 ${
                selectedCategory === category.name
                  ? 'bg-primary-600 text-white shadow-elevation-2'
                  : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white rounded-3xl shadow-elevation-2 overflow-hidden hover:shadow-elevation-3 transition-all duration-200 hover:scale-105">
            <img 
              src={item.image} 
              alt={item.name}
              className="w-full h-52 object-cover"
            />
            <div className="p-6">
              <h3 className="text-title-large text-surface-900">{item.name}</h3>
              <p className="text-body-medium text-surface-600 mt-2">{item.description}</p>
              <div className="flex justify-between items-center mt-5">
                <span className="text-title-large font-bold text-primary-600">${item.price.toFixed(2)}</span>
                <div className="flex items-center space-x-3">
                  {cart.find(cartItem => cartItem.menuItem.id === item.id) ? (
                    <div className="flex items-center space-x-3 bg-surface-100 rounded-2xl p-1">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 bg-white text-primary-600 rounded-xl hover:bg-surface-50 transition-colors duration-200 shadow-elevation-1"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="font-semibold text-title-medium min-w-[24px] text-center">
                        {cart.find(cartItem => cartItem.menuItem.id === item.id)?.quantity}
                      </span>
                      <button
                        onClick={() => addToCart(item)}
                        className="p-2 bg-white text-primary-600 rounded-xl hover:bg-surface-50 transition-colors duration-200 shadow-elevation-1"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(item)}
                      className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-3 rounded-2xl hover:bg-primary-700 transition-all duration-200 shadow-elevation-2"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="text-label-large">Add</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-elevation-5 animate-scale-in">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-headline-small text-surface-900">Checkout</h2>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="p-2 text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded-xl transition-all duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Customer Details */}
              <div className="mb-6">
                <h3 className="text-title-large text-surface-900 mb-4">Customer Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-label-large text-surface-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={customerDetails.name}
                      onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                      className="w-full px-4 py-4 border border-surface-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-body-large transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-label-large text-surface-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={customerDetails.phone}
                      onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})}
                      className="w-full px-4 py-4 border border-surface-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-body-large transition-all duration-200"
                    />
                  </div>
                  {orderType === 'delivery' && (
                    <div className="md:col-span-2">
                      <label className="block text-label-large text-surface-700 mb-2">Delivery Address</label>
                      <textarea
                        value={customerDetails.address}
                        onChange={(e) => setCustomerDetails({...customerDetails, address: e.target.value})}
                        className="w-full px-4 py-4 border border-surface-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-body-large transition-all duration-200"
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h3 className="text-title-large text-surface-900 mb-4">Payment Method</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'cash', label: 'Cash', icon: Banknote },
                    { value: 'card', label: 'Card', icon: CreditCard },
                    { value: 'online', label: 'Online', icon: Phone },
                    { value: 'cod', label: 'COD', icon: MapPin }
                  ].map(method => (
                    <button
                      key={method.value}
                      onClick={() => setCustomerDetails({...customerDetails, paymentMethod: method.value as any})}
                      className={`flex flex-col items-center space-y-3 p-4 rounded-2xl border-2 transition-all duration-200 ${
                        customerDetails.paymentMethod === method.value
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-surface-300 hover:border-surface-400'
                      }`}
                    >
                      <method.icon className="w-6 h-6" />
                      <span className="text-label-medium font-medium">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="mb-6">
                <h3 className="text-title-large text-surface-900 mb-4">Order Summary</h3>
                <div className="space-y-3 bg-surface-50 rounded-2xl p-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-body-large">
                      <span className="text-surface-900">{item.menuItem.name} x {item.quantity}</span>
                      <span className="font-medium text-surface-900">${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <hr className="my-3 border-surface-200" />
                  <div className="flex justify-between items-center text-body-large">
                    <span className="text-surface-700">Subtotal</span>
                    <span className="text-surface-900">${getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-body-large">
                    <span className="text-surface-700">Tax (10%)</span>
                    <span className="text-surface-900">${getTax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-title-large pt-2 border-t border-surface-200">
                    <span className="text-surface-900">Total</span>
                    <span className="text-primary-600">${getGrandTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={cart.length === 0 || !customerDetails.name || !customerDetails.phone}
                className="w-full bg-primary-600 text-white py-4 rounded-2xl font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-elevation-2 hover:shadow-elevation-3 text-label-large"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;