import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Order, Bill } from '../../types';
import { Receipt, Download, Printer, CreditCard, Banknote, Smartphone, Globe, DollarSign, X, Loader2 } from 'lucide-react';

const BillingPayments: React.FC = () => {
  const { orders, bills, generateBill, getTodaysRevenue } = useApp();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<Bill['paymentMethod']>('cash');
  const [paymentFilter, setPaymentFilter] = useState<'all' | Order['paymentStatus']>('all');
  const [showBillingDialog, setShowBillingDialog] = useState(false);
  const [billingOrder, setBillingOrder] = useState<Order | null>(null);
  const [displayedOrdersCount, setDisplayedOrdersCount] = useState(6);
  const [displayedBillsCount, setDisplayedBillsCount] = useState(6);
  const [isGeneratingBill, setIsGeneratingBill] = useState(false);

  const readyOrders = orders.filter(order => 
    order.status === 'ready' && order.paymentStatus === 'pending'
  );

  const filteredOrders = (paymentFilter === 'all' 
    ? orders.filter(order => ['ready', 'completed'].includes(order.status))
    : orders.filter(order => 
        ['ready', 'completed'].includes(order.status) && order.paymentStatus === paymentFilter
      )
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

  const todaysRevenue = getTodaysRevenue();

  const downloadBillPDF = (bill: Bill) => {
    // In a real app, this would generate and download a PDF
    const billContent = generateBillHTML(bill);
    const blob = new Blob([billContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bill-${bill.id}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printBill = (bill: Bill) => {
    const billContent = generateBillHTML(bill);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(billContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generateBillHTML = (bill: Bill) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill - ${bill.id}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .total { border-top: 1px solid #000; padding-top: 10px; margin-top: 10px; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Hotel Management</h2>
          <p>Bill No: ${bill.id}</p>
          <p>Date: ${formatDate(bill.generatedAt)}</p>
          <p>Time: ${formatTime(bill.generatedAt)}</p>
        </div>
        
        <div>
          <p><strong>Customer:</strong> ${bill.customerDetails.name}</p>
          <p><strong>Phone:</strong> ${bill.customerDetails.phone}</p>
          ${bill.customerDetails.tableNumber ? `<p><strong>Table:</strong> ${bill.customerDetails.tableNumber}</p>` : ''}
          ${bill.customerDetails.address ? `<p><strong>Vehicle No:</strong> ${bill.customerDetails.address}</p>` : ''}
        </div>
        
        <div style="margin: 20px 0;">
          ${bill.items.map(item => `
            <div class="item">
              <span>${item.quantity}x ${item.menuItem.name}</span>
              <span>$${(item.menuItem.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
        
        <div class="total">
          <div class="item">
            <span>Subtotal:</span>
            <span>$${bill.subtotal.toFixed(2)}</span>
          </div>
          ${bill.serviceCharge ? `
            <div class="item">
              <span>Service Charge (10%):</span>
              <span>$${bill.serviceCharge.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="item">
            <span>Tax (${(bill.taxRate * 100).toFixed(0)}%):</span>
            <span>$${bill.taxAmount.toFixed(2)}</span>
          </div>
          <div class="item" style="font-size: 18px;">
            <span>Total:</span>
            <span>$${bill.total.toFixed(2)}</span>
          </div>
          <div class="item">
            <span>Payment Method:</span>
            <span>${bill.paymentMethod.toUpperCase()}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for your visit!</p>
          <p>Generated by: ${bill.generatedBy}</p>
        </div>
      </body>
      </html>
    `;
  };

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

  const getStatusChipColor = (status: Order['status']) => {
    switch (status) {
      case 'ready': return 'chip-success';
      case 'completed': return 'chip-success';
      default: return 'chip-primary';
    }
  };

  const formatDate = (date: any) => {
    try {
      if (!date) return 'N/A';
      if (date instanceof Date) return date.toLocaleDateString();
      if (date.toDate && typeof date.toDate === 'function') return date.toDate().toLocaleDateString();
      return new Date(date).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  const formatTime = (date: any) => {
    try {
      if (!date) return 'N/A';
      if (date instanceof Date) return date.toLocaleTimeString();
      if (date.toDate && typeof date.toDate === 'function') return date.toDate().toLocaleTimeString();
      return new Date(date).toLocaleTimeString();
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'N/A';
    }
  };

  return (
    <div className="space-y-6">
      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-title-large text-success-600">${todaysRevenue.toFixed(2)}</div>
          <div className="text-body-medium text-surface-600">Today's Revenue</div>
        </div>
        <div className="card text-center">
          <div className="text-title-large text-primary-600">{readyOrders.length}</div>
          <div className="text-body-medium text-surface-600">Ready for Billing</div>
        </div>
        <div className="card text-center">
          <div className="text-title-large text-surface-900">{bills.length}</div>
          <div className="text-body-medium text-surface-600">Bills Generated</div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Orders Section */}
        <div className="space-y-4">
          {/* Header and Filters */}
          <div className="flex items-center justify-between">
            <h2 className="text-title-large">Orders</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setPaymentFilter('all')}
                className={`px-3 py-1 rounded-full text-sm ${
                  paymentFilter === 'all' 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'bg-surface-100 text-surface-600'
                }`}
              >
                All ({filteredOrders.length})
              </button>
              <button
                onClick={() => setPaymentFilter('pending')}
                className={`px-3 py-1 rounded-full text-sm ${
                  paymentFilter === 'pending' 
                    ? 'bg-warning-100 text-warning-700' 
                    : 'bg-surface-100 text-surface-600'
                }`}
              >
                Pending ({orders.filter(o => ['ready', 'completed'].includes(o.status) && o.paymentStatus === 'pending').length})
              </button>
              <button
                onClick={() => setPaymentFilter('paid')}
                className={`px-3 py-1 rounded-full text-sm ${
                  paymentFilter === 'paid' 
                    ? 'bg-success-100 text-success-700' 
                    : 'bg-surface-100 text-surface-600'
                }`}
              >
                Paid ({orders.filter(o => ['ready', 'completed'].includes(o.status) && o.paymentStatus === 'paid').length})
              </button>
            </div>
          </div>
          
          {/* Orders Grid */}
          {filteredOrders.length === 0 ? (
            <div className="card text-center py-8">
              <Receipt className="w-12 h-12 text-surface-300 mx-auto mb-4" />
              <p className="text-surface-600">No orders found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.slice(0, displayedOrdersCount).map(order => (
              <div 
                key={order.id} 
                className="card hover:shadow-elevation-3 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-title-medium">#{order.id.slice(-6)}</h3>
                    <p className="text-body-medium text-surface-600">
                      {order.customerName}
                      {order.tableNumber && ` • Table ${order.tableNumber}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-title-medium">${order.grandTotal.toFixed(2)}</div>
                    <div className={`chip ${getStatusChipColor(order.status)} text-xs mb-2`}>
                      {order.status.toUpperCase()}
                    </div>
                    <div className={`text-body-small ${getPaymentStatusColor(order.paymentStatus)}`}>
                      <DollarSign className="w-3 h-3 inline mr-1" />
                      {order.paymentStatus.toUpperCase()}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  {order.items.slice(0, 2).map(item => (
                    <div key={item.id} className="flex justify-between text-body-small">
                      <span>{item.quantity}x {item.menuItem.name}</span>
                      <span>${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-body-small text-surface-600">
                      +{order.items.length - 2} more items
                    </p>
                  )}
                </div>

                {/* Generate Bill Button - Only show for unpaid orders */}
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
                  <div className="w-full bg-success-50 text-success-700 rounded-lg text-center font-medium flex items-center justify-center space-x-2 min-h-[44px]">
                    ✓ Payment Completed
                  </div>
                )}
              </div>
            ))}
              </div>
              
              {/* View More Orders Button */}
              {filteredOrders.length > displayedOrdersCount && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setDisplayedOrdersCount(filteredOrders.length)}
                    className="btn-secondary px-6 py-2 flex items-center space-x-2"
                  >
                    <span>View More Orders ({filteredOrders.length - displayedOrdersCount} remaining)</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>      {/* Recent Bills */}
      <div className="card">
        <h3 className="text-title-large mb-4">Recent Bills ({bills.length})</h3>
        {bills.length === 0 ? (
          <p className="text-surface-600 text-center py-8">No bills generated yet</p>
        ) : (
          <>
            <div className="space-y-3">
              {bills.slice(-Math.min(displayedBillsCount, bills.length)).reverse().map(bill => (
              <div key={bill.id} className="flex items-center justify-between p-4 bg-surface-50 rounded-lg">
                <div>
                  <p className="text-body-medium font-medium">{bill.id}</p>
                  <p className="text-body-small text-surface-600">
                    {bill.customerDetails.name} • {formatDate(bill.generatedAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-body-medium font-medium">${bill.total.toFixed(2)}</p>
                    <div className="flex items-center space-x-1 text-body-small text-surface-600">
                      {getPaymentIcon(bill.paymentMethod)}
                      <span className="capitalize">{bill.paymentMethod}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => downloadBillPDF(bill)}
                      className="p-2 hover:bg-surface-200 rounded-lg"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => printBill(bill)}
                      className="p-2 hover:bg-surface-200 rounded-lg"
                      title="Print"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            </div>
            
            {/* View More Bills Button */}
            {bills.length > displayedBillsCount && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setDisplayedBillsCount(bills.length)}
                  className="btn-secondary px-6 py-2 flex items-center space-x-2"
                >
                  <span>View More Bills ({bills.length - displayedBillsCount} remaining)</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

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
                <h4 className="text-title-medium mb-2">Order #{billingOrder.id.slice(-6)}</h4>
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
                    <div key={item.id} className="flex justify-between text-body-medium">
                      <span>{item.quantity}x {item.menuItem.name}</span>
                      <span>${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bill Calculation */}
              <div className="border-t border-surface-200 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${billingOrder.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Charge (10%):</span>
                  <span>${(billingOrder.total * 0.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (18%):</span>
                  <span>${billingOrder.tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-surface-200 pt-2 flex justify-between font-medium text-title-medium">
                  <span>Total:</span>
                  <span>${billingOrder.grandTotal.toFixed(2)}</span>
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
                      try {
                        setIsGeneratingBill(true);
                        console.log('Generating bill for order:', billingOrder.id);
                        await generateBill(billingOrder.id, user?.name || 'Unknown', paymentMethod);
                        alert('Bill generated successfully!');
                        setShowBillingDialog(false);
                        setBillingOrder(null);
                      } catch (error) {
                        console.error('Error generating bill:', error);
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                        alert(`Failed to generate bill: ${errorMessage}`);
                      } finally {
                        setIsGeneratingBill(false);
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
                
                <button
                  onClick={() => {
                    if (billingOrder) {
                      const bill = {
                        id: `BILL-${Date.now()}`,
                        orderId: billingOrder.id,
                        items: billingOrder.items,
                        subtotal: billingOrder.total,
                        taxRate: 0.18,
                        taxAmount: billingOrder.tax,
                        serviceCharge: billingOrder.total * 0.1,
                        total: billingOrder.grandTotal,
                        generatedAt: new Date(),
                        generatedBy: user?.name || 'Unknown',
                        paymentMethod,
                        customerDetails: {
                          name: billingOrder.customerName,
                          phone: billingOrder.customerPhone,
                          address: billingOrder.customerAddress,
                          tableNumber: billingOrder.tableNumber,
                        },
                      };
                      printBill(bill);
                    }
                  }}
                  className="w-full btn-secondary flex items-center justify-center space-x-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Invoice</span>
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
