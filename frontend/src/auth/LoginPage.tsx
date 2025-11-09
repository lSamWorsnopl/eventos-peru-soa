import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useAuth } from './AuthContext';
import BrandLogo from '../components/BrandLogo';
import api from '../api/client';

type ApiError = { message?: string; error?: string };

export default function LoginPage() {
  const { login, user } = useAuth();
  const nav = useNavigate();
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setL] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    // Validaciones en cliente cuando se registra
    if (isRegister) {
      const emailRe = /^[^@\n\r]+@[^@\n\r]+\.[^@\n\r]+$/;
      if (!emailRe.test(email.trim())) {
        setErr('Email inválido');
        return;
      }
      const strong = p.length >= 8 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p);
      if (!strong) {
        setErr('La contraseña debe tener al menos 8 caracteres, con mayúscula, minúscula, número y símbolo');
        return;
      }
    }
    setL(true);
    try {
      if (isRegister) {
        const r = await api.post('/auth/signup', { username: u, password: p, nombre, email });
        // El backend ahora devuelve 202 y no permite login hasta verificar correo
        const msg = (r.data?.message as string) || 'Cuenta creada. Verifica tu correo.';
        setErr(msg + (r.data?.devVerifyToken ? ` (DEV token: ${r.data.devVerifyToken})` : ''));
        setIsRegister(false);
        return;
      } else {
        await login(u, p);
        nav('/dashboard');
      }
    } catch (error: unknown) {
      const ax = error as AxiosError<ApiError>;
      const status = ax.response?.status;
      let message = ax.response?.data?.message || ax.response?.data?.error || (ax as any)?.message || 'Operación fallida';
      if (status === 403 && /no verificado/i.test(String(message))) {
        message = 'Debes verificar tu correo antes de iniciar sesión.';
      }
      if (!isRegister && (status === 401 || /credenciales/i.test(String(message)))) {
        message = 'Usuario o contraseña incorrectos';
      }
      if (isRegister && /username.*existe/i.test(String(message))) {
        message = 'El usuario ya existe';
      }
      setErr(message);
    } finally {
      setL(false);
    }
  }

  if (user) nav('/dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 flex">
      <div className="hidden lg:flex flex-1 items-center justify-center p-12">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <BrandLogo className="h-10 w-10" />
            <div>
              <div className="font-semibold text-xl">Eventos Peru</div>
              <div className="text-sm text-gray-500">Gestion de eventos y proveedores</div>
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
            <div className="font-semibold">Eventos Peru</div>
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
            <p className="text-sm text-gray-500">{isRegister ? 'Regístrate para comenzar' : 'Usa tus credenciales para continuar'}</p>
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

          {isRegister && (
            <>
              <label className="block">
                <span className="text-sm text-gray-700">Nombre</span>
                <input
                  className="mt-1 w-full border rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-brand-primary"
                  placeholder="Tu nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="text-sm text-gray-700">Email</span>
                <input
                  className="mt-1 w-full border rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-brand-primary"
                  placeholder="tu@correo.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            </>
          )}

          <label className="block">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Contraseña</span>
              {!isRegister && (
                <a className="text-xs text-indigo-600 hover:underline" href="#">¿Olvidaste tu contraseña?</a>
              )}
            </div>
            <input
              className="mt-1 w-full border rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-brand-primary"
              type="password"
              placeholder="********"
              value={p}
              onChange={(e) => setP(e.target.value)}
            />
          </label>

          {err && <p className="text-sm text-red-600">{err}</p>}

          <div className="space-y-3">
            <button disabled={loading} className="w-full bg-red-600 bg-brand-primary hover:brightness-110 text-white py-2.5 rounded-md font-medium disabled:opacity-60 shadow-md">
              {loading ? (isRegister ? 'Creando…' : 'Entrando…') : (isRegister ? 'Crear cuenta' : 'Entrar')}
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); setErr(null); }}
              className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-md font-medium"
            >
              {isRegister ? 'Ya tengo cuenta' : 'Crear cuenta nueva'}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">Al ingresar aceptas nuestros Términos y Política de privacidad</p>
        </form>
      </div>
    </div>
  );
}
