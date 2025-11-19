import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RequireAuth from '../auth/RequireAuth';
import LoginPage from '../auth/LoginPage';
import AdminLayout from '../layout/AdminLayout';
import ProviderLayout from '../layout/ProviderLayout';
import LandingPage from '../pages/LandingPage';
import ServicesPage from '../pages/ServicesPage';
import ServiceDetailPage from '../pages/ServiceDetailPage';
import CartPage from '../pages/CartPage';

import MisEventos from '../features/eventos/MisEventos';
import Proveedores from '../features/proveedores/Proveedores';
import PerfilProveedor from '../features/proveedores/PerfilProveedor';
import Usuarios from '../features/usuarios/Usuarios';
import EventoDetalle from '../features/eventos/EventoDetalle';
import Perfil from '../features/perfil/Perfil';
import RequireAdmin from '../auth/RequireAdmin';
import RequireClient from '../auth/RequireClient';
import RequireProvider from '../auth/RequireProvider';

const router = createBrowserRouter([
  // Público: Landing en '/'
  { path: '/', element: <LandingPage /> },
  { path: '/servicios', element: <ServicesPage /> },
  { path: '/servicios/:serviceId', element: <ServiceDetailPage /> },
  { path: '/login', element: <LoginPage /> },
  {
    path: '/cart',
    element: <RequireClient />,
    children: [{ index: true, element: <CartPage /> }],
  },
  {
    path: '/proveedor',
    element: <RequireProvider />,
    children: [
      {
        element: <ProviderLayout />,
        children: [{ index: true, element: <PerfilProveedor /> }],
      },
    ],
  },

  // Alias para el home del panel en '/dashboard'
  {
    path: '/dashboard',
    element: <RequireAdmin />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <MisEventos /> },
        ],
      },
    ],
  },

  // Rutas protegidas (panel) conservando paths existentes
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: 'eventos/:id', element: <EventoDetalle /> },
          { path: 'proveedores', element: <Proveedores /> },
          { element: <RequireAdmin />, children: [
            { path: 'usuarios', element: <Usuarios /> },
          ]},
          { path: 'perfil', element: <Perfil /> },
        ],
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
