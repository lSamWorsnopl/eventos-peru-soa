import { useAuth } from '../auth/AuthContext';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-5xl mx-auto p-3 flex items-center justify-between">
        <nav className="flex items-center gap-4">
          <Link to="/" className="font-semibold">Eventos</Link>
          <Link to="/proveedores" className="opacity-80 hover:opacity-100">Proveedores</Link>
          <Link to="/usuarios" className="opacity-80 hover:opacity-100">Usuarios</Link>
        </nav>
        <div className="flex items-center gap-3 text-sm">
          {user && <span className="opacity-70">Hola, {user.username}</span>}
          <button onClick={logout} className="px-3 py-1 border rounded">Salir</button>
        </div>
      </div>
    </header>
  );
}

