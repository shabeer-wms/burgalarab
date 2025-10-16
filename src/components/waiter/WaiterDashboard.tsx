import React, { useState, useEffect, useRef } from 'react';
import OrderManagement from '../staff/OrderManagement';
import WaiterOrderStatusPage from './WaiterOrderStatusPage';
import WaiterBillingPage from './WaiterBillingPage';
import Snackbar from '../shared/SnackBar';
import { ShoppingCart, Eye, Receipt, UserCheck, X, Settings, Plus, Minus, Trash2, Bell } from 'lucide-react';
import WaiterSettings from './WaiterSettings';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { OrderItem, Order } from '../../types';


interface WaiterDashboardProps {
  email?: string;
  password?: string;
}

const WaiterDashboard: React.FC<WaiterDashboardProps> = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'status' | 'billing' | 'settings'>('orders');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const { user, logout } = useAuth();
  const { orders } = useApp();
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [readyOrdersSnapshot, setReadyOrdersSnapshot] = useState<Order[]>([]);
  const previousReadyOrderIdsRef = useRef<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showPaymentOptionsModal, setShowPaymentOptionsModal] = useState(false);
  const [showClearCartConfirmation, setShowClearCartConfirmation] = useState(false);
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [snackbar, setSnackbar] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success'
  });
  const [cartFunctions, setCartFunctions] = useState<{
    sendToKitchen: () => void;
    payNow: () => void;
    payLater: () => void;
    clearCart: () => void;
    updateQuantity: (itemId: string, change: number) => void;
    updateSpecialInstructions: (itemId: string, instructions: string) => void;
    updateSugarPreference: (itemId: string, preference: "sugar" | "sugarless") => void;
    updateSpicyPreference: (itemId: string, preference: "spicy" | "non-spicy") => void;
    validateCustomerDetails: () => boolean;
  } | null>(null);

  // Hide top appbar that may be rendered by a parent Layout
  React.useEffect(() => {
    const selectors = [
      "header",
      "[data-topbar]",
      ".topbar",
      ".app-header",
      "#top-appbar",
    ];

    const found: { el: Element; prev: string | null }[] = [];

    selectors.forEach((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        // skip if the element is inside our component
        if (rootRef.current && rootRef.current.contains(el)) return;
        found.push({ el, prev: (el as HTMLElement).style.display || null });
        (el as HTMLElement).style.display = "none";
      }
    });

    return () => {
      // restore any hidden elements
      found.forEach(({ el, prev }) => {
        (el as HTMLElement).style.display = prev ?? "";
      });
    };
  }, []);

  // Only show orders that belong to the logged-in waiter
  const waiterOrders = user?.id ? orders.filter(o => o.waiterId === user.id) : [];

  const confirmedOrders = waiterOrders.filter(o => o.status === 'confirmed');
  const preparingOrders = waiterOrders.filter(o => o.status === 'preparing');
  const [viewedOrderIds, setViewedOrderIds] = useState<string[]>([]);
  const readyOrders = waiterOrders.filter(o => o.status === 'ready' && !viewedOrderIds.includes(o.id));
  
  // Debug logging removed to prevent console spam
  
  // Play sound and show notification when new ready order appears
  useEffect(() => {
    const currentReadyOrderIds = readyOrders.map(o => o.id);
    const newReadyOrders = readyOrders.filter(order => !previousReadyOrderIdsRef.current.includes(order.id));

    if (newReadyOrders.length > 0) {
      setShowNotification(true);
      // Play notification sound
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      setTimeout(() => setShowNotification(false), 3000);
    }

    // Update the previous ready orders list
    previousReadyOrderIdsRef.current = currentReadyOrderIds;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readyOrders]);
  
  // Billing-specific counts (only for this waiter) - match what's shown in billing page
  const paidOrdersCount = waiterOrders.filter(order => order.status === 'completed').length;
  const pendingOrdersCount = waiterOrders.filter(order => order.status === 'ready' && order.paymentStatus === 'pending').length;
  const totalBillingOrdersCount = waiterOrders.filter(order => ['ready', 'completed'].includes(order.status)).length;

  const tabs = [
    { id: 'orders' as const, label: 'New Order', icon: ShoppingCart },
    { id: 'status' as const, label: 'Order Status', icon: Eye },
    { id: 'billing' as const, label: 'Billing', icon: Receipt },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    // Full-viewport container similar to kitchen dashboard
    <div ref={rootRef} className="fixed inset-0 flex bg-gray-100">
      {/* Desktop sidebar (hidden on tablet and smaller screens) */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 flex-col z-40">
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
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <UserCheck className="w-5 h-5 text-purple-600" />
            </div>
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white z-50">
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
      <main className="flex-1 p-4 md:p-6 xl:p-8 2xl:p-10 ml-0 lg:ml-64 overflow-auto pb-20 md:pb-24 lg:pb-6">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-none">
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
                        {activeTab === 'orders' ? 'Create and manage new customer orders' :
                         activeTab === 'status' ? 'Track order preparation and delivery status' :
                         activeTab === 'billing' ? 'Process payments and generate bills' :
                         'Configure your preferences and settings'}
                      </p>
                    </div>
                  </div>

                  {/* Cart and Notification Icons for New Order tab only */}
                  {activeTab === 'orders' && (
                    <div className="flex items-center">
                      <button
                        className="p-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors flex-shrink-0 relative"
                        aria-label="Notifications"
                        onClick={() => {
                          setReadyOrdersSnapshot(readyOrders);
                          setShowNotificationModal(true);
                        }}
                      >
                        <Bell className="w-5 h-5" />
                        {readyOrders.length > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                            {readyOrders.length}
                          </span>
                        )}
                      </button>
                      <span className="mx-2" />
                      <button
                        className="ml-0 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex-shrink-0 relative"
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
            {/* Notification Modal - shows all ready orders as a snapshot when opened */}
            {showNotificationModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-4 sm:p-6 relative mx-2 sm:mx-0" style={{width: '100%', maxWidth: '400px'}}>
                  <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    onClick={() => {
                      // Mark all viewed notifications as viewed
                      setViewedOrderIds(prev => [...prev, ...readyOrdersSnapshot.map(o => o.id)]);
                      setReadyOrdersSnapshot([]);
                      setShowNotificationModal(false);
                    }}
                    aria-label="Close"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <div className="flex items-center gap-3 mb-4">
                    <Bell className="w-7 h-7 text-yellow-500" />
                    <h2 className="text-xl font-bold text-gray-800">Ready Orders Notification</h2>
                  </div>
                  {readyOrdersSnapshot.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">No ready orders yet.</div>
                  ) : (
                    <div className="space-y-6 max-h-96 overflow-y-auto">
                      {readyOrdersSnapshot.map((order) => (
                        <div key={order.id} className="border-b pb-4 mb-4 last:border-b-0 last:mb-0 last:pb-0">
                          <div className="font-semibold text-gray-700">Order ID: <span className="text-purple-600">{order.id}</span></div>
                          <div className="text-gray-600">{order.type === 'dine-in' ? `Table: ${order.tableNumber || 'N/A'}` : `Delivery`}</div>
                          <div className="text-gray-600">Customer: <span className="font-medium">{order.customerName || 'N/A'}</span></div>
                          <div className="text-gray-600">Type: <span className="font-medium">{order.type}</span></div>
                          <div className="text-gray-600">Items:</div>
                          <ul className="list-disc ml-6 text-gray-700">
                            {order.items.map((item: OrderItem, iidx: number) => (
                              <li key={iidx}>
                                {item.menuItem.name} x {item.quantity}
                              </li>
                            ))}
                          </ul>
                          <div className="text-green-600 font-semibold">Status: Ready</div>
                          <div className="text-gray-500 text-xs mt-2">Order Time: {
                            (() => {
                              const ot = order.orderTime;
                              if (!ot) return '';
                              if (typeof ot === 'string') return ot;
                              if (ot instanceof Date) return ot.toLocaleString();
                              if (typeof ot === 'object' && typeof ot.toDate === 'function') return ot.toDate().toLocaleString();
                              return '';
                            })()
                          }</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
                      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
                      {/* Notification dropdown */}
                      {showNotification && readyOrders.length > 0 && (
                        <div className="absolute right-0 mt-14 w-72 bg-white border border-yellow-400 rounded-xl shadow-lg z-50">
                          <div className="p-4 flex items-center gap-3 border-b border-yellow-100">
                            <Bell className="w-6 h-6 text-yellow-500" />
                            <span className="font-semibold text-yellow-800">Latest Ready Order</span>
                          </div>
                          <div className="p-4">
                            <div className="text-gray-800 font-medium">Order {readyOrders[readyOrders.length-1]?.id || 'N/A'}</div>
                            <div className="text-gray-600 text-sm">Table: {readyOrders[readyOrders.length-1]?.tableNumber || 'N/A'}</div>
                            <div className="text-gray-600 text-sm">Items: {readyOrders[readyOrders.length-1]?.items?.map(i => i.menuItem.name).join(', ') || 'N/A'}</div>
                            <div className="text-green-600 text-xs mt-2">Status: Ready</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
            {/* Notification popup */}
            {showNotification && (
              <div className="fixed top-6 right-6 z-50 bg-yellow-100 border border-yellow-400 text-yellow-800 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-bounce">
                <Bell className="w-6 h-6 text-yellow-500" />
                <span>{readyOrders.length} order{readyOrders.length > 1 ? 's' : ''} ready!</span>
              </div>
            )}
                </div>

                {/* Only show counters on status and billing tabs */}
                {activeTab !== 'orders' && activeTab !== 'settings' && (
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
                          {/* Removed Total, Pending, Paid counters for mobile screens in billing tab as requested */}
                        </>
                      ) : (
                        <>
                          {/* Removed Confirmed, Preparing, Ready counters for mobile screens as requested */}
                        </>
                      )}
                    </div>

                    {/* md+ screens: force horizontal stacked counters */}
                    <div className="hidden md:flex md:items-center md:gap-6 md:justify-end">
                      {activeTab === 'billing' ? (
                        <>
                          <div className="flex flex-col items-center">
                            <p className="text-3xl font-bold text-blue-600 w-12 text-center tabular-nums">
                              {totalBillingOrdersCount}
                            </p>
                            <p className="text-gray-500 text-sm">Total</p>
                          </div>
                          <div className="flex flex-col items-center">
                            <p className="text-3xl font-bold text-orange-500 w-12 text-center tabular-nums">
                              {pendingOrdersCount}
                            </p>
                            <p className="text-gray-500 text-sm">Pending</p>
                          </div>
                          <div className="flex flex-col items-center">
                            <p className="text-3xl font-bold text-green-500 w-12 text-center tabular-nums">
                              {paidOrdersCount}
                            </p>
                            <p className="text-gray-500 text-sm">Paid</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex flex-col items-center">
                            <p className="text-3xl font-bold text-blue-600 w-12 text-center tabular-nums">
                              {confirmedOrders.length}
                            </p>
                            <p className="text-gray-500 text-sm">Confirmed</p>
                          </div>
                          <div className="flex flex-col items-center">
                            <p className="text-3xl font-bold text-orange-500 w-12 text-center tabular-nums">
                              {preparingOrders.length}
                            </p>
                            <p className="text-gray-500 text-sm">Preparing</p>
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
              {activeTab === 'status' && <WaiterOrderStatusPage />}
              {activeTab === 'billing' && <WaiterBillingPage />}
              {activeTab === 'settings' && (
                <WaiterSettings user={user} logout={logout} />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Cart Modal */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl h-[90vh] flex flex-col shadow-xl">
            {/* Fixed Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
                <h3 className="text-xl font-semibold text-gray-900">Order Items ({cartItems.length})</h3>
              </div>
              <button
                onClick={() => setShowCartModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="overflow-y-auto flex-1 p-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No items in cart</p>
                  <p className="text-gray-400 text-sm mt-2">Add items from the menu to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="border border-surface-200 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-body-large font-medium">{item.menuItem.name}</h4>
                          <p className="text-body-small text-surface-600">OMR {item.menuItem.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => cartFunctions?.updateQuantity && cartFunctions.updateQuantity(item.id, -1)}
                            className="w-8 h-8 rounded-full bg-surface-100 flex items-center justify-center hover:bg-surface-200"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => cartFunctions?.updateQuantity && cartFunctions.updateQuantity(item.id, 1)}
                            className="w-8 h-8 rounded-full bg-surface-100 flex items-center justify-center hover:bg-surface-200"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        id={`special-instructions-${item.id}`}
                        name={`specialInstructions-${item.id}`}
                        placeholder="Special instructions (optional)"
                        value={item.specialInstructions || ''}
                        onChange={(e) => cartFunctions?.updateSpecialInstructions && cartFunctions.updateSpecialInstructions(item.id, e.target.value)}
                        className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm"
                      />
                      
                      {/* Sugar preference toggle for beverage items */}
                      {item.menuItem.category.toLowerCase() === 'beverages' && (
                        <div className="flex items-center space-x-3">
                          <span className="text-body-small text-surface-600">Sugar preference:</span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => cartFunctions?.updateSugarPreference && cartFunctions.updateSugarPreference(item.id, 'sugar')}
                              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                                item.sugarPreference === 'sugar' || !item.sugarPreference
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                              }`}
                            >
                              Sugar
                            </button>
                            <button
                              onClick={() => cartFunctions?.updateSugarPreference && cartFunctions.updateSugarPreference(item.id, 'sugarless')}
                              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                                item.sugarPreference === 'sugarless'
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                              }`}
                            >
                              Sugarless
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Spicy preference toggle for main course items */}
                      {item.menuItem.category.toLowerCase() === 'main courses' && (
                        <div className="flex items-center space-x-3">
                          <span className="text-body-small text-surface-600">Spice preference:</span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => cartFunctions?.updateSpicyPreference && cartFunctions.updateSpicyPreference(item.id, 'non-spicy')}
                              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                                item.spicyPreference === 'non-spicy' || !item.spicyPreference
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                              }`}
                            >
                              Non-Spicy
                            </button>
                            <button
                              onClick={() => cartFunctions?.updateSpicyPreference && cartFunctions.updateSpicyPreference(item.id, 'spicy')}
                              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                                item.spicyPreference === 'spicy'
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                              }`}
                            >
                              Spicy
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <div className="text-right text-body-medium font-medium">
                        OMR {(item.menuItem.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* Fixed Footer - Always visible */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (cartItems.length === 0) {
                      setSnackbar({
                        show: true,
                        message: 'Order sent to kitchen successfully!',
                        type: 'success'
                      });
                      return;
                    }
                    if (!cartFunctions?.validateCustomerDetails()) {
                      setSnackbar({
                        show: true,
                        message: 'Please fill in customer name and phone number for delivery',
                        type: 'error'
                      });
                      return;
                    }
                    setShowCartModal(false);
                    setShowPaymentOptionsModal(true);
                  }}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  disabled={cartItems.length === 0}
                >
                  Send to Kitchen
                </button>

                <button
                  onClick={() => {
                    if (cartItems.length === 0) {
                      setSnackbar({
                        show: true,
                        message: 'Cart is already empty',
                        type: 'error'
                      });
                      return;
                    }
                    setShowClearCartConfirmation(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 border border-red-300 text-red-600 py-3 rounded-lg font-medium hover:bg-red-50 transition-colors disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                  disabled={cartItems.length === 0}
                >
                  <Trash2 size={18} />
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Cart Confirmation Dialog */}
      {showClearCartConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Clear Cart?
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to clear all items from the cart? This will remove all selected items and empty your cart.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowClearCartConfirmation(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    cartFunctions?.clearCart();
                    setShowClearCartConfirmation(false);
                    setShowCartModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Clear Cart
                </button>
              </div>
            </div>
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

      {/* Snackbar */}
      <Snackbar
        message={snackbar.message}
        type={snackbar.type}
        show={snackbar.show}
        onClose={() => setSnackbar(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
};

export default WaiterDashboard;