import React, { useState } from 'react';
import OrderManagement from '../staff/OrderManagement';
import OrderStatusManagement from '../staff/OrderStatusManagement';
import BillingPayments from '../staff/BillingPayments';
import { ShoppingCart, Eye, Receipt, Menu, X, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const WaiterDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'status' | 'billing'>('orders');
  const [selectedTable, setSelectedTable] = useState<string>('1');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { orders, getActiveOrders } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeOrders = getActiveOrders();
  const pausedOrders = orders.filter(o => o.status === 'confirmed' && o.paused === true);
  const inProgressOrders = orders.filter(o => o.status === 'preparing' || (o.status === 'confirmed' && o.paused !== true));
  const readyOrders = orders.filter(o => o.status === 'ready');

  const tabs = [
    { id: 'orders' as const, label: 'New Order', icon: ShoppingCart },
    { id: 'status' as const, label: 'Order Status', icon: Eye },
    { id: 'billing' as const, label: 'Billing', icon: Receipt },
  ];

  return (
    // Full-viewport container similar to kitchen dashboard
    <div className="fixed inset-0 flex bg-gray-100">
      {/* Desktop sidebar (hidden on small screens) */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white shadow-lg flex-col">
        <div className="p-6 text-lg text-gray-800 border-b">
          <p className="font-bold">Hotel Management</p>
          <p className="text-base">Waiter Dashboard</p>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          {tabs.map(tab => (
            <a
              key={tab.id}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(tab.id);
              }}
              className={`flex items-center px-4 py-2 rounded-lg ${
                activeTab === tab.id
                  ? 'text-gray-700 bg-blue-100'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-3" />
              {tab.label}
            </a>
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

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black opacity-40" />
          <div
            className="relative w-64 h-full bg-white shadow-lg p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 text-lg text-gray-800 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">Hotel Management</p>
                  <p className="text-base">Waiter Dashboard</p>
                </div>
                <button
                  aria-label="Close menu"
                  className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
              {tabs.map(tab => (
                <a
                  key={tab.id}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    activeTab === tab.id
                      ? 'text-gray-700 bg-blue-100'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-3" />
                  {tab.label}
                </a>
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
                onClick={() => {
                  setSidebarOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center px-4 py-2 text-red-500 border border-red-500 rounded-lg hover:bg-red-500 hover:text-white"
              >
                <span className="material-icons mr-2">logout</span>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content area */}
      <main className="flex-1 p-4 md:p-6 min-h-screen ml-0 md:ml-64 overflow-auto">
        <div className="w-full flex justify-center">
          <div className="w-full" style={{ maxWidth: 1200 }}>
            <header className="bg-white p-6 rounded-2xl shadow-md mb-8">
              <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-4">
                <div className="flex items-center w-full md:w-auto">
                  <button
                    className="md:hidden mr-3 p-2 rounded-md text-gray-600 hover:bg-gray-100"
                    aria-label="Open menu"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu className="w-5 h-5" />
                  </button>

                  <div className="bg-blue-100 w-12 h-12 rounded-xl mr-3 flex-shrink-0 flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-blue-500" />
                  </div>

                  <div className="min-w-0">
                    <h1 className="text-lg md:text-2xl font-bold text-gray-800 truncate">
                      {tabs.find(tab => tab.id === activeTab)?.label || 'Waiter Dashboard'}
                    </h1>
                    <p className="text-gray-500 text-sm">
                      {currentTime.toLocaleTimeString()} | {activeOrders.length} Active Orders
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-96">
                  {/* Small screens: adaptive auto-fit grid */}
                  <div
                    className="grid gap-3 w-full md:hidden"
                    style={{
                      gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <p className="text-base sm:text-lg font-bold text-yellow-500 w-8 text-center">
                        {pausedOrders.length}
                      </p>
                      <p className="text-gray-500 text-[11px] sm:text-xs">Paused</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-base sm:text-lg font-bold text-blue-500 w-8 text-center">
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
                  </div>

                  {/* md+ screens: force horizontal stacked counters */}
                  <div className="hidden md:flex md:items-center md:gap-6 md:justify-end">
                    <div className="flex flex-col items-center">
                      <p className="text-3xl font-bold text-yellow-500 w-12 text-center tabular-nums">
                        {pausedOrders.length}
                      </p>
                      <p className="text-gray-500 text-sm">Paused</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-3xl font-bold text-blue-500 w-12 text-center tabular-nums">
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
                  </div>
                </div>
              </div>
            </header>

            {/* Content area */}
            <div className="w-full">
              {activeTab === 'orders' && <OrderManagement tableNumber={selectedTable} setSelectedTable={setSelectedTable} />}
              {activeTab === 'status' && <OrderStatusManagement />}
              {activeTab === 'billing' && <BillingPayments />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WaiterDashboard;