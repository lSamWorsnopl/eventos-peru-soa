import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function RequireClient() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'CLIENTE') {
    if (user.role === 'ADMIN') return <Navigate to="/dashboard" replace />;
    if (user.role === 'PROVEEDOR') return <Navigate to="/proveedor" replace />;
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
