import React, { useState } from 'react';
import OrderManagement from '../staff/OrderManagement';
import OrderStatusManagement from '../staff/OrderStatusManagement';
import BillingPayments from '../staff/BillingPayments';
import { ShoppingCart, Eye, Receipt, User, LogOut, X, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { OrderItem } from '../../types';

const WaiterDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'status' | 'billing' | 'settings'>('orders');
  const [selectedTable, setSelectedTable] = useState<string>('1');
  const { user, logout } = useAuth();
  const { orders, bills, getActiveOrders } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCartModal, setShowCartModal] = useState(false);
  const [showPaymentOptionsModal, setShowPaymentOptionsModal] = useState(false);
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [cartFunctions, setCartFunctions] = useState<{
    sendToKitchen: () => void;
    payNow: () => void;
    payLater: () => void;
    clearCart: () => void;
  } | null>(null);

  // Update time every second
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeOrders = getActiveOrders();
  const pausedOrders = orders.filter(o => o.status === 'confirmed' && o.paused === true);
  const inProgressOrders = orders.filter(o => o.status === 'preparing' || (o.status === 'confirmed' && o.paused !== true));
  const readyOrders = orders.filter(o => o.status === 'ready');
  
  // Billing-specific counts
  const totalOrdersCount = orders.filter(order => ['ready', 'completed'].includes(order.status)).length;
  const readyForBillingCount = orders.filter(order => order.status === 'ready' && order.paymentStatus === 'pending').length;
  const generatedBillsCount = bills.length;

  const tabs = [
    { id: 'orders' as const, label: 'New Order', icon: ShoppingCart },
    { id: 'status' as const, label: 'Order Status', icon: Eye },
    { id: 'billing' as const, label: 'Billing', icon: Receipt },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    // Full-viewport container similar to kitchen dashboard
    <div className="fixed inset-0 flex bg-gray-100">
      {/* Desktop sidebar (hidden on tablet and smaller screens) */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white shadow-lg flex-col z-40">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-900">Hotel Management</h1>
          <p className="text-sm text-gray-600 mt-1">Waiter Dashboard</p>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(tab.id);
              }}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-700 bg-purple-100 border border-purple-200'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t">
          <div className="mb-4 flex items-center">
            <User className="w-6 h-6 mr-3 text-gray-500" />
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {user?.name || 'Waiter'}
              </p>
              <p className="text-xs text-gray-500">
                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Waiter'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-2 text-red-500 border border-red-500 rounded-lg hover:bg-red-500 hover:text-white"
          >
            <span className="material-icons mr-2">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile and tablet bottom navigation (visible only on non-desktop screens) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <nav className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-2 px-1 transition-colors ${
                activeTab === tab.id
                  ? "text-purple-600 bg-purple-50"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <tab.icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main content area */}
      <main className="flex-1 p-4 md:p-6 h-full ml-0 lg:ml-64 mb-16 lg:mb-0 overflow-auto">
        <div className="w-full flex justify-center">
          <div className="w-full" style={{ maxWidth: 1200 }}>
            <header className="bg-white p-6 rounded-2xl shadow-md mb-8">
              <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-4">
                <div className="flex items-center w-full justify-between">
                  <div className="flex items-center min-w-0">
                    <div className="bg-purple-100 w-12 h-12 rounded-xl mr-3 flex-shrink-0 flex items-center justify-center">
                      {activeTab === 'orders' ? <ShoppingCart className="w-6 h-6 text-purple-600" /> :
                       activeTab === 'status' ? <Eye className="w-6 h-6 text-purple-600" /> :
                       activeTab === 'billing' ? <Receipt className="w-6 h-6 text-purple-600" /> :
                       <Settings className="w-6 h-6 text-purple-600" />}
                    </div>

                    <div className="min-w-0">
                      <h1 className="text-lg md:text-2xl font-bold text-gray-800 truncate">
                        {tabs.find(tab => tab.id === activeTab)?.label || 'Waiter Dashboard'}
                      </h1>
                      <p className="text-gray-500 text-sm">
                        {currentTime.toLocaleTimeString()} 
                        {activeTab !== 'orders' && ` | ${activeOrders.length} Active Orders`}
                      </p>
                    </div>
                  </div>

                  {/* Cart Button for New Order tab only - No logout button in app bar for other tabs */}
                  {activeTab === 'orders' && (
                    <button
                      className="ml-4 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex-shrink-0 relative"
                      aria-label="Cart"
                      onClick={() => setShowCartModal(true)}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {cartItems.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                          {cartItems.length}
                        </span>
                      )}
                    </button>
                  )}
                </div>

                {/* Only show counters on status and billing tabs */}
                {activeTab !== 'orders' && (
                  <div className="w-full md:w-96">
                    {/* Small screens: adaptive auto-fit grid */}
                    <div
                      className="grid gap-3 w-full md:hidden"
                      style={{
                        gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
                      }}
                    >
                      {activeTab === 'billing' ? (
                        <>
                          <div className="flex flex-col items-center min-w-[60px]">
                            <p className="text-sm sm:text-base font-bold text-blue-500 w-8 text-center">
                              {totalOrdersCount}
                            </p>
                            <p className="text-gray-500 text-[10px] sm:text-[11px] whitespace-nowrap">Total</p>
                          </div>
                          <div className="flex flex-col items-center min-w-[60px]">
                            <p className="text-sm sm:text-base font-bold text-orange-500 w-8 text-center">
                              {readyForBillingCount}
                            </p>
                            <p className="text-gray-500 text-[10px] sm:text-[11px] whitespace-nowrap">Ready</p>
                          </div>
                          <div className="flex flex-col items-center min-w-[60px]">
                            <p className="text-sm sm:text-base font-bold text-green-500 w-8 text-center">
                              {generatedBillsCount}
                            </p>
                            <p className="text-gray-500 text-[10px] sm:text-[11px] whitespace-nowrap">Bills</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex flex-col items-center">
                            <p className="text-base sm:text-lg font-bold text-yellow-500 w-8 text-center">
                              {pausedOrders.length}
                            </p>
                            <p className="text-gray-500 text-[11px] sm:text-xs">Paused</p>
                          </div>
                          <div className="flex flex-col items-center">
                            <p className="text-base sm:text-lg font-bold text-purple-600 w-8 text-center">
                              {inProgressOrders.length}
                            </p>
                            <p className="text-gray-500 text-[11px] sm:text-xs">In Progress</p>
                          </div>
                          <div className="flex flex-col items-center">
                            <p className="text-base sm:text-lg font-bold text-green-500 w-8 text-center">
                              {readyOrders.length}
                            </p>
                            <p className="text-gray-500 text-[11px] sm:text-xs">Ready</p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* md+ screens: force horizontal stacked counters */}
                    <div className="hidden md:flex md:items-center md:gap-6 md:justify-end">
                      {activeTab === 'billing' ? (
                        <>
                          <div className="flex flex-col items-center min-w-[80px]">
                            <p className="text-2xl font-bold text-blue-500 w-12 text-center tabular-nums">
                              {totalOrdersCount}
                            </p>
                            <p className="text-gray-500 text-xs whitespace-nowrap">Total</p>
                          </div>
                          <div className="flex flex-col items-center min-w-[80px]">
                            <p className="text-2xl font-bold text-orange-500 w-12 text-center tabular-nums">
                              {readyForBillingCount}
                            </p>
                            <p className="text-gray-500 text-xs whitespace-nowrap">Ready</p>
                          </div>
                          <div className="flex flex-col items-center min-w-[80px]">
                            <p className="text-2xl font-bold text-green-500 w-12 text-center tabular-nums">
                              {generatedBillsCount}
                            </p>
                            <p className="text-gray-500 text-xs whitespace-nowrap">Bills</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex flex-col items-center">
                            <p className="text-3xl font-bold text-yellow-500 w-12 text-center tabular-nums">
                              {pausedOrders.length}
                            </p>
                            <p className="text-gray-500 text-sm">Paused</p>
                          </div>
                          <div className="flex flex-col items-center">
                            <p className="text-3xl font-bold text-purple-600 w-12 text-center tabular-nums">
                              {inProgressOrders.length}
                            </p>
                            <p className="text-gray-500 text-sm">In Progress</p>
                          </div>
                          <div className="flex flex-col items-center">
                            <p className="text-3xl font-bold text-green-500 w-12 text-center tabular-nums">
                              {readyOrders.length}
                            </p>
                            <p className="text-gray-500 text-sm">Ready</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </header>

            {/* Content area */}
            <div className="w-full">
              {activeTab === 'orders' && (
                <OrderManagement 
                  tableNumber={selectedTable} 
                  setSelectedTable={setSelectedTable}
                  onCartUpdate={setCartItems}
                  onFunctionsUpdate={setCartFunctions}
                />
              )}
              {activeTab === 'status' && <OrderStatusManagement />}
              {activeTab === 'billing' && <BillingPayments />}
              {activeTab === 'settings' && (
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Settings</h2>
                  
                  {/* User Details Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">User Details</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-800">
                            {user?.name || 'Waiter'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Waiter'}
                          </p>
                        </div>
                      </div>
                      
                      {user?.email && (
                        <div className="flex items-center space-x-3 pt-2 border-t border-gray-200">
                          <div className="w-5 h-5" />
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="text-sm font-medium text-gray-800">{user.email}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-3 pt-2 border-t border-gray-200">
                        <div className="w-5 h-5" />
                        <div>
                          <p className="text-sm text-gray-600">Login Time</p>
                          <p className="text-sm font-medium text-gray-800">{currentTime.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Actions</h3>
                    <div className="space-y-3">
                      <button
                        onClick={logout}
                        className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Cart Modal */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
              <button
                onClick={() => setShowCartModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[50vh] p-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No items in cart</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.menuItem.name}</h4>
                        <p className="text-sm text-gray-600">
                          ${item.menuItem.price.toFixed(2)} × {item.quantity}
                        </p>
                        {item.specialInstructions && (
                          <p className="text-xs text-gray-500 mt-1">Note: {item.specialInstructions}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${(item.menuItem.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-4 border-t border-gray-200 space-y-3">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-purple-600">
                    ${cartItems.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0).toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => {
                      setShowCartModal(false);
                      setShowPaymentOptionsModal(true);
                    }}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    Send to Kitchen
                  </button>

                  <button
                    onClick={() => {
                      cartFunctions?.clearCart();
                      setShowCartModal(false);
                    }}
                    className="w-full border border-red-300 text-red-600 py-3 rounded-lg font-medium hover:bg-red-50 transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Options Modal */}
      {showPaymentOptionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Payment Options</h3>
              <button
                onClick={() => setShowPaymentOptionsModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-6 text-center">
                Order will be sent to kitchen. How would you like to handle payment?
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    cartFunctions?.sendToKitchen();
                    cartFunctions?.payNow();
                    setShowPaymentOptionsModal(false);
                  }}
                  className="w-full bg-green-600 text-white py-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Receipt className="w-5 h-5" />
                  <span>Pay Now</span>
                </button>
                
                <button
                  onClick={() => {
                    cartFunctions?.sendToKitchen();
                    cartFunctions?.payLater();
                    setShowPaymentOptionsModal(false);
                  }}
                  className="w-full bg-blue-600 text-white py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Eye className="w-5 h-5" />
                  <span>Pay Later</span>
                </button>

                <button
                  onClick={() => setShowPaymentOptionsModal(false)}
                  className="w-full border border-gray-300 text-gray-600 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaiterDashboard;