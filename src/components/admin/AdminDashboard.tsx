import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useApp } from "../../context/AppContext";
import { Order } from "../../types";
import {
  TrendingUp,
  DollarSign,
  Users,
  Printer,
  Edit,
  Trash2,
  Plus,
  Filter,
  Pencil,
  Search,
  ChevronDown,
} from "lucide-react";

const AdminDashboard: React.FC = () => {
  const {
    orders,
    updateOrder,
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
  } = useApp();
  const [activeTab, setActiveTab] = useState<
    "overview" | "orders" | "menu" | "staff"
  >("overview");
  // Firestore staff data
  const [staff, setStaff] = useState<any[]>([]);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "staff"), (snapshot) => {
      setStaff(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newMenu, setNewMenu] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    available: true,
    prepTime: "",
  });
  const [newStaff, setNewStaff] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    role: "waiter",
    present: true,
  });
  const [editMenuId, setEditMenuId] = useState<string | null>(null);
  const [editMenu, setEditMenu] = useState<any>(null);
  const [editStaffId, setEditStaffId] = useState<string | null>(null);
  const [editStaff, setEditStaff] = useState<any>(null);
  const [deleteStaffId, setDeleteStaffId] = useState<string | null>(null);
  const [deleteStaffName, setDeleteStaffName] = useState<string>("");
  // Track required menu items for the day
  const [requiredMenu, setRequiredMenu] = useState<{ [id: string]: boolean }>(
    () => {
      // By default, all available menu items are required
      return Object.fromEntries(
        (useApp().menuItems || []).map((item) => [item.id, true])
      );
    }
  );
  // Remove local menuItems state, use context menuItems only
  const [menuSearch, setMenuSearch] = useState("");
  const [menuCategory, setMenuCategory] = useState("all");
  const [staffSearch, setStaffSearch] = useState("");

  const [orderFilter, setOrderFilter] = useState<
    "all" | "pending" | "completed"
  >("all");

  // Analytics calculations
  const today = new Date();
  // Helper to safely convert orderTime to Date
  function toDateSafe(val: any): Date {
    if (!val) return new Date();
    if (val instanceof Date) return val;
    if (typeof val === "string" || typeof val === "number")
      return new Date(val);
    if (typeof val === "object" && typeof val.toDate === "function")
      return val.toDate();
    return new Date();
  }

  const todayOrders = orders.filter((order) => {
    const orderDate = toDateSafe(order.orderTime);
    return orderDate.toDateString() === today.toDateString();
  });

  const completedOrders = orders.filter(
    (order) => order.status === "completed"
  );
  const totalRevenue = completedOrders.reduce(
    (sum, order) => sum + order.grandTotal,
    0
  );
  // const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
  // const averagePreparationTime = 18; // Mock data
  const totalMenuItems = menuItems.length;
  const totalStaff = staff.length;

  const filteredOrders =
    orderFilter === "all"
      ? orders
      : orders.filter(
          (order) =>
            order.status ===
            (orderFilter === "completed" ? "completed" : "pending")
        );

  const printBill = (order: Order) => {
    // Mock bill printing
    const billContent = `
      HOTEL MANAGEMENT SYSTEM
      ========================
      
      Order #${order.id.slice(-4)}
  Date: ${toDateSafe(order.orderTime).toLocaleString()}
      Customer: ${order.customerName}
      ${order.tableNumber ? `Table: ${order.tableNumber}` : ""}
      ${order.customerAddress ? `Address: ${order.customerAddress}` : ""}
      
      ITEMS:
      ${order.items
        .map(
          (item) =>
            `${item.quantity}x ${item.menuItem.name} - $${(
              item.menuItem.price * item.quantity
            ).toFixed(2)}`
        )
        .join("\n")}
      
      Subtotal: $${order.total.toFixed(2)}
      Tax (10%): $${order.tax.toFixed(2)}
      TOTAL: $${order.grandTotal.toFixed(2)}
      
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
    { id: "staff", name: "Staff", icon: Users },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your restaurant operations</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                activeTab === tab.id
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

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
                  <Plus className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Menu Items
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalMenuItems}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="bg-orange-100 rounded-md p-3">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Staff
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalStaff}
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
                  <option value="completed">Completed Orders</option>
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
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{order.id.slice(-4)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {toDateSafe(order.orderTime).toLocaleDateString()}
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
                        ${order.grandTotal.toFixed(2)}
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
                            onClick={() => printBill(order)}
                            className="text-purple-600 hover:text-purple-900 p-1"
                            title="Print Bill"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {order.status !== "completed" && (
                            <>
                              <button
                                className="text-blue-600 hover:text-blue-900 p-1"
                                title="Edit Order"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  updateOrder(order.id, { status: "cancelled" })
                                }
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
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Menu Management
            </h2>
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-center w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  className="w-full border rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Search menu..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                />
                <Search className="absolute left-2 top-2.5 w-5 h-5 text-gray-400" />
              </div>
              <select
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={menuCategory}
                onChange={(e) => setMenuCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
                <option value="Beverages">Beverages</option>
                <option value="Desserts">Desserts</option>
                <option value="Appetizers">Appetizers</option>
                <option value="Main Course">Main Course</option>
              </select>
              <button
                onClick={() => setShowAddMenu(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>
          </div>
          {/* Add Menu Modal */}
          {showAddMenu && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">Add Menu Item</h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setShowAddMenu(false);
                    await addMenuItem({
                      name: newMenu.name,
                      description: newMenu.description,
                      price: parseFloat(newMenu.price),
                      category: newMenu.category,
                      image: newMenu.image,
                      available: newMenu.available,
                      prepTime: parseInt(newMenu.prepTime) || 0,
                    });
                    setNewMenu({
                      name: "",
                      description: "",
                      price: "",
                      category: "",
                      image: "",
                      available: true,
                      prepTime: "",
                    });
                  }}
                  className="space-y-3"
                >
                  <input
                    required
                    className="w-full border p-2 rounded"
                    placeholder="Name"
                    value={newMenu.name}
                    onChange={(e) =>
                      setNewMenu({ ...newMenu, name: e.target.value })
                    }
                  />
                  <input
                    required
                    className="w-full border p-2 rounded"
                    placeholder="Description"
                    value={newMenu.description}
                    onChange={(e) =>
                      setNewMenu({ ...newMenu, description: e.target.value })
                    }
                  />
                  <input
                    required
                    className="w-full border p-2 rounded"
                    placeholder="Category"
                    value={newMenu.category}
                    onChange={(e) =>
                      setNewMenu({ ...newMenu, category: e.target.value })
                    }
                  />
                  <input
                    required
                    className="w-full border p-2 rounded"
                    placeholder="Image URL"
                    value={newMenu.image}
                    onChange={(e) =>
                      setNewMenu({ ...newMenu, image: e.target.value })
                    }
                  />
                  <input
                    required
                    type="number"
                    className="w-full border p-2 rounded"
                    placeholder="Price"
                    value={newMenu.price}
                    onChange={(e) =>
                      setNewMenu({ ...newMenu, price: e.target.value })
                    }
                  />
                  <input
                    required
                    type="number"
                    className="w-full border p-2 rounded"
                    placeholder="Prep Time (min)"
                    value={newMenu.prepTime}
                    onChange={(e) =>
                      setNewMenu({ ...newMenu, prepTime: e.target.value })
                    }
                  />
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newMenu.available}
                      onChange={(e) =>
                        setNewMenu({ ...newMenu, available: e.target.checked })
                      }
                    />
                    <span>Available</span>
                  </label>
                  <div className="flex space-x-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowAddMenu(false)}
                      className="px-4 py-2 bg-gray-200 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded"
                    >
                      Add
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(
                menuItems
                  .filter(
                    (item) =>
                      (menuCategory === "all" ||
                        item.category === menuCategory) &&
                      (item.name
                        .toLowerCase()
                        .includes(menuSearch.toLowerCase()) ||
                        item.description
                          .toLowerCase()
                          .includes(menuSearch.toLowerCase()))
                  )
                  .reduce((acc, item) => {
                    acc[item.category] = acc[item.category] || [];
                    acc[item.category].push(item);
                    return acc;
                  }, {} as Record<string, typeof menuItems>)
              ).map(([cat, items]) => (
                <React.Fragment key={cat}>
                  <div className="col-span-full mt-4 mb-2">
                    <h4 className="text-lg font-bold text-gray-700">{cat}</h4>
                  </div>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4 flex flex-col relative"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-32 object-cover rounded-md mb-2"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-1">
                          {item.description}
                        </p>
                        <p className="text-sm text-gray-500 mb-1">
                          Category: {item.category}
                        </p>
                        <p className="text-md font-semibold text-purple-700 mb-2">
                          ${item.price.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mb-1">
                          Prep Time: {item.prepTime} min
                        </p>
                      </div>
                      <div className="flex flex-col items-end mt-2">
                        <div className="flex gap-2 mb-1">
                          <button
                            onClick={() => {
                              setEditMenuId(item.id);
                              setEditMenu({ ...item });
                            }}
                            className="text-gray-400 hover:text-blue-600"
                            title="Edit"
                          >
                            <Pencil className="h-7 w-7" />
                          </button>
                          <button
                            onClick={async () => {
                              await deleteMenuItem(item.id);
                            }}
                            className="text-gray-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-7 w-7" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between w-full">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={!!requiredMenu[item.id]}
                              onChange={() =>
                                setRequiredMenu((prev) => ({
                                  ...prev,
                                  [item.id]: !prev[item.id],
                                }))
                              }
                            />
                            <span className="text-sm">Required Today</span>
                          </label>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              item.available
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item.available ? "Available" : "Not Available"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              ))}
              {/* Edit Menu Modal */}
              {editMenuId && editMenu && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                    <h3 className="text-lg font-bold mb-4">Edit Menu Item</h3>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        await updateMenuItem(editMenuId, {
                          ...editMenu,
                          price: parseFloat(editMenu.price),
                          prepTime: parseInt(editMenu.prepTime),
                        });
                        setEditMenuId(null);
                        setEditMenu(null);
                      }}
                      className="space-y-3"
                    >
                      <input
                        required
                        className="w-full border p-2 rounded"
                        placeholder="Name"
                        value={editMenu.name}
                        onChange={(e) =>
                          setEditMenu({ ...editMenu, name: e.target.value })
                        }
                      />
                      <input
                        required
                        className="w-full border p-2 rounded"
                        placeholder="Description"
                        value={editMenu.description}
                        onChange={(e) =>
                          setEditMenu({
                            ...editMenu,
                            description: e.target.value,
                          })
                        }
                      />
                      <input
                        required
                        className="w-full border p-2 rounded"
                        placeholder="Category"
                        value={editMenu.category}
                        onChange={(e) =>
                          setEditMenu({ ...editMenu, category: e.target.value })
                        }
                      />
                      <input
                        required
                        className="w-full border p-2 rounded"
                        placeholder="Image URL"
                        value={editMenu.image}
                        onChange={(e) =>
                          setEditMenu({ ...editMenu, image: e.target.value })
                        }
                      />
                      <input
                        required
                        type="number"
                        className="w-full border p-2 rounded"
                        placeholder="Price"
                        value={editMenu.price}
                        onChange={(e) =>
                          setEditMenu({ ...editMenu, price: e.target.value })
                        }
                      />
                      <input
                        required
                        type="number"
                        className="w-full border p-2 rounded"
                        placeholder="Prep Time (min)"
                        value={editMenu.prepTime}
                        onChange={(e) =>
                          setEditMenu({ ...editMenu, prepTime: e.target.value })
                        }
                      />
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editMenu.available}
                          onChange={(e) =>
                            setEditMenu({
                              ...editMenu,
                              available: e.target.checked,
                            })
                          }
                        />
                        <span>Available</span>
                      </label>
                      <div className="flex space-x-2 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setEditMenuId(null);
                            setEditMenu(null);
                          }}
                          className="px-4 py-2 bg-gray-200 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Staff Tab */}
      {activeTab === "staff" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Staff Management
            </h2>
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-center w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  className="w-full border rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Search staff..."
                  value={staffSearch}
                  onChange={(e) => setStaffSearch(e.target.value)}
                />
                <Search className="absolute left-2 top-2.5 w-5 h-5 text-gray-400" />
              </div>
              <button
                onClick={() => setShowAddStaff(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Staff</span>
              </button>
            </div>
          </div>
          {/* Add Staff Modal */}
          {showAddStaff && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
                <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
                  <Plus className="w-6 h-6 mr-2 text-purple-600" />
                  Add New Staff
                </h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setShowAddStaff(false);
                    try {
                      const userCredential =
                        await createUserWithEmailAndPassword(
                          auth,
                          newStaff.email,
                          newStaff.password
                        );
                      const { password, ...staffData } = newStaff;
                      await addDoc(collection(db, "staff"), {
                        ...staffData,
                        uid: userCredential.user.uid,
                      });
                    } catch (error) {
                      alert("Error creating staff: " + (error as any).message);
                    }
                    setNewStaff({
                      name: "",
                      phone: "",
                      email: "",
                      password: "",
                      role: "waiter",
                      present: true,
                    });
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      required
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter full name"
                      value={newStaff.name}
                      onChange={(e) =>
                        setNewStaff({ ...newStaff, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      required
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter phone number"
                      value={newStaff.phone}
                      onChange={(e) =>
                        setNewStaff({ ...newStaff, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      required
                      type="email"
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter email address"
                      value={newStaff.email}
                      onChange={(e) =>
                        setNewStaff({ ...newStaff, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      required
                      type="password"
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter password"
                      value={newStaff.password}
                      onChange={(e) =>
                        setNewStaff({ ...newStaff, password: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <div className="relative">
                      <select
                        required
                        className="w-full border border-gray-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer pr-10"
                        value={newStaff.role}
                        onChange={(e) =>
                          setNewStaff({ ...newStaff, role: e.target.value })
                        }
                      >
                        <option value="waiter">Waiter</option>
                        <option value="kitchen">Kitchen Staff</option>
                        <option value="admin">Administrator</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newStaff.present}
                        onChange={(e) =>
                          setNewStaff({
                            ...newStaff,
                            present: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Currently Present
                      </span>
                    </label>
                  </div>
                  <div className="flex space-x-3 justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddStaff(false)}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium shadow-md"
                    >
                      Add
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          <div className="bg-white rounded-lg shadow-sm p-6">
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
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Present
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staff
                  .filter(
                    (member) =>
                      member.name
                        .toLowerCase()
                        .includes(staffSearch.toLowerCase()) ||
                      (member.phone && member.phone.includes(staffSearch))
                  )
                  .map((member) => (
                    <tr key={member.id}>
                      {editStaffId === member.id ? (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {member.id.slice(-6).toUpperCase()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              className="border rounded p-1 w-full"
                              value={editStaff?.name || ""}
                              onChange={(e) =>
                                setEditStaff({
                                  ...editStaff,
                                  name: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              className="border rounded p-1 w-full"
                              type="email"
                              value={editStaff?.email || ""}
                              onChange={(e) =>
                                setEditStaff({
                                  ...editStaff,
                                  email: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              className="border rounded p-1 w-full"
                              value={editStaff?.phone || ""}
                              onChange={(e) =>
                                setEditStaff({
                                  ...editStaff,
                                  phone: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap capitalize">
                            <select
                              className="border rounded p-1"
                              value={editStaff?.role}
                              onChange={(e) =>
                                setEditStaff({
                                  ...editStaff,
                                  role: e.target.value,
                                })
                              }
                            >
                              <option value="waiter">Waiter</option>
                              <option value="kitchen">Kitchen</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={!!editStaff?.present}
                                onChange={(e) =>
                                  setEditStaff({
                                    ...editStaff,
                                    present: e.target.checked,
                                  })
                                }
                              />
                              <span
                                className={
                                  editStaff?.present
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {editStaff?.present ? "Present" : "Absent"}
                              </span>
                            </label>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                className="text-green-600 hover:text-green-900"
                                title="Save"
                                onClick={async () => {
                                  await updateDoc(
                                    doc(db, "staff", member.id),
                                    editStaff
                                  );
                                  setEditStaffId(null);
                                  setEditStaff(null);
                                }}
                              >
                                Save
                              </button>
                              <button
                                className="text-gray-400 hover:text-blue-600"
                                title="Cancel"
                                onClick={() => {
                                  setEditStaffId(null);
                                  setEditStaff(null);
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                            {member.id.slice(-6).toUpperCase()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {member.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {member.email || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {member.phone || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap capitalize">
                            {member.role}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={member.present}
                                disabled
                              />
                              <span
                                className={
                                  member.present
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {member.present ? "Present" : "Absent"}
                              </span>
                            </label>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                className="text-gray-400 hover:text-blue-600"
                                title="Edit"
                                onClick={() => {
                                  setEditStaffId(member.id);
                                  setEditStaff({ ...member });
                                }}
                              >
                                <Pencil className="h-5 w-5" />
                              </button>
                              <button
                                className="text-gray-400 hover:text-red-600"
                                title="Delete"
                                onClick={() => {
                                  setDeleteStaffId(member.id);
                                  setDeleteStaffName(member.name);
                                }}
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                {/* Edit Staff Modal */}
                {editStaffId && editStaff && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
                      <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
                        <Edit className="w-6 h-6 mr-2 text-purple-600" />
                        Edit Staff
                      </h3>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          setStaff((prev) => {
                            const idx = prev.findIndex(
                              (s: any) => s.id === editStaffId
                            );
                            if (idx !== -1) {
                              const updated = [...prev];
                              updated[idx] = { ...editStaff };
                              return updated;
                            }
                            return prev;
                          });
                          setEditStaffId(null);
                          setEditStaff(null);
                        }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Full Name
                          </label>
                          <input
                            required
                            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter full name"
                            value={editStaff.name}
                            onChange={(e) =>
                              setEditStaff({
                                ...editStaff,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Email Address
                          </label>
                          <input
                            required
                            type="email"
                            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter email address"
                            value={editStaff.email}
                            onChange={(e) =>
                              setEditStaff({
                                ...editStaff,
                                email: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Phone Number
                          </label>
                          <input
                            required
                            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter phone number"
                            value={editStaff.phone}
                            onChange={(e) =>
                              setEditStaff({
                                ...editStaff,
                                phone: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Role
                          </label>
                          <div className="relative">
                            <select
                              required
                              className="w-full border border-gray-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer pr-10"
                              value={editStaff.role}
                              onChange={(e) =>
                                setEditStaff({
                                  ...editStaff,
                                  role: e.target.value,
                                })
                              }
                            >
                              <option value="waiter">Waiter</option>
                              <option value="kitchen">Kitchen Staff</option>
                              <option value="admin">Administrator</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editStaff.present}
                              onChange={(e) =>
                                setEditStaff({
                                  ...editStaff,
                                  present: e.target.checked,
                                })
                              }
                              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              Currently Present
                            </span>
                          </label>
                        </div>
                        <div className="flex space-x-3 justify-end pt-4">
                          <button
                            type="button"
                            onClick={() => {
                              setEditStaffId(null);
                              setEditStaff(null);
                            }}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium shadow-md"
                          >
                            Save
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Delete Staff Confirmation Modal */}
                {deleteStaffId && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                          <Trash2 className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Delete Staff
                          </h3>
                          <p className="text-sm text-gray-500">
                            This action cannot be undone
                          </p>
                        </div>
                      </div>

                      <div className="mb-6">
                        <p className="text-gray-700">
                          Are you sure you want to delete{" "}
                          <span className="font-semibold">
                            {deleteStaffName}
                          </span>
                          ? This will mark them as deleted in the system.
                        </p>
                      </div>

                      <div className="flex space-x-3 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteStaffId(null);
                            setDeleteStaffName("");
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await updateDoc(doc(db, "staff", deleteStaffId), {
                                deleted: true,
                              });
                              setDeleteStaffId(null);
                              setDeleteStaffName("");
                            } catch (error) {
                              alert(
                                "Error deleting staff: " +
                                  (error as any).message
                              );
                            }
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
