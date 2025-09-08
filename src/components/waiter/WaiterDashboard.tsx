import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import OrderManagement from '../staff/OrderManagement';
import OrderStatusManagement from '../staff/OrderStatusManagement';
import BillingPayments from '../staff/BillingPayments';
import { ShoppingCart, Eye, Receipt } from 'lucide-react';

const WaiterDashboard: React.FC = () => {
  const { getActiveOrders, getTodaysRevenue } = useApp();
  const [activeTab, setActiveTab] = useState<'orders' | 'status' | 'billing'>('orders');
  
  const activeOrders = getActiveOrders();
  const todaysRevenue = getTodaysRevenue();

  const tabs = [
    { id: 'orders' as const, label: 'New Order', icon: ShoppingCart },
    { id: 'status' as const, label: 'Order Status', icon: Eye },
    { id: 'billing' as const, label: 'Billing', icon: Receipt },
  ];

  return (
    <div className="space-y-6">


      {/* Navigation Tabs */}
      <div className="card">
        <div className="flex space-x-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-elevation-2'
                  : 'text-surface-700 hover:bg-surface-100'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'orders' && <OrderManagement tableNumber="1" />}
        {activeTab === 'status' && <OrderStatusManagement />}
        {activeTab === 'billing' && <BillingPayments />}
      </div>
    </div>
  );
};

export default WaiterDashboard;