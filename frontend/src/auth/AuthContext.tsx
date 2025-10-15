import { createContext, useContext, useMemo, useState } from 'react';
import api from '../api/client';

type Role = 'CLIENTE' | 'PROVEEDOR' | 'ADMIN';
type User = { id: string; username: string; role: Role };
type AuthCtx = { user: User | null; login: (u: string, p: string) => Promise<void>; logout: () => void };

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('user');
    if (!raw || raw === 'undefined' || raw === 'null') {
      localStorage.removeItem('user');
      return null;
    }
    try {
      return JSON.parse(raw) as User;
    } catch {
      // Sanitize corrupted value to prevent boot-time crashes
      localStorage.removeItem('user');
      return null;
    }
  });

  async function login(username: string, password: string) {
    const { data, headers } = await api.post('/auth/login', { username, password });
    const token: string | undefined =
      (data && (data.accessToken || data.token || data.jwt)) ||
      (typeof headers?.authorization === 'string'
        ? headers.authorization.replace(/^Bearer\s+/i, '')
        : undefined);

    if (!token) {
      throw new Error('Respuesta de login inválida');
    }

    // Derivar el usuario desde el JWT (payload con sub, username, roles)
    function decodeJwtPayload<T = any>(jwt: string): T | null {
      try {
        const payload = jwt.split('.')[1];
        const norm = payload.replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(
          atob(norm)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(json) as T;
      } catch {
        return null;
      }
    }

    const claims = decodeJwtPayload<{ sub?: string; username?: string; roles?: string[] }>(token) || {};
    const derivedUser: User = {
      id: claims.sub || 'unknown',
      username: claims.username || username,
      role: (claims.roles || []).includes('ADMIN') ? 'ADMIN' : 'CLIENTE',
    };

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(derivedUser));
    setUser(derivedUser);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  const value = useMemo(() => ({ user, login, logout }), [user]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// 👇 Esto corrige el aviso “Fast refresh only works…”
/* eslint-disable-next-line react-refresh/only-export-components */
export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
