import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../api/client';
import Badge from '../../components/Badge';
import Icon from '../../components/Icon';
import IconButton from '../../components/IconButton';
import Modal from '../../components/Modal';
import Skeleton from '../../components/Skeleton';
import type { ServiceData, ServiceStatus } from '../../types/service';
import { DayPicker } from 'react-day-picker';

type Proveedor = {
  id: string;
  nombre: string;
  rubro?: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  activo?: boolean;
};

type ServicioPayload = {
  name: string;
  slug?: string;
  subtitle?: string;
  summary?: string;
  city?: string;
  address?: string;
  priceFrom?: number;
  heroImage?: string;
  gallery?: string[];
  contact?: { host?: string; email?: string; phone?: string };
  schedule?: ServiceData['schedule'];
  availableDates?: string[];
  availabilityMode?: 'FLEXIBLE' | 'MANUAL';
  status?: ServiceStatus;
};

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

async function fetchServicios(): Promise<ServiceData[]> {
  const { data } = await api.get('/api/servicios');
  return data;
}

async function createServicio(body: ServicioPayload) {
  const { data } = await api.post('/api/servicios', body);
  return data as ServiceData;
}

async function updateServicio(id: string, body: Partial<ServicioPayload>) {
  const { data } = await api.put(`/api/servicios/${id}`, body);
  return data as ServiceData;
}

async function deleteServicio(id: string) {
  await api.delete(`/api/servicios/${id}`);
}

const emptyProveedor: Omit<Proveedor, 'id'> = {
  nombre: '',
  rubro: '',
  contacto: '',
  telefono: '',
  email: '',
  activo: true,
};

const emptyServicioForm = {
  name: '',
  slug: '',
  subtitle: '',
  summary: '',
  city: '',
  address: '',
  priceFrom: '',
  heroImage: '',
  status: 'ABIERTO' as ServiceStatus,
  contactHost: '',
  contactEmail: '',
  contactPhone: '',
  scheduleText: '',
  availableDates: [] as string[],
  availabilityMode: 'FLEXIBLE' as 'FLEXIBLE' | 'MANUAL',
};

function scheduleToText(schedule?: ServiceData['schedule']) {
  if (!schedule || !schedule.length) return '';
  return schedule
    .map((item) => [item.day ?? '', item.open ?? '', item.close ?? '', item.note ?? ''].join(' | '))
    .join('\n');
}

function parseScheduleInput(text: string) {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  const entries: ServiceData['schedule'] = [];
  for (const line of lines) {
    const [day, open, close, note] = line.split('|').map((token) => token.trim());
    if (!day || !open || !close) {
      return null;
    }
    entries.push({ day, open, close, note });
  }
  return entries;
}

const toIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fromIsoDate = (iso: string) => {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1, 12, 0, 0);
};

const formatHumanDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
};

export default function Proveedores() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['proveedores'], queryFn: fetchProveedores });
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Proveedor, 'id'>>(emptyProveedor);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [fActivo, setFActivo] = useState<'ALL' | 'ACTIVOS' | 'INACTIVOS'>('ALL');
  const [view, setView] = useState<'PROVEEDORES' | 'SERVICIOS'>('PROVEEDORES');

  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceEditingId, setServiceEditingId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState<typeof emptyServicioForm>(emptyServicioForm);
  const [serviceErr, setServiceErr] = useState<string | null>(null);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [galleryInput, setGalleryInput] = useState('');
  const [heroUploading, setHeroUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const selectedAvailableDates = serviceForm.availableDates.map(fromIsoDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const {
    data: servicios,
    isLoading: serviciosLoading,
    error: serviciosError,
    refetch: refetchServicios,
  } = useQuery({
    queryKey: ['servicios-admin'],
    queryFn: fetchServicios,
    enabled: view === 'SERVICIOS' || serviceModalOpen,
  });

  const createMut = useMutation({
    mutationFn: createProveedor,
    onSuccess: () => {
      setShowCreate(false);
      setForm(emptyProveedor);
      refetch();
    },
    onError: (e: any) => setErrMsg(e?.response?.data?.message || 'No se pudo crear'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Omit<Proveedor, 'id'>> }) => updateProveedor(id, body),
    onSuccess: () => {
      setEditingId(null);
      refetch();
    },
    onError: (e: any) => setErrMsg(e?.response?.data?.message || 'No se pudo actualizar'),
  });

  const deleteMut = useMutation({
    mutationFn: deleteProveedor,
    onSuccess: () => refetch(),
    onError: (e: any) => setErrMsg(e?.response?.data?.message || 'No se pudo eliminar'),
  });

  const createServicioMut = useMutation({
    mutationFn: createServicio,
    onSuccess: () => {
      closeServiceModal();
      refetchServicios();
    },
    onError: (e: any) => setServiceErr(e?.response?.data?.message || 'No se pudo crear el servicio'),
  });

  const updateServicioMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<ServicioPayload> }) => updateServicio(id, body),
    onSuccess: () => {
      closeServiceModal();
      refetchServicios();
    },
    onError: (e: any) => setServiceErr(e?.response?.data?.message || 'No se pudo actualizar el servicio'),
  });

  const deleteServicioMut = useMutation({
    mutationFn: deleteServicio,
    onSuccess: () => refetchServicios(),
    onError: (e: any) => setServiceErr(e?.response?.data?.message || 'No se pudo eliminar el servicio'),
  });

  function onEditProveedor(p: Proveedor) {
    setEditingId(p.id);
    setForm({
      nombre: p.nombre,
      rubro: p.rubro || '',
      contacto: p.contacto || '',
      telefono: p.telefono || '',
      email: p.email || '',
      activo: p.activo ?? true,
    });
  }

  function onSubmitCreate(e: React.FormEvent) {
    e.preventDefault();
    setErrMsg(null);
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
    e.preventDefault();
    if (!editingId) return;
    setErrMsg(null);
    updateMut.mutate({ id: editingId, body: { ...form } });
  }

  function openServiceModal(servicio?: ServiceData) {
    if (servicio) {
      setServiceEditingId(servicio.id);
      setServiceForm({
        name: servicio.name || '',
        slug: servicio.slug || '',
        subtitle: servicio.subtitle || '',
        summary: servicio.summary || '',
        city: servicio.city || '',
        address: servicio.address || '',
        priceFrom: servicio.priceFrom != null ? String(servicio.priceFrom) : '',
        heroImage: servicio.heroImage || '',
        status: (servicio.status as ServiceStatus) || 'ABIERTO',
        contactHost: servicio.contact?.host || '',
        contactEmail: servicio.contact?.email || '',
        contactPhone: servicio.contact?.phone || '',
        scheduleText: scheduleToText(servicio.schedule),
        availableDates: servicio.availableDates || [],
        availabilityMode: (servicio.availabilityMode as 'FLEXIBLE' | 'MANUAL') || 'FLEXIBLE',
      });
      setGalleryUrls(servicio.gallery || []);
    } else {
      setServiceEditingId(null);
      setServiceForm(emptyServicioForm);
      setGalleryUrls([]);
    }
    setGalleryInput('');
    setHeroUploading(false);
    setGalleryUploading(false);
    setServiceErr(null);
    setServiceModalOpen(true);
  }

  function closeServiceModal() {
    setServiceModalOpen(false);
    setServiceErr(null);
    setServiceEditingId(null);
    setServiceForm(emptyServicioForm);
    setGalleryUrls([]);
    setGalleryInput('');
    setHeroUploading(false);
    setGalleryUploading(false);
  }

  function buildServicioPayload(): ServicioPayload | null {
    const name = serviceForm.name.trim();
    if (!name) {
      setServiceErr('El nombre es obligatorio');
      return null;
    }
    const price = serviceForm.priceFrom ? Number(serviceForm.priceFrom) : undefined;
    if (serviceForm.priceFrom && Number.isNaN(price)) {
      setServiceErr('Precio desde debe ser un número válido');
      return null;
    }
    const schedule = parseScheduleInput(serviceForm.scheduleText);
    if (serviceForm.scheduleText && schedule === null) {
      setServiceErr('Formato de horario inválido. Usa: Día | 09:00 | 18:00 | Nota');
      return null;
    }
    const availableDates = serviceForm.availableDates.filter((v) => v && v.trim().length > 0);
    const contact = [serviceForm.contactHost, serviceForm.contactEmail, serviceForm.contactPhone].some((v) => v.trim().length > 0)
      ? {
          host: serviceForm.contactHost.trim() || undefined,
          email: serviceForm.contactEmail.trim() || undefined,
          phone: serviceForm.contactPhone.trim() || undefined,
        }
      : undefined;
    return {
      name,
      slug: serviceForm.slug.trim() || undefined,
      subtitle: serviceForm.subtitle.trim() || undefined,
      summary: serviceForm.summary.trim() || undefined,
      city: serviceForm.city.trim() || undefined,
      address: serviceForm.address.trim() || undefined,
      priceFrom: price,
      heroImage: serviceForm.heroImage.trim() || undefined,
      contact,
      gallery: galleryUrls.length ? galleryUrls : undefined,
      schedule: schedule && schedule.length ? schedule : undefined,
      availableDates: availableDates.length ? availableDates : undefined,
      availabilityMode: serviceForm.availabilityMode,
      status: serviceForm.status,
    };
  }

  function onSubmitServicio(e: React.FormEvent) {
    e.preventDefault();
    setServiceErr(null);
    const payload = buildServicioPayload();
    if (!payload) return;
    if (serviceEditingId) {
      updateServicioMut.mutate({ id: serviceEditingId, body: payload });
    } else {
      createServicioMut.mutate(payload);
    }
  }

  function addGalleryUrl(url: string) {
    const trimmed = url.trim();
    if (!trimmed) return;
    setGalleryUrls((prev) => Array.from(new Set([...prev, trimmed])));
    setGalleryInput('');
  }

  function removeGalleryUrl(index: number) {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/api/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.url as string;
  }

  async function onHeroFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setServiceErr(null);
    setHeroUploading(true);
    try {
      const url = await uploadImage(file);
      setServiceForm((prev) => ({ ...prev, heroImage: url }));
    } catch (err: any) {
      setServiceErr(err?.response?.data?.message || 'No se pudo subir la imagen');
    } finally {
      setHeroUploading(false);
      e.target.value = '';
    }
  }

  async function onGalleryFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setServiceErr(null);
    setGalleryUploading(true);
    try {
      const url = await uploadImage(file);
      setGalleryUrls((prev) => [...prev, url]);
    } catch (err: any) {
      setServiceErr(err?.response?.data?.message || 'No se pudo subir la imagen');
    } finally {
      setGalleryUploading(false);
      e.target.value = '';
    }
  }

  const filteredProveedores = (data || []).filter((p) => {
    const textOk = [p.nombre, p.rubro, p.contacto, p.email, p.telefono].join(' ').toLowerCase().includes(q.toLowerCase());
    const estadoOk = fActivo === 'ALL' ? true : fActivo === 'ACTIVOS' ? !!p.activo : !p.activo;
    return textOk && estadoOk;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Catálogos</h2>
        <div className="flex gap-2">
          {[
            { key: 'PROVEEDORES', label: 'Proveedores' },
            { key: 'SERVICIOS', label: 'Servicios' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setView(item.key as typeof view)}
              className={`px-3 py-2 rounded-md text-sm font-medium ${view === item.key ? 'bg-brand-primary text-white shadow' : 'border'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {view === 'PROVEEDORES' && (
        <>
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <h3 className="text-xl font-semibold text-gray-900 mr-4">Proveedores</h3>
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
              <button onClick={() => { setShowCreate(true); setErrMsg(null); }} className="inline-flex items-center gap-2 px-3 py-2 rounded bg-brand-primary text-white text-sm shadow hover:brightness-110">
                <Icon name="plus" /> Nuevo proveedor
              </button>
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
                <button disabled={createMut.isPending} className="px-3 py-2 rounded bg-brand-primary text-white">
                  {createMut.isPending ? 'Guardando…' : 'Crear proveedor'}
                </button>
                <button type="button" className="px-3 py-2 rounded border" onClick={() => setShowCreate(false)}>
                  Cerrar
                </button>
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
                  {filteredProveedores.length ? (
                    filteredProveedores.map((p) =>
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
                            <IconButton icon="edit" label="Editar" onClick={() => onEditProveedor(p)} />
                            <IconButton icon="trash" label="Eliminar" variant="danger" onClick={() => { if (confirm('¿Eliminar proveedor?')) deleteMut.mutate(p.id); }} />
                          </td>
                        </tr>
                      ),
                    )
                  ) : (
                    <tr>
                      <td className="p-3 text-gray-500" colSpan={7}>
                        Sin proveedores.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {view === 'SERVICIOS' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Servicios</h3>
            <div className="flex items-center gap-2">
              <IconButton icon="refresh" label="Refrescar" onClick={() => refetchServicios()} />
              <button onClick={() => openServiceModal()} className="inline-flex items-center gap-2 px-3 py-2 rounded bg-brand-primary text-white text-sm shadow hover:brightness-110">
                <Icon name="plus" /> Nuevo servicio
              </button>
            </div>
          </div>

          {serviciosLoading && (
            <div className="space-y-2">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          )}
          {serviciosError && <p className="text-red-600">No se pudieron cargar los servicios.</p>}

          {!serviciosLoading && !serviciosError && (
            <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2">Nombre</th>
                    <th className="text-left p-2">Ciudad</th>
                    <th className="text-left p-2">Precio desde</th>
                    <th className="text-left p-2">Estado</th>
                    <th className="text-left p-2">Hero</th>
                    <th className="text-left p-2">Galería</th>
                    <th className="text-left p-2 w-40">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(servicios || []).length ? (
                    (servicios || []).map((serv) => (
                      <tr key={serv.id} className="border-t hover:bg-gray-50/60 transition-colors">
                        <td className="p-2">
                          <div className="font-medium">{serv.name}</div>
                          <p className="text-xs text-gray-500">{serv.subtitle || serv.summary || '-'}</p>
                        </td>
                        <td className="p-2">{serv.city || '-'}</td>
                        <td className="p-2">{serv.priceFrom != null ? `S/ ${serv.priceFrom.toFixed(2)}` : '-'}</td>
                        <td className="p-2">{serv.status ? <Badge color={serv.status === 'ABIERTO' ? 'green' : 'orange'}>{serv.status}</Badge> : '-'}</td>
                        <td className="p-2">
                          {serv.heroImage ? <img src={serv.heroImage} alt={serv.name} className="h-12 w-20 object-cover rounded" /> : <span className="text-xs text-gray-400">Sin imagen</span>}
                        </td>
                        <td className="p-2 text-xs">{serv.gallery?.length ? `${serv.gallery.length} img` : 'Sin galería'}</td>
                        <td className="p-2 space-x-1">
                          <IconButton icon="edit" label="Editar" onClick={() => openServiceModal(serv)} />
                          <IconButton icon="trash" label="Eliminar" variant="danger" onClick={() => { if (confirm('¿Eliminar servicio?')) deleteServicioMut.mutate(serv.id); }} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-3 text-gray-500" colSpan={7}>
                        Sin servicios.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <Modal open={serviceModalOpen} onClose={closeServiceModal} title={serviceEditingId ? 'Editar servicio' : 'Nuevo servicio'}>
            <div className="max-h-[75vh] overflow-y-auto pr-1">
            <form onSubmit={onSubmitServicio} className="space-y-4">
              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">Nombre</span>
                <input className="border rounded p-2 w-full" placeholder="Ej: Salón Miraflores" value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} required />
                <p className="text-xs text-gray-500">Nombre comercial visible en la web y en los listados.</p>
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">Slug</span>
                <input className="border rounded p-2 w-full" placeholder="salon-miraflores" value={serviceForm.slug} onChange={(e) => setServiceForm({ ...serviceForm, slug: e.target.value })} />
                <p className="text-xs text-gray-500">Identificador en la URL. Déjalo vacío para autogenerarlo.</p>
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">Subtítulo</span>
                <input className="border rounded p-2 w-full" placeholder="Espacios premium para bodas" value={serviceForm.subtitle} onChange={(e) => setServiceForm({ ...serviceForm, subtitle: e.target.value })} />
                <p className="text-xs text-gray-500">Descripción corta que aparece en las tarjetas del catálogo.</p>
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">Resumen</span>
                <textarea className="border rounded p-2 w-full" placeholder="Cuéntanos en 1 o 2 frases qué ofrece este proveedor…" rows={2} value={serviceForm.summary} onChange={(e) => setServiceForm({ ...serviceForm, summary: e.target.value })} />
                <p className="text-xs text-gray-500">Texto que se usa como introducción en la ficha del servicio.</p>
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">Dirección</span>
                <input className="border rounded p-2 w-full" placeholder="Av. Primavera 123, Surco" value={serviceForm.address} onChange={(e) => setServiceForm({ ...serviceForm, address: e.target.value })} />
                <p className="text-xs text-gray-500">Ubicación exacta que se mostrará en la pestaña de ubicación.</p>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block space-y-1">
                  <span className="text-sm font-medium text-gray-700">Ciudad</span>
                  <input className="border rounded p-2 w-full" placeholder="Lima" value={serviceForm.city} onChange={(e) => setServiceForm({ ...serviceForm, city: e.target.value })} />
                  <p className="text-xs text-gray-500">Lugar o zona donde opera el servicio.</p>
                </label>
                <label className="block space-y-1">
                  <span className="text-sm font-medium text-gray-700">Precio desde (S/)</span>
                  <input className="border rounded p-2 w-full" placeholder="1500" value={serviceForm.priceFrom} onChange={(e) => setServiceForm({ ...serviceForm, priceFrom: e.target.value })} />
                  <p className="text-xs text-gray-500">Monto inicial referencial. Acepta números enteros o decimales.</p>
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">Estado</span>
                <select className="border rounded p-2 w-full" value={serviceForm.status} onChange={(e) => setServiceForm({ ...serviceForm, status: e.target.value as ServiceStatus })}>
                  <option value="ABIERTO">Abierto (visible)</option>
                  <option value="CERRADO">Cerrado (oculto)</option>
                </select>
                <p className="text-xs text-gray-500">Define si el servicio está disponible para el público.</p>
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">Disponibilidad en la reserva</span>
                <select
                  className="border rounded p-2 w-full"
                  value={serviceForm.availabilityMode}
                  onChange={(e) => setServiceForm({ ...serviceForm, availabilityMode: e.target.value as 'FLEXIBLE' | 'MANUAL' })}
                >
                  <option value="FLEXIBLE">Permitir cualquier fecha</option>
                  <option value="MANUAL">Solo mostrar las fechas listadas debajo</option>
                </select>
                <p className="text-xs text-gray-500">Afecta las fechas que verá el cliente al reservar.</p>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="block space-y-1">
                  <span className="text-sm font-medium text-gray-700">Nombre del contacto</span>
                  <input className="border rounded p-2 w-full" placeholder="Coordinador" value={serviceForm.contactHost} onChange={(e) => setServiceForm({ ...serviceForm, contactHost: e.target.value })} />
                </label>
                <label className="block space-y-1">
                  <span className="text-sm font-medium text-gray-700">Email de contacto</span>
                  <input className="border rounded p-2 w-full" placeholder="contacto@empresa.com" value={serviceForm.contactEmail} onChange={(e) => setServiceForm({ ...serviceForm, contactEmail: e.target.value })} />
                </label>
                <label className="block space-y-1">
                  <span className="text-sm font-medium text-gray-700">Teléfono</span>
                  <input className="border rounded p-2 w-full" placeholder="+51 999 999 999" value={serviceForm.contactPhone} onChange={(e) => setServiceForm({ ...serviceForm, contactPhone: e.target.value })} />
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">Horario</span>
                <textarea className="border rounded p-2 w-full" rows={3} placeholder="Lunes | 09:00 | 18:00 | Nota opcional" value={serviceForm.scheduleText} onChange={(e) => setServiceForm({ ...serviceForm, scheduleText: e.target.value })} />
                <p className="text-xs text-gray-500">Formato: Día | Hora inicio | Hora fin | Nota. Una línea por día.</p>
              </label>

              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-700">Fechas disponibles</span>
                <DayPicker
                  mode="multiple"
                  selected={selectedAvailableDates}
                  onSelect={(dates) => {
                    const normalized = (dates ?? []).map(toIsoDate).sort();
                    setServiceForm((prev) => ({ ...prev, availableDates: normalized }));
                  }}
                  disabled={{ before: today }}
                  className="rounded-xl border border-gray-200 p-3"
                />
                <p className="text-xs text-gray-500">Selecciona directamente en el calendario las fechas que deseas mostrar.</p>
                <div className="flex flex-wrap gap-2">
                  {serviceForm.availableDates.length ? (
                    serviceForm.availableDates.map((date) => (
                      <span key={date} className="px-3 py-1 rounded-full bg-gray-100 text-sm flex items-center gap-2">
                        {formatHumanDate(date)}
                        <button type="button" aria-label={`Quitar ${date}`} onClick={() => setServiceForm((prev) => ({ ...prev, availableDates: prev.availableDates.filter((d) => d !== date) }))}>
                          <Icon name="x" className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400">No hay fechas seleccionadas.</p>
                  )}
                </div>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-gray-700">Hero image</span>
                <div className="space-y-2">
                  <input className="border rounded p-2 w-full" placeholder="https://..." value={serviceForm.heroImage} onChange={(e) => setServiceForm({ ...serviceForm, heroImage: e.target.value })} />
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex items-center gap-2 px-3 py-2 border rounded cursor-pointer text-sm">
                      <input type="file" accept="image/*" className="hidden" onChange={onHeroFileChange} />
                      <Icon name="upload" />
                      {heroUploading ? 'Subiendo…' : 'Subir archivo'}
                    </label>
                    {serviceForm.heroImage && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>Vista previa:</span>
                        <img src={serviceForm.heroImage} alt="Hero preview" className="h-10 w-16 object-cover rounded border" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Puedes pegar una URL o subir un archivo (se alojará en /uploads).</p>
                </div>
              </label>

              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-700">Galería</span>
                <div className="flex flex-wrap gap-2">
                  <input className="border rounded p-2 flex-1 min-w-[140px]" placeholder="https://..." value={galleryInput} onChange={(e) => setGalleryInput(e.target.value)} />
                  <button type="button" onClick={() => addGalleryUrl(galleryInput)} className="px-3 py-2 rounded bg-brand-primary text-white text-sm">
                    Agregar URL
                  </button>
                  <label className="inline-flex items-center gap-2 px-3 py-2 border rounded cursor-pointer text-sm">
                    <input type="file" accept="image/*" className="hidden" onChange={onGalleryFileChange} />
                    <Icon name="upload" />
                    {galleryUploading ? 'Subiendo…' : 'Subir archivo'}
                  </label>
                </div>
                <p className="text-xs text-gray-500">Añade imágenes adicionales que se mostrarán en mosaico.</p>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {galleryUrls.length ? (
                    galleryUrls.map((url, idx) => (
                      <div key={`${url}-${idx}`} className="flex items-center gap-2 text-sm bg-gray-50 border rounded px-2 py-1">
                        <span className="flex-1 truncate">{url}</span>
                        <IconButton icon="trash" label="Quitar" variant="ghost" onClick={() => removeGalleryUrl(idx)} />
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400">Aún no agregas imágenes.</p>
                  )}
                </div>
              </div>

              {serviceErr && <p className="text-sm text-red-600">{serviceErr}</p>}
              <div className="flex gap-2">
                <button
                  disabled={createServicioMut.isPending || updateServicioMut.isPending}
                  className="px-3 py-2 rounded bg-brand-primary text-white"
                >
                  {createServicioMut.isPending || updateServicioMut.isPending ? 'Guardando…' : serviceEditingId ? 'Actualizar' : 'Crear'}
                </button>
                <button type="button" className="px-3 py-2 rounded border" onClick={closeServiceModal}>
                  Cerrar
                </button>
              </div>
            </form>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}
