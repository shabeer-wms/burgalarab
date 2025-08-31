import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { KitchenDisplayItem, OrderItem } from '../../types';
import { Clock, ChefHat, AlertCircle, CheckCircle, Play, Pause } from 'lucide-react';

const KitchenDisplaySystem: React.FC = () => {
  const { kitchenOrders, updateKitchenOrderStatus, updateOrderItemStatus } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning-100 text-warning-800 border-warning-300';
      case 'in-progress': return 'bg-primary-100 text-primary-800 border-primary-300';
      case 'ready': return 'bg-success-100 text-success-800 border-success-300';
      default: return 'bg-surface-100 text-surface-800 border-surface-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-l-error-500';
      case 'medium': return 'border-l-4 border-l-warning-500';
      case 'low': return 'border-l-4 border-l-success-500';
      default: return 'border-l-4 border-l-surface-300';
    }
  };

  const getTimeElapsed = (orderTime: Date) => {
    const diff = Math.floor((currentTime.getTime() - orderTime.getTime()) / 1000 / 60);
    return diff;
  };

  const getTimeRemaining = (orderTime: Date, estimatedTime: number) => {
    const elapsed = getTimeElapsed(orderTime);
    const remaining = estimatedTime - elapsed;
    return Math.max(0, remaining);
  };

  const isOverdue = (orderTime: Date, estimatedTime: number) => {
    return getTimeElapsed(orderTime) > estimatedTime;
  };

  const handleStatusChange = (orderId: string, newStatus: 'pending' | 'in-progress' | 'ready') => {
    updateKitchenOrderStatus(orderId, newStatus);
  };

  const handleItemStatusChange = (orderId: string, itemId: string, status: OrderItem['status']) => {
    updateOrderItemStatus(orderId, itemId, status);
  };

  const pendingOrders = kitchenOrders.filter(order => order.status === 'pending');
  const inProgressOrders = kitchenOrders.filter(order => order.status === 'in-progress');
  const readyOrders = kitchenOrders.filter(order => order.status === 'ready');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary-100 rounded-2xl">
              <ChefHat className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-headline-medium">Kitchen Display System</h1>
              <p className="text-body-medium text-surface-600">
                {currentTime.toLocaleTimeString()} | {kitchenOrders.length} Active Orders
              </p>
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="text-center">
              <div className="text-title-large text-warning-600">{pendingOrders.length}</div>
              <div className="text-body-small text-surface-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-title-large text-primary-600">{inProgressOrders.length}</div>
              <div className="text-body-small text-surface-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-title-large text-success-600">{readyOrders.length}</div>
              <div className="text-body-small text-surface-600">Ready</div>
            </div>
          </div>
        </div>
      </div>

      {/* Kitchen Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Orders */}
        <div>
          <h2 className="text-title-large mb-4 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-warning-600" />
            <span>Pending ({pendingOrders.length})</span>
          </h2>
          <div className="space-y-4">
            {pendingOrders.map(order => (
              <KitchenOrderCard
                key={order.orderId}
                order={order}
                currentTime={currentTime}
                onStatusChange={handleStatusChange}
                onItemStatusChange={handleItemStatusChange}
              />
            ))}
          </div>
        </div>

        {/* In Progress Orders */}
        <div>
          <h2 className="text-title-large mb-4 flex items-center space-x-2">
            <Play className="w-5 h-5 text-primary-600" />
            <span>In Progress ({inProgressOrders.length})</span>
          </h2>
          <div className="space-y-4">
            {inProgressOrders.map(order => (
              <KitchenOrderCard
                key={order.orderId}
                order={order}
                currentTime={currentTime}
                onStatusChange={handleStatusChange}
                onItemStatusChange={handleItemStatusChange}
              />
            ))}
          </div>
        </div>

        {/* Ready Orders */}
        <div>
          <h2 className="text-title-large mb-4 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-success-600" />
            <span>Ready ({readyOrders.length})</span>
          </h2>
          <div className="space-y-4">
            {readyOrders.map(order => (
              <KitchenOrderCard
                key={order.orderId}
                order={order}
                currentTime={currentTime}
                onStatusChange={handleStatusChange}
                onItemStatusChange={handleItemStatusChange}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface KitchenOrderCardProps {
  order: KitchenDisplayItem;
  currentTime: Date;
  onStatusChange: (orderId: string, status: 'pending' | 'in-progress' | 'ready') => void;
  onItemStatusChange: (orderId: string, itemId: string, status: OrderItem['status']) => void;
}

const KitchenOrderCard: React.FC<KitchenOrderCardProps> = ({
  order,
  currentTime,
  onStatusChange,
  onItemStatusChange
}) => {
  const getTimeElapsed = (orderTime: Date) => {
    return Math.floor((currentTime.getTime() - orderTime.getTime()) / 1000 / 60);
  };

  const getTimeRemaining = (orderTime: Date, estimatedTime: number) => {
    const elapsed = getTimeElapsed(orderTime);
    const remaining = estimatedTime - elapsed;
    return Math.max(0, remaining);
  };

  const isOverdue = (orderTime: Date, estimatedTime: number) => {
    return getTimeElapsed(orderTime) > estimatedTime;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-l-error-500';
      case 'medium': return 'border-l-4 border-l-warning-500';
      case 'low': return 'border-l-4 border-l-success-500';
      default: return 'border-l-4 border-l-surface-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning-100 text-warning-800 border-warning-300';
      case 'in-progress': return 'bg-primary-100 text-primary-800 border-primary-300';
      case 'ready': return 'bg-success-100 text-success-800 border-success-300';
      default: return 'bg-surface-100 text-surface-800 border-surface-300';
    }
  };

  const elapsed = getTimeElapsed(order.orderTime);
  const remaining = getTimeRemaining(order.orderTime, order.estimatedTime);
  const overdue = isOverdue(order.orderTime, order.estimatedTime);

  return (
    <div className={`card ${getPriorityColor(order.priority)} ${overdue ? 'animate-pulse' : ''}`}>
      {/* Order Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-title-medium">{order.orderNumber}</h3>
          <p className="text-body-small text-surface-600">
            {order.customerName} {order.tableNumber && `• Table ${order.tableNumber}`}
          </p>
        </div>
        <div className="text-right">
          <div className={`chip ${getStatusColor(order.status)}`}>
            {order.status.toUpperCase()}
          </div>
          <div className="flex items-center space-x-1 mt-1">
            <Clock className="w-4 h-4 text-surface-500" />
            <span className={`text-body-small ${overdue ? 'text-error-600 font-medium' : 'text-surface-600'}`}>
              {overdue ? `+${elapsed - order.estimatedTime}min` : `${remaining}min`}
            </span>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="space-y-3 mb-4">
        {order.items.map(item => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-body-medium font-medium">{item.quantity}x</span>
                <span className="text-body-medium">{item.menuItem.name}</span>
                <span className={`chip text-xs ${
                  item.status === 'pending' ? 'chip-warning' :
                  item.status === 'preparing' ? 'chip-primary' :
                  item.status === 'ready' ? 'chip-success' : 'chip-secondary'
                }`}>
                  {item.status}
                </span>
              </div>
              {item.specialInstructions && (
                <p className="text-body-small text-surface-600 mt-1">
                  Note: {item.specialInstructions}
                </p>
              )}
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => onItemStatusChange(order.orderId, item.id, 'preparing')}
                className="p-1 rounded text-xs bg-primary-100 text-primary-700 hover:bg-primary-200"
                disabled={item.status !== 'pending'}
              >
                Start
              </button>
              <button
                onClick={() => onItemStatusChange(order.orderId, item.id, 'ready')}
                className="p-1 rounded text-xs bg-success-100 text-success-700 hover:bg-success-200"
                disabled={item.status === 'ready'}
              >
                Done
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Kitchen Notes */}
      {order.kitchenNotes && (
        <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg mb-4">
          <p className="text-body-small text-warning-800">
            <strong>Kitchen Notes:</strong> {order.kitchenNotes}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2">
        {order.status === 'pending' && (
          <button
            onClick={() => onStatusChange(order.orderId, 'in-progress')}
            className="flex-1 btn-primary py-2 text-sm"
          >
            Start Cooking
          </button>
        )}
        {order.status === 'in-progress' && (
          <>
            <button
              onClick={() => onStatusChange(order.orderId, 'pending')}
              className="flex-1 btn-outlined py-2 text-sm"
            >
              Pause
            </button>
            <button
              onClick={() => onStatusChange(order.orderId, 'ready')}
              className="flex-1 btn-primary py-2 text-sm"
            >
              Mark Ready
            </button>
          </>
        )}
        {order.status === 'ready' && (
          <div className="flex-1 text-center py-2 text-sm text-success-600 font-medium">
            Ready for Pickup
          </div>
        )}
      </div>
    </div>
  );
};

export default KitchenDisplaySystem;
