import React, { useState } from "react";
import { Search, Plus, Clock, Edit, Trash2, X } from "lucide-react";
import { useApp } from "../../../context/AppContext";

interface AdminMenuProps {
  categories: string[];
}

export const AdminMenu: React.FC<AdminMenuProps> = ({
  categories,
}) => {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useApp();
  const [menuSearchTerm, setMenuSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [showEditMenuModal, setShowEditMenuModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<any>(null);
  const [showDeleteMenuModal, setShowDeleteMenuModal] = useState(false);
  const [menuItemToDelete, setMenuItemToDelete] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleAddMenuItem = async () => {
    try {
      setIsLoading(true);
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
    } catch (error) {
      console.error("Error adding menu item:", error);
      alert("Failed to add menu item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMenuItem = async () => {
    try {
      setIsLoading(true);
      const updates = {
        name: selectedMenuItem.name,
        description: selectedMenuItem.description,
        category: selectedMenuItem.category,
        price: parseFloat(selectedMenuItem.price),
        prepTime: parseInt(selectedMenuItem.prepTime),
        available: selectedMenuItem.available,
      };

      await updateMenuItem(selectedMenuItem.id, updates);
      
      setShowEditMenuModal(false);
      setSelectedMenuItem(null);
    } catch (error) {
      console.error("Error updating menu item:", error);
      alert("Failed to update menu item. Please try again.");
    } finally {
      setIsLoading(false);
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
        await deleteMenuItem(menuItemToDelete);
        setMenuItemToDelete(null);
        setShowDeleteMenuModal(false);
      } catch (error) {
        console.error("Error deleting menu item:", error);
        alert("Failed to delete menu item. Please try again.");
      } finally {
        setIsLoading(false);
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
      <div className="space-y-4 sm:space-y-6 pb-20 md:pb-0">
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
          {/* <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Menu Management
          </h2> */}
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 sm:flex-1">
            <div className="relative w-full sm:flex-1">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={menuSearchTerm}
                onChange={(e) => setMenuSearchTerm(e.target.value)}
                className="pl-8 sm:pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-purple-500 focus:border-purple-500 h-10"
              />
            </div>
            <div
              className="relative w-full sm:w-auto"
              style={{ minWidth: "120px", maxWidth: "170px" }}
            >
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm focus:outline-none  focus:ring-purple-500 focus:border-purple-500 text-sm min-w-[120px] transition-colors duration-150 pr-8 h-10"
                style={{
                  minWidth: "120px",
                  maxWidth: "170px",
                  height: "40px",
                  appearance: "none",
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                }}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 8L10 12L14 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowAddMenuModal(true)}
            className="w-full sm:w-auto bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 h-10 sm:ml-4"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredMenuItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
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
                    ${item.price}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {item.prepTime} min
                  </span>
                  <span className="text-xs">ID: #{item.id}</span>
                </div>

                <div className="flex justify-between items-center">
                  {/* Available/Unavailable Checkbox */}
                  <label className="flex items-center select-none">
                    <input
                      type="checkbox"
                      checked={item.available}
                      onChange={async () => {
                        try {
                          await updateMenuItem(item.id, { available: !item.available });
                        } catch (error) {
                          console.error("Error updating availability:", error);
                        }
                      }}
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
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditMenuModal(item)}
                      className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded"
                      title="Edit Item"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMenuItem(item.id)}
                      className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

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
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={newMenuItem.image}
                  onChange={(e) =>
                    setNewMenuItem({ ...newMenuItem, image: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 border-[1px] rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="https://example.com/image.jpg"
                />
                {newMenuItem.image && (
                  <img
                    src={newMenuItem.image}
                    alt="Preview"
                    className="mt-2 w-32 h-32 object-cover rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                )}
              </div>

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
                disabled={isLoading}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Adding..." : "Add Item"}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={selectedMenuItem.image}
                  onChange={(e) =>
                    setSelectedMenuItem({
                      ...selectedMenuItem,
                      image: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 border-[1px] rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="https://example.com/image.jpg"
                />
                {selectedMenuItem.image && (
                  <img
                    src={selectedMenuItem.image}
                    alt="Preview"
                    className="mt-2 w-32 h-32 object-cover rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                )}
              </div>

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
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
              >
                Update Item
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
