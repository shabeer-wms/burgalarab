import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { User, Staff } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, staff: Staff[]) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user
    try {
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      }
    } catch (error) {
      // Corrupted data – clear and continue to login
      try { localStorage.removeItem('user'); } catch {}
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, staff: Staff[]): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if it's the admin with fixed credentials
    if (email === 'admin@pro.com' && password === 'admin123') {
      const adminUser: User = {
        id: 'admin-1',
        name: 'Admin',
        email: 'admin@pro.com',
        role: 'admin'
      };
      setUser(adminUser);
      localStorage.setItem('user', JSON.stringify(adminUser));
      setIsLoading(false);
      return true;
    }
    
    // Check other demo users (customer)
    const demoUsers = [
      { id: '1', name: 'Demo Customer', email: 'customer@demo.com', role: 'customer' as const },
    ];
    
    const demoUser = demoUsers.find(u => u.email === email);
    if (demoUser && password === 'demo123') {
      setUser(demoUser);
      localStorage.setItem('user', JSON.stringify(demoUser));
      setIsLoading(false);
      return true;
    }
    
    // Check staff members from Firestore - authenticate with Firebase Auth
    const staffMember = staff.find(s => s.email === email);
    if (staffMember) {
      try {
        // Use Firebase Authentication to verify the password
        await signInWithEmailAndPassword(auth, email, password);
        
        const user: User = {
          id: staffMember.id,
          name: staffMember.name,
          email: staffMember.email,
          role: staffMember.role as "customer" | "waiter" | "kitchen" | "admin"
        };
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        setIsLoading(false);
        return true;
      } catch (firebaseError) {
        console.error("Firebase authentication failed:", firebaseError);
        setIsLoading(false);
        return false;
      }
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};