import React, { useState } from "react";
import { kitchenColors } from "../theme/colors";
import { kitchenLayout } from "../theme/layout";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  prepTime: number;
}

interface KitchenMenuProps {
  menuItems: MenuItem[];
  onUpdateMenuItem?: (itemId: string, updates: Partial<MenuItem>) => void;
}

export const KitchenMenu: React.FC<KitchenMenuProps> = ({
  menuItems,
  onUpdateMenuItem,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Get unique categories from menu items
  const categories = [...new Set(menuItems.map((item) => item.category))];

  // Filter menu items
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group items by availability for kitchen priority
  const availableItems = filteredMenuItems.filter((item) => item.available);
  const unavailableItems = filteredMenuItems.filter((item) => !item.available);

  const getCategoryIconClass = (category: string) => {
    switch (category.toLowerCase()) {
      case "appetizers":
        return kitchenColors.status.pending.icon;
      case "main course":
        return kitchenColors.status.inProgress.icon;
      case "desserts":
        return kitchenColors.status.ready.icon;
      case "beverages":
        return kitchenColors.ui.primary.textSecondary;
      default:
        return kitchenColors.ui.primary.text;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "appetizers":
        return "restaurant";
      case "main course":
        return "dinner_dining";
      case "desserts":
        return "cake";
      case "beverages":
        return "local_cafe";
      default:
        return "fastfood";
    }
  };

  const formatPrepTime = (minutes: number) => {
    return `${minutes}min`;
  };

  const handleAvailabilityToggle = (
    itemId: string,
    currentAvailability: boolean
  ) => {
    if (onUpdateMenuItem) {
      onUpdateMenuItem(itemId, { available: !currentAvailability });
    }
  };

  const MenuItemCard: React.FC<{ item: MenuItem; isUnavailable?: boolean }> = ({
    item,
    isUnavailable = false,
  }) => (
    <div
      className={`${kitchenColors.ui.layout.card} ${
        kitchenLayout.spacing.card
      } rounded-2xl h-full flex flex-col ${isUnavailable ? "opacity-60" : ""}`}
    >
      {/* Header Section */}
      <div className="flex justify-between items-start mb-3 lg:mb-4">
        <div className="min-w-0 flex-1 mr-3">
          <h3
            className={`${kitchenLayout.typography.card.title} ${kitchenColors.ui.primary.text} truncate`}
          >
            {item.name}
          </h3>
          <p
            className={`${kitchenLayout.typography.card.subtitle} ${kitchenColors.ui.primary.textSecondary} truncate`}
          >
            {item.description}
          </p>
        </div>
        <div className="flex-shrink-0 ml-4">
          <img
            src={item.image}
            alt={item.name}
            className="w-16 h-16 rounded-xl object-cover"
          />
        </div>
      </div>

      {/* Details Section */}
      <div className="mb-3 lg:mb-4 space-y-2 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span
              className={`material-icons ${getCategoryIconClass(
                item.category
              )} mr-2`}
              style={{ fontSize: 18 }}
            >
              {getCategoryIcon(item.category)}
            </span>
            <span
              className={`${kitchenLayout.typography.card.subtitle} ${kitchenColors.ui.primary.textSecondary}`}
            >
              {item.category}
            </span>
          </div>
          <div className="flex items-center">
            <span
              className={`material-icons ${kitchenColors.ui.primary.textSecondary} mr-1`}
              style={{ fontSize: 16 }}
            >
              schedule
            </span>
            <span
              className={`${kitchenLayout.typography.card.subtitle} ${kitchenColors.ui.primary.text} font-medium`}
            >
              {formatPrepTime(item.prepTime)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span
            className={`${kitchenLayout.typography.card.title} ${kitchenColors.ui.primary.text} font-bold`}
          >
            ${item.price.toFixed(2)}
          </span>
          <div
            className={`${
              item.available
                ? kitchenColors.status.ready.badge
                : "bg-red-100 text-red-700"
            } ${kitchenLayout.typography.card.subtitle} font-medium ${
              kitchenLayout.sizing.button.paddingSmall
            } rounded-full flex items-center flex-shrink-0`}
          >
            <span
              className={`material-icons ${kitchenLayout.sizing.icon.small} mr-1`}
            >
              {item.available ? "check_circle" : "cancel"}
            </span>
            {item.available ? "Available" : "Unavailable"}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-3 lg:mt-4">
        <button
          onClick={() => handleAvailabilityToggle(item.id, item.available)}
          className={`w-full ${
            item.available
              ? "bg-red-500 text-white hover:bg-red-600"
              : `${kitchenColors.status.ready.button} text-white ${kitchenColors.status.ready.hover}`
          } ${
            kitchenLayout.sizing.button.padding
          } rounded-lg font-semibold transition duration-300 flex items-center justify-center ${
            kitchenLayout.typography.card.button
          } ${
            onUpdateMenuItem
              ? "cursor-pointer"
              : "cursor-not-allowed opacity-60"
          }`}
          disabled={!onUpdateMenuItem}
          title={
            onUpdateMenuItem ? "Click to toggle availability" : "Read-only mode"
          }
        >
          <span
            className={`material-icons mr-2 ${kitchenLayout.sizing.icon.button}`}
          >
            {item.available ? "visibility_off" : "visibility"}
          </span>
          {item.available ? "Mark Unavailable" : "Mark Available"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div
        className={`${kitchenColors.ui.layout.card} ${kitchenLayout.responsive.header.padding} rounded-2xl ${kitchenLayout.responsive.header.margin} ${kitchenLayout.responsive.header.minHeight}`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-3 lg:gap-4">
          <div className="flex items-center min-w-0 flex-1 md:flex-initial">
            <div
              className={`${kitchenColors.ui.layout.header} ${kitchenLayout.sizing.icon.header} rounded-xl mr-3 flex-shrink-0 flex items-center justify-center`}
            >
              <span
                className={`material-icons ${kitchenColors.ui.layout.headerIcon}`}
                style={{ fontSize: 18 }}
              >
                menu_book
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h1
                className={`${kitchenLayout.typography.header.title} ${kitchenColors.ui.primary.text} truncate`}
              >
                Kitchen Menu
              </h1>
              <p
                className={`${kitchenColors.ui.primary.textSecondary} ${kitchenLayout.typography.header.subtitle} tabular-nums truncate`}
              >
                {menuItems.length} Items | {availableItems.length} Available
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div
          className={`${kitchenColors.ui.layout.card} ${kitchenLayout.spacing.card} rounded-xl`}
        >
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span
                  className={`material-icons ${kitchenColors.ui.primary.textSecondary}`}
                  style={{ fontSize: 18 }}
                >
                  search
                </span>
              </div>
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`block w-full pl-10 pr-3 py-2 border ${kitchenColors.ui.primary.border} rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm`}
              />
            </div>
            {/* Category Filter */}
            <div className="relative min-w-[140px]">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`block w-full pl-3 pr-10 py-2 text-sm border ${kitchenColors.ui.primary.border} rounded-lg ${kitchenColors.ui.primary.background} ${kitchenColors.ui.primary.text} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer shadow-sm hover:shadow-md transition-shadow`}
                style={{ minWidth: "140px" }}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <span
                  className={`material-icons ${kitchenColors.ui.primary.textSecondary}`}
                  style={{ fontSize: 16 }}
                >
                  expand_more
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Items */}
      {availableItems.length > 0 && (
        <div className="mb-8">
          <h2
            className={`text-lg font-semibold ${kitchenColors.ui.primary.text} mb-4 flex items-center`}
          >
            <span
              className={`material-icons ${kitchenColors.status.ready.icon} mr-2`}
              style={{ fontSize: 20 }}
            >
              check_circle
            </span>
            Available Items ({availableItems.length})
          </h2>
          <div className="space-y-3">
            {availableItems.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Unavailable Items */}
      {unavailableItems.length > 0 && (
        <div className="mb-8">
          <h2
            className={`text-lg font-semibold ${kitchenColors.ui.primary.text} mb-4 flex items-center`}
          >
            <span
              className="material-icons text-red-500 mr-2"
              style={{ fontSize: 20 }}
            >
              cancel
            </span>
            Unavailable Items ({unavailableItems.length})
          </h2>
          <div className="space-y-3">
            {unavailableItems.map((item) => (
              <MenuItemCard key={item.id} item={item} isUnavailable={true} />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredMenuItems.length === 0 && (
        <div
          className={`${kitchenColors.ui.layout.card} ${kitchenLayout.spacing.card} rounded-xl text-center py-12`}
        >
          <span
            className={`material-icons ${kitchenColors.ui.primary.textSecondary} mb-4`}
            style={{ fontSize: 48 }}
          >
            search_off
          </span>
          <p className={`${kitchenColors.ui.primary.textSecondary} text-lg`}>
            No menu items found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
};
