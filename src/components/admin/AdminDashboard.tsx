import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Clock, 
  Printer, 
  Edit, 
  Trash2,
  Plus,
  Filter
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { orders, updateOrder } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'menu'>('overview');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Analytics calculations
  const today = new Date();
  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.orderTime);
    return orderDate.toDateString() === today.toDateString();
  });

  const completedOrders = orders.filter(order => order.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.grandTotal, 0);
  const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
  const averagePreparationTime = 18; // Mock data

  const filteredOrders = orderFilter === 'all' ? orders : 
    orders.filter(order => order.status === (orderFilter === 'completed' ? 'completed' : 'pending'));

  const printBill = (order: Order) => {
    // Mock bill printing
    const billContent = `
      HOTEL MANAGEMENT SYSTEM
      ========================
      
      Order #${order.id.slice(-4)}
      Date: ${new Date(order.orderTime).toLocaleString()}
      Customer: ${order.customerName}
      ${order.tableNumber ? `Table: ${order.tableNumber}` : ''}
      ${order.vehicleNumber ? `Vehicle Number: ${order.vehicleNumber}` : ''}
      
      ITEMS:
      ${order.items.map(item => 
        `${item.quantity}x ${item.menuItem.name} - $${(item.menuItem.price * item.quantity).toFixed(2)}`
      ).join('\n')}
      
      Subtotal: $${order.total.toFixed(2)}
      Tax (10%): $${order.tax.toFixed(2)}
      TOTAL: $${order.grandTotal.toFixed(2)}
      
      Payment Method: ${order.paymentMethod || 'Not specified'}
      Status: ${order.paymentStatus}
      
      Thank you for dining with us!
    `;
    
    // In a real app, this would send to printer
    console.log('Printing bill:', billContent);
    alert('Bill sent to printer!');
    
    // Mark as paid if printing bill
    if (order.paymentStatus === 'pending') {
      updateOrder(order.id, { paymentStatus: 'paid' });
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'orders', name: 'Orders', icon: Users },
    { id: 'menu', name: 'Menu', icon: Plus }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your restaurant operations</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-md p-3">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-md p-3">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="bg-purple-100 rounded-md p-3">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">${averageOrderValue.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="bg-orange-100 rounded-md p-3">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Prep Time</p>
                  <p className="text-2xl font-bold text-gray-900">{averagePreparationTime}m</p>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">Orders Today</p>
                <p className="text-2xl font-bold text-blue-600">{todayOrders.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Revenue Today</p>
                <p className="text-2xl font-bold text-green-600">
                  ${todayOrders
                    .filter(order => order.status === 'completed')
                    .reduce((sum, order) => sum + order.grandTotal, 0)
                    .toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-orange-600">
                  {orders.filter(order => 
                    ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
                  ).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending Orders</option>
                  <option value="completed">Completed Orders</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{order.id.slice(-4)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(order.orderTime).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.customerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.tableNumber || order.customerPhone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          order.type === 'dine-in'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {order.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${order.grandTotal.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'preparing' ? 'bg-orange-100 text-orange-800' :
                          order.status === 'ready' ? 'bg-green-100 text-green-800' :
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          order.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => printBill(order)}
                            className="text-purple-600 hover:text-purple-900 p-1"
                            title="Print Bill"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {order.status !== 'completed' && (
                            <>
                              <button
                                className="text-blue-600 hover:text-blue-900 p-1"
                                title="Edit Order"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => updateOrder(order.id, { status: 'cancelled' })}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Cancel Order"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Menu Tab */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600">Menu management features coming soon...</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Categories</h3>
                <p className="text-sm text-gray-600">Manage food categories</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Menu Items</h3>
                <p className="text-sm text-gray-600">Add, edit, or remove items</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Pricing</h3>
                <p className="text-sm text-gray-600">Update prices and availability</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;