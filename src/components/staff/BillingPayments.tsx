import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Order, Bill } from '../../types';
import { Receipt, CreditCard, Banknote, Smartphone, Globe, X, Loader2, Printer } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const BillingPayments: React.FC = () => {
  const { orders, generateBill, showNotification } = useApp();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<Bill['paymentMethod']>('cash');
  const [paymentFilter, setPaymentFilter] = useState<'all' | Order['paymentStatus']>('all');
  const [showBillingDialog, setShowBillingDialog] = useState(false);
  const [billingOrder, setBillingOrder] = useState<Order | null>(null);
  const [isGeneratingBill, setIsGeneratingBill] = useState(false);
  const [showUpiQrModal, setShowUpiQrModal] = useState(false);
  
  // Pagination states for orders
  const [currentOrderPage, setCurrentOrderPage] = useState(1);
  const [orderItemsPerPage, setOrderItemsPerPage] = useState(9); // Default for tablet/desktop
  
  // Bills listing removed; retain bills only for generating when payment occurs

  // Responsive items per page based on screen size
  React.useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;
      if (width < 768) { // Mobile
        setOrderItemsPerPage(6);
  // bills list removed
      } else if (width < 1280) { // Tablet
        setOrderItemsPerPage(9);
  // bills list removed
      } else { // Desktop
        setOrderItemsPerPage(9);
  // bills list removed
      }
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  // Reset to first page when payment filter changes
  React.useEffect(() => {
    setCurrentOrderPage(1);
  }, [paymentFilter]);

  // If a waiter is logged in, only include their orders
  const baseOrders = user?.role === 'waiter' && user.id ? orders.filter(o => o.waiterId === user.id) : orders;

  const filteredOrders = (paymentFilter === 'all'
    ? baseOrders.filter(order => ['ready', 'completed'].includes(order.status))
    : baseOrders.filter(order => ['ready', 'completed'].includes(order.status) && order.paymentStatus === paymentFilter)
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

  // Orders pagination calculations
  const totalOrderItems = filteredOrders.length;
  const totalOrderPages = Math.ceil(totalOrderItems / orderItemsPerPage);
  const orderStartIndex = (currentOrderPage - 1) * orderItemsPerPage;
  const orderEndIndex = orderStartIndex + orderItemsPerPage;
  const paginatedOrders = filteredOrders.slice(orderStartIndex, orderEndIndex);

  // Bills pagination calculations
  // Removed bill pagination calculations
  // Removed bill pagination & export helpers since All Bills view is gone

  // Pagination helpers
  const goToOrderPage = (page: number) => {
    if (page < 1) {
      setCurrentOrderPage(1);
    } else if (page > totalOrderPages) {
      setCurrentOrderPage(totalOrderPages || 1);
    } else {
      setCurrentOrderPage(page);
    }
  };

  // Keep current page in bounds if data size shrinks
  React.useEffect(() => {
    if (currentOrderPage > totalOrderPages && totalOrderPages > 0) {
      setCurrentOrderPage(totalOrderPages);
    }
  }, [currentOrderPage, totalOrderPages]);

  const getPaymentIcon = (method: Bill['paymentMethod']) => {
    switch (method) {
      case 'cash': return <Banknote className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'upi': return <Smartphone className="w-4 h-4" />;
      case 'online': return <Globe className="w-4 h-4" />;
      default: return <Banknote className="w-4 h-4" />;
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

  const handlePrintReceipt = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const customerInfo = order.customerName ? `
      <div style="margin-bottom: 15px;">
        <strong>Customer Details:</strong><br>
        Name: ${order.customerName}<br>
        ${order.customerPhone ? `Phone: ${order.customerPhone}<br>` : ''}
        ${order.customerAddress ? `Address: ${order.customerAddress}<br>` : ''}
        ${order.tableNumber ? `Table: ${order.tableNumber}<br>` : ''}
      </div>
    ` : '';

    const orderDate = order.orderTime instanceof Date ? order.orderTime : 
                     typeof order.orderTime === 'string' ? new Date(order.orderTime) : 
                     order.orderTime?.toDate ? order.orderTime.toDate() : new Date();

    const printContent = `
      <html>
        <head>
          <title>Order Receipt - ${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .order-info { margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f2f2f2; }
            .total-section { border-top: 2px solid #333; padding-top: 10px; text-align: right; }
            .total-line { margin: 5px 0; }
            .grand-total { font-size: 18px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Restaurant Order Receipt</h2>
            <p>Order ID: ${order.id}</p>
          </div>
          
          <div class="order-info">
            <strong>Order Details:</strong><br>
            Date: ${orderDate.toLocaleDateString()} ${orderDate.toLocaleTimeString()}<br>
            Type: ${order.type}<br>
            Status: ${order.status}<br>
            Payment Status: ${order.paymentStatus}<br>
            ${order.paymentMethod ? `Payment Method: ${order.paymentMethod}<br>` : ''}
          </div>

          ${customerInfo}

          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.menuItem.name}</td>
                  <td>${item.quantity}</td>
                  <td>OMR ${item.menuItem.price.toFixed(2)}</td>
                  <td>OMR ${(item.quantity * item.menuItem.price).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-line">Subtotal: OMR ${order.total.toFixed(2)}</div>
            <div class="total-line">Tax (5%): OMR ${(order.total * 0.05).toFixed(2)}</div>
            <div class="total-line grand-total">Grand Total: OMR ${(order.total * 1.05).toFixed(2)}</div>
          </div>

          <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
            Thank you for your order!
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Section */}
        <div className="space-y-4">
          {/* Header and Filters - hidden on mobile, including Billing card */}
          <div className="hidden sm:block sm:flex items-start lg:items-center">
            <div className="overflow-x-auto pb-2 flex-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style dangerouslySetInnerHTML={{ __html: `.overflow-x-auto::-webkit-scrollbar { display: none; }` }} />
              <div className="flex space-x-2 min-w-max">
                <button
                  onClick={() => setPaymentFilter('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    paymentFilter === 'all' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setPaymentFilter('pending')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    paymentFilter === 'pending' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setPaymentFilter('paid')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    paymentFilter === 'paid' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                  }`}
                >
                  Paid
                </button>
              </div>
            </div>
            <h2 className="text-title-large"></h2>
          </div>
          {/* Header and Filters are now hidden on mobile (sm: and up) */}
          
          {/* Grid */}
          {filteredOrders.length === 0 ? (
            <div className="card text-center py-12 border border-dashed border-surface-300">
              <Receipt className="w-16 h-16 text-surface-300 mx-auto mb-4" />
              <p className="text-headline-small text-surface-600">No orders found</p>
              <p className="text-body-medium text-surface-500 mt-2">Orders will appear here once they are ready for billing</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedOrders.map(order => (
                  <div 
                    key={order.id} 
                    className="card p-0 border border-surface-200 hover:shadow-md transition-all duration-300 flex flex-col h-full"
                  >
                    {/* Card Content - Main body */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-title-medium text-primary-900"> {order.id.slice(-6)}</h3>
                          <p className="text-body-medium text-surface-700">
                            {order.customerName}
                            {order.tableNumber && ` • Table ${order.tableNumber}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-title-medium font-bold">OMR {order.grandTotal.toFixed(2)}</div>
                          <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-1 ${
                            order.status === 'ready' ? 'bg-success-100 text-success-800' : 
                            order.status === 'completed' ? 'bg-primary-100 text-primary-800' : 
                            'bg-surface-100 text-surface-800'
                          }`}>
                            {order.status.toUpperCase()}
                          </div>
                          <div className={`text-body-small ${getPaymentStatusColor(order.paymentStatus)} flex items-center justify-end`}>
                            <span className="inline mr-1 font-bold text-primary-700">OMR</span>
                            {order.paymentStatus.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 border-t border-b border-surface-100 py-2">
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

                    {/* Card Footer - Sticky at bottom */}
                    <div className="border-t border-surface-100 bg-surface-50 px-4 py-3">
                      {order.paymentStatus !== 'paid' ? (
                        <button
                          onClick={() => {
                            setBillingOrder(order);
                            setShowBillingDialog(true);
                          }}
                          className="w-full btn-primary flex items-center justify-center space-x-2"
                        >
                          <Receipt className="w-4 h-4" />
                          <span>Generate Bill</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePrintReceipt(order)}
                          className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Print Receipt</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Simple Pagination Controls (Previous / Next) */}
              {totalOrderPages > 1 && (
                <div className="flex items-center justify-end mt-8 pb-8 sm:pb-12 md:pb-6">
                  <div className="flex items-center">
                    <button
                      onClick={() => goToOrderPage(currentOrderPage - 1)}
                      disabled={currentOrderPage === 1}
                      className="p-2 mr-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      aria-label="Previous page"
                      title="Previous page"
                    >
                      <span className="material-icons">chevron_left</span>
                    </button>

                    <div className="text-sm text-gray-600 mr-3">
                      Page {currentOrderPage} of {totalOrderPages}
                    </div>

                    <button
                      onClick={() => goToOrderPage(currentOrderPage + 1)}
                      disabled={currentOrderPage === totalOrderPages}
                      className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      aria-label="Next page"
                      title="Next page"
                    >
                      <span className="material-icons">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

  {/* All Bills section removed per requirement: only show orders (billing queue) */}

      {/* Billing Dialog Modal */}
      {showBillingDialog && billingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            {/* Loading Overlay */}
            {isGeneratingBill && (
              <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-lg">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-2" />
                  <p className="text-body-medium text-surface-600">Generating Bill...</p>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between p-6 border-b border-surface-200">
              <h3 className="text-title-large">Generate Bill</h3>
              <button
                onClick={() => {
                  if (!isGeneratingBill) {
                    setShowBillingDialog(false);
                    setBillingOrder(null);
                  }
                }}
                disabled={isGeneratingBill}
                className={`p-2 rounded-lg transition-colors ${
                  isGeneratingBill 
                    ? 'cursor-not-allowed opacity-50' 
                    : 'hover:bg-surface-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Order Details */}
              <div>
                <h4 className="text-title-medium mb-2"> {billingOrder.id.slice(-6)}</h4>
                <p className="text-body-medium text-surface-600">
                  {billingOrder.customerName} • {billingOrder.customerPhone}
                </p>
                {billingOrder.tableNumber && (
                  <p className="text-body-medium text-surface-600">Table {billingOrder.tableNumber}</p>
                )}
              </div>

              {/* Items */}
              <div>
                <h4 className="text-title-medium mb-2">Items</h4>
                <div className="space-y-2">
                  {billingOrder.items.map(item => (
                    <div key={item.id} className="flex justify-between items-start text-body-medium">
                      <div className="flex-1">
                        <div>{item.quantity}x {item.menuItem.name}</div>
                        {item.sugarPreference && (
                          <div className="text-body-small text-primary-600">Sugar: {item.sugarPreference}</div>
                        )}
                        {item.specialInstructions && (
                          <div className="text-body-small text-warning-600">Note: {item.specialInstructions}</div>
                        )}
                      </div>
                      <span>OMR {(item.menuItem.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bill Calculation */}
              <div className="border-t border-surface-200 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>OMR {billingOrder.total.toFixed(2)}</span>
                </div>
              
                <div className="flex justify-between">
                  <span>Tax (5%):</span>
                  <span>OMR {billingOrder.tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-surface-200 pt-2 flex justify-between font-medium text-title-medium">
                  <span>Total:</span>
                  <span>OMR {billingOrder.grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <span className={`font-medium ${getPaymentStatusColor(billingOrder.paymentStatus)}`}>
                    {billingOrder.paymentStatus.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div className={isGeneratingBill ? 'opacity-50 pointer-events-none' : ''}>
                <h4 className="text-title-medium mb-3">Payment Method</h4>
                <div className="grid grid-cols-2 gap-2">
                  {(['cash', 'card', 'upi', 'online'] as Bill['paymentMethod'][]).map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      disabled={isGeneratingBill}
                      className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${
                        paymentMethod === method
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-surface-300 hover:bg-surface-50'
                      } ${isGeneratingBill ? 'cursor-not-allowed' : ''}`}
                    >
                      {getPaymentIcon(method)}
                      <span className="capitalize">{method}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={async () => {
                    if (billingOrder && !isGeneratingBill) {
                      if (paymentMethod === 'upi') {
                        // Show UPI QR modal instead of processing immediately
                        setShowUpiQrModal(true);
                      } else {
                        try {
                          setIsGeneratingBill(true);
                          await generateBill(billingOrder.id, user?.name || 'Unknown', paymentMethod);
                          showNotification('✅ Payment processed successfully! Marked as payment completed.', 'success');
                          setShowBillingDialog(false);
                          setBillingOrder(null);
                        } catch (error) {
                          console.error('Error generating bill:', error);
                          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                          showNotification(`Failed to generate bill: ${errorMessage}`, 'error');
                        } finally {
                          setIsGeneratingBill(false);
                        }
                      }
                    }
                  }}
                  disabled={isGeneratingBill}
                  className={`w-full flex items-center justify-center space-x-2 min-h-[48px] ${
                    isGeneratingBill 
                      ? 'bg-surface-300 text-surface-500 cursor-not-allowed' 
                      : 'btn-primary'
                  }`}
                >
                  {isGeneratingBill ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Receipt className="w-4 h-4" />
                  )}
                  <span>{isGeneratingBill ? 'Generating Bill...' : 'Generate Bill & Process Payment'}</span>
                </button>
                
                {/* Print Invoice button removed along with All Bills section */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPI QR Code Modal */}
      {showUpiQrModal && billingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[90%] sm:max-w-sm md:max-w-md p-3 sm:p-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Pay with UPI</h3>
              <button
                onClick={() => setShowUpiQrModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <div className="text-center space-y-3 sm:space-y-4">
              {/* QR Code */}
              <div className="bg-gray-50 p-2 sm:p-3 md:p-4 rounded-xl border-2 border-gray-200 inline-block">
                <img 
                  src="/upi-qr-code.jpg" 
                  alt="UPI QR Code" 
                  className="w-40 h-40 sm:w-48 sm:h-48 md:w-52 md:h-52 object-contain mx-auto"
                  onError={(e) => {
                    // Fallback to generated QR code if image not found
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden">
                  <QRCodeCanvas 
                    value="upi://pay?pa=sayedshahloobp-1@oksbi&pn=Restaurant&cu=OMR" 
                    size={256}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </div>
              
              {/* UPI ID */}
              <div className="space-y-1.5">
                <p className="text-xs sm:text-sm font-semibold text-gray-700">UPI ID</p>
                <div className="bg-blue-50 p-2 sm:p-3 rounded-lg border border-blue-200">
                  <p className="text-xs sm:text-sm md:text-base font-mono text-blue-700 break-all">sayedshahloobp-1@oksbi</p>
                </div>
              </div>
              
              {/* Amount */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 rounded-xl border-2 border-blue-300 shadow-sm">
                <p className="text-xs text-gray-600 mb-0.5">Amount to Pay</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-700">OMR {billingOrder.grandTotal.toFixed(2)}</p>
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={async () => {
                    try {
                      setShowUpiQrModal(false);
                      setIsGeneratingBill(true);
                      await generateBill(billingOrder.id, user?.name || 'Unknown', 'upi');
                      showNotification('✅ Payment processed successfully! Marked as payment completed.', 'success');
                      setShowBillingDialog(false);
                      setBillingOrder(null);
                    } catch (error) {
                      console.error('Error generating bill:', error);
                      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                      showNotification(`Failed to generate bill: ${errorMessage}`, 'error');
                    } finally {
                      setIsGeneratingBill(false);
                    }
                  }}
                  disabled={isGeneratingBill}
                  className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isGeneratingBill ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Receipt className="w-4 h-4" />
                  )}
                  <span className="text-sm sm:text-base">{isGeneratingBill ? 'Processing...' : 'Payment Completed'}</span>
                </button>
                
                <button
                  onClick={() => setShowUpiQrModal(false)}
                  disabled={isGeneratingBill}
                  className="w-full bg-gray-100 text-gray-700 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
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

export default BillingPayments;
