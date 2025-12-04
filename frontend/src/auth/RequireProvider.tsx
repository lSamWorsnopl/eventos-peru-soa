import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function RequireProvider() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'PROVEEDOR') {
    if (user.role === 'ADMIN') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
