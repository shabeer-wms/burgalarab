import React, { useState, useRef } from "react";
import { Search, Plus, Clock, Edit, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { CheckCircle, XCircle } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { ImageUpload } from "./ImageUpload";
import Snackbar, { SnackbarType } from "../../SnackBar";

interface AdminMenuProps {
  categories: string[];
}

export const AdminMenu: React.FC<AdminMenuProps> = ({
  categories,
}) => {
  // For undo delete
  const lastDeletedMenuItem = useRef<any>(null);
  const [showUndo, setShowUndo] = useState(false);
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useApp();
  const [menuSearchTerm, setMenuSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [showEditMenuModal, setShowEditMenuModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<any>(null);
  const [showDeleteMenuModal, setShowDeleteMenuModal] = useState(false);
  const [menuItemToDelete, setMenuItemToDelete] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    show: boolean;
    message: string;
    type: SnackbarType;
  }>({ show: false, message: "", type: "success" });
  
  // Loading states for menu operations
  const [isAddingMenuItem, setIsAddingMenuItem] = useState(false);
  const [isEditingMenuItem, setIsEditingMenuItem] = useState(false);
  const [isDeletingMenuItem, setIsDeletingMenuItem] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  
  // Responsive items per page based on grid layout
  const getItemsPerPage = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      
      // xl: grid-cols-5 (5 items per row) -> 10 items per page
      if (width >= 1280) {
        return 10;
      }
      // lg: grid-cols-4 (4 items per row) -> 12 items per page
      else if (width >= 1024) {
        return 12;
      }
      // md: grid-cols-3 (3 items per row) -> 9 items per page
      else if (width >= 768) {
        return 9;
      }
      // grid-cols-2 (2 items per row) -> 6 items per page for mobile
      else {
        return 6;
      }
    }
    return 10; // Default fallback
  };
  
  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage());
  
  // Update items per page on window resize
  React.useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(getItemsPerPage());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const [newMenuItem, setNewMenuItem] = useState<{
    name: string;
    description: string;
    category: string;
    image: string;
    price: string;
    prepTime: string;
    available: boolean;
  }>({
    name: "",
    description: "",
    category: "",
    image: "",
    price: "",
    prepTime: "",
    available: true,
  });

  // Menu management functions
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(menuSearchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(menuSearchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredMenuItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMenuItems = filteredMenuItems.slice(startIndex, endIndex);

  // Reset to first page when search, category, or items per page changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [menuSearchTerm, selectedCategory, itemsPerPage]);

  const showSnackbar = (message: string, type: SnackbarType = "success") => {
    setSnackbar({ show: true, message, type });
  };

  const hideSnackbar = () => {
    setSnackbar(prev => ({ ...prev, show: false }));
  };

  const handleAddMenuItem = async () => {
    try {
      setIsLoading(true);
      setIsAddingMenuItem(true);
      const menuItemData = {
        name: newMenuItem.name,
        description: newMenuItem.description,
        category: newMenuItem.category,
        image: newMenuItem.image,
        price: parseFloat(newMenuItem.price),
        prepTime: parseInt(newMenuItem.prepTime),
        available: newMenuItem.available,
      };

      await addMenuItem(menuItemData);
      
      setNewMenuItem({
        name: "",
        description: "",
        category: "",
        image: "",
        price: "",
        prepTime: "",
        available: true,
      });
      setShowAddMenuModal(false);
      showSnackbar("Menu item added successfully!");
    } catch (error) {
      console.error("Error adding menu item:", error);
      showSnackbar("Failed to add menu item. Please try again.", "error");
    } finally {
      setIsLoading(false);
      setIsAddingMenuItem(false);
    }
  };

  const handleEditMenuItem = async () => {
    try {
      setIsLoading(true);
      setIsEditingMenuItem(true);
      const updates = {
        name: selectedMenuItem.name,
        description: selectedMenuItem.description,
        category: selectedMenuItem.category,
        image: selectedMenuItem.image,
        price: parseFloat(selectedMenuItem.price),
        prepTime: parseInt(selectedMenuItem.prepTime),
        available: selectedMenuItem.available,
      };

      await updateMenuItem(selectedMenuItem.id, updates);
      
      setShowEditMenuModal(false);
      setSelectedMenuItem(null);
      showSnackbar("Menu item updated successfully!");
    } catch (error) {
      console.error("Error updating menu item:", error);
      showSnackbar("Failed to update menu item. Please try again.", "error");
    } finally {
      setIsLoading(false);
      setIsEditingMenuItem(false);
    }
  };

  const handleDeleteMenuItem = (itemId: string) => {
    setMenuItemToDelete(itemId);
    setShowDeleteMenuModal(true);
  };

  const confirmDeleteMenuItem = async () => {
    if (menuItemToDelete) {
      try {
        setIsLoading(true);
        setIsDeletingMenuItem(true);
        // Save deleted item for undo
        const deletedItem = menuItems.find((item) => item.id === menuItemToDelete);
        lastDeletedMenuItem.current = deletedItem;
        await deleteMenuItem(menuItemToDelete);
        setMenuItemToDelete(null);
        setShowDeleteMenuModal(false);
        setShowUndo(true);
        showSnackbar("Menu item deleted. Undo?");
        // Hide undo after 5 seconds
        setTimeout(() => setShowUndo(false), 5000);
      } catch (error) {
        console.error("Error deleting menu item:", error);
        showSnackbar("Failed to delete menu item. Please try again.", "error");
      } finally {
        setIsLoading(false);
        setIsDeletingMenuItem(false);
      }
    }
  };

  const cancelDeleteMenuItem = () => {
    setMenuItemToDelete(null);
    setShowDeleteMenuModal(false);
  };

  const openEditMenuModal = (item: any) => {
    setSelectedMenuItem({
      ...item,
      price: item.price.toString(),
      prepTime: item.prepTime.toString(),
    });
    setShowEditMenuModal(true);
  };

  return (
    <>
      <div className="space-y-4 sm:space-y-6 pb-20 sm:pb-24 md:pb-16 lg:pb-4">
        <div className="flex flex-col space-y-4">
          {/* Search Bar */}
          <div className="flex justify-between items-center gap-4">
            <div className="relative flex-1 max-w-xs sm:max-w-none">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={menuSearchTerm}
                onChange={(e) => setMenuSearchTerm(e.target.value)}
                className="pl-8 sm:pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-purple-500 focus:border-purple-500 h-10"
              />
            </div>
            {/* Responsive Add Menu button: shows '+' icon on mobile, full button on larger screens */}
            <button
              onClick={() => setShowAddMenuModal(true)}
              className="bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center h-10 flex-shrink-0 px-3 sm:px-4"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm hidden sm:inline ml-2">Add Menu</span>
            </button>
          </div>
          
          {/* Category Filter Chips */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Menu Categories</h3>
            <div 
              className="overflow-x-auto pb-2" 
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none'
              }}
            >
              <style dangerouslySetInnerHTML={{
                __html: `
                  .overflow-x-auto::-webkit-scrollbar {
                    display: none;
                  }
                `
              }} />
              <div className="flex space-x-2 min-w-max">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                      selectedCategory === category
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
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
          {paginatedMenuItems.map((item) => {
            // Category color theme map
            const categoryColors: Record<string, string> = {
              Beverage: 'bg-blue-50',
              Dessert: 'bg-pink-50',
              Main: 'bg-yellow-50',
              Appetizer: 'bg-green-50',
              // Add more as needed
            };
            const cardBg = categoryColors[item.category] || 'bg-white';
            return (
              <div
                key={item.id}
                className={`${cardBg} rounded-lg shadow-sm border border-gray-200 overflow-hidden`}
              >
                {/* Mobile: category and dot above image */}
                <div className="block md:hidden px-2 pt-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">{item.category}</span>
                  <span className={`inline-block w-3 h-3 rounded-full ${item.available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                </div>
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-24 sm:h-28 md:h-32 object-cover"
                  />
                  {/* Desktop: category and status badge */}
                  <div className="hidden md:block absolute top-1 left-1">
                    <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 text-xs font-medium rounded-full">
                      {item.category}
                    </span>
                  </div>
                  <div className="hidden md:block absolute top-1 right-1">
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
                </div>

                <div className="p-2 md:p-3">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate flex-1 pr-1">
                      {item.name}
                    </h3>
                    <span className="text-xs sm:text-sm font-bold text-purple-600 flex-shrink-0">
                      ${item.price}
                    </span>
                  </div>

                  <p className="text-gray-600 text-xs mb-2 line-clamp-2 leading-tight">
                    {item.description}
                  </p>

                  <div className="flex justify-start items-center text-xs text-gray-500 mb-2">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {item.prepTime} min
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    {/* Available/Unavailable Toggle Button */}
                    <button
                      onClick={async () => {
                        try {
                          await updateMenuItem(item.id, { available: !item.available });
                        } catch (error) {
                          console.error("Error updating availability:", error);
                        }
                      }}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                        item.available 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'bg-red-500 hover:bg-red-600'
                      }`}
                      title={item.available ? 'Available - Click to disable' : 'Unavailable - Click to enable'}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                          item.available ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => openEditMenuModal(item)}
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                        title="Edit Item"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteMenuItem(item.id)}
                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Simple Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end mt-6 mb-4">
            <div className="flex items-center">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 mr-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="text-sm text-gray-600 mr-3">Page {currentPage} of {totalPages}</div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {filteredMenuItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No menu items found matching your criteria.
            </p>
          </div>
        )}
      </div>

      {/* Delete Menu Item Confirmation Modal */}
      {showDeleteMenuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Delete Menu Item
            </h3>
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete this menu item?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={cancelDeleteMenuItem}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteMenuItem}
                disabled={isDeletingMenuItem}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeletingMenuItem ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Menu Item Modal */}
      {showAddMenuModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
          style={{
            margin: 0,
            padding: 16,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
          }}
        >
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                Add New Menu Item
              </h3>
              <button
                onClick={() => setShowAddMenuModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newMenuItem.name}
                  onChange={(e) =>
                    setNewMenuItem({ ...newMenuItem, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter item name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newMenuItem.description}
                  onChange={(e) =>
                    setNewMenuItem({
                      ...newMenuItem,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter item description"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newMenuItem.category}
                  onChange={(e) =>
                    setNewMenuItem({
                      ...newMenuItem,
                      category: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none  focus:ring-purple-500 focus:border-purple-500 bg-white appearance-none pr-10 transition-colors"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <svg
                  className="w-4 h-4 text-gray-400 absolute right-3 top-9 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              <ImageUpload
                currentImage={newMenuItem.image}
                onImageChange={(imageUrl) =>
                  setNewMenuItem({ ...newMenuItem, image: imageUrl })
                }
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newMenuItem.price}
                    onChange={(e) =>
                      setNewMenuItem({
                        ...newMenuItem,
                        price: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prep Time (min)
                  </label>
                  <input
                    type="number"
                    value={newMenuItem.prepTime}
                    onChange={(e) =>
                      setNewMenuItem({
                        ...newMenuItem,
                        prepTime: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="15"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="available"
                  checked={newMenuItem.available}
                  onChange={(e) =>
                    setNewMenuItem({
                      ...newMenuItem,
                      available: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="available"
                  className="ml-2 text-sm text-gray-700"
                >
                  Available for orders
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowAddMenuModal(false)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMenuItem}
                disabled={isAddingMenuItem || isLoading}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingMenuItem ? "Adding..." : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Menu Item Modal */}
      {showEditMenuModal && selectedMenuItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
          style={{
            margin: 0,
            padding: 16,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
          }}
        >
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                Edit Menu Item
              </h3>
              <button
                onClick={() => setShowEditMenuModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={selectedMenuItem.name}
                  onChange={(e) =>
                    setSelectedMenuItem({
                      ...selectedMenuItem,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={selectedMenuItem.description}
                  onChange={(e) =>
                    setSelectedMenuItem({
                      ...selectedMenuItem,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={selectedMenuItem.category}
                  onChange={(e) =>
                    setSelectedMenuItem({
                      ...selectedMenuItem,
                      category: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white appearance-none pr-10 transition-colors"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <svg
                  className="w-4 h-4 text-gray-400 absolute right-3 top-9 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              <ImageUpload
                currentImage={selectedMenuItem.image}
                onImageChange={(imageUrl) =>
                  setSelectedMenuItem({
                    ...selectedMenuItem,
                    image: imageUrl,
                  })
                }
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={selectedMenuItem.price}
                    onChange={(e) =>
                      setSelectedMenuItem({
                        ...selectedMenuItem,
                        price: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prep Time (min)
                  </label>
                  <input
                    type="number"
                    value={selectedMenuItem.prepTime}
                    onChange={(e) =>
                      setSelectedMenuItem({
                        ...selectedMenuItem,
                        prepTime: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowEditMenuModal(false)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEditMenuItem}
                disabled={isEditingMenuItem || isLoading}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEditingMenuItem ? "Updating..." : "Update Item"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Snackbar */}
      {/* Undo Snackbar */}
      {showUndo && lastDeletedMenuItem.current && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-white border border-gray-300 shadow-lg rounded-lg px-4 py-2 flex items-center space-x-2">
          <span>Menu item deleted.</span>
          <button
            className="text-purple-600 font-semibold hover:underline"
            onClick={async () => {
              await addMenuItem(lastDeletedMenuItem.current);
              setShowUndo(false);
              showSnackbar("Menu item restored!");
            }}
          >Undo</button>
        </div>
      )}
      <Snackbar
        message={snackbar.message}
        type={snackbar.type}
        show={snackbar.show}
        onClose={hideSnackbar}
      />
    </>
  );
};
