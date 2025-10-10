import React, { useState, useMemo, useEffect } from "react";
import { Order, MenuItem, Staff, Rating } from "../../../types";
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface AdminOverviewProps {
  orders: Order[];
  menuItems: MenuItem[];
  staff: Staff[];
  ratings: Rating[];
}

type FilterPeriod = "this_week" | "this_month" | "this_year" | "total";

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  orders,
  menuItems,
  staff,
  ratings,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<FilterPeriod>("this_week");
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive design for pie chart
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

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

  // Helper function to safely get rating date
  const getRatingDate = (rating: Rating): Date | null => {
    try {
      if (rating.timestamp instanceof Date) {
        return rating.timestamp;
      } else if (
        typeof rating.timestamp === "object" &&
        rating.timestamp.toDate
      ) {
        return rating.timestamp.toDate();
      } else {
        return new Date(rating.timestamp as string);
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

  // Calculate today's metrics for cards (always show today's data regardless of filter)
  const todayMetrics = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const todayOrders = orders.filter((order) => {
      const orderDate = getOrderDate(order);
      return orderDate && orderDate >= today;
    });
    
    const todayPaidOrders = todayOrders.filter((order) => order.paymentStatus === "paid");
    const todayRevenue = todayPaidOrders.reduce((sum, order) => sum + (order.grandTotal || order.total || 0), 0);
    
    return {
      revenueToday: todayRevenue,
      ordersToday: todayOrders.length,
      totalMenu: menuItems.length,
      totalStaff: staff.length,
    };
  }, [orders, menuItems, staff]);



  // Generate chart data for revenue trends based on selected period
  const revenueChartData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    if (selectedPeriod === "this_week") {
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

    // Different shades of purple from dark to light
    const purpleShades = ["#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"];

    return Object.entries(itemCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count], index) => ({
        name,
        value: count,
        color: purpleShades[index] || "#e5e7eb",
      }));
  }, [filteredOrders]);

  // Recent customer reviews (latest 10 ratings)
  const recentReviews = useMemo(() => {
    return ratings
      .slice()
      .sort((a, b) => {
        const dateA = getRatingDate(a);
        const dateB = getRatingDate(b);
        if (!dateA || !dateB) return 0;
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 10);
  }, [ratings]);

  // Generate star rating display
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-lg ${
          index < rating ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ));
  };

  // Generate avatar with initials
  const generateAvatar = (name: string) => {
    const initials = name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
      
    // Generate a gradient color based on the name using purple theme variations
    const gradients = [
      "bg-gradient-to-br from-purple-500 to-purple-600",
      "bg-gradient-to-br from-purple-600 to-violet-600",
      "bg-gradient-to-br from-violet-500 to-purple-500",
      "bg-gradient-to-br from-indigo-500 to-purple-500",
      "bg-gradient-to-br from-purple-400 to-purple-600",
      "bg-gradient-to-br from-violet-600 to-indigo-600",
      "bg-gradient-to-br from-indigo-600 to-purple-700",
      "bg-gradient-to-br from-purple-700 to-violet-800"
    ];
    const gradientIndex = name.length % gradients.length;
    
    return (
      <div className={`w-10 h-10 ${gradients[gradientIndex]} text-white rounded-full flex items-center justify-center font-bold text-xs shadow-lg ring-2 ring-white/20`}>
        {initials}
      </div>
    );
  };

  const periodLabels = {
    this_week: "This Week",
    this_month: "This Month",
    this_year: "This Year",
    total: "All Time",
  };

  const getChartTitle = () => {
    switch (selectedPeriod) {
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
      {/* Today's Orders Heading and Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 sm:hidden">Overview</h2>
        
        {/* Key Metrics Cards */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 sm:grid sm:grid-cols-2 xl:grid-cols-5 sm:gap-4 sm:overflow-x-visible sm:pb-0">
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 border border-gray-200 flex-shrink-0 min-w-[140px] sm:min-w-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{todayMetrics.revenueToday.toFixed(2)} <span className="text-sm font-normal text-gray-600">(OMR)</span></p>
              <p className="text-xs font-medium text-gray-600">Revenue Today</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 border border-gray-200 flex-shrink-0 min-w-[140px] sm:min-w-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{todayMetrics.ordersToday}</p>
              <p className="text-xs font-medium text-gray-600">Orders Today</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 border border-gray-200 flex-shrink-0 min-w-[140px] sm:min-w-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{todayMetrics.totalMenu}</p>
              <p className="text-xs font-medium text-gray-600">Total Menu</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 border border-gray-200 flex-shrink-0 min-w-[140px] sm:min-w-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197v1M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{todayMetrics.totalStaff}</p>
              <p className="text-xs font-medium text-gray-600">Total Staff</p>
            </div>
          </div>
        </div>
      </div>
      </div>
      
      {/* Filter Controls */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{getChartTitle()}</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4}/>
                    <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="100%" stopColor="#faf5ff" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#7c3aed" 
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                  className="text-purple-600"
                />
                <YAxis 
                  stroke="#7c3aed" 
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                  className="text-purple-600"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#faf5ff", 
                    border: "1px solid #c4b5fd", 
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: "0 10px 15px -3px rgb(139 92 246 / 0.1)",
                    color: "#7c3aed"
                  }}
                  cursor={{ stroke: "rgba(139, 92, 246, 0.3)", strokeWidth: 2 }}
                  formatter={(value: any, name: string, props: any) => {
                    if (name === 'revenue') {
                      const orders = props.payload?.orders || 0;
                      return [
                        <div key="tooltip-content" className="space-y-1">
                          <div className="font-semibold text-purple-700">
                            Revenue: {Number(value).toFixed(2)} OMR
                          </div>
                          <div className="text-purple-600">
                            Orders: {orders}
                          </div>
                        </div>
                      ];
                    }
                    return [value, name];
                  }}
                  labelStyle={{ color: "#7c3aed", fontWeight: "600" }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="url(#areaGradient)"
                  dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#8b5cf6", strokeWidth: 2, fill: "#faf5ff" }}
                  label={({ payload, x, y }: any) => {
                    const orders = payload?.orders || payload?.payload?.orders || 0;
                    return orders > 0 ? (
                      <text x={x} y={y - 5} fill="#7c3aed" fontSize="9" textAnchor="middle" fontWeight="500">
                        {orders} orders
                      </text>
                    ) : null;
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Menu Items Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Top 5 Menu Items</h3>
            <span className="text-xs sm:text-sm text-gray-500">By order frequency</span>
          </div>
          <div className="relative h-64 sm:h-80">
            <div className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topMenuItemsData}
                    cx="40%"
                    cy="50%"
                    innerRadius={isMobile ? 35 : 60}
                    outerRadius={isMobile ? 70 : 120}
                    paddingAngle={1}
                    dataKey="value"
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, value }: any) => {
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);

                      return (
                        <text 
                          x={x} 
                          y={y} 
                          fill="white" 
                          textAnchor={x > cx ? 'start' : 'end'} 
                          dominantBaseline="central"
                          fontSize={isMobile ? "10" : "12"}
                          fontWeight="600"
                        >
                          {value}
                        </text>
                      );
                    }}
                    labelLine={false}
                  >
                    {topMenuItemsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "#faf5ff",
                      border: "1px solid #c4b5fd",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Legend - Bottom Right */}
            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 space-y-0.5 sm:space-y-1">
              {topMenuItemsData.map((item, index) => (
                <div key={index} className="flex items-center space-x-0.5 sm:space-x-1 text-xs sm:text-xs">
                  <div 
                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <div className="text-purple-600 font-medium min-w-0">
                    <div className="text-xs sm:text-xs whitespace-nowrap">{item.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
          <span className="text-sm text-gray-500">Recent feedback</span>
        </div>
        
        {recentReviews.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {recentReviews.map((review) => {
              const reviewDate = getRatingDate(review);
              return (
                <div
                  key={review.id}
                  className="bg-gradient-to-br from-white to-purple-50/30 rounded-3xl shadow-sm p-6 border border-purple-100 flex-shrink-0 min-w-[220px] max-w-[220px] h-36 hover:shadow-lg hover:border-purple-200 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden"
                >
                  {/* Decorative background element */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-100/50 to-transparent rounded-full -translate-y-6 translate-x-6"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-50/30 to-transparent rounded-full translate-y-4 -translate-x-4"></div>
                  
                  <div className="relative z-10 h-full flex flex-col">
                    {/* Header with avatar and rating */}
                    <div className="flex items-center space-x-3 mb-6">
                      {generateAvatar(review.customerName || "Anonymous")}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 truncate text-sm">
                          {review.customerName || "Anonymous"}
                        </h4>
                        <div className="flex items-center mt-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Date and time at bottom */}
                    <div className="mt-auto">
                      <div className="flex items-center justify-between text-xs">
                        <div className="text-gray-600 font-medium">
                          {reviewDate
                            ? reviewDate.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: reviewDate.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
                              })
                            : "Recent"}
                        </div>
                        <div className="text-gray-500">
                          {reviewDate
                            ? reviewDate.toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200 text-center">
            <div className="w-16 h-16 bg-purple-50 text-purple-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h4>
            <p className="text-gray-500 text-sm">Customer reviews will appear here once customers start rating their experience.</p>
          </div>
        )}
      </div>
    </div>
  );
};
