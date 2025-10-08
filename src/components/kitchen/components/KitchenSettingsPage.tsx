import React from "react";
import { LogOut, User } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const KitchenSettingsPage: React.FC = () => {
	const { user, logout } = useAuth();
	return (
		<div className="bg-white rounded-2xl shadow-md p-6 w-full">
			<h2 className="text-xl font-bold text-gray-800 mb-6">Settings</h2>
			{/* User Details Section */}
			<div className="mb-8">
				<h3 className="text-lg font-semibold text-gray-700 mb-4">User Details</h3>
				<div className="bg-gray-50 rounded-lg p-4 space-y-3">
					<div className="flex items-center space-x-3">
						<div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center">
							<User className="w-6 h-6 text-purple-600" />
						</div>
						<div>
							<p className="text-lg font-semibold text-gray-800">{user?.name || "Kitchen Staff"}</p>
							<p className="text-sm text-gray-500">
								{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Kitchen"}
							</p>
						</div>
					</div>
					<div className="flex items-center space-x-3 pt-2 border-t border-gray-200">
						<div className="w-5 h-5" />
						<div>
							<p className="text-sm text-gray-600">Email</p>
							<p className="text-sm font-medium text-gray-800">{user?.email || "kitchen@example.com"}</p>
						</div>
					</div>
				</div>
			</div>
			{/* Actions Section */}
			<div>
				<div className="space-y-3">
					   <button
						   onClick={logout}
						   className="block md:hidden w-full flex items-center justify-center space-x-3 px-6 py-4 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors"
					   >
						   <LogOut className="w-5 h-5" />
						   <span className="font-medium">Logout</span>
					   </button>
				</div>
			</div>
		</div>
	);
};

export default KitchenSettingsPage;
