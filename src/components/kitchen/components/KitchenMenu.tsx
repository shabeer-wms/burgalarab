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
  const [currentPage, setCurrentPage] = useState(1);
  const getItemsPerPage = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width >= 1280) {
        return 10;
      } else if (width >= 1024) {
        return 12;
      } else if (width >= 768) {
        return 9;
      } else {
        return 4;
      }
    }
    return 10;
  };
  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage());
  useEffect(() => {
    const handleResize = () => setItemsPerPage(getItemsPerPage());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // close dropdown when clicking outside

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
  const totalPages = Math.ceil(filteredMenuItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMenuItems = filteredMenuItems.slice(startIndex, endIndex);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedCategory, itemsPerPage]);

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
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${isUnavailable ? "opacity-60" : ""}`}
    >
      <div className="relative">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-24 sm:h-28 md:h-32 object-cover"
        />
        <div className="absolute top-1 right-1">
          <span
            className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${
              item.available
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {item.available ? "Available" : "Unavailable"}
          </span>
        </div>
        <div className="absolute top-1 left-1">
          <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 text-xs font-medium rounded-full">
            {item.category}
          </span>
        </div>
      </div>

      <div className="p-2 md:p-3">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate flex-1 pr-2">
            {item.name}
          </h3>
          <span className="text-base sm:text-lg font-bold text-purple-600 flex-shrink-0">
            ${item.price.toFixed(2)}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
          {item.description}
        </p>

        <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
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
      <div className="space-y-4 sm:space-y-6 pb-32 md:pb-12">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center gap-4">
            <div className="relative flex-1 max-w-xs sm:max-w-none">
              <span className="material-icons text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ fontSize: 18 }}>search</span>
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 sm:pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-purple-500 focus:border-purple-500 h-10"
              />
            </div>
          </div>
          {/* Category Filter Chips */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Menu Categories</h3>
            <div className="overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style dangerouslySetInnerHTML={{ __html: `.overflow-x-auto::-webkit-scrollbar { display: none; }` }} />
              <div className="flex space-x-2 min-w-max">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedCategory === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedCategory === category ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {paginatedMenuItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative">
                <img src={item.image} alt={item.name} className="w-full h-24 sm:h-28 md:h-32 object-cover" />
                <div className="absolute top-1 right-1">
                  <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{item.available ? 'Available' : 'Unavailable'}</span>
                </div>
                <div className="absolute top-1 left-1">
                  <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 text-xs font-medium rounded-full">{item.category}</span>
                </div>
              </div>
              <div className="p-2 md:p-3">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate flex-1 pr-1">{item.name}</h3>
                  <span className="text-xs sm:text-sm font-bold text-purple-600 flex-shrink-0">${item.price}</span>
                </div>
                <p className="text-gray-600 text-xs mb-2 line-clamp-2 leading-tight">{item.description}</p>
                <div className="flex justify-start items-center text-xs text-gray-500 mb-2">
                  <span className="flex items-center">
                    <span className="material-icons mr-1" style={{ fontSize: 16 }}>schedule</span>
                    {item.prepTime} min
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  {/* Available/Unavailable Toggle Button */}
                  <button
                    onClick={() => onUpdateMenuItem && onUpdateMenuItem(item.id, { available: !item.available })}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${item.available ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                    title={item.available ? 'Available - Click to disable' : 'Unavailable - Click to enable'}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${item.available ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end mt-8 pb-8 sm:pb-12 md:pb-6">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <span className="material-icons">chevron_left</span>
              </button>
              <div className="flex items-center space-x-0.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  const shouldShow = page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1);
                  if (!shouldShow) {
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return (<span key={page} className="px-1 py-1 text-xs text-gray-400">...</span>);
                    }
                    return null;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 text-xs font-medium rounded transition-colors ${page === currentPage ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <span className="material-icons">chevron_right</span>
              </button>
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredMenuItems.length === 0 && (
          <div className="text-center py-12">
            <span className="material-icons text-gray-400 mb-4" style={{ fontSize: 48 }}>search_off</span>
            <p className="text-gray-500 text-lg">No menu items found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
