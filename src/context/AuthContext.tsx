import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { User, Staff } from '../types';

// --- Discord Logging Utility (Duplicated for standalone use in AuthContext) ---
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1430553611372335269/UHYp8mcvcczR-iRJcuk8YNJnqznsB35X7EoLgQD4N9Tp44L_BVHeDHyed6HVEjFzkPi-";

type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'AUTH_FAIL';

const logToDiscord = async (
  message: string,
  level: LogLevel = 'INFO',
  context: Record<string, any> = {}
) => {
  if (!DISCORD_WEBHOOK_URL) return;

  const timestamp = new Date().toISOString();
  let color = 3447003; // Blue (INFO)
  if (level === 'ERROR') color = 15158332; // Red
  if (level === 'WARN') color = 16776960; // Yellow
  if (level === 'AUTH_FAIL') color = 10038562; // Purple/Red

  const description = `**[${level}]** ${message}`;
  const fields = Object.entries(context).map(([key, value]) => ({
    name: key,
    value: typeof value === 'object' && value !== null ? JSON.stringify(value, null, 2) : String(value),
    inline: false
  }));

  const payload = {
    embeds: [
      {
        title: `[POS] System Log Event`,
        description: description,
        color: color,
        timestamp: timestamp,
        fields: fields,
      }
    ]
  };

  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("Failed to send log to Discord:", err);
  }
};
// -----------------------------------------------------------------------------


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
      logToDiscord("Local storage user data corruption detected.", "WARN", { error: String(error) });
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
      logToDiscord("Admin user logged in.", "INFO", { email });
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
      logToDiscord("Demo Customer logged in.", "INFO", { email });
      return true;
    }
    
    // Check staff members - support both email and phone number login
    let staffMember = staff.find(s => s.email === email);
    let emailToUse = email;
    
    // If no direct email match, check if input looks like phone number
    if (!staffMember) {
      const isPhoneNumber = /^[\d\s\-\(\)\+]+$/.test(email.trim());
      if (isPhoneNumber) {
        // Clean phone number and convert to email format
        const cleanPhone = email.replace(/[\s\-\(\)\+]/g, '');
        emailToUse = `${cleanPhone}@gmail.com`;
        staffMember = staff.find(s => s.email === emailToUse);
      }
    }
    
    if (staffMember) {
      try {
        // Check if the user is frozen before attempting authentication
        if (staffMember.isFrozen) {
          console.error("Account is frozen");
          logToDiscord("Login attempt blocked: Staff account is frozen.", "AUTH_FAIL", { emailInput: email, staffId: staffMember.id });
          setIsLoading(false);
          return false;
        }
        
        // Use Firebase Authentication to verify the password with the correct email
        await signInWithEmailAndPassword(auth, emailToUse, password);
        
        const user: User = {
          id: staffMember.id,
          name: staffMember.name,
          email: staffMember.email,
          role: staffMember.role as "customer" | "waiter" | "kitchen" | "admin"
        };
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        setIsLoading(false);
        logToDiscord(`Staff login successful.`, "INFO", { staffId: staffMember.id, role: staffMember.role });
        return true;
      } catch (firebaseError) {
        console.error("Firebase authentication failed:", firebaseError);
        logToDiscord(`Firebase Staff Authentication Failed.`, "AUTH_FAIL", { 
          emailInput: email, 
          emailUsed: emailToUse,
          reason: firebaseError instanceof Error ? firebaseError.message : String(firebaseError)
        });
        setIsLoading(false);
        return false;
      }
    }
    
    // Final generic failure log
    logToDiscord(`Login attempt failed: Credentials not recognized.`, "AUTH_FAIL", { emailInput: email });
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    logToDiscord("User logged out.", "INFO", { userId: user?.id, role: user?.role });
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