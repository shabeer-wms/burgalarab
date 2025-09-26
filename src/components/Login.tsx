// import React, { useState } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useApp } from '../context/AppContext';
// import { Eye, EyeOff, Lock, Mail, ChefHat } from 'lucide-react';

// const Login: React.FC = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState('');
//   const { login, isLoading } = useAuth();
//   const { staff } = useApp();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     const success = await login(email, password, staff);
//     if (!success) {
//       setError('Invalid email or password');
//     }
//   };

//   const demoAccounts = [
//     { role: 'Customer', email: 'customer@demo.com', color: 'bg-blue-100 text-blue-800' },
//     { role: 'Admin', email: 'admin@pro.com', color: 'bg-purple-100 text-purple-800' },
//   ];

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F7F8FA] via-[#E3E6F3] to-[#D1D5E7] px-4">
//       <div className="max-w-md w-full space-y-6">
//         <div className="text-center">
//           <div className="flex justify-center mb-6">
//             <div className="bg-[#4F46E5] p-5 rounded-full shadow-lg">
//               <ChefHat className="w-12 h-12 text-white" />
//             </div>
//           </div>
//           <h1 className="text-3xl font-bold text-[#22223B] mb-2 tracking-tight">
//             Hotel Management System
//           </h1>
//           <p className="text-base text-[#4A4E69]">
//             Sign in to access your dashboard
//           </p>
//         </div>

//         <div className="bg-white rounded-2xl shadow-xl p-8">
//           <form className="space-y-6" onSubmit={handleSubmit}>
//             <div>
//               <label htmlFor="email" className="block text-sm font-semibold text-[#22223B] mb-2">
//                 Email address
//               </label>
//               <div className="relative">
//                 <span className="absolute inset-y-0 left-0 flex items-center pl-3">
//                   <Mail className="h-5 w-5 text-[#9A9CB2]" />
//                 </span>
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   autoComplete="email"
//                   required
//                   className="block w-full pl-11 pr-4 py-3 border border-[#E0E2EA] rounded-lg placeholder-[#BFC2D9] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] text-base transition-all"
//                   placeholder="Enter your email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div>
//               <label htmlFor="password" className="block text-sm font-semibold text-[#22223B] mb-2">
//                 Password
//               </label>
//               <div className="relative">
//                 <span className="absolute inset-y-0 left-0 flex items-center pl-3">
//                   <Lock className="h-5 w-5 text-[#9A9CB2]" />
//                 </span>
//                 <input
//                   id="password"
//                   name="password"
//                   type={showPassword ? 'text' : 'password'}
//                   autoComplete="current-password"
//                   required
//                   className="block w-full pl-11 pr-11 py-3 border border-[#E0E2EA] rounded-lg placeholder-[#BFC2D9] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] text-base transition-all"
//                   placeholder="Enter your password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                 />
//                 <button
//                   type="button"
//                   className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#9A9CB2] focus:outline-none"
//                   onClick={() => setShowPassword((prev) => !prev)}
//                   tabIndex={-1}
//                 >
//                   {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//                 </button>
//               </div>
//             </div>

//             {error && (
//               <div className="text-[#B91C1C] text-sm text-center bg-[#FEE2E2] p-3 rounded-lg border border-[#FCA5A5]">
//                 {error}
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full py-3 px-6 rounded-lg font-semibold text-white bg-[#4F46E5] hover:bg-[#3730A3] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] disabled:opacity-50 transition-all shadow-md"
//             >
//               {isLoading ? 'Signing in...' : 'Sign in'}
//             </button>
//           </form>

//           <div className="mt-8 pt-6 border-t border-[#E0E2EA]">
//             <h3 className="text-lg font-semibold text-[#22223B] text-center mb-4">Demo Accounts</h3>
//             <div className="grid grid-cols-2 gap-3">
//               {demoAccounts.map((account) => (
//                 <button
//                   key={account.email}
//                   onClick={() => {
//                     setEmail(account.email);
//                     if (account.email === 'admin@pro.com') {
//                       setPassword('admin123');
//                     } else {
//                       setPassword('demo123');
//                     }
//                   }}
//                   className={`text-sm px-4 py-3 rounded-lg font-medium transition-all hover:scale-105 ${account.color} shadow hover:shadow-md`}
//                 >
//                   {account.role}
//                 </button>
//               ))}
//             </div>
//             <div className="text-xs text-center text-[#6B7280] mt-4">
//               <p>
//                 Customer password:{' '}
//                 <code className="bg-[#F3F4F6] px-2 py-1 rounded font-mono">demo123</code>
//               </p>
//               <p>
//                 Admin password:{' '}
//                 <code className="bg-[#F3F4F6] px-2 py-1 rounded font-mono">admin123</code>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side */}
      <div className="flex-1 flex flex-col justify-center items-center bg-[#EDE9FE] relative px-8 py-12">
        {/* Diagonal rounded rectangle at bottom left */}
        <div className="absolute bottom-0 left-0">
          <div className="w-48 h-20 bg-[#C7BFFF] rounded-tl-3xl rounded-br-3xl shadow-lg rotate-[-15deg] mb-[-30px] ml-[-30px]" />
        </div>
        <div className="w-full max-w-sm z-10">
          <h2 className="text-3xl font-bold text-center text-[#6D28D9] mb-8">Welcome Back!</h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-base font-medium text-[#6D28D9] mb-2">
                Username
              </label>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="username"
                required
                className="block w-full px-4 py-3 rounded-full border-2 border-[#A78BFA] bg-white placeholder-[#A78BFA] focus:outline-none focus:border-[#7C3AED] text-lg transition-all"
                placeholder="Enter your username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-base font-medium text-[#6D28D9] mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full px-4 py-3 rounded-full border-2 border-[#A78BFA] bg-white placeholder-[#A78BFA] focus:outline-none focus:border-[#7C3AED] text-lg transition-all"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="text-[#B91C1C] text-sm text-center bg-[#FEE2E2] p-3 rounded-full border border-[#FCA5A5]">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className={`w-full py-3 rounded-full font-semibold text-[#EDE9FE] bg-[#7C3AED] transition-all shadow-lg ${
                isLoading || !email || !password
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-[#6D28D9]'
              }`}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className="mt-8 pt-6 border-t border-[#E0E2EA]">
            <h3 className="text-lg font-semibold text-[#22223B] text-center mb-4">Demo Accounts</h3>
            <div className="grid grid-cols-2 gap-3">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.email === 'admin@pro.com' ? 'admin123' : 'demo123');
                  }}
                  className={`text-sm px-4 py-3 rounded-lg font-medium transition-all hover:scale-105 ${account.color} shadow hover:shadow-md`}
                >
                  {account.role}
                </button>
              ))}
            </div>
            <div className="text-xs text-center text-[#6B7280] mt-4">
              <p>
                Customer password:{' '}
                <code className="bg-[#F3F4F6] px-2 py-1 rounded font-mono">demo123</code>
              </p>
              <p>
                Admin password:{' '}
                <code className="bg-[#F3F4F6] px-2 py-1 rounded font-mono">admin123</code>
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Right Side */}
      <div className="flex-1 flex items-center justify-center bg-[#D1C4E9] relative px-8 py-12">
        {/* 3D Illustration Placeholder */}
        <div className="w-full max-w-lg flex flex-col items-center justify-center">
          <svg width="320" height="320" viewBox="0 0 320 320" fill="none">
            {/* Laptop */}
            <rect x="60" y="180" width="200" height="40" rx="12" fill="#B39DDB" />
            <rect x="80" y="120" width="160" height="70" rx="14" fill="#EDE9FE" />
            <rect x="80" y="120" width="160" height="20" rx="8" fill="#7C3AED" />
            {/* Keys */}
            <rect x="100" y="190" width="20" height="10" rx="3" fill="#90CAF9" />
            <rect x="130" y="190" width="20" height="10" rx="3" fill="#90CAF9" />
            <rect x="160" y="190" width="20" height="10" rx="3" fill="#90CAF9" />
            <rect x="190" y="190" width="20" height="10" rx="3" fill="#90CAF9" />
            {/* Floating sticks */}
            <rect x="170" y="100" width="8" height="30" rx="4" fill="#FFD54F" transform="rotate(-15 170 100)" />
            <rect x="200" y="90" width="8" height="30" rx="4" fill="#F06292" transform="rotate(10 200 90)" />
            {/* Floating chart/document */}
            <rect x="120" y="60" width="80" height="40" rx="10" fill="#7C3AED" />
            {/* Donut chart */}
            <circle cx="160" cy="80" r="14" fill="#EDE9FE" />
            <path d="M160 66 a14 14 0 0 1 14 14" stroke="#FFD54F" strokeWidth="6" fill="none" />
            <path d="M160 94 a14 14 0 0 1 -14 -14" stroke="#F06292" strokeWidth="6" fill="none" />
            <path d="M146 80 a14 14 0 0 1 14 -14" stroke="#7C3AED" strokeWidth="6" fill="none" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Login;