import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { fetchAdminMe, loginAdmin } from '../api/admin';
import {
  clearAdminToken,
  getAdminName,
  getAdminRole,
  hasAdminToken,
  initializeAdminToken,
  setAdminName,
  setAdminRole,
  setAdminToken
} from '../api/client';

type AuthContextValue = {
  isAuthenticated: boolean;
  role: string;
  fullName: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  initializeAdminToken();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(hasAdminToken());
  const [role, setRole] = useState<string>(getAdminRole());
  const [fullName, setFullName] = useState<string>(getAdminName());

  useEffect(() => {
    let mounted = true;
    if (!isAuthenticated) return undefined;

    fetchAdminMe()
      .then((me) => {
        if (!mounted) return;
        if (me.role) {
          setAdminRole(me.role);
          setRole(me.role);
        }
        if (me.full_name) {
          setAdminName(me.full_name);
          setFullName(me.full_name);
        }
      })
      .catch(() => {
        // Global 401 interceptor handles token-expired redirect to login.
      });

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      role,
      fullName,
      login: async (email: string, password: string) => {
        const auth = await loginAdmin(email, password);
        setAdminToken(auth.access_token);
        setAdminRole(auth.role);
        setAdminName(auth.full_name);
        setIsAuthenticated(true);
        setRole(auth.role);
        setFullName(auth.full_name);
      },
      logout: () => {
        clearAdminToken();
        setIsAuthenticated(false);
        setRole('unknown');
        setFullName('');
      }
    }),
    [isAuthenticated, role, fullName]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
