import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { useState } from 'react';
import Badge from '../../components/Badge';
import Skeleton from '../../components/Skeleton';
import Icon from '../../components/Icon';
import IconButton from '../../components/IconButton';
import Modal from '../../components/Modal';

type Proveedor = { id: string; nombre: string; rubro?: string; contacto?: string; telefono?: string; email?: string; activo?: boolean };

async function fetchProveedores(): Promise<Proveedor[]> {
  const { data } = await api.get('/api/proveedores');
  return data;
}

async function createProveedor(body: Omit<Proveedor, 'id'>) {
  const { data } = await api.post('/api/proveedores', body);
  return data as Proveedor;
}

async function updateProveedor(id: string, body: Partial<Omit<Proveedor, 'id'>>) {
  const { data } = await api.put(`/api/proveedores/${id}`, body);
  return data as Proveedor;
}

async function deleteProveedor(id: string) {
  await api.delete(`/api/proveedores/${id}`);
}

export default function Proveedores() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['proveedores'], queryFn: fetchProveedores });
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Proveedor, 'id'>>({ nombre: '', rubro: '', contacto: '', telefono: '', email: '', activo: true });
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [fActivo, setFActivo] = useState<'ALL' | 'ACTIVOS' | 'INACTIVOS'>('ALL');

  const createMut = useMutation({
    mutationFn: createProveedor,
    onSuccess: () => { setShowCreate(false); setForm({ nombre: '', rubro: '', contacto: '', telefono: '', email: '', activo: true }); refetch(); },
    onError: (e: any) => setErrMsg(e?.response?.data?.message || 'No se pudo crear'),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Omit<Proveedor, 'id'>> }) => updateProveedor(id, body),
    onSuccess: () => { setEditingId(null); refetch(); },
    onError: (e: any) => setErrMsg(e?.response?.data?.message || 'No se pudo actualizar'),
  });
  const deleteMut = useMutation({
    mutationFn: deleteProveedor,
    onSuccess: () => refetch(),
    onError: (e: any) => setErrMsg(e?.response?.data?.message || 'No se pudo eliminar'),
  });

  function onEdit(p: Proveedor) {
    setEditingId(p.id);
    setForm({ nombre: p.nombre, rubro: p.rubro || '', contacto: p.contacto || '', telefono: p.telefono || '', email: p.email || '', activo: p.activo ?? true });
  }

  function onSubmitCreate(e: React.FormEvent) {
    e.preventDefault(); setErrMsg(null);
    createMut.mutate({
      nombre: form.nombre,
      rubro: form.rubro || undefined,
      contacto: form.contacto || undefined,
      telefono: form.telefono || undefined,
      email: form.email || undefined,
      activo: form.activo ?? true,
    } as any);
  }

  function onSubmitEdit(e: React.FormEvent) {
    e.preventDefault(); if (!editingId) return; setErrMsg(null);
    updateMut.mutate({ id: editingId, body: { ...form } });
  }

  const filtered = (data || []).filter(p => {
    const textOk = [p.nombre, p.rubro, p.contacto, p.email, p.telefono].join(' ').toLowerCase().includes(q.toLowerCase());
    const estadoOk = fActivo === 'ALL' ? true : fActivo === 'ACTIVOS' ? !!p.activo : !p.activo;
    return textOk && estadoOk;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <h2 className="text-2xl font-semibold text-gray-900 mr-4">Proveedores</h2>
        <div className="flex flex-1 flex-wrap items-center gap-2 min-w-[260px]">
          <div className="relative flex-1 min-w-[220px] md:max-w-sm">
            <input value={q} onChange={(e) => setQ(e.target.value)} className="w-full border rounded-md pl-9 pr-3 py-2 text-sm" placeholder="Buscar por nombre, rubro..." />
            <Icon name="search" className="h-4 w-4 text-gray-400 absolute left-2.5 top-3" />
          </div>
          <select value={fActivo} onChange={(e) => setFActivo(e.target.value as any)} className="border rounded-md px-2 py-2 text-sm h-9">
            <option value="ALL">Todos</option>
            <option value="ACTIVOS">Activos</option>
            <option value="INACTIVOS">Inactivos</option>
          </select>
          <IconButton icon="refresh" label="Refrescar" onClick={() => refetch()} />
            <button onClick={() => { setShowCreate(true); setErrMsg(null); }} className="inline-flex items-center gap-2 px-3 py-2 rounded bg-red-600 bg-brand-primary text-white text-sm shadow hover:brightness-110"><Icon name='plus' /> Nuevo proveedor</button>
          </div>
        </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo proveedor">
        <form onSubmit={onSubmitCreate} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="border rounded p-2" placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          <input className="border rounded p-2" placeholder="Rubro" value={form.rubro} onChange={(e) => setForm({ ...form, rubro: e.target.value })} />
          <input className="border rounded p-2" placeholder="Contacto" value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} />
          <input className="border rounded p-2" placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          <input className="border rounded p-2 md:col-span-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {errMsg && <p className="text-sm text-red-600 md:col-span-2">{errMsg}</p>}
          <div className="md:col-span-2 flex gap-2">
            <button disabled={createMut.isPending} className="px-3 py-2 rounded bg-red-600 bg-brand-primary text-white">{createMut.isPending ? 'Guardando…' : 'Crear proveedor'}</button>
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
                <th className="text-left p-2">Nombre</th>
                <th className="text-left p-2">Rubro</th>
                <th className="text-left p-2">Contacto</th>
                <th className="text-left p-2">Teléfono</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Estado</th>
                <th className="text-left p-2 w-40">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? filtered.map((p) => (
                editingId === p.id ? (
                  <tr key={p.id} className="border-t">
                    <td className="p-2"><input className="border rounded p-1 w-full" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></td>
                    <td className="p-2"><input className="border rounded p-1 w-full" value={form.rubro} onChange={(e) => setForm({ ...form, rubro: e.target.value })} /></td>
                    <td className="p-2"><input className="border rounded p-1 w-full" value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} /></td>
                    <td className="p-2"><input className="border rounded p-1 w-full" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></td>
                    <td className="p-2"><input className="border rounded p-1 w-full" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></td>
                    <td className="p-2"><input type="checkbox" checked={!!form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} /></td>
                    <td className="p-2 space-x-1">
                      <IconButton icon="check" label="Guardar" variant="primary" onClick={onSubmitEdit as any} />
                      <IconButton icon="x" label="Cancelar" onClick={() => setEditingId(null)} />
                    </td>
                  </tr>
                ) : (
                  <tr key={p.id} className="border-t hover:bg-gray-50/60 transition-colors">
                    <td className="p-2">{p.nombre}</td>
                    <td className="p-2">{p.rubro || '-'}</td>
                    <td className="p-2">{p.contacto || '-'}</td>
                    <td className="p-2">{p.telefono || '-'}</td>
                    <td className="p-2">{p.email || '-'}</td>
                    <td className="p-2">{p.activo ? <Badge color="green">Activo</Badge> : <Badge color="red">Inactivo</Badge>}</td>
                    <td className="p-2 space-x-1">
                      <IconButton icon="edit" label="Editar" onClick={() => onEdit(p)} />
                      <IconButton icon="trash" label="Eliminar" variant="danger" onClick={() => { if (confirm('¿Eliminar proveedor?')) deleteMut.mutate(p.id); }} />
                    </td>
                  </tr>
                )
              )) : (
                <tr>
                  <td className="p-3 text-gray-500" colSpan={6}>Sin proveedores.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
