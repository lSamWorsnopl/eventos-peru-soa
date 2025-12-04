import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import api from '../../api/client';

export default function Perfil() {
  const { user } = useAuth();
  const [form, setForm] = useState<{ username: string; nombre?: string }>({ username: user?.username || '', nombre: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);
  const [pwdLocked, setPwdLocked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        // Intentar /me primero; si falla usar /users/:id
        let data;
        try {
          const r = await api.get('/api/users/me');
          data = r.data;
        } catch {
          const r = await api.get(`/api/users/${user?.id}`);
          data = r.data;
        }
        if (!cancelled) setForm({ username: data.username || user?.username, nombre: data.nombre || '' });
      } catch (e) {
        // noop
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user?.id, user?.username]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!form.username.trim()) { setMsg('El username es obligatorio'); return; }
    setSaving(true);
    try {
      await api.put(`/api/users/${user?.id}`, { username: form.username, nombre: form.nombre });
      setMsg('Perfil actualizado');
    } catch (e: any) {
      setMsg(e?.response?.data?.message || 'No se pudo actualizar el perfil');
    } finally {
      setSaving(false);
    }
  }

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdMsg(null);
    if (!pwd.current || !pwd.next) { setPwdMsg('Completa todos los campos'); return; }
    if (pwd.next.length < 8) { setPwdMsg('La nueva contraseña debe tener al menos 8 caracteres'); return; }
    if (pwd.next !== pwd.confirm) { setPwdMsg('Las contraseñas no coinciden'); return; }
    setSaving(true);
    try {
      const payload = { currentPassword: pwd.current, newPassword: pwd.next };
      await api.patch('/api/users/me/password', payload);
      setPwd({ current: '', next: '', confirm: '' });
      setPwdMsg('Contraseña actualizada');
      setPwdLocked(false);
    } catch (e: any) {
      const status = e?.response?.status as number | undefined;
      const message = (e?.response?.data?.message || '').toString();
      if (status === 400) {
        setPwdMsg('Contraseña actual errónea');
        setPwdLocked(true);
      } else if (status === 401) {
        setPwdMsg('Sesión expirada, vuelve a iniciar sesión');
      } else {
        setPwdMsg(message || 'No se pudo cambiar la contraseña');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-2xl font-semibold">Mi perfil</h2>
      {loading ? (
        <p>Cargando…</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={onSubmit} className="border rounded-xl p-4 bg-white space-y-3 shadow-sm">
            <h3 className="font-semibold">Datos de perfil</h3>
            <label className="block">
              <span className="text-sm text-gray-700">Username</span>
              <input className="mt-1 w-full border rounded p-2" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-sm text-gray-700">Nombre</span>
              <input className="mt-1 w-full border rounded p-2" value={form.nombre || ''} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </label>
            {msg && <p className={`text-sm ${msg.includes('actualizado') ? 'text-green-700' : 'text-red-700'}`}>{msg}</p>}
            <button disabled={saving} className="px-3 py-2 rounded bg-red-600 bg-brand-primary text-white">{saving ? 'Guardando…' : 'Guardar cambios'}</button>
          </form>

          <form onSubmit={onChangePassword} className="border rounded-xl p-4 bg-white space-y-3 shadow-sm">
            <h3 className="font-semibold">Cambiar contraseña</h3>
            <label className="block">
              <span className="text-sm text-gray-700">Contraseña actual</span>
              <input className="mt-1 w-full border rounded p-2" type="password" value={pwd.current} onChange={(e) => { setPwd({ ...pwd, current: e.target.value }); setPwdLocked(false); setPwdMsg(null); }} />
            </label>
            <label className="block">
              <span className="text-sm text-gray-700">Nueva contraseña</span>
              <input className="mt-1 w-full border rounded p-2" type="password" value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-sm text-gray-700">Confirmar nueva</span>
              <input className="mt-1 w-full border rounded p-2" type="password" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} />
            </label>
            {pwdMsg && <p className={`text-sm ${pwdMsg.includes('actualizada') || pwdMsg.includes('actualizado') ? 'text-green-700' : 'text-red-700'}`}>{pwdMsg}</p>}
            <button disabled={saving || pwdLocked} className={`px-3 py-2 rounded text-white ${pwdLocked ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 bg-brand-primary hover:brightness-110'}`}>{saving ? 'Guardando…' : 'Cambiar contraseña'}</button>
          </form>
        </div>
      )}
    </div>
  );
}

