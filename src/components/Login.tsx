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
import { Utensils } from 'lucide-react';


const Login: React.FC = () => {
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const { staff } = useApp();
    const [buttonLoading, setButtonLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
      setButtonLoading(true);
    
    // Check if staff member exists and is frozen before attempting login
    const isPhoneNumber = /^[\d\s\-\(\)\+]+$/.test(phoneOrEmail.trim());
    let emailToCheck = phoneOrEmail;
    if (isPhoneNumber) {
      const cleanPhone = phoneOrEmail.replace(/[\s\-\(\)\+]/g, '');
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
      setError('Invalid phone number or password');
    }
      setButtonLoading(false);
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-8">
  <div className="w-full max-w-md bg-white bg-opacity-50 backdrop-blur-lg shadow-2xl rounded-3xl p-10 flex flex-col items-center border-2 border-black">
        <div className="mb-6">
          <div className="bg-[#7C3AED] p-3 rounded-full shadow-lg flex items-center justify-center">
            <Utensils className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-[#7C3AED] mb-2 tracking-tight text-center drop-shadow-lg">Welcome to Royal Restaurant</h1>
        <p className="text-lg text-[#6B7280] mb-8 text-center font-medium">Sign in to manage your orders, staff, and kitchen with ease.</p>
        <form className="space-y-6 w-full" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="phoneOrEmail" className="block text-base font-semibold text-[#7C3AED] mb-2">Phone Number</label>
            <input
              id="phoneOrEmail"
              name="phoneOrEmail"
              type="tel"
              autoComplete="tel"
              required
              className="block w-full px-5 py-3 rounded-xl border-2 border-[#E0E2EA] bg-white bg-opacity-80 placeholder-[#BFC2D9] focus:outline-none focus:border-[#7C3AED] text-lg transition-all shadow-sm"
              placeholder="Enter your phone number"
              value={phoneOrEmail}
              onChange={(e) => setPhoneOrEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-base font-semibold text-[#7C3AED] mb-2">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="block w-full px-5 py-3 rounded-xl border-2 border-[#E0E2EA] bg-white bg-opacity-80 placeholder-[#BFC2D9] focus:outline-none focus:border-[#7C3AED] text-lg transition-all shadow-sm"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <div className="text-[#B91C1C] text-sm text-center bg-[#FEE2E2] p-3 rounded-xl border border-[#FCA5A5] animate-shake">{error}</div>
          )}
          <button
            type="submit"
          disabled={buttonLoading || !phoneOrEmail || !password}
          className={`w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#7C3AED] to-[#F06292] transition-all shadow-lg flex items-center justify-center gap-2 ${buttonLoading || !phoneOrEmail || !password ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-2xl'}`}
          >
          {buttonLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                Logging in...
              </>
          ) : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;