import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearDatabase } from '../utils/clearDatabase';

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
          <button
            className="w-full px-4 py-3 rounded-lg bg-yellow-100 text-yellow-800 font-semibold hover:bg-yellow-200"
            onClick={() => navigate('/waiter', { state: { email: 'waiterpro26@gmail.com', password: 'waiter123' } })}
          >
            Waiter
          </button>
        </div>
        <button
          className="w-full px-4 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 mb-2"
          onClick={() => setShowConfirm(true)}
          disabled={clearLoading}
        >
          {clearLoading ? "Clearing..." : "Clear Database"}
        </button>
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center">
              <h3 className="text-lg font-bold mb-4">Confirm Clear Database</h3>
              <p className="mb-6">Are you sure you want to clear all data? This action cannot be undone.</p>
              <div className="flex gap-4 justify-center">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold"
                  onClick={() => setShowConfirm(false)}
                  disabled={clearLoading}
                >Cancel</button>
                <button
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
                  onClick={handleClearDatabase}
                  disabled={clearLoading}
                >{clearLoading ? "Clearing..." : "Yes, Clear"}</button>
              </div>
            </div>
          </div>
        )}
        {clearMsg && <div className="text-center text-sm mt-2 text-red-700">{clearMsg}</div>}
      </div>
    </div>
  );
};

export default RoleSelection;
