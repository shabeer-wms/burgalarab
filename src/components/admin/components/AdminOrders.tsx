import React, { useState } from "react";
import { Order } from "../../../types";
import {
  Printer,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  ChefHat,
  Download,
  RotateCcw,
} from "lucide-react";

// Helper functions
const formatDate = (dateValue: Date | string | { toDate: () => Date }) => {
  try {
    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString();
    } else if (typeof dateValue === "object" && dateValue.toDate) {
      return dateValue.toDate().toLocaleDateString();
    } else {
      return new Date(dateValue as string).toLocaleDateString();
    }
  } catch {
    return "Invalid Date";
  }
};

const formatDateTime = (dateValue: Date | string | { toDate: () => Date }) => {
  try {
    if (dateValue instanceof Date) {
      return dateValue.toLocaleString();
    } else if (typeof dateValue === "object" && dateValue.toDate) {
      return dateValue.toDate().toLocaleString();
    } else {
      return new Date(dateValue as string).toLocaleString();
    }
  } catch {
    return "Invalid Date";
  }
};

const formatTime = (dateValue: Date | string | { toDate: () => Date }) => {
  try {
    if (dateValue instanceof Date) {
      return dateValue.toLocaleTimeString();
    } else if (typeof dateValue === "object" && dateValue.toDate) {
      return dateValue.toDate().toLocaleTimeString();
    } else {
      return new Date(dateValue as string).toLocaleTimeString();
    }
  } catch {
    return "Invalid Time";
  }
};

interface AdminOrdersProps {
  orders: Order[];
  updateOrder: (id: string, updates: any) => Promise<void>;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  orders,
  updateOrder,
}) => {
  const [orderFilter, setOrderFilter] = useState<
    | "all"
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "completed"
    | "cancelled"
  >("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showCancelOrderModal, setShowCancelOrderModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<any>(null);

  const filteredOrders =
    orderFilter === "all"
      ? orders
      : orders.filter((order) => order.status === orderFilter);

  const printBill = (order: Order) => {
    const billContent = generateBillHTML(order);
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(billContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generateBillHTML = (order: Order) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill - Order #${order.id.slice(-4)}</title>
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
          <p>Order No: #${order.id.slice(-4)}</p>
          <p>Date: ${formatDate(order.orderTime)}</p>
          <p>Time: ${formatTime(order.orderTime)}</p>
        </div>
        
        <div>
          <p><strong>Customer:</strong> ${order.customerName}</p>
          <p><strong>Phone:</strong> ${order.customerPhone}</p>
          ${
            order.tableNumber
              ? `<p><strong>Table:</strong> ${order.tableNumber}</p>`
              : ""
          }
          ${
            order.customerAddress
              ? `<p><strong>Vehicle No:</strong> ${order.customerAddress}</p>`
              : ""
          }
        </div>
        
        <div style="margin: 20px 0;">
          ${order.items
            .map(
              (item) => `
            <div class="item">
              <span>${item.quantity || 0}x ${
                item.menuItem?.name || "Unknown Item"
              }</span>
              <span>$${(
                (item.menuItem?.price || 0) * (item.quantity || 0)
              ).toFixed(2)}</span>
            </div>
          `
            )
            .join("")}
        </div>
        
        <div class="total">
          <div class="item">
            <span>Subtotal:</span>
            <span>$${(order.total || 0).toFixed(2)}</span>
          </div>
          <div class="item">
            <span>Tax (10%):</span>
            <span>$${(order.tax || 0).toFixed(2)}</span>
          </div>
          <div class="item" style="font-size: 18px;">
            <span>Total:</span>
            <span>$${(order.grandTotal || 0).toFixed(2)}</span>
          </div>
          <div class="item">
            <span>Payment Method:</span>
            <span>${(
              order.paymentMethod || "Not specified"
            ).toUpperCase()}</span>
          </div>
          <div class="item">
            <span>Payment Status:</span>
            <span>${(order.paymentStatus || "pending").toUpperCase()}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for your visit!</p>
          <p>Generated from Admin Panel</p>
        </div>
      </body>
      </html>
    `;
  };

  const handleCancelOrder = (order: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setOrderToCancel(order);
    setShowCancelOrderModal(true);
  };

  const confirmCancelOrder = () => {
    if (orderToCancel) {
      updateOrder(orderToCancel.id, { status: "cancelled" });
      setOrderToCancel(null);
      setShowCancelOrderModal(false);
    }
  };

  const handleUncancelOrder = (order: any, e: React.MouseEvent) => {
    e.stopPropagation();
    updateOrder(order.id, { status: "pending" });
  };

  const cancelCancelOrder = () => {
    setOrderToCancel(null);
    setShowCancelOrderModal(false);
  };

  const handleExportOrders = () => {
    try {
      // Prepare data for export
      const exportData = filteredOrders.map((order) => ({
        "Order ID": order.id,
        "Customer Name": order.customerName || "N/A",
        "Table Number": order.tableNumber || "N/A",
        Status: order.status,
        "Order Date": formatDateTime(order.orderTime),
        "Total Amount": `$${order.grandTotal?.toFixed(2) || "0.00"}`,
        Items:
          order.items
            ?.map((item) => `${item.menuItem.name} x${item.quantity}`)
            .join(", ") || "No items",
        "Payment Method": order.paymentMethod || "N/A",
      }));

      // Convert to CSV
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(","),
        ...exportData.map((row) =>
          headers
            .map((header) => {
              const value = row[header as keyof typeof row];
              // Escape commas and quotes in values
              return `"${String(value).replace(/"/g, '""')}"`;
            })
            .join(",")
        ),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `orders_export_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting orders:", error);
      alert("Failed to export orders. Please try again.");
    }
  };

  return (
    <>
      <div className="space-y-4 sm:space-y-6 pb-20 md:pb-12">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Order Filters</h3>
            <button
              onClick={handleExportOrders}
              className="flex items-center justify-center text-gray-700 hover:text-gray-900 p-2 transition-colors duration-150 h-10 w-10 hover:bg-gray-100 rounded-lg"
              title="Export Orders"
            >
              <Download size={18} />
            </button>
          </div>
          
          {/* Filter chips with horizontal scroll on mobile */}
          <div className="overflow-x-auto lg:overflow-x-visible scrollbar-hide pb-2">
            <div className="flex lg:flex-wrap space-x-2 min-w-max lg:min-w-0">
              <button
                onClick={() => setOrderFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  orderFilter === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Orders
              </button>
              <button
                onClick={() => setOrderFilter('pending')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  orderFilter === 'pending'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setOrderFilter('confirmed')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  orderFilter === 'confirmed'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Confirmed
              </button>
              <button
                onClick={() => setOrderFilter('preparing')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  orderFilter === 'preparing'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Preparing
              </button>
              <button
                onClick={() => setOrderFilter('ready')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  orderFilter === 'ready'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Ready
              </button>
              <button
                onClick={() => setOrderFilter('completed')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  orderFilter === 'completed'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setOrderFilter('cancelled')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  orderFilter === 'cancelled'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancelled
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Type
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{order.id.slice(-4)}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          {formatDate(order.orderTime)}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                          {order.customerName}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[120px] sm:max-w-none">
                          {order.tableNumber || order.customerPhone}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          order.type === "dine-in"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {order.type}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${(order.grandTotal || 0).toFixed(2)}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "confirmed"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "preparing"
                            ? "bg-orange-100 text-orange-800"
                            : order.status === "ready"
                            ? "bg-green-100 text-green-800"
                            : order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          order.paymentStatus === "paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-1 sm:space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            printBill(order);
                          }}
                          className="text-purple-600 hover:text-purple-900 p-1"
                          title="Print Bill"
                        >
                          <Printer className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        {order.status === "cancelled" ? (
                          <button
                            onClick={(e) => handleUncancelOrder(order, e)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Uncancel Order"
                          >
                            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        ) : (
                          order.paymentStatus !== "paid" && (
                            <button
                              onClick={(e) => handleCancelOrder(order, e)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Cancel Order"
                            >
                              <X className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          )
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

      {/* Cancel Order Confirmation Modal */}
      {showCancelOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Cancel Order
            </h3>
            <p className="mb-6 text-gray-700">
              Are you sure you want to cancel this order?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={cancelCancelOrder}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmCancelOrder}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-surface-200">
              <h3 className="text-title-large">Order Details</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-surface-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <OrderDetailsPanel order={selectedOrder} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

interface OrderDetailsPanelProps {
  order: Order;
}

const OrderDetailsPanel: React.FC<OrderDetailsPanelProps> = ({ order }) => {
  return (
    <div className="space-y-6">
      {/* Order Info */}
      <div>
        <h4 className="text-title-medium mb-2">Order #{order.id.slice(-6)}</h4>
        <div className="space-y-1 text-body-medium">
          <p>
            <strong>Customer:</strong> {order.customerName}
          </p>
          <p>
            <strong>Phone:</strong> {order.customerPhone}
          </p>
          <p>
            <strong>Type:</strong> {order.type}
          </p>
          {order.tableNumber && (
            <p>
              <strong>Table:</strong> {order.tableNumber}
            </p>
          )}
          {order.customerAddress && (
            <p>
              <strong>Vehicle No:</strong> {order.customerAddress}
            </p>
          )}
          <p>
            <strong>Order Time:</strong> {formatDateTime(order.orderTime)}
          </p>
          {order.estimatedTime && (
            <p>
              <strong>Estimated Time:</strong> {order.estimatedTime} minutes
            </p>
          )}
        </div>
      </div>

      {/* Order Status Timeline */}
      <div>
        <h4 className="text-title-medium mb-4">Order Progress</h4>
        <OrderStatusTimeline currentStatus={order.status} />
      </div>

      {/* Order Items */}
      <div>
        <h4 className="text-title-medium mb-2">Items</h4>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-start p-3 bg-surface-50 rounded-lg"
            >
              <div className="flex-1">
                <p className="text-body-medium font-medium">
                  {item.quantity}x {item.menuItem.name}
                </p>
                <p className="text-body-small text-surface-600">
                  ${item.menuItem.price.toFixed(2)} each
                </p>
                {item.specialInstructions && (
                  <p className="text-body-small text-warning-700 mt-1">
                    Note: {item.specialInstructions}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-body-medium font-medium">
                  ${(item.menuItem.price * item.quantity).toFixed(2)}
                </p>
                <div
                  className={`chip text-xs ${
                    item.status === "pending"
                      ? "chip-warning"
                      : item.status === "preparing"
                      ? "chip-primary"
                      : item.status === "ready"
                      ? "chip-success"
                      : "chip-secondary"
                  }`}
                >
                  {item.status}
                </div>
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
            <span>${order.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>${order.tax.toFixed(2)}</span>
          </div>
          <div className="border-t border-surface-200 pt-2 flex justify-between font-medium">
            <span>Total:</span>
            <span>${order.grandTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Status:</span>
            <span
              className={`font-medium ${
                order.paymentStatus === "paid"
                  ? "text-success-600"
                  : order.paymentStatus === "pending"
                  ? "text-warning-600"
                  : "text-error-600"
              }`}
            >
              {order.paymentStatus.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface OrderStatusTimelineProps {
  currentStatus: Order["status"];
}

const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({
  currentStatus,
}) => {
  const timelineSteps = [
    {
      id: "pending",
      label: "Order Placed",
      icon: Clock,
      description: "Order received and pending confirmation",
    },
    {
      id: "confirmed",
      label: "Confirmed",
      icon: CheckCircle,
      description: "Order confirmed and sent to kitchen",
    },
    {
      id: "preparing",
      label: "Preparing",
      icon: ChefHat,
      description: "Kitchen is preparing your order",
    },
    {
      id: "ready",
      label: "Ready",
      icon: Package,
      description: "Order is ready for pickup/delivery",
    },
  ];

  const getStepStatus = (stepId: string) => {
    const currentIndex = timelineSteps.findIndex(
      (step) => step.id === currentStatus
    );
    const stepIndex = timelineSteps.findIndex((step) => step.id === stepId);

    if (currentStatus === "cancelled") {
      return stepIndex === 0 ? "completed" : "cancelled";
    }

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "pending";
  };

  const getStepStyles = (status: string) => {
    switch (status) {
      case "completed":
        return {
          container: "text-success-600",
          icon: "bg-success-600 text-white",
          line: "bg-success-600",
        };
      case "current":
        return {
          container: "text-primary-600",
          icon: "bg-primary-600 text-white",
          line: "bg-surface-300",
        };
      case "cancelled":
        return {
          container: "text-error-600",
          icon: "bg-error-600 text-white",
          line: "bg-error-600",
        };
      default:
        return {
          container: "text-surface-400",
          icon: "bg-surface-200 text-surface-600",
          line: "bg-surface-200",
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
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${styles.icon}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              {!isLast && <div className={`w-0.5 h-8 mt-2 ${styles.line}`} />}
            </div>

            {/* Content */}
            <div className={`ml-4 pb-6 ${styles.container}`}>
              <h5 className="text-body-large font-medium">{step.label}</h5>
              <p className="text-body-small mt-1">{step.description}</p>
              {status === "current" && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Current Status
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {currentStatus === "cancelled" && (
        <div className="flex items-start">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-error-600 text-white">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="ml-4 text-error-600">
            <h5 className="text-body-large font-medium">Order Cancelled</h5>
            <p className="text-body-small mt-1">
              This order has been cancelled
            </p>
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-error-100 text-error-800">
                Cancelled
              </span>
            </div>
          </div>
        </div>
      )}

      {currentStatus === "completed" && (
        <div className="flex items-start">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-success-600 text-white">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="ml-4 text-success-600">
            <h5 className="text-body-large font-medium">Order Completed</h5>
            <p className="text-body-small mt-1">
              Order has been delivered/picked up
            </p>
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
                Completed
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
