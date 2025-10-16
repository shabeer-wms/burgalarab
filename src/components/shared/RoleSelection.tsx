import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearDatabase } from '../../utils/clearDatabase';

const RoleSelection: React.FC = () => {
	const navigate = useNavigate();
	const [clearLoading, setClearLoading] = useState(false);
	const [clearMsg, setClearMsg] = useState("");
	const [showConfirm, setShowConfirm] = useState(false);

	const handleClearDatabase = async () => {
		setClearLoading(true);
		setClearMsg("");
		try {
			await clearDatabase();
			setClearMsg("Database cleared successfully.");
		} catch {
			setClearMsg("Failed to clear database.");
		}
		setClearLoading(false);
		setShowConfirm(false);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
			<div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
				<h2 className="text-xl font-bold mb-6 text-center">Select Role</h2>
				<div className="flex flex-col gap-4 mb-6">
					<button
						className="w-full px-4 py-3 rounded-lg bg-blue-100 text-blue-800 font-semibold hover:bg-blue-200"
						onClick={() => navigate('/kitchen', { state: { email: 'kitchenpro26@gmail.com', password: 'kitchen123' } })}
					>
						Kitchen
					</button>
					<button
						className="w-full px-4 py-3 rounded-lg bg-green-100 text-green-800 font-semibold hover:bg-green-200"
						onClick={() => navigate('/admin', { state: { email: 'adminpro26@gmail.com', password: 'admin123' } })}
					>
						Admin
					</button>
					{/* ...existing code... */}
				</div>
			</div>
		</div>
	);
};

export default RoleSelection;