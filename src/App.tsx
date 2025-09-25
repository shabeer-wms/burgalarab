import React from 'react';
import Snackbar from './components/SnackBar';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; message?: string }>{
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, message: (error as Error)?.message };
  }

  componentDidCatch() {
    // no-op
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface-50 flex items-center justify-center">
          <div className="card text-center max-w-lg">
            <h2 className="text-title-large mb-2">Something went wrong</h2>
            <p className="text-body-medium text-surface-600 mb-4">{this.state.message || 'An unexpected error occurred.'}</p>
            <div className="space-y-2">
              <button className="btn-primary w-full" onClick={() => window.location.reload()}>Reload</button>
              <button className="btn-outlined w-full" onClick={() => { localStorage.removeItem('user'); window.location.reload(); }}>Clear session and reload</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import Login from './components/Login';
import Layout from './components/Layout';
import CustomerDashboard from './components/customer/CustomerDashboard';
import WaiterDashboard from './components/waiter/WaiterDashboard';
import KitchenDashboard from './components/kitchen/KitchenDashboard';
import AdminDashboard from './components/admin/AdminDashboard';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { notification, hideNotification } = useApp();

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
      {notification && (
        <Snackbar 
          message={notification.message}
          type={notification.type}
          show={!!notification}
          onClose={hideNotification}
        />
      )}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;