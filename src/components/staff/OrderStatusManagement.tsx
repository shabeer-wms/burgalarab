import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types';
import { 
  Clock, CheckCircle, AlertCircle, Package, DollarSign, Eye, ChefHat, 
  Trash2, X, Receipt, CreditCard, Banknote, Smartphone, Globe, Truck 
} from 'lucide-react';
import ConfirmationDialog from '../../components/ConfirmationDialog';

const OrderStatusManagement: React.FC = () => {
  const { orders, updateOrder, showNotification } = useApp();
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<'all' | Order['status'] | 'delivered'>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // Fixed 9 cards per page for all screen sizes

  // Reset to first page when status filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus]);

  // If logged in user is a waiter, only show their orders
  const baseOrders = user?.role === 'waiter' && user.id ? orders.filter(o => o.waiterId === user.id) : orders;

  const filteredOrders = (selectedStatus === 'all'
    ? baseOrders
    : selectedStatus === 'delivered' 
      ? baseOrders.filter(order => (order.status === 'ready' || order.status === 'completed') && order.deliveryStatus === 'delivered')
      : selectedStatus === 'completed'
        ? baseOrders.filter(order => order.status === 'completed' && order.paymentStatus === 'paid' && order.deliveryStatus !== 'delivered')
        : baseOrders.filter(order => order.status === selectedStatus)
  ).sort((a, b) => {
    // Sort by order time in descending order (most recent first)
    const timeA = a.orderTime instanceof Date ? a.orderTime : 
                  typeof a.orderTime === 'string' ? new Date(a.orderTime) : 
                  a.orderTime?.toDate ? a.orderTime.toDate() : new Date(0);
    const timeB = b.orderTime instanceof Date ? b.orderTime : 
                  typeof b.orderTime === 'string' ? new Date(b.orderTime) : 
                  b.orderTime?.toDate ? b.orderTime.toDate() : new Date(0);
    return timeB.getTime() - timeA.getTime();
  });

  // Pagination calculations
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Handle page navigation
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'preparing': return <Package className="w-4 h-4" />;
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'chip-warning';
      case 'confirmed': return 'chip-primary';
      case 'preparing': return 'chip-primary';
      case 'ready': return 'chip-success';
      case 'completed': return 'chip-success';
      case 'cancelled': return 'chip-error';
      default: return 'chip-secondary';
    }
  };

  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'paid': return 'text-success-600';
      case 'pending': return 'text-warning-600';
      case 'partial': return 'text-warning-600';
      case 'refunded': return 'text-error-600';
      default: return 'text-surface-600';
    }
  };

  const handleCancelOrder = (orderId: string) => {
    setOrderToCancel(orderId);
    setShowCancelConfirmation(true);
  };
  
  const confirmCancelOrder = async () => {
    if (orderToCancel) {
      try {
        await updateOrder(orderToCancel, { 
          status: 'cancelled',
          completedTime: new Date()
        });
        showNotification('Order cancelled successfully', 'success');
      } catch (error) {
        console.error('Error cancelling order:', error);
        showNotification('Failed to cancel order. Please try again.', 'error');
      } finally {
        // Clear the state
        setShowCancelConfirmation(false);
        setOrderToCancel(null);
      }
    }
  };

  const handleDeliveryStatusToggle = async (orderId: string, currentDeliveryStatus?: 'pending' | 'delivered') => {
    try {
      const newStatus = currentDeliveryStatus === 'delivered' ? 'pending' : 'delivered';
      await updateOrder(orderId, { 
        deliveryStatus: newStatus
      });
      showNotification(
        newStatus === 'delivered' 
          ? 'Order marked as delivered' 
          : 'Order marked as pending delivery', 
        'success'
      );
    } catch (error) {
      console.error('Error updating delivery status:', error);
      showNotification('Failed to update delivery status. Please try again.', 'error');
    }
  };

  const getTimeElapsed = (orderTime: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - orderTime.getTime()) / 1000 / 60);
    return diff;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="mb-6">
        <div className="flex items-start lg:items-center">
          <div className="overflow-x-auto pb-2 flex-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style dangerouslySetInnerHTML={{ __html: `.overflow-x-auto::-webkit-scrollbar { display: none; }` }} />
            <div className="flex space-x-2 min-w-max">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedStatus === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedStatus('confirmed')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedStatus === 'confirmed' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Confirmed
              </button>
              <button
                onClick={() => setSelectedStatus('preparing')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedStatus === 'preparing' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Preparing
              </button>
              <button
                onClick={() => setSelectedStatus('ready')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedStatus === 'ready' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Ready
              </button>
              <button
                onClick={() => setSelectedStatus('completed')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedStatus === 'completed' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Completed
              </button>
              <button
                onClick={() => setSelectedStatus('delivered')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedStatus === 'delivered' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Delivered
              </button>
              <button
                onClick={() => setSelectedStatus('cancelled')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedStatus === 'cancelled' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Cancelled
              </button>
            </div>
          </div>
        </div>
      </div>

  {/* List */}
      <div className="space-y-6">
        <div className="space-y-4">
          {/* Header Section */}
          <h2 className="text-title-large"></h2>
          
          {/* Grid */}
          {filteredOrders.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-surface-600">No found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedOrders.map(order => (
              <div key={order.id} className="card p-0 border border-surface-200 hover:shadow-elevation-3 transition-all duration-200 flex flex-col h-full">
                {/* Card Content - Main body */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-title-medium">{order.id.slice(-6)}</h3>
                      <p className="text-body-medium text-surface-600">
                        {order.customerName} • {order.type}
                        {order.tableNumber && ` • Table ${order.tableNumber}`}
                      </p>
                      <p className="text-body-small text-surface-500">
                        {(() => {
                          let date: Date;
                          if (order.orderTime instanceof Date) {
                            date = order.orderTime;
                          } else if (
                            typeof order.orderTime === 'object' &&
                            order.orderTime !== null &&
                            'toDate' in order.orderTime &&
                            typeof (order.orderTime as { toDate?: unknown }).toDate === 'function'
                          ) {
                            date = (order.orderTime as { toDate: () => Date }).toDate(); // Firestore Timestamp
                          } else {
                            date = new Date(order.orderTime as string);
                          }
                          return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                        })()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`chip ${getStatusColor(order.status)} mb-2`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status.toUpperCase()}</span>
                      </div>
                      <div className={`text-body-small ${getPaymentStatusColor(order.paymentStatus)}`}>
                        <span className="inline mr-1 font-bold text-primary-700">OMR</span>
                        {order.paymentStatus.toUpperCase()}
                      </div>
                      {(order.status === 'ready' || order.status === 'completed') && order.deliveryStatus === 'delivered' && (
                        <div className="text-body-small text-green-600 mt-1">
                          <Truck className="w-3 h-3 inline mr-1" />
                          DELIVERED
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.slice(0, 2).map(item => (
                      <div key={item.id} className="flex justify-between text-body-small">
                        <span>{item.quantity}x {item.menuItem.name}</span>
                        <span>OMR {(item.menuItem.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-body-small text-surface-600">
                        +{order.items.length - 2} more items
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer - Price, time and actions */}
                <div className="border-t border-surface-100 bg-surface-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="text-title-medium font-semibold text-primary-600">
                        OMR {order.grandTotal.toFixed(2)}
                      </div>
                      <div className="text-body-small text-surface-600 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {(() => {
                          let date: Date;
                          if (order.orderTime instanceof Date) {
                            date = order.orderTime;
                          } else if (
                            typeof order.orderTime === 'object' &&
                            order.orderTime !== null &&
                            'toDate' in order.orderTime &&
                            typeof (order.orderTime as { toDate?: unknown }).toDate === 'function'
                          ) {
                            date = (order.orderTime as { toDate: () => Date }).toDate();
                          } else {
                            date = new Date(order.orderTime as string);
                          }
                          return getTimeElapsed(date);
                        })()}min ago
                      </div>
                    </div>
                    <div className="flex space-x-2 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedOrderId(order.id);
                          setShowOrderDialog(true);
                        }}
                        className="p-2 hover:bg-surface-200 rounded-lg transition-colors border border-surface-200"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {(order.status === 'ready' || order.status === 'completed') && selectedStatus !== 'ready' && (
                        <button
                          onClick={() => handleDeliveryStatusToggle(order.id, order.deliveryStatus)}
                          className={`p-2 rounded-lg transition-colors border ${
                            order.deliveryStatus === 'delivered' 
                              ? 'bg-green-100 text-green-600 border-green-200 hover:bg-green-200' 
                              : 'bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-200'
                          }`}
                          title={order.deliveryStatus === 'delivered' ? 'Mark as pending' : 'Mark as delivered'}
                        >
                          <Truck className="w-4 h-4" />
                        </button>
                      )}
                      {order.status !== 'completed' && order.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors border border-red-200"
                          title="Cancel order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
          
          {/* Simple Pagination Controls (Previous / Next) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end mt-8 pb-8 sm:pb-12 md:pb-6">
              <div className="flex items-center">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 mr-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                  title="Previous page"
                >
                  <span className="material-icons">chevron_left</span>
                </button>

                <div className="text-sm text-gray-600 mr-3">
                  Page {currentPage} of {totalPages}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                  title="Next page"
                >
                  <span className="material-icons">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Dialog Modal */}
  {showOrderDialog && selectedOrderId && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] m-0 p-0">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4 my-8">
            <div className="flex items-center justify-between p-6 border-b border-surface-200">
              <h3 className="text-title-large">Order Details</h3>
              <button
                onClick={() => {
                  setShowOrderDialog(false);
                  setSelectedOrderId(null);
                }}
                className="p-2 hover:bg-surface-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <OrderDetailsPanel orderId={selectedOrderId} />
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showCancelConfirmation}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmText="Yes, Cancel Order"
        cancelText="No, Keep It"
        onConfirm={confirmCancelOrder}
        onCancel={() => {
          setShowCancelConfirmation(false);
          setOrderToCancel(null);
        }}
        type="danger"
      />
    </div>
  );
};

interface OrderDetailsPanelProps {
  orderId: string;
}

const OrderDetailsPanel: React.FC<OrderDetailsPanelProps> = ({ orderId }) => {
  const { orders } = useApp();
  const order = React.useMemo(() => orders.find(o => o.id === orderId), [orders, orderId]);
  if (!order) {
    return (
      <div className="p-4 text-center text-surface-500">
        <p>Order no longer available or was removed.</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
        {/* Order Info */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-title-medium">Order {order.id.slice(-6)}</h4>
            {order.draft && (
              <span className="chip chip-secondary">DRAFT</span>
            )}
          </div>
          <div className="space-y-1 text-body-medium">
            <p><strong>Customer:</strong> {order.customerName}</p>
            <p><strong>Phone:</strong> {order.customerPhone}</p>
            <p><strong>Type:</strong> {order.type}</p>
            {order.tableNumber && <p><strong>Table:</strong> {order.tableNumber}</p>}
            {order.customerAddress && <p><strong>Vehicle No:</strong> {order.customerAddress}</p>}
            <p><strong>Order Time:</strong> {(() => {
              let date: Date;
              if (order.orderTime instanceof Date) {
                date = order.orderTime;
              } else if (
                typeof order.orderTime === 'object' &&
                order.orderTime !== null &&
                'toDate' in order.orderTime &&
                typeof (order.orderTime as { toDate?: unknown }).toDate === 'function'
              ) {
                date = (order.orderTime as { toDate: () => Date }).toDate();
              } else {
                date = new Date(order.orderTime as string);
              }
              return date.toLocaleString();
            })()}</p>
            {order.estimatedTime && <p><strong>Estimated Time:</strong> {order.estimatedTime} minutes</p>}
          </div>
        </div>

        {/* Order Status Timeline */}
        <div>
          <h4 className="text-title-medium mb-4">Order Progress</h4>
          <OrderStatusTimeline currentStatus={order.status} order={order} />
        </div>

        {/* Order Items */}
        <div>
          <h4 className="text-title-medium mb-2">Items</h4>
          <div className="space-y-3">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between items-start p-3 bg-surface-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-body-medium font-medium">
                    {item.quantity}x {item.menuItem.name}
                  </p>
                  <p className="text-body-small text-surface-600">
                    OMR {item.menuItem.price.toFixed(2)} each
                  </p>
                  {item.sugarPreference && (
                    <p className="text-body-small text-primary-700 mt-1">
                      Sugar: {item.sugarPreference}
                    </p>
                  )}
                  {item.specialInstructions && (
                    <p className="text-body-small text-warning-700 mt-1">
                      Note: {item.specialInstructions}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-body-medium font-medium">
                    OMR {(item.menuItem.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Billing */}
        <div>
          <h4 className="text-title-medium mb-2">Billing</h4>
          <div className="space-y-2 text-body-medium">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>OMR {order.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>OMR {order.tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-surface-200 pt-2 flex justify-between font-medium">
              <span>Total:</span>
              <span>OMR {order.grandTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Status:</span>
              <span className={`font-medium ${
                order.paymentStatus === 'paid' ? 'text-success-600' :
                order.paymentStatus === 'pending' ? 'text-warning-600' :
                order.paymentStatus === 'partial' ? 'text-amber-600' :
                'text-error-600'
              }`}>
                {order.paymentStatus.toUpperCase()}
              </span>
            </div>
            {order.paymentMethod && (
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-medium">
                  {order.paymentMethod === 'cash' && (
                    <span className="flex items-center"><Banknote className="w-4 h-4 mr-1" /> Cash</span>
                  )}
                  {order.paymentMethod === 'card' && (
                    <span className="flex items-center"><CreditCard className="w-4 h-4 mr-1" /> Card</span>
                  )}
                  {order.paymentMethod === 'online' && (
                    <span className="flex items-center"><Globe className="w-4 h-4 mr-1" /> Online</span>
                  )}
                  {order.paymentMethod === 'upi' && (
                    <span className="flex items-center"><Smartphone className="w-4 h-4 mr-1" /> UPI</span>
                  )}
                </span>
              </div>
            )}
          </div>
          {(order.status === 'ready' || order.status === 'completed') && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 flex items-center">
                <Receipt className="w-4 h-4 mr-2" />
                {order.paymentStatus === 'paid' 
                  ? "Bill has been generated and payment received" 
                  : "This order is ready for billing"}
              </p>
            </div>
          )}
        </div>
    </div>
  );
};

interface OrderStatusTimelineProps {
  currentStatus: Order['status'];
  order?: Order;
}

const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({ currentStatus, order }) => {
  const timelineSteps = [
    {
      id: 'pending',
      label: 'Order Placed',
      icon: Clock,
      description: 'Order received and pending confirmation'
    },
    {
      id: 'confirmed',
      label: 'Confirmed',
      icon: CheckCircle,
      description: 'Order confirmed and sent to kitchen'
    },
    {
      id: 'preparing',
      label: 'Preparing',
      icon: ChefHat,
      description: 'Kitchen is preparing your order'
    },
    {
      id: 'ready',
      label: 'Ready',
      icon: Package,
      description: 'Order is ready for pickup/delivery'
    },
    {
      id: 'delivered',
      label: 'Payment Completed & Delivered',
      icon: DollarSign,
      description: 'Payment received and order delivered to customer'
    }
  ];

  const getStepStatus = (stepId: string) => {
    // Handle draft orders specially
    if (currentStatus === 'pending' && order?.draft) {
      return stepId === 'pending' ? 'draft' : 'pending';
    }
    
    // If final step (delivered), handle based on completion and delivery status
    if (stepId === 'delivered') {
      if (currentStatus === 'completed' && order?.paymentStatus === 'paid' && order?.deliveryStatus === 'delivered') {
        return 'completed';
      }
      if (currentStatus === 'completed' && order?.paymentStatus === 'paid' && order?.deliveryStatus !== 'delivered') {
        return 'paused'; // Payment completed but waiting for delivery
      }
      return 'pending';
    }
    
    const currentIndex = timelineSteps.findIndex(step => step.id === currentStatus);
    const stepIndex = timelineSteps.findIndex(step => step.id === stepId);
    
    if (currentStatus === 'cancelled') {
      return stepIndex === 0 ? 'completed' : 'cancelled';
    }
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const getStepStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          container: 'text-success-600',
          icon: 'bg-success-600 text-white',
          line: 'bg-success-600'
        };
      case 'current':
        return {
          container: 'text-primary-600',
          icon: 'bg-primary-600 text-white',
          line: 'bg-surface-300'
        };
      case 'paused':
        return {
          container: 'text-amber-600',
          icon: 'bg-amber-500 text-white',
          line: 'bg-amber-300'
        };
      case 'cancelled':
        return {
          container: 'text-error-600',
          icon: 'bg-error-600 text-white',
          line: 'bg-error-600'
        };
      case 'draft':
        return {
          container: 'text-surface-600',
          icon: 'bg-surface-600 text-white',
          line: 'bg-surface-300'
        };
      default:
        return {
          container: 'text-surface-400',
          icon: 'bg-surface-200 text-surface-600',
          line: 'bg-surface-200'
        };
    }
  };

  return (
    <div className="space-y-4">
      {timelineSteps.map((step, index) => {
        const status = getStepStatus(step.id);
        const styles = getStepStyles(status);
        const Icon = step.icon;
        const isLast = index === timelineSteps.length - 1;

        return (
          <div key={step.id} className="flex items-start">
            {/* Icon */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${styles.icon}`}>
                <Icon className="w-5 h-5" />
              </div>
              {!isLast && (
                <div className={`w-0.5 h-8 mt-2 ${styles.line}`} />
              )}
            </div>

            {/* Content */}
            <div className={`ml-4 pb-6 ${styles.container}`}>
              <h5 className="text-body-large font-medium">{step.label}</h5>
              <p className="text-body-small mt-1">
                {status === 'paused' && step.id === 'delivered' 
                  ? 'Payment completed, waiting for delivery' 
                  : step.description}
              </p>
              {status === 'current' && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Current Status
                  </span>
                </div>
              )}
              {status === 'paused' && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Awaiting Delivery
                  </span>
                </div>
              )}
              {status === 'draft' && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-surface-100 text-surface-800">
                    Draft
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
      {currentStatus === 'cancelled' && (
        <div className="flex items-start">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-error-600 text-white">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="ml-4 text-error-600">
            <h5 className="text-body-large font-medium">Order Cancelled</h5>
            <p className="text-body-small mt-1">This order has been cancelled</p>
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-error-100 text-error-800">
                Cancelled
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStatusManagement;
