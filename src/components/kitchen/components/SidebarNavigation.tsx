import React from "react";
import { kitchenColors } from "../theme/colors";
import { kitchenLayout } from "../theme/layout";

interface NavigationItem {
  id: "all" | "pending" | "in-progress" | "ready" | "menu";
  label: string;
  icon: string;
}

interface SidebarNavigationProps {
  selectedFilter: "all" | "pending" | "in-progress" | "ready" | "menu";
  onFilterClick: (
    e: React.MouseEvent,
    filter: "all" | "pending" | "in-progress" | "ready" | "menu"
  ) => void;
  userName?: string;
  userRole?: string;
  onLogout: () => void;
}

const navigationItems: NavigationItem[] = [
  { id: "all", label: "All", icon: "apps" },
  { id: "pending", label: "Pending", icon: "hourglass_top" },
  { id: "in-progress", label: "In Progress", icon: "autorenew" },
  { id: "ready", label: "Ready", icon: "check_circle_outline" },
  { id: "menu", label: "Menu", icon: "menu_book" },
];

const getNavItemClasses = (
  isSelected: boolean,
  filterId: "all" | "pending" | "in-progress" | "ready" | "menu"
) => {
  const baseClasses = `flex items-center ${kitchenLayout.sizing.button.nav} rounded-lg`;

  if (isSelected) {
    switch (filterId) {
      case "all":
      case "in-progress":
        return `${baseClasses} ${kitchenColors.ui.sidebar.text} ${kitchenColors.ui.sidebar.active}`;
      case "pending":
        return `${baseClasses} ${kitchenColors.ui.sidebar.text} ${kitchenColors.status.pending.background}`;
      case "ready":
        return `${baseClasses} ${kitchenColors.ui.sidebar.text} ${kitchenColors.status.ready.background}`;
      case "menu":
        return `${baseClasses} ${kitchenColors.ui.sidebar.text} ${kitchenColors.ui.sidebar.active}`;
      default:
        return `${baseClasses} ${kitchenColors.ui.sidebar.text} ${kitchenColors.ui.sidebar.active}`;
    }
  }

  return `${baseClasses} ${kitchenColors.ui.sidebar.text} ${kitchenColors.ui.sidebar.hover}`;
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
      <div className="p-6 text-lg text-gray-800 border-b">
        <p className="font-bold">Hotel Management</p>
        <p className="text-base">Kitchen Dashboard</p>
      </div>

      {/* Navigation Items */}
      <nav className={`flex-1 px-4 py-4 ${kitchenLayout.spacing.navigation}`}>
        {navigationItems.map((item) => (
          <a
            key={item.id}
            href="#"
            onClick={(e) => onFilterClick(e, item.id)}
            className={getNavItemClasses(selectedFilter === item.id, item.id)}
          >
            <span
              className={`material-icons mr-3 ${kitchenLayout.typography.navigation.sidebar}`}
            >
              {item.icon}
            </span>
            {item.label}
          </a>
        ))}
      </nav>

      {/* User Section */}
      <div
        className={`p-4 ${kitchenColors.ui.sidebar.border} flex flex-col justify-start`}
      >
        <div className="mb-3 flex items-center">
          <span
            className={`material-icons mr-3 ${kitchenColors.ui.primary.textSecondary} ${kitchenLayout.sizing.icon.user}`}
          >
            account_circle
          </span>
          <div>
            <p
              className={`text-sm font-semibold ${kitchenColors.ui.primary.text}`}
            >
              {userName}
            </p>
            <p className={`text-xs ${kitchenColors.ui.primary.textSecondary}`}>
              {userRole
                ? userRole.charAt(0).toUpperCase() + userRole.slice(1)
                : "Unknown"}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className={`w-full flex items-center justify-center px-4 py-2 border rounded-lg mt-4 ${kitchenColors.ui.button.danger}`}
        >
          <span className="material-icons mr-2">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
};
