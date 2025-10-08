import React from "react";
import { kitchenColors } from "../theme/colors";
import { kitchenLayout } from "../theme/layout";
import { Settings } from "lucide-react";

interface NavigationItem {
  id: "all" | "pending" | "in-progress" | "ready" | "menu" | "settings";
  label: string;
  icon: string;
}

interface BottomNavigationProps {
  selectedFilter: "all" | "pending" | "in-progress" | "ready" | "menu" | "settings";
  onFilterClick: (
    e: React.MouseEvent,
    filter: "all" | "pending" | "in-progress" | "ready" | "menu" | "settings"
  ) => void;
}

const navigationItems: NavigationItem[] = [
  { id: "all", label: "All", icon: "apps" },
  { id: "pending", label: "Pending", icon: "hourglass_top" },
  { id: "in-progress", label: "In Progress", icon: "autorenew" },
  { id: "ready", label: "Ready", icon: "check_circle_outline" },
  { id: "menu", label: "Menu", icon: "menu_book" },
  { id: "settings", label: "Settings", icon: "settings" },
];

const getButtonClasses = (isSelected: boolean) => {
  const baseClasses = `flex flex-col items-center justify-center ${kitchenLayout.sizing.button.navBottom} transition-colors`;

  if (isSelected) {
    // All selected items use the same purple styling, just like admin module
    return `${baseClasses} text-purple-600 bg-purple-50`;
  }

  return `${baseClasses} text-gray-600 hover:text-gray-900`;
};

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  selectedFilter,
  onFilterClick,
}) => {
  // Only show required options on small screens
  const filteredItems = navigationItems.filter(
    (item) => item.id !== "all"
  );

  return (
    <nav
      className={`${kitchenLayout.responsive.bottomNav.position} ${kitchenColors.navigation.bottom.background} ${kitchenColors.navigation.bottom.border} ${kitchenLayout.responsive.bottomNav.hidden} z-50`}
    >
      <div className={`flex flex-row justify-between items-center ${kitchenLayout.responsive.bottomNav.height}`}>
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={(e) => onFilterClick(e, item.id)}
            className={getButtonClasses(selectedFilter === item.id) + " flex-1 min-w-0 px-1"}
            style={{ maxWidth: "120px" }}
          >
            {item.id === "settings" ? (
              <Settings className={`w-5 h-5 ${kitchenLayout.typography.navigation.bottom} text-purple-600`} />
            ) : (
              <span
                className={`material-icons ${kitchenLayout.typography.navigation.bottom}`}
              >
                {item.icon}
              </span>
            )}
            <span className={`text-xs md:text-sm font-medium truncate`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};
