import React from "react";
import { DollarSign, Users, TrendingUp, Clock } from "lucide-react";
import { Order } from "../../../types";

interface AdminOverviewProps {
  orders: Order[];
  menuItems: any[];
  staff: any[];
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  orders,
  menuItems,
  staff,
}) => {
  // Analytics calculations
  const today = new Date();
  const todayOrders = orders.filter((order) => {
    try {
      let orderDate: Date;
      if (order.orderTime instanceof Date) {
        orderDate = order.orderTime;
      } else if (
        typeof order.orderTime === "object" &&
        order.orderTime.toDate
      ) {
        orderDate = order.orderTime.toDate();
      } else {
        orderDate = new Date(order.orderTime as string);
      }
      return orderDate.toDateString() === today.toDateString();
    } catch {
      return false;
    }
  });

  const completedOrders = orders.filter(
    (order) => order.status === "completed"
  );
  const totalRevenue = completedOrders.reduce(
    (sum, order) => sum + (order.grandTotal || 0),
    0
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-md p-2 sm:p-3 flex-shrink-0">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                Total Revenue
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                ${totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-md p-2 sm:p-3 flex-shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                Total Orders
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                {orders.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-md p-2 sm:p-3 flex-shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                Total Menu
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                {menuItems.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-orange-100 rounded-md p-2 sm:p-3 flex-shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                Total Staff
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                {staff.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
          Today's Summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center sm:text-left">
            <p className="text-sm text-gray-600">Orders Today</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              {todayOrders.length}
            </p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm text-gray-600">Revenue Today</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              $
              {todayOrders
                .filter((order) => order.status === "completed")
                .reduce((sum, order) => sum + order.grandTotal, 0)
                .toFixed(2)}
            </p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm text-gray-600">Active Orders</p>
            <p className="text-xl sm:text-2xl font-bold text-orange-600">
              {
                orders.filter((order) =>
                  [
                    "pending",
                    "confirmed",
                    "preparing",
                    "ready",
                  ].includes(order.status)
                ).length
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};