
import React, { useState } from "react";
import SnackBar from "../SnackBar";
import { LogOut, User, Eye, EyeOff, Trash2 } from "lucide-react";
import { updatePassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

interface AdminSettingsProps {
  user: {
    name?: string;
    role?: string;
    email?: string;
  } | null;
  logout: () => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ user, logout }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (newPassword !== confirmPassword) {
      setSnackbarMsg("Passwords do not match.");
      setShowSnackbar(true);
      setLoading(false);
      return;
    }
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        setSnackbarMsg("Password updated successfully.");
        setShowSnackbar(true);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setSnackbarMsg("No authenticated user.");
        setShowSnackbar(true);
      }
    } catch (error: any) {
      setSnackbarMsg(error.message || "Failed to update password.");
      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  };


  // Clear Database Logic
  const handleClearDatabase = async () => {
    setClearLoading(true);
    try {
      // List of collections to clear
  const collections = ["menuItems", "orders", "staff", "users", "bills", "kitchenOrders", "ratings"];
      for (const col of collections) {
        const colRef = collection(db, col);
        const snapshot = await getDocs(colRef);
        for (const docSnap of snapshot.docs) {
          try {
            await deleteDoc(doc(db, col, docSnap.id));
          } catch (err) {
            console.error(`Failed to delete doc ${docSnap.id} in ${col}:`, err);
          }
        }
      }
      setSnackbarMsg("Database cleared successfully.");
    } catch (error) {
      setSnackbarMsg("Failed to clear database.");
    } finally {
      setShowSnackbar(true);
      setClearLoading(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-full ml-0 relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Settings</h2>
        {/* Logout icon for small screens */}
        <button
          onClick={logout}
          className="block md:hidden p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          title="Logout"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>
      {/* User Details Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">User Details</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800">{user?.name || "Admin User"}</p>
              <p className="text-sm text-gray-500">
                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Admin"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 pt-2 border-t border-gray-200">
            <div className="w-5 h-5" />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-sm font-medium text-gray-800">{user?.email || "admin@example.com"}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Password Update Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Update Password</h3>
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-5 py-3 text-lg border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 pr-12"
                placeholder="New Password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                minLength={6}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-5 py-3 text-lg border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 pr-12"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                minLength={6}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="w-full md:w-auto flex items-center justify-center space-x-3 px-6 py-4 bg-purple-600 text-white rounded-xl text-lg font-semibold hover:bg-purple-700 transition-colors"
              disabled={loading || !newPassword || !confirmPassword}
            >
              {loading ? "Confirming..." : "Confirm"}
            </button>
          </div>
        </form>
        {/* Snackbar notification for success/error */}
        <SnackBar
          message={snackbarMsg}
          type={snackbarMsg.includes("success") ? "success" : "error"}
          show={showSnackbar}
          onClose={() => setShowSnackbar(false)}
        />
      </div>
      {/* Clear Database Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-red-700 mb-4">Danger Zone</h3>
        <button
          className="flex items-center space-x-2 px-6 py-4 bg-red-600 text-white rounded-xl text-lg font-semibold hover:bg-red-700 transition-colors"
          onClick={() => setShowConfirmDialog(true)}
          disabled={clearLoading}
        >
          <Trash2 className="w-6 h-6" />
          <span>{clearLoading ? "Clearing..." : "Clear Database"}</span>
        </button>
        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 shadow-lg max-w-sm w-full">
              <h4 className="text-xl font-bold text-red-700 mb-4">Are you sure?</h4>
              <p className="mb-6 text-gray-700">This will permanently delete all data in the database. This action cannot be undone.</p>
              <div className="flex justify-end space-x-4">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300"
                  onClick={() => setShowConfirmDialog(false)}
                  disabled={clearLoading}
                >Cancel</button>
                <button
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 flex items-center justify-center"
                  onClick={handleClearDatabase}
                  disabled={clearLoading}
                >
                  {clearLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                      Deleting...
                    </span>
                  ) : (
                    "Yes, Delete All"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
