import React, { useState } from "react";
import { Order } from "../../../types";
import { Printer, Edit, X } from "lucide-react";

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
  const [orderUpdateLoading, setOrderUpdateLoading] = useState(false);
  const [orderUpdateError, setOrderUpdateError] = useState<string | null>(null);
  const [showEditOrderModal, setShowEditOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showCancelOrderModal, setShowCancelOrderModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<any>(null);

  // Helper function to format dates safely
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

  // Helper function to format date and time safely
  const formatDateTime = (
    dateValue: Date | string | { toDate: () => Date }
  ) => {
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

  const filteredOrders =
    orderFilter === "all"
      ? orders
      : orders.filter((order) => order.status === orderFilter);

  const openEditOrderModal = (order: any) => {
    setEditingOrder({ ...order });
    setShowEditOrderModal(true);
  };

  const handleEditOrder = async () => {
    if (editingOrder) {
      setOrderUpdateLoading(true);
      setOrderUpdateError(null);
      console.log("Updating order:", editingOrder);
      try {
        await updateOrder(editingOrder.id, {
          status: editingOrder.status,
          paymentStatus: editingOrder.paymentStatus,
          customerName: editingOrder.customerName,
          customerPhone: editingOrder.customerPhone,
          tableNumber: editingOrder.tableNumber,
          kitchenNotes: editingOrder.specialInstructions ?? "", // Never undefined
        });
        setShowEditOrderModal(false);
        setEditingOrder(null);
      } catch (err) {
        setOrderUpdateError("Failed to update order. See console for details.");
        console.error("Order update error:", err);
      } finally {
        setOrderUpdateLoading(false);
      }
    }
  };

  const printBill = (order: Order) => {
    // Mock bill printing
    const billContent = `
      HOTEL MANAGEMENT SYSTEM
      ========================
      
      Order #${order.id.slice(-4)}
      Date: ${formatDateTime(order.orderTime)}
      Customer: ${order.customerName}

      ${order.tableNumber ? `Table: ${order.tableNumber}` : ""}
      ${order.customerAddress ? `Vehicle No: ${order.customerAddress}` : ""}

      ${order.tableNumber ? `Table: ${order.tableNumber}` : ""}
      ${order.customerAddress ? `Address: ${order.customerAddress}` : ""}

      
      ITEMS:
      ${order.items
        .map(
          (item) =>
            `${item.quantity || 0}x ${
              item.menuItem?.name || "Unknown Item"
            } - $${((item.menuItem?.price || 0) * (item.quantity || 0)).toFixed(
              2
            )}`
        )
        .join("\n")}
      
      Subtotal: $${(order.total || 0).toFixed(2)}
      Tax (10%): $${(order.tax || 0).toFixed(2)}
      TOTAL: $${(order.grandTotal || 0).toFixed(2)}
      
      Payment Method: ${order.paymentMethod || "Not specified"}
      Status: ${order.paymentStatus}
      
      Thank you for dining with us!
    `;

    // In a real app, this would send to printer
    console.log("Printing bill:", billContent);
    alert("Bill sent to printer!");

    // Mark as paid if printing bill
    if (order.paymentStatus === "pending") {
      updateOrder(order.id, { paymentStatus: "paid" });
    }
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

  const cancelCancelOrder = () => {
    setOrderToCancel(null);
    setShowCancelOrderModal(false);
  };

  return (
    <>
      <div className="space-y-4 sm:space-y-6 pb-20 md:pb-0">
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
          {/* <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Order Management
          </h2> */}
          <div className="sm:flex-1"></div>
          
          <div
            className="relative w-full sm:w-auto"
            style={{ minWidth: "140px", maxWidth: "180px" }}
          >
            <select
              value={orderFilter}
              onChange={(e) => setOrderFilter(e.target.value as any)}
              className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm min-w-[140px] transition-colors duration-150 pr-8 h-10"
              style={{
                minWidth: "140px",
                maxWidth: "180px",
                height: "40px",
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
              }}
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 8L10 12L14 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
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
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
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
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
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
                        {order.status !== "completed" && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditOrderModal(order);
                              }}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Edit Order"
                            >
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            {order.status !== "cancelled" && (
                              <button
                                onClick={(e) => handleCancelOrder(order, e)}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Cancel Order"
                              >
                                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            )}
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

      {/* Edit Order Modal */}
      {showEditOrderModal && editingOrder && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
          style={{
            margin: 0,
            padding: 16,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
          }}
        >
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                Edit Order #{editingOrder.id.slice(-4)}
              </h3>
              <button
                onClick={() => setShowEditOrderModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={editingOrder.customerName}
                  onChange={(e) =>
                    setEditingOrder({
                      ...editingOrder,
                      customerName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Phone
                </label>
                <input
                  type="tel"
                  value={editingOrder.customerPhone || ""}
                  onChange={(e) =>
                    setEditingOrder({
                      ...editingOrder,
                      customerPhone: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Table Number
                </label>
                <input
                  type="number"
                  value={editingOrder.tableNumber || ""}
                  onChange={(e) =>
                    setEditingOrder({
                      ...editingOrder,
                      tableNumber: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Status
                </label>
                <select
                  value={editingOrder.status}
                  onChange={(e) =>
                    setEditingOrder({
                      ...editingOrder,
                      status: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white appearance-none pr-10"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 mt-3">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status
                </label>
                <select
                  value={editingOrder.paymentStatus}
                  onChange={(e) =>
                    setEditingOrder({
                      ...editingOrder,
                      paymentStatus: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white appearance-none pr-10"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 mt-3">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Instructions
                </label>
                <textarea
                  value={editingOrder.specialInstructions || ""}
                  onChange={(e) =>
                    setEditingOrder({
                      ...editingOrder,
                      specialInstructions: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter any special instructions..."
                />
              </div>

              {orderUpdateError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{orderUpdateError}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowEditOrderModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditOrder}
                  disabled={orderUpdateLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  {orderUpdateLoading ? "Updating..." : "Update Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
          style={{
            margin: 0,
            padding: 16,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
          }}
        >
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Order Details
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Order Status Timeline */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  Order Progress
                </h3>
                <div className="flex items-center justify-between relative">
                  {/* Timeline Steps */}
                  {(() => {
                    const steps = [
                      {
                        key: "pending",
                        label: "Pending",
                        bgClass: "bg-yellow-500",
                        borderClass: "border-yellow-500",
                      },
                      {
                        key: "confirmed",
                        label: "Confirmed",
                        bgClass: "bg-blue-500",
                        borderClass: "border-blue-500",
                      },
                      {
                        key: "preparing",
                        label: "Preparing",
                        bgClass: "bg-orange-500",
                        borderClass: "border-orange-500",
                      },
                      {
                        key: "ready",
                        label: "Ready",
                        bgClass: "bg-green-400",
                        borderClass: "border-green-400",
                      },
                      {
                        key: "completed",
                        label: "Completed",
                        bgClass: "bg-green-600",
                        borderClass: "border-green-600",
                      },
                      {
                        key: "paid",
                        label: "Paid",
                        bgClass: "bg-emerald-600",
                        borderClass: "border-emerald-600",
                      },
                      {
                        key: "cancelled",
                        label: "Cancelled",
                        bgClass: "bg-gray-500",
                        borderClass: "border-gray-500",
                      },
                    ];

                    const currentStatus = selectedOrder.status;
                    const paymentStatus = selectedOrder.paymentStatus;
                    const isCancelled = currentStatus === "cancelled";
                    const isPaid = paymentStatus === "paid";

                    // For cancelled orders, we need to determine at which step it was cancelled
                    // We'll use a heuristic: if an order has items and customer info, it was at least confirmed
                    // If it has kitchen notes or specific statuses recorded, we can infer further
                    let lastCompletedStep = 0; // Default to pending

                    if (isCancelled) {
                      // Determine the last completed step before cancellation
                      // This is a simplified heuristic - in a real app, you'd track cancellation point
                      if (
                        selectedOrder.items &&
                        selectedOrder.items.length > 0
                      ) {
                        lastCompletedStep = 1; // At least confirmed if items exist
                      }
                      // Add more logic here based on available data
                      // For now, we'll assume it was cancelled after confirmation
                    }

                    // Build display steps based on order status and payment status
                    let displaySteps;
                    if (isCancelled) {
                      // Show steps up to cancellation point, then show cancelled
                      const normalSteps = steps.slice(0, 6); // All normal steps except cancelled
                      const relevantSteps = normalSteps.slice(
                        0,
                        lastCompletedStep + 2
                      ); // Show completed + 1 more
                      displaySteps = [...relevantSteps, steps[6]]; // Add cancelled at the end
                    } else if (isPaid && currentStatus === "completed") {
                      displaySteps = steps.slice(0, -1); // Show all steps except cancelled, including paid
                    } else {
                      displaySteps = steps.slice(0, -2); // Normal flow, exclude paid and cancelled
                    }

                    // Determine active step index for normal orders
                    let activeStepIndex = steps.findIndex(
                      (step) => step.key === currentStatus
                    );
                    if (activeStepIndex === -1) activeStepIndex = 0;

                    return (
                      <>
                        {/* Connecting Lines */}
                        <div className="absolute top-6 left-0 w-full h-0.5 flex">
                          {displaySteps.slice(0, -1).map((_, index) => (
                            <div
                              key={index}
                              className="flex-1 mx-8 border-t-2 border-dashed border-gray-300"
                            />
                          ))}
                        </div>

                        {/* Step Circles and Labels */}
                        {displaySteps.map((step, index) => {
                          let isCompleted = false;

                          if (isCancelled) {
                            if (step.key === "cancelled") {
                              // Cancelled step is always highlighted when order is cancelled
                              isCompleted = true;
                            } else {
                              // For cancelled orders, only show steps up to the cancellation point as completed
                              isCompleted = index <= lastCompletedStep;
                            }
                          } else {
                            // Normal progression
                            if (step.key === "paid") {
                              // Paid step is completed only if payment is paid and order is completed
                              isCompleted =
                                isPaid && currentStatus === "completed";
                            } else {
                              isCompleted = index <= activeStepIndex;
                            }
                          }

                          return (
                            <div
                              key={step.key}
                              className="flex flex-col items-center relative z-10"
                            >
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 text-sm font-bold ${
                                  isCompleted
                                    ? `${step.bgClass} text-white ${step.borderClass}`
                                    : "bg-white text-gray-400 border-gray-300"
                                }`}
                              >
                                {index + 1}
                              </div>
                              <span
                                className={`text-xs font-medium mt-2 text-center max-w-[60px] ${
                                  isCompleted
                                    ? "text-gray-900"
                                    : "text-gray-400"
                                }`}
                              >
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Order Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-100">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                    <span className="text-white text-xs sm:text-sm font-bold">
                      #
                    </span>
                  </div>
                  Order Information
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-semibold text-xs sm:text-sm">
                          ID
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Order ID
                        </p>
                        <p className="text-base sm:text-lg font-bold text-gray-900 truncate">
                          #{selectedOrder.id.slice(-8)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 font-semibold text-xs sm:text-sm">
                          👤
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Customer
                        </p>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                          {selectedOrder.customerName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-600 font-semibold text-xs sm:text-sm">
                          📅
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Order Date
                        </p>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                          {formatDateTime(selectedOrder.orderTime)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-orange-600 font-semibold text-xs sm:text-sm">
                          🏪
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Order Type
                        </p>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                          {selectedOrder.type}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-yellow-600 font-semibold text-xs sm:text-sm">
                          📊
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Status
                        </p>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            selectedOrder.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : selectedOrder.status === "confirmed"
                              ? "bg-blue-100 text-blue-800"
                              : selectedOrder.status === "preparing"
                              ? "bg-orange-100 text-orange-800"
                              : selectedOrder.status === "ready"
                              ? "bg-green-100 text-green-800"
                              : selectedOrder.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {selectedOrder.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-600 font-semibold text-xs sm:text-sm">
                          💳
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Payment Status
                        </p>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            selectedOrder.paymentStatus === "paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {selectedOrder.paymentStatus}
                        </span>
                      </div>
                    </div>

                    {selectedOrder.tableNumber && (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-indigo-600 font-semibold text-xs sm:text-sm">
                            🪑
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Table Number
                          </p>
                          <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                            Table {selectedOrder.tableNumber}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 border border-green-100">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                    <span className="text-white text-xs sm:text-sm font-bold">
                      🍽️
                    </span>
                  </div>
                  Order Items
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-green-100"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                          {item.menuItem?.name || "Unknown Item"}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Quantity:{" "}
                          <span className="font-medium">
                            {item.quantity || 0}
                          </span>
                        </p>
                        {item.specialInstructions && (
                          <p className="text-xs sm:text-sm text-orange-600 italic mt-1">
                            Note: {item.specialInstructions}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-gray-900 text-sm sm:text-base">
                          $
                          {(
                            (item.menuItem?.price || 0) * (item.quantity || 0)
                          ).toFixed(2)}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          ${(item.menuItem?.price || 0).toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              {selectedOrder.specialInstructions && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 sm:p-6 border border-amber-100">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-amber-500 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                      <span className="text-white text-xs sm:text-sm font-bold">
                        📝
                      </span>
                    </div>
                    Special Instructions
                  </h3>
                  <div className="bg-white border border-amber-200 rounded-lg p-3 sm:p-4">
                    <p className="text-sm sm:text-base text-gray-700 italic">
                      "{selectedOrder.specialInstructions}"
                    </p>
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 sm:p-6 border border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-700 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                    <span className="text-white text-xs sm:text-sm font-bold">
                      💰
                    </span>
                  </div>
                  Order Summary
                </h3>
                <div className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border border-gray-200">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium text-gray-900">
                        ${(selectedOrder.total || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-gray-600">Tax (10%):</span>
                      <span className="font-medium text-gray-900">
                        ${(selectedOrder.tax || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between items-center text-lg sm:text-xl font-bold">
                        <span className="text-gray-900">Grand Total:</span>
                        <span className="text-green-600">
                          ${(selectedOrder.grandTotal || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm sm:text-base pt-2 border-t border-gray-100">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium text-gray-900">
                        {selectedOrder.paymentMethod || "Not specified"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              {(selectedOrder.customerPhone ||
                selectedOrder.customerAddress) && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-indigo-100">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                      <span className="text-white text-xs sm:text-sm font-bold">
                        👤
                      </span>
                    </div>
                    Customer Details
                  </h3>
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-indigo-100">
                    <div className="space-y-3">
                      {selectedOrder.customerPhone && (
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-indigo-600 font-semibold text-xs">
                              📞
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Phone
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {selectedOrder.customerPhone}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedOrder.customerAddress && (
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-indigo-600 font-semibold text-xs">
                              📍
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Address
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {selectedOrder.customerAddress}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    printBill(selectedOrder);
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md"
                >
                  <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium">Print Bill</span>
                </button>
                {selectedOrder.status !== "completed" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditOrderModal(selectedOrder);
                      setSelectedOrder(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md"
                  >
                    <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium">Edit Order</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
