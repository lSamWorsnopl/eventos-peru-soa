import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { useState } from 'react';
import Badge from '../../components/Badge';
import Skeleton from '../../components/Skeleton';
import Icon from '../../components/Icon';
import IconButton from '../../components/IconButton';
import Modal from '../../components/Modal';

type Usuario = { id: string; username: string; nombre?: string; roles?: string[] };

async function fetchUsuarios(): Promise<Usuario[]> {
  const { data } = await api.get('/api/users');
  return data;
}

async function createUsuario(body: Omit<Usuario, 'id'>) {
  const { data } = await api.post('/api/users', body);
  return data as Usuario;
}

async function updateUsuario(id: string, body: Partial<Omit<Usuario, 'id'>>) {
  const { data } = await api.put(`/api/users/${id}`, body);
  return data as Usuario;
}

async function deleteUsuario(id: string) {
  await api.delete(`/api/users/${id}`);
}

export default function Usuarios() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['usuarios'], queryFn: fetchUsuarios });
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Usuario, 'id'>>({ username: '', nombre: '', roles: ['USER'] });
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [fRol, setFRol] = useState<'ALL' | 'ADMIN' | 'USER' | 'PROVEEDOR'>('ALL');

  const createMut = useMutation({
    mutationFn: createUsuario,
    onSuccess: () => { setShowCreate(false); setForm({ username: '', nombre: '', roles: ['USER'] }); refetch(); },
    onError: (e: any) => setErrMsg(e?.response?.data?.message || 'No se pudo crear'),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Omit<Usuario, 'id'>> }) => updateUsuario(id, body),
    onSuccess: () => { setEditingId(null); refetch(); },
    onError: (e: any) => setErrMsg(e?.response?.data?.message || 'No se pudo actualizar'),
  });
  const deleteMut = useMutation({
    mutationFn: deleteUsuario,
    onSuccess: () => refetch(),
    onError: (e: any) => setErrMsg(e?.response?.data?.message || 'No se pudo eliminar'),
  });

  function onEdit(u: Usuario) {
    setEditingId(u.id);
    setForm({ username: u.username, nombre: u.nombre || '', roles: u.roles || ['USER'] });
  }

  function onSubmitCreate(e: React.FormEvent) { e.preventDefault(); setErrMsg(null); createMut.mutate(form); }
  function onSubmitEdit(e: React.FormEvent) { e.preventDefault(); if (!editingId) return; setErrMsg(null); updateMut.mutate({ id: editingId, body: form }); }

  const filtered = (data || []).filter(u => {
    const textOk = [u.username, u.nombre, (u.roles || []).join(' ')].join(' ').toLowerCase().includes(q.toLowerCase());
    const rolOk = fRol === 'ALL' ? true : (u.roles || []).includes(fRol);
    // Si es admin, no ver su propio usuario
    const hideSelf = user?.role === 'ADMIN' ? u.id !== user.id : true;
    return textOk && rolOk && hideSelf;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <h2 className="text-2xl font-semibold text-gray-900 mr-4">Usuarios</h2>
        <div className="flex flex-1 flex-wrap items-center gap-2 min-w-[260px]">
          <div className="relative flex-1 min-w-[220px] md:max-w-sm">
            <input value={q} onChange={(e) => setQ(e.target.value)} className="w-full border rounded-md pl-9 pr-3 py-2 text-sm" placeholder="Buscar por username, nombre..." />
            <Icon name="search" className="h-4 w-4 text-gray-400 absolute left-2.5 top-3" />
          </div>
          <select value={fRol} onChange={(e) => setFRol(e.target.value as any)} className="border rounded-md px-2 py-2 text-sm h-9">
            <option value="ALL">Todos</option>
            <option value="ADMIN">ADMIN</option>
            <option value="USER">USER</option>
            <option value="PROVEEDOR">PROVEEDOR</option>
          </select>
            <IconButton icon="refresh" label="Refrescar" onClick={() => refetch()} />
            <button onClick={() => { setShowCreate(true); setErrMsg(null); }} className="inline-flex items-center gap-2 px-3 py-2 rounded bg-red-600 bg-brand-primary text-white text-sm shadow hover:brightness-110"><Icon name='plus' /> Nuevo usuario</button>
          </div>
        </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo usuario">
        <form onSubmit={onSubmitCreate} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="border rounded p-2" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          <input className="border rounded p-2" placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <select className="border rounded p-2" value={((form.roles||[])[0]) || 'USER'} onChange={(e) => setForm({ ...form, roles: [e.target.value] })}>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="PROVEEDOR">PROVEEDOR</option>
          </select>
          {errMsg && <p className="text-sm text-red-600 md:col-span-3">{errMsg}</p>}
          <div className="md:col-span-3 flex gap-2">
            <button disabled={createMut.isPending} className="px-3 py-2 rounded bg-red-600 bg-brand-primary text-white">{createMut.isPending ? 'Guardando…' : 'Crear usuario'}</button>
            <button type="button" className="px-3 py-2 rounded border" onClick={() => setShowCreate(false)}>Cerrar</button>
          </div>
        </form>
      </Modal>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      )}
      {error && <p className="text-red-600">No se pudo cargar.</p>}

      {!isLoading && !error && (
        <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">Username</th>
                <th className="text-left p-2">Nombre</th>
                <th className="text-left p-2">Roles</th>
                <th className="text-left p-2 w-40">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? filtered.map((u) => (
                editingId === u.id ? (
                  <tr key={u.id} className="border-t">
                    <td className="p-2"><input className="border rounded p-1 w-full" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></td>
                    <td className="p-2"><input className="border rounded p-1 w-full" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></td>
                    <td className="p-2"><input className="border rounded p-1 w-full" value={(form.roles || []).join(',')} onChange={(e) => setForm({ ...form, roles: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} /></td>
                    <td className="p-2 space-x-1">
                      <IconButton icon="check" label="Guardar" variant="primary" onClick={onSubmitEdit as any} />
                      <IconButton icon="x" label="Cancelar" onClick={() => setEditingId(null)} />
                    </td>
                  </tr>
                ) : (
                  <tr key={u.id} className="border-t hover:bg-gray-50/60 transition-colors">
                    <td className="p-2">{u.username}</td>
                    <td className="p-2">{u.nombre || '-'}</td>
                    <td className="p-2">{(u.roles || []).map(r => <Badge key={r} color={r === 'ADMIN' ? 'brand' : r === 'PROVEEDOR' ? 'yellow' : 'gray'}>{r}</Badge>)}</td>
                    <td className="p-2 space-x-1">
                      <IconButton icon="edit" label="Editar" onClick={() => onEdit(u)} />
                      <IconButton icon="trash" label="Eliminar" variant="danger" onClick={() => { if (confirm('¿Eliminar usuario?')) deleteMut.mutate(u.id); }} />
                    </td>
                  </tr>
                )
              )) : (
                <tr>
                  <td className="p-3 text-gray-500" colSpan={4}>Sin usuarios.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
