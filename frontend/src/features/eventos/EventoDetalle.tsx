import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useState } from 'react';

type Estado = 'CREADO' | 'EN_PROCESO' | 'FINALIZADO' | 'CANCELADO';
type Evento = { id: string; nombre: string; descripcion?: string; fechaHora: string | null; ubicacion?: string; estado: Estado };
type Proveedor = { id: string; nombre: string };

async function fetchEvento(id: string): Promise<Evento> { const { data } = await api.get(`/api/eventos/${id}`); return data; }
async function fetchAsignados(id: string): Promise<Proveedor[]> { const { data } = await api.get(`/api/eventos/${id}/proveedores`); return data; }
async function fetchProveedores(): Promise<Proveedor[]> { const { data } = await api.get('/api/proveedores'); return data; }

export default function EventoDetalle() {
  const { id } = useParams();
  const nav = useNavigate();
  const eid = id as string;

  const { data: evento, refetch: refetchEvento } = useQuery({ queryKey: ['evento', eid], queryFn: () => fetchEvento(eid) });
  const { data: asignados, refetch: refetchAsignados } = useQuery({ queryKey: ['evento-proveedores', eid], queryFn: () => fetchAsignados(eid) });
  const { data: proveedores } = useQuery({ queryKey: ['proveedores-all'], queryFn: fetchProveedores });

  const [nuevoProv, setNuevoProv] = useState('');
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const assignMut = useMutation({
    mutationFn: async (provId: string) => { await api.post(`/api/eventos/${eid}/proveedores/${provId}`); },
    onSuccess: () => { setNuevoProv(''); refetchAsignados(); },
    onError: (e: any) => setErrMsg(e?.response?.data?.message || 'No se pudo asignar'),
  });
  const unassignMut = useMutation({
    mutationFn: async (provId: string) => { await api.delete(`/api/eventos/${eid}/proveedores/${provId}`); },
    onSuccess: () => { refetchAsignados(); },
    onError: (e: any) => setErrMsg(e?.response?.data?.message || 'No se pudo quitar'),
  });
  const estadoMut = useMutation({
    mutationFn: async (estado: Estado) => { await api.patch(`/api/eventos/${eid}/estado`, null, { params: { estado } }); },
    onSuccess: () => { refetchEvento(); },
    onError: (e: any) => setErrMsg(e?.response?.data?.message || 'No se pudo cambiar estado'),
  });

  return (
    <div className="max-w-4xl p-4 space-y-4">
        <button onClick={() => nav(-1)} className="text-sm underline">Volver</button>
        {!evento ? <p>Cargando…</p> : (
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{evento.nombre}</h2>
            <p className="opacity-80">{evento.descripcion || 'Sin descripción'}</p>
            <div className="text-sm flex gap-4">
              <span>Fecha: {evento.fechaHora ? new Date(evento.fechaHora).toLocaleString() : '-'}</span>
              <span>Ubicación: {evento.ubicacion || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Estado:</span>
              <select value={evento.estado} onChange={(e) => estadoMut.mutate(e.target.value as Estado)} className="border rounded px-2 py-1 text-sm">
                {(['CREADO','EN_PROCESO','FINALIZADO','CANCELADO'] as Estado[]).map(es => <option key={es} value={es}>{es}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="border rounded bg-white">
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className="font-semibold">Proveedores asignados</h3>
            <div className="flex items-center gap-2">
              <select className="border rounded px-2 py-1 text-sm" value={nuevoProv} onChange={(e) => setNuevoProv(e.target.value)}>
                <option value="">Selecciona proveedor…</option>
                {(proveedores || []).map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
              <button disabled={!nuevoProv || assignMut.isPending} onClick={() => assignMut.mutate(nuevoProv)} className="px-3 py-1 border rounded">Asignar</button>
            </div>
          </div>
          <ul className="divide-y">
            {(asignados || []).map(p => (
              <li key={p.id} className="p-3 flex items-center justify-between">
                <span>{p.nombre}</span>
                <button onClick={() => unassignMut.mutate(p.id)} className="px-2 py-1 border rounded text-red-700">Quitar</button>
              </li>
            ))}
            {(!asignados || asignados.length === 0) && <li className="p-3 text-gray-500">Sin proveedores</li>}
          </ul>
        </div>

        {errMsg && <p className="text-sm text-red-600">{errMsg}</p>}
    </div>
  );
}
