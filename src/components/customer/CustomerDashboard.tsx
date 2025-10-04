import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { MenuItem, OrderItem } from '../../types';
import { Plus, Minus, ShoppingCart, MapPin, Phone, CreditCard, Banknote, X, Search, Settings, ClipboardList, Receipt, User, LogOut } from 'lucide-react';

const CustomerDashboard: React.FC = () => {
  const { categories, menuItems, addOrder, orders, bills } = useApp();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'menu' | 'orders' | 'billing' | 'settings'>('menu');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<'dine-in' | 'delivery'>('dine-in');
  const [customerDetails, setCustomerDetails] = useState({
    name: user?.name || '',
    phone: '',
    vehicleNumber: '',
    paymentMethod: 'cash' as 'cash' | 'card' | 'online' | 'upi'
  });
  const [showCheckout, setShowCheckout] = useState(false);

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    const orderId = await addOrder({
      customerId: user?.id || '',
      customerName: customerDetails.name,
      customerPhone: customerDetails.phone,
      customerAddress: orderType === 'delivery' ? customerDetails.vehicleNumber : undefined,
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

  // Get user's orders
  const userOrders = orders.filter(order => order.customerId === user?.id);

  // Get user's bills  
  const userBills = bills.filter(bill => 
    userOrders.some(order => order.id === bill.orderId)
  );

  const renderMenuTab = () => (
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

      {/* Search Bar */}
      <div className="bg-white rounded-3xl shadow-elevation-2 p-6">
        <h2 className="text-title-large text-surface-900 mb-4">Search Menu</h2>
        <div className="relative">
          <Search className="w-5 h-5 text-surface-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-surface-200 rounded-2xl text-body-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-6">
        <h2 className="text-title-large text-surface-900 mb-4">Categories</h2>
        <div className="flex lg:flex-wrap gap-3 overflow-x-auto lg:overflow-x-visible scrollbar-hide pb-2">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-5 py-3 rounded-full text-label-large font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
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
              className={`px-5 py-3 rounded-full text-label-large font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
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
    </div>
  );

  const renderOrdersTab = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl shadow-elevation-2 p-6">
        <h2 className="text-title-large text-surface-900 mb-6">My Orders</h2>
        {userOrders.length === 0 ? (
          <div className="text-center py-8">
            <ClipboardList className="w-16 h-16 text-surface-300 mx-auto mb-4" />
            <p className="text-body-large text-surface-600">No orders found</p>
            <p className="text-body-medium text-surface-500 mt-2">Your orders will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userOrders.slice(0, 10).map(order => (
              <div key={order.id} className="border border-surface-200 rounded-2xl p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-surface-900">Order #{order.id.slice(-6)}</p>
                    <p className="text-sm text-surface-600">
                      {(() => {
                        if (order.orderTime instanceof Date) {
                          return order.orderTime.toLocaleDateString();
                        } else if (typeof order.orderTime === 'object' && order.orderTime !== null && 'toDate' in order.orderTime) {
                          return (order.orderTime as { toDate: () => Date }).toDate().toLocaleDateString();
                        } else {
                          return new Date(order.orderTime as string).toLocaleDateString();
                        }
                      })()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed' ? 'bg-success-100 text-success-700' :
                      order.status === 'ready' ? 'bg-primary-100 text-primary-700' :
                      order.status === 'preparing' ? 'bg-warning-100 text-warning-700' :
                      'bg-surface-100 text-surface-700'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-surface-600">{order.items.length} items</p>
                  <p className="font-bold text-primary-600">${order.grandTotal.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderBillingTab = () => (
    <div className="space-y-4 pb-20">
      <div className="bg-white rounded-3xl shadow-elevation-2 p-6">
        <h2 className="text-title-large text-surface-900 mb-6">My Bills</h2>
        {userBills.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="w-16 h-16 text-surface-300 mx-auto mb-4" />
            <p className="text-body-large text-surface-600">No bills found</p>
            <p className="text-body-medium text-surface-500 mt-2">Your bills will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userBills.slice(0, 10).map(bill => (
              <div key={bill.id} className="border border-surface-200 rounded-2xl p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-surface-900">Bill #{bill.id.slice(-6)}</p>
                    <p className="text-sm text-surface-600">
                      {(() => {
                        if (bill.generatedAt instanceof Date) {
                          return bill.generatedAt.toLocaleDateString();
                        } else if (typeof bill.generatedAt === 'object' && bill.generatedAt !== null && 'toDate' in bill.generatedAt) {
                          return (bill.generatedAt as { toDate: () => Date }).toDate().toLocaleDateString();
                        } else {
                          return new Date(bill.generatedAt as string).toLocaleDateString();
                        }
                      })()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-success-600">${bill.total.toFixed(2)}</p>
                    <p className="text-xs text-surface-500 capitalize">{bill.paymentMethod}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl shadow-elevation-2 p-6">
        <h2 className="text-title-large text-surface-900 mb-6">Settings</h2>
        
        {/* User Info */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center space-x-4 p-4 bg-surface-50 rounded-2xl">
            <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-surface-900">{user?.name || 'User'}</p>
              <p className="text-sm text-surface-600">{user?.email || 'No email'}</p>
              <p className="text-xs text-surface-500 capitalize">{user?.role || 'Customer'}</p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            logout();
            // Optionally show a confirmation dialog
          }}
          className="w-full flex items-center justify-center space-x-3 bg-error-600 text-white py-4 rounded-2xl hover:bg-error-700 transition-all duration-200 shadow-elevation-2"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-label-large">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-surface-200 px-4 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-title-large font-semibold text-surface-900">
              {activeTab === 'menu' && 'Order Menu'}
              {activeTab === 'orders' && 'My Orders'}
              {activeTab === 'billing' && 'My Bills'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
            <p className="text-body-small text-surface-600 mt-1">
              {activeTab === 'menu' && 'Choose your favorite dishes'}
              {activeTab === 'orders' && 'Track your orders'}
              {activeTab === 'billing' && 'View your bills'}
              {activeTab === 'settings' && 'Manage your account'}
            </p>
          </div>
          {activeTab === 'menu' && cart.length > 0 && (
            <button
              onClick={() => setShowCheckout(true)}
              className="relative bg-primary-600 text-white p-3 rounded-full shadow-lg"
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-error-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {activeTab === 'menu' && renderMenuTab()}
        {activeTab === 'orders' && renderOrdersTab()}
        {activeTab === 'billing' && renderBillingTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-surface-200 px-4 py-2 flex-shrink-0">
        <div className="flex justify-around items-center">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex flex-col items-center space-y-1 py-2 px-4 rounded-xl transition-all duration-200 ${
              activeTab === 'menu'
                ? 'bg-primary-100 text-primary-600'
                : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
            }`}
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="text-xs font-medium">Menu</span>
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center space-y-1 py-2 px-4 rounded-xl transition-all duration-200 ${
              activeTab === 'orders'
                ? 'bg-primary-100 text-primary-600'
                : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
            }`}
          >
            <ClipboardList className="w-6 h-6" />
            <span className="text-xs font-medium">Orders</span>
          </button>
          
          <button
            onClick={() => setActiveTab('billing')}
            className={`flex flex-col items-center space-y-1 py-2 px-4 rounded-xl transition-all duration-200 ${
              activeTab === 'billing'
                ? 'bg-primary-100 text-primary-600'
                : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
            }`}
          >
            <Receipt className="w-6 h-6" />
            <span className="text-xs font-medium">Bills</span>
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center space-y-1 py-2 px-4 rounded-xl transition-all duration-200 ${
              activeTab === 'settings'
                ? 'bg-primary-100 text-primary-600'
                : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
            }`}
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs font-medium">Settings</span>
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-elevation-5">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-title-large text-surface-900">Checkout</h2>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="p-2 text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded-xl transition-all duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Customer Details */}
              <div className="mb-6">
                <h3 className="text-title-medium text-surface-900 mb-4">Customer Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-label-medium text-surface-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={customerDetails.name}
                      onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                      className="w-full px-4 py-3 border border-surface-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-body-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-label-medium text-surface-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={customerDetails.phone}
                      onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-surface-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-body-medium"
                    />
                  </div>
                  {orderType === 'delivery' && (
                    <div>
                      <label className="block text-label-medium text-surface-700 mb-2">Vehicle Number</label>
                      <input
                        type="text"
                        value={customerDetails.vehicleNumber}
                        onChange={(e) => setCustomerDetails({...customerDetails, vehicleNumber: e.target.value})}
                        className="w-full px-4 py-3 border border-surface-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-body-medium"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Order Type */}
              <div className="mb-6">
                <h3 className="text-title-medium text-surface-900 mb-4">Order Type</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setOrderType('dine-in')}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      orderType === 'dine-in'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                    }`}
                  >
                    Dine In
                  </button>
                  <button
                    onClick={() => setOrderType('delivery')}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      orderType === 'delivery'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                    }`}
                  >
                    Delivery
                  </button>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h3 className="text-title-medium text-surface-900 mb-4">Payment Method</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'cash', label: 'Cash', icon: Banknote },
                    { value: 'card', label: 'Card', icon: CreditCard },
                    { value: 'online', label: 'Online', icon: Phone },
                    { value: 'cod', label: 'COD', icon: MapPin }
                  ].map(method => (
                    <button
                      key={method.value}
                      onClick={() => setCustomerDetails({...customerDetails, paymentMethod: method.value as any})}
                      className={`flex flex-col items-center space-y-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                        customerDetails.paymentMethod === method.value
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-surface-300 hover:border-surface-400'
                      }`}
                    >
                      <method.icon className="w-5 h-5" />
                      <span className="text-label-small font-medium">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="mb-6">
                <h3 className="text-title-medium text-surface-900 mb-4">Order Summary</h3>
                <div className="space-y-3 bg-surface-50 rounded-xl p-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-body-medium">
                      <span className="text-surface-900">{item.menuItem.name} x {item.quantity}</span>
                      <span className="font-medium text-surface-900">${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <hr className="my-3 border-surface-200" />
                  <div className="flex justify-between items-center text-body-medium">
                    <span className="text-surface-700">Subtotal</span>
                    <span className="text-surface-900">${getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-body-medium">
                    <span className="text-surface-700">Tax (10%)</span>
                    <span className="text-surface-900">${getTax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-title-medium pt-2 border-t border-surface-200">
                    <span className="text-surface-900">Total</span>
                    <span className="text-primary-600">${getGrandTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={cart.length === 0 || !customerDetails.name || !customerDetails.phone}
                className="w-full bg-primary-600 text-white py-4 rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md text-label-large"
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