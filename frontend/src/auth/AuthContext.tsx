import { createContext, useContext, useEffect, useMemo, useState } from 'react';
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
      localStorage.removeItem('user');
      return null;
    }
  });

  // Rehidratar sesión desde cookie al montar
  useEffect(() => {
    (async () => {
      try {
        const { data: me } = await api.get('/api/me');
        if (me?.authenticated) {
          const authorities: string[] = me.authorities || [];
          const derivedUser: User = {
            id: me.principal || 'unknown',
            username: (me.username || me.principal) || 'unknown',
            role: authorities.includes('ROLE_ADMIN') ? 'ADMIN' : 'CLIENTE',
          };
          setUser(derivedUser);
          localStorage.setItem('user', JSON.stringify(derivedUser));
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  async function login(username: string, password: string) {
    await api.post('/auth/login', { username, password });
    const { data: me } = await api.get('/api/me');
    if (!me?.authenticated) throw new Error('Login sin sesión');
    const authorities: string[] = me.authorities || [];
    const derivedUser: User = {
      id: me.principal || 'unknown',
      username: (me.username || username),
      role: authorities.includes('ROLE_ADMIN') ? 'ADMIN' : 'CLIENTE',
    };
    localStorage.setItem('user', JSON.stringify(derivedUser));
    setUser(derivedUser);
  }

  async function logout() {
    try { await api.post('/auth/logout'); } catch {}
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