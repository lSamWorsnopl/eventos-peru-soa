import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useAuth } from './AuthContext';
import BrandLogo from '../components/BrandLogo';

type ApiError = { message?: string };

export default function LoginPage() {
  const { login, user } = useAuth();
  const nav = useNavigate();
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setL] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setL(true);
    try {
      await login(u, p);
      nav('/');
    } catch (error: unknown) {
      const ax = error as AxiosError<ApiError>;
      const message = ax.response?.data?.message ?? 'Credenciales inválidas';
      setErr(message);
    } finally {
      setL(false);
    }
  }

  if (user) nav('/');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 flex">
      <div className="hidden lg:flex flex-1 items-center justify-center p-12">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <BrandLogo className="h-10 w-10" />
            <div>
              <div className="font-semibold text-xl">Eventos Perú</div>
              <div className="text-sm text-gray-500">Gestión de eventos y proveedores</div>
            </div>
          </div>
          <h2 className="text-3xl font-semibold tracking-tight mb-2">Bienvenido de vuelta</h2>
          <p className="text-gray-600">Accede para gestionar eventos, proveedores y usuarios desde un panel moderno.</p>
        </div>
      </div>

      <div className="flex-1 grid place-items-center p-6">
        <form onSubmit={onSubmit} className="w-full max-w-md bg-white/80 backdrop-blur border rounded-xl shadow-sm p-8 space-y-5">
          <div className="lg:hidden flex items-center gap-3">
            <BrandLogo className="h-8 w-8" />
            <div className="font-semibold">Eventos Perú</div>
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
            <p className="text-sm text-gray-500">Usa tus credenciales para continuar</p>
          </div>

          <label className="block">
            <span className="text-sm text-gray-700">Usuario</span>
            <input
              className="mt-1 w-full border rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-brand-primary"
              placeholder="tu.usuario"
              value={u}
              onChange={(e) => setU(e.target.value)}
              autoFocus
            />
          </label>

          <label className="block">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Contraseña</span>
              <a className="text-xs text-indigo-600 hover:underline" href="#">¿Olvidaste tu contraseña?</a>
            </div>
            <input
              className="mt-1 w-full border rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-brand-primary"
              type="password"
              placeholder="••••••••"
              value={p}
              onChange={(e) => setP(e.target.value)}
            />
          </label>

          {err && <p className="text-sm text-red-600">{err}</p>}

          <button disabled={loading} className="w-full bg-red-600 bg-brand-primary hover:brightness-110 text-white py-2.5 rounded-md font-medium disabled:opacity-60 shadow-md">
            {loading ? 'Entrando…' : 'Entrar'}
          </button>

          <p className="text-xs text-gray-500 text-center">Al ingresar aceptas nuestros Términos y Política de privacidad</p>
        </form>
      </div>
    </div>
  );
}
