import React from "react";
import { kitchenColors } from "../theme/colors";
import { kitchenLayout } from "../theme/layout";

interface NavigationItem {
  id: "all" | "pending" | "in-progress" | "ready";
  label: string;
  icon: string;
}

interface BottomNavigationProps {
  selectedFilter: "all" | "pending" | "in-progress" | "ready";
  onFilterClick: (
    e: React.MouseEvent,
    filter: "all" | "pending" | "in-progress" | "ready"
  ) => void;
}

const navigationItems: NavigationItem[] = [
  { id: "all", label: "All", icon: "apps" },
  { id: "pending", label: "Pending", icon: "hourglass_top" },
  { id: "in-progress", label: "In Progress", icon: "autorenew" },
  { id: "ready", label: "Ready", icon: "check_circle_outline" },
];

const getButtonClasses = (
  isSelected: boolean,
  filterId: "all" | "pending" | "in-progress" | "ready"
) => {
  const baseClasses = `flex flex-col items-center justify-center ${kitchenLayout.sizing.button.navBottom}`;

  if (isSelected) {
    switch (filterId) {
      case "pending":
        return `${baseClasses} ${kitchenColors.status.pending.navActive}`;
      case "in-progress":
      case "all":
        return `${baseClasses} ${kitchenColors.status.inProgress.navActive}`;
      case "ready":
        return `${baseClasses} ${kitchenColors.status.ready.navActive}`;
      default:
        return `${baseClasses} ${kitchenColors.status.inProgress.navActive}`;
    }
  }

  return `${baseClasses} ${kitchenColors.navigation.bottom.text} ${kitchenColors.navigation.bottom.hover}`;
};

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  selectedFilter,
  onFilterClick,
}) => {
  return (
    <nav
      className={`${kitchenLayout.responsive.bottomNav.position} ${kitchenColors.navigation.bottom.background} ${kitchenColors.navigation.bottom.border} ${kitchenLayout.responsive.bottomNav.hidden} z-50`}
    >
      <div
        className={`grid grid-cols-4 ${kitchenLayout.responsive.bottomNav.height}`}
      >
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={(e) => onFilterClick(e, item.id)}
            className={getButtonClasses(selectedFilter === item.id, item.id)}
          >
            <span
              className={`material-icons ${kitchenLayout.typography.navigation.bottom}`}
            >
              {item.icon}
            </span>
            <span className={`text-xs md:text-sm font-medium`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};
