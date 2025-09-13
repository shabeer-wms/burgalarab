import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Order } from "../../types";
import {
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  Printer,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search,
  UserCheck,
  X,
} from "lucide-react";

const AdminDashboard: React.FC = () => {
  const { orders, updateOrder } = useApp();

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
  const [activeTab, setActiveTab] = useState<
    "overview" | "orders" | "menu" | "staff"
  >("overview");
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
  const [showEditOrderModal, setShowEditOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [staffSearchTerm, setStaffSearchTerm] = useState("");
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "waiter",
  });

  // Menu management state
  const [menuSearchTerm, setMenuSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [showEditMenuModal, setShowEditMenuModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<any>(null);
  const [newMenuItem, setNewMenuItem] = useState({
    name: "",
    description: "",
    category: "",
    image: "",
    price: "",
    prepTime: "",
    available: true,
  });

  // Mock staff data
  const [staff, setStaff] = useState([
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@restaurant.com",
      phoneNumber: "+1-555-0101",
      role: "waiter",
      attendance: true,
      dateJoined: "2024-01-15",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.johnson@restaurant.com",
      phoneNumber: "+1-555-0102",
      role: "kitchen",
      attendance: true,
      dateJoined: "2024-02-01",
    },
    {
      id: "3",
      name: "Mike Davis",
      email: "mike.davis@restaurant.com",
      phoneNumber: "+1-555-0103",
      role: "manager",
      attendance: false,
      dateJoined: "2023-12-10",
    },
    {
      id: "4",
      name: "Emily Chen",
      email: "emily.chen@restaurant.com",
      phoneNumber: "+1-555-0104",
      role: "admin",
      attendance: true,
      dateJoined: "2024-01-05",
    },
  ]);

  // Staff management functions
  const filteredStaff = staff.filter(
    (member) =>
      member.name.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(staffSearchTerm.toLowerCase())
  );

  const handleAddStaff = () => {
    const newStaffMember = {
      id: Date.now().toString(),
      ...newStaff,
      attendance: true,
      dateJoined: new Date().toISOString().split("T")[0],
    };
    setStaff([...staff, newStaffMember]);
    setNewStaff({
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      role: "waiter",
    });
    setShowAddStaffModal(false);
  };

  const handleEditStaff = () => {
    setStaff(
      staff.map((member) =>
        member.id === selectedStaff.id ? selectedStaff : member
      )
    );
    setShowEditStaffModal(false);
    setSelectedStaff(null);
  };

  const handleDeleteStaff = (staffId: string) => {
    setStaff(staff.filter((member) => member.id !== staffId));
  };

  const toggleAttendance = (staffId: string) => {
    setStaff(
      staff.map((member) =>
        member.id === staffId
          ? { ...member, attendance: !member.attendance }
          : member
      )
    );
  };

  const openEditModal = (staffMember: any) => {
    setSelectedStaff({ ...staffMember });
    setShowEditStaffModal(true);
  };

  // Order management functions
  const openEditOrderModal = (order: any) => {
    setEditingOrder({ ...order });
    setShowEditOrderModal(true);
  };

  const handleEditOrder = () => {
    if (editingOrder) {
      updateOrder(editingOrder.id, {
        status: editingOrder.status,
        paymentStatus: editingOrder.paymentStatus,
        customerName: editingOrder.customerName,
        customerPhone: editingOrder.customerPhone,
        tableNumber: editingOrder.tableNumber,
        kitchenNotes: editingOrder.specialInstructions, // Map to kitchenNotes
      });
      setShowEditOrderModal(false);
      setEditingOrder(null);
    }
  };

  // Mock menu data
  const [menuItems, setMenuItems] = useState([
    {
      id: "1",
      name: "Chicken Wings",
      description: "Spicy buffalo wings with ranch dressing",
      price: 12.99,
      category: "Appetizers",
      image:
        "https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg?auto=compress&cs=tinysrgb&w=400",
      available: true,
      prepTime: 15,
    },
    {
      id: "2",
      name: "Caesar Salad",
      description: "Fresh romaine lettuce with parmesan and croutons",
      price: 9.99,
      category: "Appetizers",
      image:
        "https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=400",
      available: true,
      prepTime: 10,
    },
    {
      id: "3",
      name: "Grilled Salmon",
      description: "Fresh Atlantic salmon with seasonal vegetables",
      price: 24.99,
      category: "Main Course",
      image:
        "https://images.pexels.com/photos/725992/pexels-photo-725992.jpeg?auto=compress&cs=tinysrgb&w=400",
      available: true,
      prepTime: 25,
    },
    {
      id: "4",
      name: "Beef Steak",
      description: "Premium ribeye steak cooked to perfection",
      price: 32.99,
      category: "Main Course",
      image:
        "https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg?auto=compress&cs=tinysrgb&w=400",
      available: false,
      prepTime: 30,
    },
    {
      id: "5",
      name: "Chocolate Cake",
      description: "Rich chocolate cake with vanilla ice cream",
      price: 7.99,
      category: "Desserts",
      image:
        "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=400",
      available: true,
      prepTime: 5,
    },
    {
      id: "6",
      name: "Fresh Juice",
      description: "Freshly squeezed orange juice",
      price: 4.99,
      category: "Beverages",
      image:
        "https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=400",
      available: true,
      prepTime: 3,
    },
  ]);

  const categories = ["Appetizers", "Main Course", "Desserts", "Beverages"];

  // Menu management functions
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(menuSearchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(menuSearchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddMenuItem = () => {
    const newItem = {
      id: Date.now().toString(),
      ...newMenuItem,
      price: parseFloat(newMenuItem.price),
      prepTime: parseInt(newMenuItem.prepTime),
    };
    setMenuItems([...menuItems, newItem]);
    setNewMenuItem({
      name: "",
      description: "",
      category: "",
      image: "",
      price: "",
      prepTime: "",
      available: true,
    });
    setShowAddMenuModal(false);
  };

  const handleEditMenuItem = () => {
    const updatedItem = {
      ...selectedMenuItem,
      price: parseFloat(selectedMenuItem.price),
      prepTime: parseInt(selectedMenuItem.prepTime),
    };
    setMenuItems(
      menuItems.map((item) =>
        item.id === selectedMenuItem.id ? updatedItem : item
      )
    );
    setShowEditMenuModal(false);
    setSelectedMenuItem(null);
  };

  const handleDeleteMenuItem = (itemId: string) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      setMenuItems(menuItems.filter((item) => item.id !== itemId));
    }
  };

  const openEditMenuModal = (item: any) => {
    setSelectedMenuItem({
      ...item,
      price: item.price.toString(),
      prepTime: item.prepTime.toString(),
    });
    setShowEditMenuModal(true);
  };

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
  const averageOrderValue =
    completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
  const averagePreparationTime = 18; // Mock data

  const filteredOrders =
    orderFilter === "all"
      ? orders
      : orders.filter((order) => order.status === orderFilter);

  const printBill = (order: Order) => {
    // Mock bill printing
    const billContent = `
      HOTEL MANAGEMENT SYSTEM
      ========================
      
      Order #${order.id.slice(-4)}
      Date: ${formatDateTime(order.orderTime)}
      Customer: ${order.customerName}
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

  const tabs = [
    { id: "overview", name: "Overview", icon: TrendingUp },
    { id: "orders", name: "Orders", icon: Users },
    { id: "menu", name: "Menu", icon: Plus },
    { id: "staff", name: "Staff", icon: UserCheck },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Hotel Management System
                </h1>
                <p className="text-gray-600 mt-1">
                  Admin Dashboard - Manage your restaurant operations
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">Welcome, Admin</div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-t border-gray-200">
            <nav className="-mb-px flex space-x-8 px-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-600 bg-purple-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="bg-green-100 rounded-md p-3">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${totalRevenue.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-md p-3">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Orders
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {orders.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="bg-purple-100 rounded-md p-3">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Avg Order Value
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${averageOrderValue.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="bg-orange-100 rounded-md p-3">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Avg Prep Time
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {averagePreparationTime}m
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Today's Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Orders Today</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {todayOrders.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Revenue Today</p>
                  <p className="text-2xl font-bold text-green-600">
                    $
                    {todayOrders
                      .filter((order) => order.status === "completed")
                      .reduce((sum, order) => sum + order.grandTotal, 0)
                      .toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Orders</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {
                      orders.filter((order) =>
                        ["pending", "confirmed", "preparing", "ready"].includes(
                          order.status
                        )
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Order Management
              </h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={orderFilter}
                    onChange={(e) => setOrderFilter(e.target.value as any)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="all">All Orders</option>
                    <option value="pending">Pending Orders</option>
                    <option value="confirmed">Confirmed Orders</option>
                    <option value="preparing">Preparing Orders</option>
                    <option value="ready">Ready Orders</option>
                    <option value="completed">Completed Orders</option>
                    <option value="cancelled">Cancelled Orders</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              #{order.id.slice(-4)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(order.orderTime)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.customerName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.tableNumber || order.customerPhone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${(order.grandTotal || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
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
                        <td className="px-6 py-4 whitespace-nowrap">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                printBill(order);
                              }}
                              className="text-purple-600 hover:text-purple-900 p-1"
                              title="Print Bill"
                            >
                              <Printer className="w-4 h-4" />
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
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateOrder(order.id, {
                                      status: "cancelled",
                                    });
                                  }}
                                  className="text-red-600 hover:text-red-900 p-1"
                                  title="Cancel Order"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
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
        )}

        {/* Menu Tab */}
        {activeTab === "menu" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Menu Management
              </h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    value={menuSearchTerm}
                    onChange={(e) => setMenuSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowAddMenuModal(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Item</span>
                </button>
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenuItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.available
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.available ? "Available" : "Unavailable"}
                      </span>
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 text-xs font-medium rounded-full">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      <span className="text-lg font-bold text-purple-600">
                        ${item.price}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {item.prepTime} min
                      </span>
                      <span>ID: #{item.id}</span>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => openEditMenuModal(item)}
                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded"
                        title="Edit Item"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMenuItem(item.id)}
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredMenuItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No menu items found matching your criteria.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Add Menu Item Modal */}
        {showAddMenuModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
            style={{
              margin: 0,
              padding: 0,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100vw",
              height: "100vh",
            }}
          >
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Add New Menu Item
                </h3>
                <button
                  onClick={() => setShowAddMenuModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newMenuItem.name}
                    onChange={(e) =>
                      setNewMenuItem({ ...newMenuItem, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter item name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newMenuItem.description}
                    onChange={(e) =>
                      setNewMenuItem({
                        ...newMenuItem,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter item description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newMenuItem.category}
                    onChange={(e) =>
                      setNewMenuItem({
                        ...newMenuItem,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={newMenuItem.image}
                    onChange={(e) =>
                      setNewMenuItem({ ...newMenuItem, image: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter image URL"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newMenuItem.price}
                      onChange={(e) =>
                        setNewMenuItem({
                          ...newMenuItem,
                          price: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prep Time (min)
                    </label>
                    <input
                      type="number"
                      value={newMenuItem.prepTime}
                      onChange={(e) =>
                        setNewMenuItem({
                          ...newMenuItem,
                          prepTime: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      placeholder="15"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="available"
                    checked={newMenuItem.available}
                    onChange={(e) =>
                      setNewMenuItem({
                        ...newMenuItem,
                        available: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="available"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Available for orders
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddMenuModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMenuItem}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Menu Item Modal */}
        {showEditMenuModal && selectedMenuItem && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
            style={{
              margin: 0,
              padding: 0,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100vw",
              height: "100vh",
            }}
          >
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Edit Menu Item
                </h3>
                <button
                  onClick={() => setShowEditMenuModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={selectedMenuItem.name}
                    onChange={(e) =>
                      setSelectedMenuItem({
                        ...selectedMenuItem,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={selectedMenuItem.description}
                    onChange={(e) =>
                      setSelectedMenuItem({
                        ...selectedMenuItem,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={selectedMenuItem.category}
                    onChange={(e) =>
                      setSelectedMenuItem({
                        ...selectedMenuItem,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={selectedMenuItem.image}
                    onChange={(e) =>
                      setSelectedMenuItem({
                        ...selectedMenuItem,
                        image: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={selectedMenuItem.price}
                      onChange={(e) =>
                        setSelectedMenuItem({
                          ...selectedMenuItem,
                          price: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prep Time (min)
                    </label>
                    <input
                      type="number"
                      value={selectedMenuItem.prepTime}
                      onChange={(e) =>
                        setSelectedMenuItem({
                          ...selectedMenuItem,
                          prepTime: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-available"
                    checked={selectedMenuItem.available}
                    onChange={(e) =>
                      setSelectedMenuItem({
                        ...selectedMenuItem,
                        available: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="edit-available"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Available for orders
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditMenuModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditMenuItem}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                >
                  Update Item
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Staff Tab */}
        {activeTab === "staff" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Staff Management
              </h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search staff..."
                    value={staffSearchTerm}
                    onChange={(e) => setStaffSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <button
                  onClick={() => setShowAddStaffModal(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Staff</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Staff ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attendance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStaff.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{member.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {member.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {member.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {member.phoneNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              member.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : member.role === "manager"
                                ? "bg-blue-100 text-blue-800"
                                : member.role === "waiter"
                                ? "bg-green-100 text-green-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {member.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={member.attendance}
                              onChange={() => toggleAttendance(member.id)}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <span
                              className={`ml-2 text-sm ${
                                member.attendance
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {member.attendance ? "Present" : "Absent"}
                            </span>
                          </label>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(member)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Edit Staff"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStaff(member.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete Staff"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Add Staff Modal */}
        {showAddStaffModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
            style={{
              margin: 0,
              padding: 0,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100vw",
              height: "100vh",
            }}
          >
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Add New Staff
                </h3>
                <button
                  onClick={() => setShowAddStaffModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newStaff.name}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newStaff.email}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newStaff.phoneNumber}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, phoneNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={newStaff.password}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, password: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={newStaff.role}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="waiter">Waiter</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="kitchen">Kitchen</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStaff}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                >
                  Add Staff
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Staff Modal */}
        {showEditStaffModal && selectedStaff && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
            style={{
              margin: 0,
              padding: 0,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100vw",
              height: "100vh",
            }}
          >
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Edit Staff
                </h3>
                <button
                  onClick={() => setShowEditStaffModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={selectedStaff.name}
                    onChange={(e) =>
                      setSelectedStaff({
                        ...selectedStaff,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={selectedStaff.email}
                    onChange={(e) =>
                      setSelectedStaff({
                        ...selectedStaff,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={selectedStaff.phoneNumber}
                    onChange={(e) =>
                      setSelectedStaff({
                        ...selectedStaff,
                        phoneNumber: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={selectedStaff.role}
                    onChange={(e) =>
                      setSelectedStaff({
                        ...selectedStaff,
                        role: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="waiter">Waiter</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="kitchen">Kitchen</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditStaffModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditStaff}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                >
                  Update Staff
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
            style={{
              margin: 0,
              padding: 0,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100vw",
              height: "100vh",
            }}
          >
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">
                  Order Details
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Order ID
                    </label>
                    <p className="text-sm text-gray-900">
                      #{selectedOrder.id.slice(-8)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date & Time
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDateTime(selectedOrder.orderTime)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Customer
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedOrder.customerName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Contact
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedOrder.customerPhone || "No phone number"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Table
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedOrder.tableNumber
                        ? `Table ${selectedOrder.tableNumber}`
                        : "No table assigned"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Order Type
                    </label>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        selectedOrder.type === "dine-in"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {selectedOrder.type}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
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

                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Order Items
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.menuItem?.name || "Unknown Item"}
                          </p>
                          {item.specialInstructions && (
                            <p className="text-sm text-gray-600">
                              Instructions: {item.specialInstructions}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {item.quantity || 0} × $
                            {(item.menuItem?.price || 0).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            $
                            {(
                              (item.quantity || 0) * (item.menuItem?.price || 0)
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">
                        ${(selectedOrder.total || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-medium">
                        ${(selectedOrder.tax || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>${(selectedOrder.grandTotal || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Payment Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Payment Status
                      </label>
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Payment Method
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedOrder.paymentMethod || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Special Instructions */}
                {selectedOrder.specialInstructions && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Special Instructions
                    </h3>
                    <p className="text-sm text-gray-700 p-3 bg-yellow-50 rounded-lg">
                      {selectedOrder.specialInstructions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Order Modal */}
        {showEditOrderModal && editingOrder && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
            style={{
              margin: 0,
              padding: 0,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100vw",
              height: "100vh",
            }}
          >
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Edit Order #{editingOrder.id.slice(-4)}
                </h3>
                <button
                  onClick={() => setShowEditOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kitchen Notes
                  </label>
                  <textarea
                    value={
                      editingOrder.kitchenNotes ||
                      editingOrder.specialInstructions ||
                      ""
                    }
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        specialInstructions: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter any kitchen notes or special instructions..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditOrderModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditOrder}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                >
                  Update Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
