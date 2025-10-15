import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RequireAuth from '../auth/RequireAuth';
import LoginPage from '../auth/LoginPage';
import AdminLayout from '../layout/AdminLayout';

import MisEventos from '../features/eventos/MisEventos';
import Proveedores from '../features/proveedores/Proveedores';
import Usuarios from '../features/usuarios/Usuarios';
import EventoDetalle from '../features/eventos/EventoDetalle';
import Perfil from '../features/perfil/Perfil';
import RequireAdmin from '../auth/RequireAdmin';

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <MisEventos /> },
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
