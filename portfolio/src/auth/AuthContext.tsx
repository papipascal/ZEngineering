import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  name: string;
  email: string;
  role: 'admin' | 'client';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'admin@zengineering.com': {
    password: 'admin123',
    user: { name: 'Pascal Goris', email: 'admin@zengineering.com', role: 'admin' },
  },
  'client@demo.com': {
    password: 'demo123',
    user: { name: 'Demo Client', email: 'client@demo.com', role: 'client' },
  },
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('portfolio_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email: string, password: string): boolean => {
    const entry = DEMO_USERS[email.toLowerCase()];
    if (entry && entry.password === password) {
      setUser(entry.user);
      localStorage.setItem('portfolio_user', JSON.stringify(entry.user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('portfolio_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
