import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const Login: React.FC = () => {
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // Removed showRoleOptions, not needed anymore
  const { login } = useAuth();
  const { staff } = useApp();
  const [buttonLoading, setButtonLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setButtonLoading(true);
    // Main login check
    if (phoneOrEmail === 'pro26@gmail.com' && password === 'pro26123') {
      setButtonLoading(false);
      navigate('/role-selection');
      return;
    }
    // ...existing code...
    const isPhoneNumber = /^[\d\s-()+]+$/.test(phoneOrEmail.trim());
    let emailToCheck = phoneOrEmail;
    if (isPhoneNumber) {
      const cleanPhone = phoneOrEmail.replace(/[\s-()+]/g, '');
      emailToCheck = `${cleanPhone}@gmail.com`;
    }
    const staffMember = staff.find(s => s.email === emailToCheck || s.email === phoneOrEmail);
    if (staffMember && staffMember.isFrozen) {
      setError('Your account has been frozen. Please contact the administrator.');
      setButtonLoading(false);
      return;
    }
    const success = await login(phoneOrEmail, password, staff);
    if (!success) {
      setError('Invalid email/phone or password');
    }
    setButtonLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center">
          <h1 className="mt-4 text-2xl font-bold text-gray-800">BURG-AL-ARAB</h1>
          <p className="text-sm text-gray-500 mt-1 text-center">Sign in to manage orders, staff and kitchen</p>
        </div>
        <form className="mt-6 space-y-5" onSubmit={handleSubmit} aria-label="login form">
          <div>
            <label htmlFor="phoneOrEmail" className="block text-sm font-medium text-gray-700">Email or phone</label>
            <input
              id="phoneOrEmail"
              name="phoneOrEmail"
              type="text"
              autoComplete="username"
              required
              className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              placeholder="you@example.com or +123456789"
              value={phoneOrEmail}
              onChange={(e) => setPhoneOrEmail(e.target.value)}
              aria-required="true"
              // ...no longer disabling input
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative mt-1">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="block w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-required="true"
                // ...no longer disabling input
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 focus:outline-none"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {error && (
            <div role="alert" className="text-red-700 text-sm bg-red-50 p-3 rounded-md border border-red-100">{error}</div>
          )}
          <button
            type="submit"
            disabled={buttonLoading || !phoneOrEmail || !password}
            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-medium bg-gradient-to-r from-purple-600 to-pink-500 shadow ${buttonLoading || !phoneOrEmail || !password ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
          >
            {buttonLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            ) : null}
            {buttonLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        {/* Role selection buttons are now on a separate page */}
      </div>
    </div>
  );
};

export default Login;
// Moved to shared/
