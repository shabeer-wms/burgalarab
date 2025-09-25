import React from "react";
import { TrendingUp, Users, Plus, UserCheck, LogOut } from "lucide-react";

interface AdminSidebarProps {
  activeTab: "overview" | "orders" | "menu" | "staff";
  onTabChange: (tab: "overview" | "orders" | "menu" | "staff") => void;
  user: any;
  onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
  user,
  onLogout,
}) => {
  const menuItems = [
    { id: "overview", name: "Overview", icon: TrendingUp },
    { id: "orders", name: "Orders", icon: Users },
    { id: "menu", name: "Menu", icon: Plus },
    { id: "staff", name: "Staff", icon: UserCheck },
  ] as const;

  const handleMenuClick = (tabId: typeof activeTab) => {
    onTabChange(tabId);
  };

  return (
    <>
      {/* Desktop sidebar (hidden on tablet and smaller screens) */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white shadow-lg flex-col z-40">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-900">Hotel Management</h1>
          <p className="text-sm text-gray-600 mt-1">Admin Dashboard</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? "text-purple-700 bg-purple-100 border border-purple-200"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-200">
          <div className="mb-4 flex items-center">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <UserCheck className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {user?.name || "Admin User"}
              </p>
              <p className="text-xs text-gray-500">
                {user?.role
                  ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                  : "Admin"}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile and tablet bottom navigation (visible only on non-desktop screens) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <nav className="flex">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`flex-1 flex flex-col items-center py-2 px-1 transition-colors ${
                  activeTab === item.id
                    ? "text-purple-600 bg-purple-50"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default AdminSidebar;
