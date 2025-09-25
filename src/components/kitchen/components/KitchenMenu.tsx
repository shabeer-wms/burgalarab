import React, { useState, useRef, useEffect } from "react";

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
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        event.target instanceof Node &&
        !wrapperRef.current.contains(event.target)
      ) {
        setIsCategoryOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${
        isUnavailable ? "opacity-60" : ""
      }`}
    >
      <div className="relative">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-40 sm:h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              item.available
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {item.available ? "Available" : "Unavailable"}
          </span>
        </div>
        <div className="absolute top-2 left-2">
          <span className="bg-purple-100 text-purple-800 px-2 py-1 text-xs font-medium rounded-full">
            {item.category}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate flex-1 pr-2">
            {item.name}
          </h3>
          <span className="text-base sm:text-lg font-bold text-purple-600 flex-shrink-0">
            ${item.price.toFixed(2)}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {item.description}
        </p>

        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
          <span className="flex items-center">
            <span className="material-icons mr-1" style={{ fontSize: 16 }}>
              schedule
            </span>
            {formatPrepTime(item.prepTime)}
          </span>
          <span className="text-xs">ID: #{item.id}</span>
        </div>

        <div className="flex justify-between items-center">
          {/* Available/Unavailable Toggle (checkbox only) */}
          <label className="flex items-center select-none">
            <input
              type="checkbox"
              checked={item.available}
              onChange={() => handleAvailabilityToggle(item.id, item.available)}
              disabled={!onUpdateMenuItem}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <span
              className={`ml-2 text-xs sm:text-sm ${
                item.available ? "text-green-600" : "text-red-600"
              }`}
            >
              {item.available ? "Available" : "Unavailable"}
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* Header Section - AdminMenu Style */}
      <div className="space-y-4 sm:space-y-6 pb-20 md:pb-0">
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Kitchen Menu
          </h2>
          <p className="text-sm text-gray-600">
            {menuItems.length} Items | {availableItems.length} Available
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="relative flex-1">
            <span
              className="material-icons text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
              style={{ fontSize: 18 }}
            >
              search
            </span>
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Category Filter */}
          <div
            className="relative w-full sm:w-auto"
            ref={wrapperRef}
            style={{ minWidth: "140px", maxWidth: "200px" }}
          >
            <button
              type="button"
              onClick={() => setIsCategoryOpen((s) => !s)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setIsCategoryOpen(false);
              }}
              className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm min-w-[140px] transition-colors duration-150 flex items-center justify-between"
              aria-haspopup="listbox"
              aria-expanded={isCategoryOpen}
            >
              <span className="truncate">
                {selectedCategory === "all"
                  ? "All Categories"
                  : selectedCategory}
              </span>
              <span
                className="material-icons text-gray-400 ml-2"
                style={{ fontSize: 16 }}
              >
                expand_more
              </span>
            </button>

            {/* Dropdown Options */}
            {isCategoryOpen && (
              <ul
                role="listbox"
                aria-activedescendant={selectedCategory}
                tabIndex={-1}
                className="absolute left-0 mt-2 max-h-52 overflow-auto rounded-lg bg-white shadow-xl border border-gray-200 z-50 w-full"
                onKeyDown={(e) => {
                  if (e.key === "Escape") setIsCategoryOpen(false);
                }}
              >
                <li
                  role="option"
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors hover:bg-purple-50 ${
                    selectedCategory === "all"
                      ? "bg-purple-600 text-white hover:bg-purple-600"
                      : "text-gray-700"
                  }`}
                  onClick={() => {
                    setSelectedCategory("all");
                    setIsCategoryOpen(false);
                  }}
                >
                  All Categories
                </li>
                {categories.map((category) => (
                  <li
                    key={category}
                    role="option"
                    className={`px-4 py-2 text-sm cursor-pointer transition-colors hover:bg-purple-50 ${
                      selectedCategory === category
                        ? "bg-purple-600 text-white hover:bg-purple-600"
                        : "text-gray-700"
                    }`}
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsCategoryOpen(false);
                    }}
                  >
                    {category}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredMenuItems.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>

        {/* No Results */}
        {filteredMenuItems.length === 0 && (
          <div className="text-center py-12">
            <span
              className="material-icons text-gray-400 mb-4"
              style={{ fontSize: 48 }}
            >
              search_off
            </span>
            <p className="text-gray-500 text-lg">
              No menu items found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
