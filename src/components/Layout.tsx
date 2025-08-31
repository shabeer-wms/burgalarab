import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, ShoppingCart, ChefHat, Settings, Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'customer':
        return <ShoppingCart className="w-6 h-6" />;
      case 'waiter':
        return <User className="w-6 h-6" />;
      case 'kitchen':
        return <ChefHat className="w-6 h-6" />;
      case 'admin':
        return <Settings className="w-6 h-6" />;
      default:
        return <User className="w-6 h-6" />;
    }
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'customer':
        return 'bg-primary-600';
      case 'waiter':
        return 'bg-success-600';
      case 'kitchen':
        return 'bg-warning-600';
      case 'admin':
        return 'bg-secondary-600';
      default:
        return 'bg-surface-500';
    }
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-white shadow-elevation-2 border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-2xl ${getRoleColor()} shadow-elevation-2`}>
                {getRoleIcon()}
              </div>
              <div>
                <h1 className="text-title-large text-surface-900">Hotel Management</h1>
                <p className="text-body-medium text-surface-600 capitalize">{user?.role} Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-3">
                <div className="w-10 h-10 bg-surface-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-surface-600" />
                </div>
                <div className="text-right">
                  <p className="text-body-medium font-medium text-surface-900">{user?.name}</p>
                  <p className="text-body-small text-surface-600 capitalize">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-3 text-label-large font-medium text-surface-700 bg-white border border-surface-300 rounded-xl hover:bg-surface-50 transition-all duration-200 shadow-elevation-1 hover:shadow-elevation-2"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;