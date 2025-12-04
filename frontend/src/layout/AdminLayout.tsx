import { NavLink, Outlet, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import BrandLogo from '../components/BrandLogo';

function Icon({ name, className = 'h-5 w-5' }: { name: 'home' | 'calendar' | 'users' | 'store' | 'logout'; className?: string }) {
  switch (name) {
    case 'home':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v10h14V10"/></svg>
      );
    case 'calendar':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
      );
    case 'users':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      );
    case 'store':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l1-5h16l1 5"/><path d="M4 9h16v12H4z"/><path d="M9 13h6v8H9z"/></svg>
      );
    case 'logout':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
      );
  }
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <aside className={(open ? 'w-64' : 'w-20') + ' fixed inset-y-0 left-0 z-30 border-r bg-white duration-200'}>
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <div className="flex items-center gap-2">
            {/* Logo en public/brand/eventos-peru-logo.png (con fallback a .svg) */}
            <BrandLogo className="h-8 w-8" />
            {open && <span className="font-semibold">Eventos Perú</span>}
          </div>
          <button onClick={() => setOpen(!open)} className="text-gray-500 hover:text-gray-900" aria-label="Toggle sidebar">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16M4 6h16M4 18h16"/></svg>
          </button>
        </div>
        <nav className="p-3 space-y-1 text-sm">
          <Item to="/dashboard" icon="calendar" label="Eventos" open={open} />
          <Item to="/proveedores" icon="store" label="Proveedores" open={open} />
          {user?.role === 'ADMIN' && <Item to="/usuarios" icon="users" label="Usuarios" open={open} />}
        </nav>
        <div className="absolute bottom-0 inset-x-0 p-3 border-t">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-brand-primary text-white grid place-items-center uppercase text-xs">
              {user?.username?.[0] || 'U'}
            </div>
            {open && (
              <div className="flex-1">
                <div className="text-sm font-medium leading-tight">{user?.username || 'Usuario'}</div>
                <button onClick={logout} className="text-xs text-gray-500 hover:text-gray-900 inline-flex items-center gap-1 mt-1">
                  <Icon name="logout" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className={(open ? 'pl-64' : 'pl-20') + ' min-h-screen'}>
        <header className="h-16 bg-black text-white border-b border-black/20 px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="font-semibold tracking-wide">Eventos Perú · Panel</div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input className="hidden md:block bg-black/60 text-white placeholder:text-gray-400 border border-white/10 rounded-md pl-9 pr-3 py-1.5 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-brand-primary/70" placeholder="Buscar..." />
              <svg className="h-4 w-4 text-gray-400 absolute left-2.5 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
            </div>
            <Link to="/" className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-sm">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7"/><path d="M9 22V12h6v10"/><path d="M21 22H3"/></svg>
              Ver sitio
            </Link>
            <Link to="/perfil" className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-sm">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.33 1.82l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 8.6 15a1.65 1.65 0 0 0-1.82-.33l-.06-.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0 .33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-.6 1.65 1.65 0 0 0 .33-1.82l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 15.4 9a1.65 1.65 0 0 0 1.82.33l.06.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 15z"/></svg>
              Perfil
            </Link>
            <span className="hidden sm:block text-sm text-gray-300">{user?.role || '—'}</span>
            <div className="h-9 w-9 rounded-full bg-brand-primary text-white grid place-items-center uppercase text-xs ring-2 ring-white/10">{user?.username?.[0] || 'U'}</div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Item({ to, icon, label, open }: { to: string; icon: React.ComponentProps<typeof Icon>['name']; label: string; open: boolean }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        'flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 ' + (isActive ? 'bg-gray-100 text-brand-primary font-medium' : 'text-gray-700')
      }
    >
      <Icon name={icon} />
      {open && <span>{label}</span>}
    </NavLink>
  );
}
