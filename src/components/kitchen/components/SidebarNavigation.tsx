import React from "react";
import { UserCheck, LogOut, Hourglass, RotateCcw, CheckCircle2, BookOpen, Settings, List } from "lucide-react";
import { kitchenColors } from "../theme/colors";
import { kitchenLayout } from "../theme/layout";

interface NavigationItem {
  id: "all" | "pending" | "in-progress" | "ready" | "menu" | "settings";
  label: string;
  icon: React.ElementType;
}

interface SidebarNavigationProps {
  selectedFilter: "all" | "pending" | "in-progress" | "ready" | "menu" | "settings";
  onFilterClick: (
    e: React.MouseEvent,
    filter: "all" | "pending" | "in-progress" | "ready" | "menu" | "settings"
  ) => void;
  userName?: string;
  userRole?: string;
  onLogout: () => void;
}

const navigationItems: NavigationItem[] = [
  { id: "all", label: "All", icon: List },
  { id: "pending", label: "Pending", icon: Hourglass },
  { id: "in-progress", label: "In Progress", icon: RotateCcw },
  { id: "ready", label: "Ready", icon: CheckCircle2 },
  { id: "menu", label: "Menu", icon: BookOpen },
  { id: "settings", label: "Settings", icon: Settings },
];

const getNavItemClasses = (isSelected: boolean) => {
  // Use exact same classes as admin module
  const baseClasses = `w-full flex items-center px-4 py-3 rounded-lg transition-colors`;

  if (isSelected) {
    // Exact same styling as admin module
    return `${baseClasses} text-purple-700 bg-purple-100 border border-purple-200`;
  }

  return `${baseClasses} text-gray-700 hover:bg-gray-100`;
};

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  selectedFilter,
  onFilterClick,
  userName,
  userRole,
  onLogout,
}) => {
  return (
    <aside
      className={`${kitchenLayout.responsive.sidebar.hidden} ${kitchenLayout.responsive.sidebar.position} ${kitchenLayout.responsive.sidebar.width} ${kitchenColors.ui.sidebar.background} shadow-lg flex-col`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-900">Hotel Management</h1>
        <p className="text-sm text-gray-600 mt-1">Kitchen Dashboard</p>
      </div>

      {/* Navigation Items */}
      <nav className={`flex-1 px-4 py-6 space-y-2`}>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={(e) => onFilterClick(e, item.id)}
              className={getNavItemClasses(selectedFilter === item.id)}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="mb-4 flex items-center">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
            <UserCheck className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {userName || "Kitchen User"}
            </p>
            <p className="text-xs text-gray-500">
              {userRole
                ? userRole.charAt(0).toUpperCase() + userRole.slice(1)
                : "Kitchen"}
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
  );
};
