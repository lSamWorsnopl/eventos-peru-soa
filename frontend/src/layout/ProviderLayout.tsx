import { Link, NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import BrandLogo from '../components/BrandLogo';

export default function ProviderLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <aside className={(open ? 'w-64' : 'w-20') + ' fixed inset-y-0 left-0 z-30 border-r bg-white duration-200'}>
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <div className="flex items-center gap-2">
            <BrandLogo className="h-8 w-8" />
            {open && <span className="font-semibold">Panel Proveedor</span>}
          </div>
          <button onClick={() => setOpen(!open)} className="text-gray-500 hover:text-gray-900" aria-label="Toggle sidebar">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16M4 6h16M4 18h16"/></svg>
          </button>
        </div>
        <nav className="p-3 space-y-1 text-sm">
          <Item to="/proveedor" label="Mis servicios" open={open} />
        </nav>
        <div className="absolute bottom-0 inset-x-0 p-3 border-t">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-brand-primary text-white grid place-items-center uppercase text-xs">
              {user?.username?.[0] || 'P'}
            </div>
            {open && (
              <div className="flex-1">
                <div className="text-sm font-medium leading-tight">{user?.username || 'Proveedor'}</div>
                <button onClick={logout} className="text-xs text-gray-500 hover:text-gray-900 inline-flex items-center gap-1 mt-1">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className={(open ? 'pl-64' : 'pl-20') + ' min-h-screen'}>
        <header className="h-16 bg-white border-b px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="font-semibold tracking-wide text-gray-800">Panel de proveedor</div>
          <div className="flex items-center gap-3">
            <Link to="/" className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-sm hover:bg-gray-50">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7"/><path d="M9 22V12h6v10"/><path d="M21 22H3"/></svg>
              Ver sitio
            </Link>
          </div>
        </header>
        <main className="max-w-5xl mx-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Item({ to, label, open }: { to: string; label: string; open: boolean }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        'flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 ' + (isActive ? 'bg-gray-100 text-brand-primary font-medium' : 'text-gray-700')
      }
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19V5a2 2 0 0 1 2-2h7l7 7v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M13 3v6h6"/></svg>
      {open && <span>{label}</span>}
    </NavLink>
  );
}
