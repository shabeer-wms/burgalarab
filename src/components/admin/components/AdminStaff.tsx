import React, { useState } from "react";
import { Plus, Search, Edit, Trash2, X } from "lucide-react";
import { useApp } from "../../../context/AppContext";

export const AdminStaff: React.FC = () => {
  const { staff, addStaff, updateStaff, deleteStaff } = useApp();
  const [staffSearchTerm, setStaffSearchTerm] = useState("");
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [showDeleteStaffModal, setShowDeleteStaffModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<any>(null);

  const [newStaff, setNewStaff] = useState({
    name: "",
    phoneNumber: "",
    password: "",
    role: "waiter" as "waiter" | "kitchen" | "admin" | "manager",
    isFrozen: false,
    dateJoined: new Date().toISOString().split("T")[0],
  });

  // Staff management functions
  const filteredStaff = staff
    .filter(
      (member) =>
        member.name.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
        member.phoneNumber.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(staffSearchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Sort by createdAt first (if available), then by dateJoined as fallback
      // Handle different date formats (Date object, Firestore Timestamp, or string)
      const getDateValue = (staff: any) => {
        if (staff.createdAt) {
          if (staff.createdAt.toDate) {
            return staff.createdAt.toDate().getTime(); // Firestore Timestamp
          }
          return new Date(staff.createdAt).getTime(); // Date object or string
        }
        return new Date(staff.dateJoined).getTime(); // Fallback to dateJoined
      };

      const aTime = getDateValue(a);
      const bTime = getDateValue(b);

      // Sort in descending order (newest first)
      return bTime - aTime;
    });

  const handleAddStaff = async () => {
    try {
      // Auto-generate email from phone number
      const generatedEmail = `${newStaff.phoneNumber}@gmail.com`;
      const staffWithEmail = {
        ...newStaff,
        email: generatedEmail,
      };

      await addStaff(staffWithEmail);

      setNewStaff({
        name: "",
        phoneNumber: "",
        password: "",
        role: "waiter",
        isFrozen: false,
        dateJoined: new Date().toISOString().split("T")[0],
      });
      setShowAddStaffModal(false);
    } catch (error) {
      console.error("Error adding staff:", error);
      alert("Failed to add staff member. Please try again.");
    }
  };

  const handleEditStaff = async () => {
    try {
      // Find the original staff member to check if phone number changed
      const originalStaff = staff.find(s => s.id === selectedStaff.id);
      const phoneChanged = originalStaff && originalStaff.phoneNumber !== selectedStaff.phoneNumber;
      
      let updates: any = {
        name: selectedStaff.name,
        phoneNumber: selectedStaff.phoneNumber,
        role: selectedStaff.role,
        isFrozen: selectedStaff.isFrozen,
      };

      // If phone number changed, regenerate email
      if (phoneChanged) {
        const newEmail = `${selectedStaff.phoneNumber}@gmail.com`;
        updates.email = newEmail;
        updates.phoneChanged = true;
        updates.oldEmail = originalStaff!.email;
      }
      
      await updateStaff(selectedStaff.id, updates);
      setShowEditStaffModal(false);
      setSelectedStaff(null);
    } catch (error) {
      console.error("Error updating staff:", error);
      alert("Failed to update staff member. Please try again.");
    }
  };

  const handleDeleteStaff = (staffId: string) => {
    setStaffToDelete(staffId);
    setShowDeleteStaffModal(true);
  };

  const confirmDeleteStaff = async () => {
    if (staffToDelete) {
      try {
        await deleteStaff(staffToDelete);
        setStaffToDelete(null);
        setShowDeleteStaffModal(false);
      } catch (error) {
        console.error("Error deleting staff:", error);
        alert("Failed to delete staff member. Please try again.");
      }
    }
  };

  const cancelDeleteStaff = () => {
    setStaffToDelete(null);
    setShowDeleteStaffModal(false);
  };

  const toggleFrozenStatus = async (staffId: string) => {
    try {
      const staffMember = staff.find((member) => member.id === staffId);
      if (staffMember) {
        await updateStaff(staffId, { isFrozen: !staffMember.isFrozen });
      }
    } catch (error) {
      console.error("Error updating frozen status:", error);
    }
  };

  const openEditModal = (staffMember: any) => {
    setSelectedStaff({ ...staffMember });
    setShowEditStaffModal(true);
  };

  return (
    <>
      <div className="space-y-4 sm:space-y-6 pb-20 md:pb-12">
        <div className="flex justify-between items-center gap-4">
          <div className="relative flex-1 max-w-xs sm:max-w-none">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search staff..."
              value={staffSearchTerm}
              onChange={(e) => setStaffSearchTerm(e.target.value)}
              className="pl-8 sm:pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-purple-500 focus:border-purple-500 h-10"
            />
          </div>
          <button
            onClick={() => setShowAddStaffModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 h-10 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Add Staff</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff ID
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{member.id}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                        {member.name}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {member.phoneNumber}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">
                        {member.role}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleFrozenStatus(member.id)}
                        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-md active:scale-95 ${
                          !member.isFrozen
                            ? "bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900 shadow-green-200/50"
                            : "bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900 shadow-red-200/50"
                        }`}
                        title={`Click to ${!member.isFrozen ? 'freeze' : 'activate'} user`}
                      >
                        {!member.isFrozen ? "Active" : "Frozen"}
                      </button>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-1 sm:space-x-2">
                        <button
                          onClick={() => openEditModal(member)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Edit Staff"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(member.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete Staff"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Staff Confirmation Modal */}
      {showDeleteStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Delete Staff
            </h3>
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete this staff member?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={cancelDeleteStaff}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteStaff}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaffModal && (
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
                Add New Staff
              </h3>
              <button
                onClick={() => setShowAddStaffModal(false)}
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
                  value={newStaff.name}
                  onChange={(e) =>
                    setNewStaff({ ...newStaff, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter full name"
                />
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newStaff.phoneNumber}
                  onChange={(e) =>
                    setNewStaff({
                      ...newStaff,
                      phoneNumber: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={newStaff.password}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, password: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter password"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={newStaff.role}
                  onChange={(e) =>
                    setNewStaff({
                      ...newStaff,
                      role: e.target.value as
                        | "waiter"
                        | "kitchen"
                        | "admin"
                        | "manager",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 border-[1px] rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white appearance-none pr-10 transition-colors"
                >
                  <option value="waiter">Waiter</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="kitchen">Kitchen</option>
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
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowAddStaffModal(false)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStaff}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
              >
                Add Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditStaffModal && selectedStaff && (
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
              <h3 className="text-lg font-medium text-gray-900">Edit Staff</h3>
              <button
                onClick={() => setShowEditStaffModal(false)}
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
                  value={selectedStaff.name}
                  onChange={(e) =>
                    setSelectedStaff({
                      ...selectedStaff,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={selectedStaff.phoneNumber}
                  onChange={(e) =>
                    setSelectedStaff({
                      ...selectedStaff,
                      phoneNumber: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={selectedStaff.role}
                  onChange={(e) =>
                    setSelectedStaff({
                      ...selectedStaff,
                      role: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 border-[1px] rounded-md text-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white appearance-none pr-10 transition-colors"
                >
                  <option value="waiter">Waiter</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="kitchen">Kitchen</option>
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
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowEditStaffModal(false)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEditStaff}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
              >
                Update Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
