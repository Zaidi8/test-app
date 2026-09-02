'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  UserPublic,
} from '@prioritree/shared';

import {apiFetch} from './api-client';

interface AuthContextValue {
  user: UserPublic | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Hydrates the current user from `/auth/me` on mount (the api-client silently
 * refreshes an expired access token), and exposes login/register/logout that
 * keep the in-memory user in sync.
 */
export function AuthProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiFetch<AuthResponse>('/auth/me')
      .then(res => {
        if (active) setUser(res.user);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const login = async (input: LoginInput) => {
    const res = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    setUser(res.user);
  };

  const register = async (input: RegisterInput) => {
    const res = await apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', {method: 'POST'});
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{user, loading, login, register, logout}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
