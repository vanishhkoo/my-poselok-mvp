import { createContext, useContext, useState, ReactNode } from 'react';

export interface Profile {
  id: string;
  name: string;
  email: string;
  bio: string;
}

interface AuthContextValue {
  profile: Profile | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  register: (name: string, email: string) => void;
  logout: () => void;
  updateProfile: (patch: Partial<Pick<Profile, 'name' | 'bio'>>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Каркас авторизации для Phase 0/UI-восстановления.
 * Хранит сессию только в памяти вкладки — реальная регистрация,
 * OTP-подтверждение и cookie-сессии подключаются в Phase 1 AUTH.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<Profile | null>(null);

  const login = (email: string) => {
    setProfile({
      id: `u-${Date.now()}`,
      name: email.split('@')[0],
      email,
      bio: '',
    });
  };

  const register = (name: string, email: string) => {
    setProfile({
      id: `u-${Date.now()}`,
      name,
      email,
      bio: '',
    });
  };

  const logout = () => setProfile(null);

  const updateProfile = (patch: Partial<Pick<Profile, 'name' | 'bio'>>) => {
    setProfile((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  return (
    <AuthContext.Provider
      value={{ profile, isAuthenticated: !!profile, login, register, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
