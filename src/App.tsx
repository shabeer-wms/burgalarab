import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Login from './components/Login';
import Layout from './components/Layout';
import CustomerDashboard from './components/customer/CustomerDashboard';
import WaiterDashboard from './components/waiter/WaiterDashboard';
import KitchenDashboard from './components/kitchen/KitchenDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import OrderTracking from './components/OrderTracking';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="card text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-surface-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'customer':
        return <CustomerDashboard />;
      case 'waiter':
        return <WaiterDashboard />;
      case 'kitchen':
        return <KitchenDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <div>Unknown role</div>;
    }
  };

  return (
    <Layout>
      {renderDashboard()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/track-order/:orderId" element={<OrderTracking />} />
            <Route path="/*" element={<AppContent />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;