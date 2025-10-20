import React, { useState } from "react";
import SnackBar from "../SnackBar";
import { User, LogOut } from "lucide-react";
import { updatePassword } from "firebase/auth";
import { auth } from "../../firebase";

interface WaiterSettingsProps {
  user: {
    name?: string;
    role?: string;
    email?: string;
  } | null;
  logout: () => void;
}

const WaiterSettings: React.FC<WaiterSettingsProps> = ({ user, logout }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");

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

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-full ml-0 relative">
      {/* User Details Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-700">User Details</h3>
          {/* Logout icon for small screens, in same row as User Details heading */}
          <button
            onClick={logout}
            className="block p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors md:hidden"
            title="Logout"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800">{user?.name || "Waiter"}</p>
              <p className="text-sm text-gray-500">
                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Waiter"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 pt-2 border-t border-gray-200">
            <div className="w-5 h-5" />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-sm font-medium text-gray-800">{user?.email || "waiter@example.com"}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Password Update Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Update Password</h3>
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-5 py-3 text-lg border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  minLength={6}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-5 py-3 text-lg border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <input
                id="show-password-checkbox"
                type="checkbox"
                checked={showPassword}
                onChange={e => setShowPassword(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="show-password-checkbox" className="text-sm text-gray-700">Show password</label>
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="w-full md:w-auto flex items-center justify-center space-x-3 px-4 py-2 bg-purple-600 text-white rounded-xl text-base font-semibold hover:bg-purple-700 transition-colors"
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
    </div>
  );
};

export default WaiterSettings;
