import React, { useState } from 'react';
import OrderManagement from '../staff/OrderManagement';
import OrderStatusManagement from '../staff/OrderStatusManagement';
import BillingPayments from '../staff/BillingPayments';
import { ShoppingCart, Eye, Receipt, Menu, X } from 'lucide-react';

const WaiterDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'status' | 'billing'>('orders');
  const [selectedTable, setSelectedTable] = useState<string>('1');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    { id: 'orders' as const, label: 'New Order', icon: ShoppingCart },
    { id: 'status' as const, label: 'Order Status', icon: Eye },
    { id: 'billing' as const, label: 'Billing', icon: Receipt },
  ];

  return (
    <div className="flex h-screen bg-surface-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar Navigation - Fixed */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white shadow-elevation-2 border-r border-surface-200
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        transition-transform duration-300 ease-in-out
      `}>
        <div className="flex items-center justify-between p-6 lg:justify-start">
          <h1 className="text-title-large text-surface-900">Waiter Dashboard</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-surface-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="px-6 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSidebarOpen(false); // Close sidebar on mobile after selection
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-elevation-2'
                  : 'text-surface-700 hover:bg-surface-100 hover:text-surface-900'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-0 overflow-auto">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-surface-200 p-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-surface-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-title-medium text-surface-900">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>
        </div>

        <div className="p-4 lg:p-6">
          {activeTab === 'orders' && <OrderManagement tableNumber={selectedTable} setSelectedTable={setSelectedTable} />}
          {activeTab === 'status' && <OrderStatusManagement />}
          {activeTab === 'billing' && <BillingPayments />}
        </div>
      </div>
    </div>
  );
};

export default WaiterDashboard;