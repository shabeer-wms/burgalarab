import React, { useState, useMemo } from "react";
import { DollarSign, TrendingUp, Clock, ShoppingBag } from "lucide-react";
import { Order } from "../../../types";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface AdminOverviewProps {
  orders: Order[];
}

type FilterPeriod = "today" | "this_week" | "this_month" | "this_year" | "total";

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  orders,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<FilterPeriod>("today");

  // Helper function to safely get order date
  const getOrderDate = (order: Order): Date | null => {
    try {
      if (order.orderTime instanceof Date) {
        return order.orderTime;
      } else if (
        typeof order.orderTime === "object" &&
        order.orderTime.toDate
      ) {
        return order.orderTime.toDate();
      } else {
        return new Date(order.orderTime as string);
      }
    } catch {
      return null;
    }
  };

  // Filter orders based on selected period
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);

    return orders.filter((order) => {
      const orderDate = getOrderDate(order);
      if (!orderDate) return false;

      switch (selectedPeriod) {
        case "today":
          return orderDate >= today;
        case "this_week":
          return orderDate >= thisWeekStart;
        case "this_month":
          return orderDate >= thisMonth;
        case "this_year":
          return orderDate >= thisYear;
        case "total":
        default:
          return true;
      }
    });
  }, [orders, selectedPeriod]);

  // Calculate metrics based on filtered orders
  const metrics = useMemo(() => {
    const paidOrders = filteredOrders.filter((order) => order.paymentStatus === "paid");
    const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.grandTotal || order.total || 0), 0);
    const activeOrders = filteredOrders.filter((order) =>
      ["pending", "confirmed", "preparing", "ready"].includes(order.status)
    ).length;
    
    const averageOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
    
    return {
      totalOrders: filteredOrders.length,
      totalRevenue,
      activeOrders,
      completedOrders: filteredOrders.filter((order) => order.status === "completed").length,
      averageOrderValue,
      paidOrders: paidOrders.length,
    };
  }, [filteredOrders]);

  // Generate chart data for revenue trends based on selected period
  const revenueChartData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    if (selectedPeriod === "today") {
      // Show hourly data for today
      for (let i = 0; i < 24; i++) {
        const hour = i;
        const hourOrders = filteredOrders.filter((order) => {
          const orderDate = getOrderDate(order);
          return orderDate && orderDate.getHours() === hour && order.paymentStatus === "paid";
        });
        
        const revenue = hourOrders.reduce((sum, order) => sum + (order.grandTotal || order.total || 0), 0);
        
        if (revenue > 0 || i >= 6) { // Show only from 6 AM or if there's revenue
          data.push({
            date: `${hour.toString().padStart(2, '0')}:00`,
            revenue: revenue,
            orders: hourOrders.length,
          });
        }
      }
    } else if (selectedPeriod === "this_week") {
      // Show last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const dateStr = date.toDateString();
        
        const dayOrders = orders.filter((order) => {
          const orderDate = getOrderDate(order);
          return orderDate && orderDate.toDateString() === dateStr && order.paymentStatus === "paid";
        });
        
        const revenue = dayOrders.reduce((sum, order) => sum + (order.grandTotal || order.total || 0), 0);
        
        data.push({
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          revenue: revenue,
          orders: dayOrders.length,
        });
      }
    } else if (selectedPeriod === "this_month") {
      // Show weeks of current month
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentWeek = Math.ceil(now.getDate() / 7);
      
      for (let week = 1; week <= currentWeek; week++) {
        const weekStart = new Date(firstDay);
        weekStart.setDate((week - 1) * 7 + 1);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const weekOrders = orders.filter((order) => {
          const orderDate = getOrderDate(order);
          return orderDate && orderDate >= weekStart && orderDate <= weekEnd && order.paymentStatus === "paid";
        });
        
        const revenue = weekOrders.reduce((sum, order) => sum + (order.grandTotal || order.total || 0), 0);
        
        data.push({
          date: `Week ${week}`,
          revenue: revenue,
          orders: weekOrders.length,
        });
      }
    } else if (selectedPeriod === "this_year") {
      // Show months of current year
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonth = now.getMonth();
      
      for (let month = 0; month <= currentMonth; month++) {
        const monthOrders = orders.filter((order) => {
          const orderDate = getOrderDate(order);
          return orderDate && orderDate.getFullYear() === now.getFullYear() && 
                 orderDate.getMonth() === month && order.paymentStatus === "paid";
        });
        
        const revenue = monthOrders.reduce((sum, order) => sum + (order.grandTotal || order.total || 0), 0);
        
        data.push({
          date: months[month],
          revenue: revenue,
          orders: monthOrders.length,
        });
      }
    } else {
      // Show last 30 days for "total"
      for (let i = 29; i >= 0; i -= 3) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const endDate = new Date(date);
        endDate.setDate(date.getDate() + 2);
        
        const periodOrders = orders.filter((order) => {
          const orderDate = getOrderDate(order);
          return orderDate && orderDate >= date && orderDate <= endDate && order.paymentStatus === "paid";
        });
        
        const revenue = periodOrders.reduce((sum, order) => sum + (order.grandTotal || order.total || 0), 0);
        
        data.push({
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          revenue: revenue,
          orders: periodOrders.length,
        });
      }
    }
    
    return data;
  }, [orders, selectedPeriod, filteredOrders]);

  // Top menu items by orders (for pie chart)
  const topMenuItemsData = useMemo(() => {
    const itemCounts = filteredOrders.reduce((acc, order) => {
      order.items.forEach((item) => {
        const name = item.menuItem.name;
        acc[name] = (acc[name] || 0) + item.quantity;
      });
      return acc;
    }, {} as Record<string, number>);

    const colors = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

    return Object.entries(itemCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count], index) => ({
        name,
        value: count,
        color: colors[index] || "#6b7280",
      }));
  }, [filteredOrders]);

  const periodLabels = {
    today: "Today",
    this_week: "This Week",
    this_month: "This Month",
    this_year: "This Year",
    total: "All Time",
  };

  const getChartTitle = () => {
    switch (selectedPeriod) {
      case "today":
        return "Revenue Trend (Hourly - Today)";
      case "this_week":
        return "Revenue Trend (Last 7 Days)";
      case "this_month":
        return "Revenue Trend (Weekly - This Month)";
      case "this_year":
        return "Revenue Trend (Monthly - This Year)";
      default:
        return "Revenue Trend (Last 30 Days)";
    }
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-6 md:pb-24 lg:pb-6">
      {/* Filter and Key Metrics */}
      <div className="space-y-4">
        <div className="w-full">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {Object.entries(periodLabels).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setSelectedPeriod(value as FilterPeriod)}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  selectedPeriod === value
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">${metrics.totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-green-600 mt-1">
                {metrics.paidOrders} paid orders
              </p>
            </div>
            <div className="bg-green-100 rounded-xl p-2 sm:p-3 flex-shrink-0">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{metrics.totalOrders}</p>
              <p className="text-xs text-blue-600 mt-1">
                {metrics.completedOrders} completed
              </p>
            </div>
            <div className="bg-blue-100 rounded-xl p-2 sm:p-3 flex-shrink-0">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Active Orders</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{metrics.activeOrders}</p>
              <p className="text-xs text-orange-600 mt-1">
                In progress
              </p>
            </div>
            <div className="bg-orange-100 rounded-xl p-2 sm:p-3 flex-shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">${metrics.averageOrderValue.toFixed(2)}</p>
              <p className="text-xs text-purple-600 mt-1">
                Per order
              </p>
            </div>
            <div className="bg-purple-100 rounded-xl p-2 sm:p-3 flex-shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{getChartTitle()}</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "white", 
                    border: "1px solid #e2e8f0", 
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
                  }}
                  cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                />
                <Bar
                  dataKey="revenue"
                  fill="url(#barGradient)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Menu Items Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top 5 Menu Items</h3>
            <span className="text-sm text-gray-500">By order frequency</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topMenuItemsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {topMenuItemsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
