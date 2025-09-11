import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Clock, CheckCircle, ChefHat, Truck, X } from 'lucide-react';

const OrderTracking: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders } = useApp();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId && orders.length > 0) {
      const foundOrder = orders.find(o => o.id === orderId);
      setOrder(foundOrder);
      setLoading(false);
    }
  }, [orderId, orders]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-6 h-6 text-blue-500" />;
      case 'preparing':
        return <ChefHat className="w-6 h-6 text-orange-500" />;
      case 'ready':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'cancelled':
        return <X className="w-6 h-6 text-red-500" />;
      default:
        return <Clock className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Order Received';
      case 'confirmed':
        return 'Order Confirmed';
      case 'preparing':
        return 'Preparing Your Order';
      case 'ready':
        return 'Ready for Pickup/Delivery';
      case 'completed':
        return 'Order Completed';
      case 'cancelled':
        return 'Order Cancelled';
      default:
        return 'Unknown Status';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600">The order you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-primary-500 text-white p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Order Tracking</h1>
          <p className="text-primary-100">Order #{order.id.slice(-6)}</p>
        </div>

        {/* Order Status */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              {getStatusIcon(order.status)}
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {getStatusText(order.status)}
            </h2>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>

          {/* Order Details */}
          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Order Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium">{order.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{order.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{order.type}</span>
                </div>
                {order.tableNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Table:</span>
                    <span className="font-medium">{order.tableNumber}</span>
                  </div>
                )}
                {order.vehicleNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="font-medium">{order.vehicleNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">${order.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
              <div className="space-y-2">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div>
                      <span className="font-medium">{item.menuItem.name}</span>
                      <span className="text-gray-600 ml-2">x{item.quantity}</span>
                    </div>
                    <span className="font-medium">${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Estimated Time */}
            {order.estimatedTime && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-blue-500 mr-2" />
                  <div>
                    <p className="font-medium text-blue-900">Estimated Time</p>
                    <p className="text-sm text-blue-700">{order.estimatedTime} minutes</p>
                  </div>
                </div>
              </div>
            )}

            {/* Order Time */}
            <div className="text-center text-sm text-gray-600">
              <p>Order placed: {new Date(order.orderTime).toLocaleString()}</p>
            </div>
          </div>

          {/* Auto-refresh notice */}
          <div className="text-center text-xs text-gray-500 bg-gray-100 rounded-lg p-3">
            <p>This page updates automatically</p>
            <p>Last updated: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
