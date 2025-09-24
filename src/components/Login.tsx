import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, Lock, Mail, ChefHat } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const { staff } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = await login(email, password, staff);
    if (!success) {
      setError('Invalid email or password');
    }
  };

  const demoAccounts = [
    { role: 'Customer', email: 'customer@demo.com', color: 'bg-blue-100 text-blue-800' },
    { role: 'Admin', email: 'admin@pro.com', color: 'bg-purple-100 text-purple-800' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6 animate-fade-in">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-primary-600 p-4 rounded-3xl shadow-elevation-3">
              <ChefHat className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-headline-large font-display text-surface-900 mb-2">
            Hotel Management System
          </h1>
          <p className="text-body-large text-surface-600">
            Sign in to access your dashboard
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-elevation-3 p-8 animate-slide-up">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-label-large text-surface-700 mb-2">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-surface-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full pl-12 pr-4 py-4 border border-surface-300 rounded-xl placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-body-large transition-all duration-200"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-label-large text-surface-700 mb-2">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-surface-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full pl-12 pr-12 py-4 border border-surface-300 rounded-xl placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-body-large transition-all duration-200"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <button
                    type="button"
                    className="text-surface-400 hover:text-surface-600 transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="text-error-600 text-body-medium text-center bg-error-50 p-3 rounded-xl border border-error-200">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-label-large font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-elevation-2 hover:shadow-elevation-3"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-surface-200">
            <h3 className="text-title-medium text-surface-700 text-center mb-4">Demo Accounts</h3>
            <div className="grid grid-cols-2 gap-3">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  onClick={() => {
                    setEmail(account.email);
                    if (account.email === 'admin@pro.com') {
                      setPassword('admin123');
                    } else {
                      setPassword('demo123');
                    }
                  }}
                  className={`text-label-medium px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${account.color} shadow-elevation-1 hover:shadow-elevation-2`}
                >
                  {account.role}
                </button>
              ))}
            </div>
            <div className="text-body-small text-center text-surface-500 mt-3">
              <p>Customer password: <code className="bg-surface-100 px-2 py-1 rounded-md font-mono">demo123</code></p>
              <p>Admin password: <code className="bg-surface-100 px-2 py-1 rounded-md font-mono">admin123</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;