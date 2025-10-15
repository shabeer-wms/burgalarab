import React from "react";
import { kitchenColors } from "../theme/colors";
import { kitchenLayout } from "../theme/layout";
import {
  List,
  Hourglass,
  RotateCcw,
  CheckCircle2,
  BookOpen,
  Settings,
} from "lucide-react";

interface NavigationItem {
  id: "all" | "pending" | "in-progress" | "ready" | "menu" | "settings";
  label: string;
  icon: React.ElementType;
}

interface BottomNavigationProps {
  selectedFilter:
    | "all"
    | "pending"
    | "in-progress"
    | "ready"
    | "menu"
    | "settings";
  onFilterClick: (
    e: React.MouseEvent,
    filter: "all" | "pending" | "in-progress" | "ready" | "menu" | "settings"
  ) => void;
}

const navigationItems: NavigationItem[] = [
  { id: "all", label: "All", icon: List },
  { id: "pending", label: "Pending", icon: Hourglass },
  { id: "in-progress", label: "In Progress", icon: RotateCcw },
  { id: "ready", label: "Ready", icon: CheckCircle2 },
  { id: "menu", label: "Menu", icon: BookOpen },
  { id: "settings", label: "Settings", icon: Settings },
];

const getButtonClasses = (isSelected: boolean) => {
  // Make buttons fill the nav height so the selected background covers the
  // full tappable area instead of leaving padding around the selected box.
  const baseClasses = `flex flex-col items-center justify-center h-full w-full ${kitchenLayout.sizing.button.navBottom} transition-colors`;

  if (isSelected) {
    // Selected item uses purple text and a light purple background that
    // covers the full button area.
    return `${baseClasses} text-purple-600 bg-purple-50`;
  }

  return `${baseClasses} text-gray-600 hover:text-gray-900`;
};

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  selectedFilter,
  onFilterClick,
}) => {
  // Only show required options on small screens
  const filteredItems = navigationItems.filter((item) => item.id !== "all");

  return (
    <nav
      className={`${kitchenLayout.responsive.bottomNav.position} ${kitchenColors.navigation.bottom.background} ${kitchenColors.navigation.bottom.border} ${kitchenLayout.responsive.bottomNav.hidden} z-50`}
    >
      <div
        className={`flex flex-row justify-between items-center ${kitchenLayout.responsive.bottomNav.height}`}
      >
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={(e) => onFilterClick(e, item.id)}
            className={
              getButtonClasses(selectedFilter === item.id) + " flex-1 min-w-0"
            }
          >
            <item.icon
              className={`w-5 h-5 ${kitchenLayout.typography.navigation.bottom}`}
            />
            <span className={`text-xs md:text-sm font-medium truncate`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};
