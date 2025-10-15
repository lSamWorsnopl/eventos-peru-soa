import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import Badge from '../../components/Badge';
import Skeleton from '../../components/Skeleton';
import Modal from '../../components/Modal';
import Icon from '../../components/Icon';
import IconButton from '../../components/IconButton';
import { useState } from 'react';
// import { Link } from 'react-router-dom';

type Estado = 'CREADO' | 'EN_PROCESO' | 'FINALIZADO' | 'CANCELADO';
type Evento = { id: string; nombre: string; descripcion?: string; fechaHora: string | null; ubicacion?: string; estado: Estado };

async function fetchEventos(): Promise<Evento[]> {
  const { data } = await api.get('/api/eventos');
  return data;
}

async function createEvento(body: { nombre: string; descripcion?: string; fechaHora: string | null; ubicacion?: string }) {
  const { data } = await api.post('/api/eventos', body);
  return data as Evento;
}

async function updateEvento(id: string, body: Partial<Omit<Evento, 'id'>>) {
  const { data } = await api.put(`/api/eventos/${id}`, body);
  return data as Evento;
}

async function deleteEvento(id: string) {
  await api.delete(`/api/eventos/${id}`);
}

export default function MisEventos() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['eventos'], queryFn: fetchEventos });
  // const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{ nombre: string; descripcion?: string; fechaHora: string; ubicacion?: string }>({ nombre: '', descripcion: '', fechaHora: '', ubicacion: '' });
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [fEstado, setFEstado] = useState<Estado | 'ALL'>('ALL');

  const createMut = useMutation({
    mutationFn: createEvento,
    onSuccess: () => {
      setOpenCreate(false);
      setForm({ nombre: '', descripcion: '', fechaHora: '', ubicacion: '' });
      refetch();
    },
    onError: (e: any) => setErrMsg(e?.response?.data?.message || 'No se pudo crear'),
  });

  const updateMut = useMutation({
    mutationFn: (payload: { id: string; body: Partial<Omit<Evento, 'id'>> }) => updateEvento(payload.id, payload.body),
    onSuccess: () => {
      setEditingId(null);
      refetch();
    },
    onError: (e: any) => setErrMsg(e?.response?.data?.message || 'No se pudo actualizar'),
  });

  const deleteMut = useMutation({
    mutationFn: deleteEvento,
    onSuccess: () => refetch(),
    onError: (e: any) => setErrMsg(e?.response?.data?.message || 'No se pudo eliminar'),
  });

  function onEdit(ev: Evento) {
    setEditingId(ev.id);
    setForm({
      nombre: ev.nombre,
      descripcion: ev.descripcion || '',
      fechaHora: ev.fechaHora ? ev.fechaHora.slice(0, 16) : '',
      ubicacion: ev.ubicacion || '',
    });
  }

  function onCancelEdit() {
    setEditingId(null);
  }

  function onSubmitCreate(e: React.FormEvent) {
    e.preventDefault();
    setErrMsg(null);
    createMut.mutate({
      nombre: form.nombre,
      descripcion: form.descripcion || undefined,
      fechaHora: form.fechaHora ? new Date(form.fechaHora).toISOString() : null,
      ubicacion: form.ubicacion || undefined,
    });
  }

  function onSubmitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setErrMsg(null);
    updateMut.mutate({
      id: editingId,
      body: {
        nombre: form.nombre,
        descripcion: form.descripcion,
        fechaHora: form.fechaHora ? new Date(form.fechaHora).toISOString() : null,
        ubicacion: form.ubicacion,
      },
    });
  }

  const filtered = (data || []).filter(ev => {
    const textOk = [ev.nombre, ev.descripcion, ev.ubicacion].join(' ').toLowerCase().includes(q.toLowerCase());
    const estadoOk = fEstado === 'ALL' ? true : ev.estado === fEstado;
    return textOk && estadoOk;
  });

  const counts: Record<Estado, number> = {
    CREADO: (data || []).filter(e => e.estado === 'CREADO').length,
    EN_PROCESO: (data || []).filter(e => e.estado === 'EN_PROCESO').length,
    FINALIZADO: (data || []).filter(e => e.estado === 'FINALIZADO').length,
    CANCELADO: (data || []).filter(e => e.estado === 'CANCELADO').length,
  } as const;

  function estadoColor(e: Estado) {
    switch (e) {
      case 'CREADO': return 'gray' as const;
      case 'EN_PROCESO': return 'brand' as const;
      case 'FINALIZADO': return 'green' as const;
      case 'CANCELADO': return 'red' as const;
    }
  }

  // Detalle de evento para el popup
  async function fetchEvento(id: string): Promise<Evento> { const { data } = await api.get(`/api/eventos/${id}`); return data; }
  const { data: detalle } = useQuery({ queryKey: ['evento-preview', detailId], queryFn: () => fetchEvento(detailId as string), enabled: !!detailId });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <h2 className="text-2xl font-semibold text-gray-900 mr-4">Mis eventos</h2>
        <div className="flex flex-1 flex-wrap items-center gap-2 min-w-[260px]">
          <div className="relative flex-1 min-w-[220px] md:max-w-sm">
            <input value={q} onChange={(e) => setQ(e.target.value)} className="w-full border rounded-md pl-9 pr-3 py-2 text-sm" placeholder="Buscar por nombre, ubicación..." />
            <Icon name="search" className="h-4 w-4 text-gray-400 absolute left-2.5 top-3" />
          </div>
          <select value={fEstado} onChange={(e) => setFEstado(e.target.value as any)} className="border rounded-md px-2 py-2 text-sm h-9">
            <option value="ALL">Todos</option>
            <option value="CREADO">Creado</option>
            <option value="EN_PROCESO">En proceso</option>
            <option value="FINALIZADO">Finalizado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
          <IconButton icon="refresh" label="Refrescar" onClick={() => refetch()} />
          <button onClick={() => { setOpenCreate(true); setErrMsg(null); }} className="inline-flex items-center gap-2 px-3 py-2 rounded bg-red-600 bg-brand-primary text-white text-sm shadow hover:brightness-110">
            <Icon name="plus" /> Nuevo evento
          </button>
        </div>
      </div>

      <div className="flex gap-2 text-xs">
        <Badge color="gray">Creado {counts.CREADO}</Badge>
        <Badge color="brand">En proceso {counts.EN_PROCESO}</Badge>
        <Badge color="green">Finalizado {counts.FINALIZADO}</Badge>
        <Badge color="red">Cancelado {counts.CANCELADO}</Badge>
      </div>

      <Modal open={openCreate} onClose={() => setOpenCreate(false)} title="Nuevo evento" size="lg">
        <form onSubmit={onSubmitCreate} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="border rounded p-2" placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            <input className="border rounded p-2" placeholder="Ubicación" value={form.ubicacion} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} />
            <input className="border rounded p-2" type="datetime-local" value={form.fechaHora} onChange={(e) => setForm({ ...form, fechaHora: e.target.value })} />
            <input className="border rounded p-2" placeholder="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          {errMsg && <p className="text-sm text-red-600">{errMsg}</p>}
          <div className="flex gap-2">
            <button disabled={createMut.isPending} className="px-3 py-2 rounded bg-red-600 bg-brand-primary text-white">{createMut.isPending ? 'Guardando…' : 'Crear evento'}</button>
            <button type="button" className="px-3 py-2 rounded border" onClick={() => setOpenCreate(false)}>Cerrar</button>
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
                <th className="text-left p-3">Fecha</th>
                <th className="text-left p-3">Nombre</th>
                <th className="text-left p-3">Estado</th>
                <th className="text-left p-3 w-40">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? filtered.map((ev) => (
                editingId === ev.id ? (
                  <tr key={ev.id} className="border-t">
                    <td className="p-3"><input className="border rounded p-1 w-full" type="datetime-local" value={form.fechaHora} onChange={(e) => setForm({ ...form, fechaHora: e.target.value })} /></td>
                    <td className="p-3"><input className="border rounded p-1 w-full" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></td>
                    <td className="p-3"><Badge color={estadoColor(ev.estado)}>{ev.estado}</Badge></td>
              <td className="p-3 space-x-1">
                <IconButton icon="check" label="Guardar" variant="primary" onClick={onSubmitEdit as any} />
                <IconButton icon="x" label="Cancelar" onClick={onCancelEdit} />
              </td>
                  </tr>
                ) : (
                  <tr key={ev.id} className="border-t hover:bg-gray-50/60 transition-colors">
                    <td className="p-3">{ev.fechaHora ? new Date(ev.fechaHora).toLocaleString() : '-'}</td>
                    <td className="p-3"><button className="underline decoration-brand-primary/40 hover:decoration-brand-primary" onClick={() => setDetailId(ev.id)}>{ev.nombre}</button></td>
                    <td className="p-3"><Badge color={estadoColor(ev.estado)}>{ev.estado}</Badge></td>
                      <td className="p-3 space-x-1">
                        <IconButton icon="edit" label="Editar" onClick={() => onEdit(ev)} />
                        <IconButton icon="trash" label="Eliminar" variant="danger" onClick={() => { if (confirm('¿Eliminar evento?')) deleteMut.mutate(ev.id); }} />
                      </td>
                  </tr>
                )
              )) : (
                <tr>
                  <td className="p-3 text-gray-500" colSpan={4}>Sin eventos aún.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!detailId} onClose={() => setDetailId(null)} title={detalle ? detalle.nombre : 'Cargando evento…'} size="lg">
        {!detalle ? (
          <div className="space-y-2">
            <Skeleton className="h-6" />
            <Skeleton className="h-6" />
            <Skeleton className="h-6" />
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <p className="opacity-80">{detalle.descripcion || 'Sin descripción'}</p>
            <div className="flex flex-wrap gap-4">
              <span><strong>Fecha:</strong> {detalle.fechaHora ? new Date(detalle.fechaHora).toLocaleString() : '-'}</span>
              <span><strong>Ubicación:</strong> {detalle.ubicacion || '-'}</span>
              <span><strong>Estado:</strong> <Badge color={estadoColor(detalle.estado)}>{detalle.estado}</Badge></span>
            </div>
            <div className="pt-2">
              <a className="text-brand-primary underline" href={`/eventos/${detalle.id}`}>Abrir en página completa</a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
