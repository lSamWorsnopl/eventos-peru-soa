import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RequireAuth from '../auth/RequireAuth';
import LoginPage from '../auth/LoginPage';
import AdminLayout from '../layout/AdminLayout';
import LandingPage from '../pages/LandingPage';

import MisEventos from '../features/eventos/MisEventos';
import Proveedores from '../features/proveedores/Proveedores';
import Usuarios from '../features/usuarios/Usuarios';
import EventoDetalle from '../features/eventos/EventoDetalle';
import Perfil from '../features/perfil/Perfil';
import RequireAdmin from '../auth/RequireAdmin';

const router = createBrowserRouter([
  // Público: Landing en '/'
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },

  // Alias para el home del panel en '/dashboard'
  {
    path: '/dashboard',
    element: <RequireAuth />,
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
