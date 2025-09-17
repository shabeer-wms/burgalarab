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
  const [orderUpdateLoading, setOrderUpdateLoading] = useState(false);
  const [orderUpdateError, setOrderUpdateError] = useState<string | null>(null);
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
  // Modal state for delete confirmation
  const [showDeleteMenuModal, setShowDeleteMenuModal] = useState(false);
  const [menuItemToDelete, setMenuItemToDelete] = useState<any>(null);
  const [newMenuItem, setNewMenuItem] = useState<{
    name: string;
    description: string;
    category: string;
    image: string | File;
    price: string;
    prepTime: string;
    available: boolean;
  }>({
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
  // Staff delete modal state
  const [showDeleteStaffModal, setShowDeleteStaffModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<any>(null);

  const handleDeleteStaff = (staffId: string) => {
    setStaffToDelete(staffId);
    setShowDeleteStaffModal(true);
  };

  const confirmDeleteStaff = () => {
    if (staffToDelete) {
      setStaff(staff.filter((member) => member.id !== staffToDelete));
      setStaffToDelete(null);
      setShowDeleteStaffModal(false);
    }
  };

  const cancelDeleteStaff = () => {
    setStaffToDelete(null);
    setShowDeleteStaffModal(false);
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
    let imageUrl = "";
    if (typeof newMenuItem.image === "string") {
      imageUrl = newMenuItem.image;
    } else if (newMenuItem.image) {
      imageUrl = URL.createObjectURL(newMenuItem.image);
    }
    const newItem = {
      id: Date.now().toString(),
      ...newMenuItem,
      image: imageUrl,
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
    setMenuItemToDelete(itemId);
    setShowDeleteMenuModal(true);
  };

  const confirmDeleteMenuItem = () => {
    if (menuItemToDelete) {
      setMenuItems(menuItems.filter((item) => item.id !== menuItemToDelete));
      setMenuItemToDelete(null);
      setShowDeleteMenuModal(false);
    }
  };

  const cancelDeleteMenuItem = () => {
    setMenuItemToDelete(null);
    setShowDeleteMenuModal(false);
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

      ${order.tableNumber ? `Table: ${order.tableNumber}` : ''}
      ${order.customerAddress ? `Vehicle No: ${order.customerAddress}` : ''}

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

  // Cancel order modal state
  const [showCancelOrderModal, setShowCancelOrderModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<any>(null);

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
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                  Hotel Management System
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1 truncate">
                  Admin Dashboard - Manage your restaurant operations
                </p>
              </div>
              <div className="flex items-center justify-end flex-shrink-0">
                <div className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                  Welcome, Admin
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-t border-gray-200">
            <nav className="-mb-px flex overflow-x-auto scrollbar-hide px-1 space-x-2 sm:space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center space-x-1 sm:space-x-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-600 bg-purple-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline sm:inline">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6 sm:space-y-8">
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
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Order Management
              </h2>
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                <div
                  className="relative w-full sm:w-auto"
                  style={{ minWidth: "140px", maxWidth: "180px" }}
                >
                  <select
                    value={orderFilter}
                    onChange={(e) => setOrderFilter(e.target.value as any)}
                    className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm min-w-[140px] transition-colors duration-150 pr-8"
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
        )}

        {/* Menu Tab */}
        {activeTab === "menu" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Menu Management
              </h2>
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                <div className="relative w-full sm:w-44">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    value={menuSearchTerm}
                    onChange={(e) => setMenuSearchTerm(e.target.value)}
                    className="pl-8 sm:pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div
                  className="relative w-full sm:w-auto"
                  style={{ minWidth: "120px", maxWidth: "170px" }}
                >
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm focus:outline-none  focus:ring-purple-500 focus:border-purple-500 text-sm min-w-[120px] transition-colors duration-150 pr-8"
                    style={{
                      minWidth: "120px",
                      maxWidth: "170px",
                      height: "40px",
                      appearance: "none",
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                    }}
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
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

                <button
                  onClick={() => setShowAddMenuModal(true)}
                  className="w-full sm:w-auto bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Item</span>
                </button>
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredMenuItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-40 sm:h-48 object-cover"
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
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate flex-1 pr-2">
                        {item.name}
                      </h3>
                      <span className="text-base sm:text-lg font-bold text-purple-600 flex-shrink-0">
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
                      <span className="text-xs">ID: #{item.id}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      {/* Available/Unavailable Checkbox */}
                      <label className="flex items-center select-none">
                        <input
                          type="checkbox"
                          checked={item.available}
                          onChange={() => {
                            setMenuItems(
                              menuItems.map((m) =>
                                m.id === item.id
                                  ? { ...m, available: !m.available }
                                  : m
                              )
                            );
                          }}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span
                          className={`ml-2 text-xs sm:text-sm ${
                            item.available ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {item.available ? "Available" : "Unavailable"}
                        </span>
                      </label>
                      <div className="flex space-x-2">
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

            {/* Delete Menu Item Confirmation Modal */}
            {showDeleteMenuModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Delete Menu Item
                  </h3>
                  <p className="mb-6 text-gray-700">
                    Are you sure you want to delete this menu item?
                  </p>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={cancelDeleteMenuItem}
                      className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDeleteMenuItem}
                      className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add Menu Item Modal */}
        {showAddMenuModal && (
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
                  Add New Menu Item
                </h3>
                <button
                  onClick={() => setShowAddMenuModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter item description"
                  />
                </div>

                <div className="relative">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none  focus:ring-purple-500 focus:border-purple-500 bg-white appearance-none pr-10 transition-colors"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="w-4 h-4 text-gray-400 absolute right-3 top-9 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image Upload
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files && e.target.files[0];
                      if (file) {
                        setNewMenuItem({ ...newMenuItem, image: file });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 border-[1px] rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                  {newMenuItem.image &&
                    typeof newMenuItem.image !== "string" && (
                      <img
                        src={URL.createObjectURL(newMenuItem.image)}
                        alt="Preview"
                        className="mt-2 w-32 h-32 object-cover rounded"
                      />
                    )}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 border-t bg-gray-50">
                <button
                  onClick={() => setShowAddMenuModal(false)}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMenuItem}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
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
                  Edit Menu Item
                </h3>
                <button
                  onClick={() => setShowEditMenuModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div className="relative">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white appearance-none pr-10 transition-colors"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="w-4 h-4 text-gray-400 absolute right-3 top-9 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image Upload
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files && e.target.files[0];
                      if (file) {
                        setSelectedMenuItem({
                          ...selectedMenuItem,
                          image: file,
                        });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 border-[1px] rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                  {selectedMenuItem.image && (
                    <img
                      src={
                        typeof selectedMenuItem.image === "string"
                          ? selectedMenuItem.image
                          : URL.createObjectURL(selectedMenuItem.image)
                      }
                      alt="Preview"
                      className="mt-2 w-32 h-32 object-cover rounded"
                    />
                  )}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 border-t bg-gray-50">
                <button
                  onClick={() => setShowEditMenuModal(false)}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditMenuItem}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                >
                  Update Item
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Staff Tab */}
        {activeTab === "staff" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Staff Management
              </h2>
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search staff..."
                    value={staffSearchTerm}
                    onChange={(e) => setStaffSearchTerm(e.target.value)}
                    className="pl-8 sm:pl-10 pr-4 py-2 w-full sm:w-auto border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <button
                  onClick={() => setShowAddStaffModal(true)}
                  className="w-full sm:w-auto bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Staff</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Staff ID
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Email
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Phone Number
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attendance
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStaff.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{member.id}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                            {member.name}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="text-sm text-gray-900 truncate max-w-[150px]">
                            {member.email}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          <div className="text-sm text-gray-900">
                            {member.phoneNumber}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
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
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={member.attendance}
                              onChange={() => toggleAttendance(member.id)}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <span
                              className={`ml-2 text-xs sm:text-sm ${
                                member.attendance
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {member.attendance ? "Present" : "Absent"}
                            </span>
                          </label>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-1 sm:space-x-2">
                            <button
                              onClick={() => openEditModal(member)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Edit Staff"
                            >
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStaff(member.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete Staff"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
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

        {/* Delete Staff Confirmation Modal */}
        {showDeleteStaffModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Delete Staff
              </h3>
              <p className="mb-6 text-gray-700">
                Are you sure you want to delete this staff member?
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={cancelDeleteStaff}
                  className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteStaff}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Staff Modal */}
        {showAddStaffModal && (
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
                  Add New Staff
                </h3>
                <button
                  onClick={() => setShowAddStaffModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter password"
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={newStaff.role}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 border-[1px] rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white appearance-none pr-10 transition-colors"
                  >
                    <option value="waiter">Waiter</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="kitchen">Kitchen</option>
                  </select>
                  <svg
                    className="w-4 h-4 text-gray-400 absolute right-3 top-9 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 border-t bg-gray-50">
                <button
                  onClick={() => setShowAddStaffModal(false)}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStaff}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
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
                  Edit Staff
                </h3>
                <button
                  onClick={() => setShowEditStaffModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div className="relative">
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
                    className="w-full px-3 py-2 border border-gray-300 border-[1px] rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white appearance-none pr-10 transition-colors"
                  >
                    <option value="waiter">Waiter</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="kitchen">Kitchen</option>
                  </select>
                  <svg
                    className="w-4 h-4 text-gray-400 absolute right-3 top-9 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 border-t bg-gray-50">
                <button
                  onClick={() => setShowEditStaffModal(false)}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditStaff}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
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
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justifycenter flex-shrink-0">
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
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Customer
                          </p>
                          <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                            {selectedOrder.customerName}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">
                            {selectedOrder.customerPhone || "No phone number"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <div className="w-3 h-3 sm:w-5 sm:h-5 bg-purple-600 rounded"></div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Table & Type
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                            <p className="text-sm sm:text-base font-semibold text-gray-900">
                              {selectedOrder.tableNumber
                                ? `Table ${selectedOrder.tableNumber}`
                                : "No table"}
                            </p>
                            <span
                              className={`inline-flex px-2 sm:px-3 py-1 text-xs font-medium rounded-full w-fit mt-1 sm:mt-0 ${
                                selectedOrder.type === "dine-in"
                                  ? "bg-green-100 text-green-700 border border-green-200"
                                  : "bg-blue-100 text-blue-700 border border-blue-200"
                              }`}
                            >
                              {selectedOrder.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Order Time
                          </p>
                          <p className="text-sm sm:text-base font-semibold text-gray-900">
                            {formatDateTime(selectedOrder.orderTime)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              selectedOrder.status === "pending"
                                ? "bg-yellow-500"
                                : selectedOrder.status === "confirmed"
                                ? "bg-blue-500"
                                : selectedOrder.status === "preparing"
                                ? "bg-orange-500"
                                : selectedOrder.status === "ready"
                                ? "bg-green-400"
                                : selectedOrder.status === "completed"
                                ? "bg-green-600"
                                : "bg-gray-500"
                            }`}
                          ></div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Current Status
                          </p>
                          <span
                            className={`inline-flex px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full ${
                              selectedOrder.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                : selectedOrder.status === "confirmed"
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : selectedOrder.status === "preparing"
                                ? "bg-orange-100 text-orange-800 border border-orange-200"
                                : selectedOrder.status === "ready"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : selectedOrder.status === "completed"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-gray-100 text-gray-800 border border-gray-200"
                            }`}
                          >
                            {selectedOrder.status.charAt(0).toUpperCase() +
                              selectedOrder.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-white text-sm">🍽️</span>
                      </div>
                      Order Items ({selectedOrder.items.length})
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {selectedOrder.items.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                              {item.quantity || 0}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-base">
                                {item.menuItem?.name || "Unknown Item"}
                              </p>
                              {item.specialInstructions && (
                                <div className="mt-1 flex items-center space-x-2">
                                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                                  <p className="text-sm text-gray-600 italic">
                                    {item.specialInstructions}
                                  </p>
                                </div>
                              )}
                              <p className="text-sm text-gray-500 mt-1">
                                ${(item.menuItem?.price || 0).toFixed(2)} each
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              $
                              {(
                                (item.quantity || 0) *
                                (item.menuItem?.price || 0)
                              ).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.quantity || 0} × $
                              {(item.menuItem?.price || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                      <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    Order Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 font-medium">
                        Subtotal
                      </span>
                      <span className="text-gray-900 font-semibold text-lg">
                        ${(selectedOrder.total || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 font-medium">
                        Tax & Fees
                      </span>
                      <span className="text-gray-900 font-semibold text-lg">
                        ${(selectedOrder.tax || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-green-200 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-900">
                          Grand Total
                        </span>
                        <span className="text-2xl font-bold text-green-600">
                          ${(selectedOrder.grandTotal || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                      <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    Payment Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          selectedOrder.paymentStatus === "paid"
                            ? "bg-green-100"
                            : selectedOrder.paymentStatus === "pending"
                            ? "bg-yellow-100"
                            : "bg-red-100"
                        }`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${
                            selectedOrder.paymentStatus === "paid"
                              ? "bg-green-500"
                              : selectedOrder.paymentStatus === "pending"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Payment Status
                        </p>
                        <span
                          className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${
                            selectedOrder.paymentStatus === "paid"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : selectedOrder.paymentStatus === "pending"
                              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                              : "bg-red-100 text-red-800 border-red-200"
                          }`}
                        >
                          {selectedOrder.paymentStatus.charAt(0).toUpperCase() +
                            selectedOrder.paymentStatus.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-purple-600 text-xs font-bold">
                          💳
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Payment Method
                        </p>
                        <p className="text-base font-semibold text-gray-900 capitalize">
                          {selectedOrder.paymentMethod || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Special Instructions */}
                {selectedOrder.specialInstructions && (
                  <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-white text-sm">📝</span>
                      </div>
                      Special Instructions
                    </h3>
                    <div className="bg-white rounded-lg p-4 border border-amber-100">
                      <p className="text-gray-700 leading-relaxed font-medium">
                        "{selectedOrder.specialInstructions}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter any kitchen notes or special instructions..."
                  />
                </div>
              </div>

              {orderUpdateError && (
                <div className="text-red-600 text-sm mb-2">
                  {orderUpdateError}
                </div>
              )}
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 border-t bg-gray-50">
                <button
                  onClick={() => setShowEditOrderModal(false)}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  disabled={orderUpdateLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditOrder}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                >
                  Update Order
                </button>
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
                This action cannot be undone. The selected order will be marked
                as cancelled. Are you sure you want to proceed?
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
                  Confirm Cancel
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
