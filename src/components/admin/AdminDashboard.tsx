import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import AdminSidebar from "./components/AdminSidebar";
import { AdminOverview } from "./components/AdminOverview";
import { AdminOrders } from "./components/AdminOrders";
import { AdminStaff } from "./components/AdminStaff";
import { AdminMenu } from "./components/AdminMenu";
import { TrendingUp, Users, Plus, LogOut, Settings, User } from "lucide-react";

const AdminDashboard: React.FC = () => {
  const { orders, updateOrder, menuItems, staff } = useApp();
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
    "overview" | "orders" | "menu" | "staff" | "settings"
  >("overview");

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
      <main className="flex-1 p-4 md:p-6 h-full ml-0 lg:ml-64 mb-16 lg:mb-0 overflow-auto">
        <div className="w-full h-full">
          {/* Dynamic Header */}
          <header className="bg-white p-6 rounded-2xl shadow-md mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1 min-w-0">
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
                  {activeTab === "settings" && (
                    <Settings className="w-7 h-7 text-purple-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-lg md:text-2xl font-bold text-gray-800 truncate">
                    {activeTab === "overview" && "Dashboard Overview"}
                    {activeTab === "orders" && "Order Management"}
                    {activeTab === "menu" && "Menu Management"}
                    {activeTab === "staff" && "Staff Management"}
                    {activeTab === "settings" && "Settings"}
                  </h1>
                  <p className="text-gray-500 text-sm">
                    {activeTab === "overview" &&
                      "Monitor your restaurant performance"}
                    {activeTab === "orders" &&
                      "Manage customer orders and payments"}
                    {activeTab === "menu" &&
                      "Add, edit, and organize menu items"}
                    {activeTab === "staff" && "Manage staff accounts and roles"}
                    {activeTab === "settings" && "Manage your account and preferences"}
                  </p>
                </div>
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

          {activeTab === "menu" && <AdminMenu categories={categories} />}

          {activeTab === "staff" && <AdminStaff />}

          {activeTab === "settings" && (
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Settings</h2>
              
              {/* User Details Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">User Details</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-800">
                        {user?.name || 'Admin User'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Admin'}
                      </p>
                    </div>
                  </div>
                  
                  {user?.email && (
                    <div className="flex items-center space-x-3 pt-2 border-t border-gray-200">
                      <div className="w-5 h-5" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="text-sm font-medium text-gray-800">{user.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={logout}
                    className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
