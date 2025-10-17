import React from 'react';
import { useAuth } from '../../context/AuthContext';
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
		<div className="min-h-screen flex flex-col">
			<header className={`flex items-center justify-between px-6 py-4 shadow-md ${getRoleColor()}`}>
				<div className="flex items-center gap-3">
					{getRoleIcon()}
					<span className="font-bold text-lg text-white">{user?.role?.toUpperCase() || 'USER'}</span>
				</div>
				<button
					onClick={logout}
					className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-gray-800 font-medium shadow hover:bg-gray-100"
				>
					<LogOut className="w-5 h-5" />
					Logout
				</button>
			</header>
			<main className="flex-1 bg-gray-50 p-6">
				{children}
			</main>
		</div>
	);
};

export default Layout;