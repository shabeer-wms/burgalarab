import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import AdminSidebar from "./components/AdminSidebar";
import { AdminOverview } from "./components/AdminOverview";
import { AdminOrders } from "./components/AdminOrders";
import { AdminStaff } from "./components/AdminStaff";
import { AdminMenu } from "./components/AdminMenu";
import { TrendingUp, Users, Plus, LogOut } from "lucide-react";

const AdminDashboard: React.FC = () => {
  const { orders, updateOrder } = useApp();
  const { user, logout } = useAuth();
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Hide top appbar(s) that may be rendered by a parent Layout.
  // We deliberately don't edit Layout — instead we hide any likely header elements
  // on mount and restore them on unmount so this view appears full-height.
  // IMPORTANT: skip any headers that are inside this component (rootRef) so we
  // don't accidentally hide our own header card.
  useEffect(() => {
    const selectors = [
      "header",
      "[data-topbar]",
      ".topbar",
      ".app-header",
      "#top-appbar",
    ];

    const found: { el: Element; prev: string | null }[] = [];

    selectors.forEach((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        // skip if the element is inside our component
        if (rootRef.current && rootRef.current.contains(el)) return;
        found.push({ el, prev: (el as HTMLElement).style.display || null });
        (el as HTMLElement).style.display = "none";
      }
    });

    return () => {
      // restore previous display values
      found.forEach(({ el, prev }) => {
        (el as HTMLElement).style.display = prev ?? "";
      });
    };
  }, []);

  const [activeTab, setActiveTab] = useState<
    "overview" | "orders" | "menu" | "staff"
  >("overview");

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

  return (
    <div ref={rootRef} className="fixed inset-0 flex bg-gray-50">
      {/* Admin Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
        onLogout={logout}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 h-full ml-0 md:ml-64 mb-16 md:mb-0 overflow-auto">
        <div className="w-full h-full">
          {/* Dynamic Header */}
          <header className="bg-white p-6 rounded-2xl shadow-md mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-4">
              <div className="flex items-center w-full md:w-auto">
                <div className="bg-purple-100 p-3 rounded-xl mr-3 flex-shrink-0">
                  {activeTab === "overview" && (
                    <TrendingUp className="w-7 h-7 text-purple-600" />
                  )}
                  {activeTab === "orders" && (
                    <Users className="w-7 h-7 text-purple-600" />
                  )}
                  {activeTab === "menu" && (
                    <Plus className="w-7 h-7 text-purple-600" />
                  )}
                  {activeTab === "staff" && (
                    <Users className="w-7 h-7 text-purple-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-lg md:text-2xl font-bold text-gray-800 truncate">
                    {activeTab === "overview" && "Dashboard Overview"}
                    {activeTab === "orders" && "Order Management"}
                    {activeTab === "menu" && "Menu Management"}
                    {activeTab === "staff" && "Staff Management"}
                  </h1>
                  <p className="text-gray-500 text-sm">
                    {activeTab === "overview" &&
                      "Monitor your restaurant performance"}
                    {activeTab === "orders" &&
                      "Manage customer orders and payments"}
                    {activeTab === "menu" &&
                      "Add, edit, and organize menu items"}
                    {activeTab === "staff" && "Manage staff accounts and roles"}
                  </p>
                </div>

                {/* Mobile Logout Icon */}
                <button
                  className="md:hidden ml-3 p-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors flex-shrink-0"
                  aria-label="Logout"
                  onClick={logout}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>

          {/* Content Based on Active Tab */}
          {activeTab === "overview" && (
            <AdminOverview
              orders={orders}
              menuItems={menuItems}
              staff={staff}
            />
          )}

          {activeTab === "orders" && (
            <AdminOrders orders={orders} updateOrder={updateOrder} />
          )}

          {activeTab === "menu" && (
            <AdminMenu
              menuItems={menuItems}
              setMenuItems={setMenuItems}
              categories={categories}
            />
          )}

          {activeTab === "staff" && (
            <AdminStaff staff={staff} setStaff={setStaff} />
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
