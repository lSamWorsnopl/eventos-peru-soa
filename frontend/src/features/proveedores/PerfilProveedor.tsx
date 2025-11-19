import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../api/client';
import type { ServiceData, ServiceStatus } from '../../types/service';
import Icon from '../../components/Icon';
import IconButton from '../../components/IconButton';
import Modal from '../../components/Modal';
import Skeleton from '../../components/Skeleton';
import { DayPicker } from 'react-day-picker';

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

const emptyForm = {
  name: '',
  slug: '',
  subtitle: '',
  summary: '',
  city: '',
  address: '',
  priceFrom: '',
  heroImage: '',
  status: 'ABIERTO' as ServiceStatus,
  statusMode: 'MANUAL' as 'MANUAL' | 'AUTO',
  contactHost: '',
  contactEmail: '',
  contactPhone: '',
  scheduleText: '',
  availableDates: [] as string[],
  availabilityMode: 'FLEXIBLE' as 'FLEXIBLE' | 'MANUAL',
};

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

async function fetchMisServicios(): Promise<ServiceData[]> {
  const { data } = await api.get('/api/servicios', { params: { mine: true } });
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

export default function PerfilProveedor() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['mis-servicios'], queryFn: fetchMisServicios });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [galleryInput, setGalleryInput] = useState('');
  const [heroUploading, setHeroUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const selectedAvailableDates = form.availableDates.map(fromIsoDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleAvailableDateSelect = (dates?: Date[]) => {
    const normalized = (dates ?? []).map(toIsoDate).sort();
    setForm((prev) => ({ ...prev, availableDates: normalized }));
  };

  const removeAvailableDate = (value: string) => {
    setForm((prev) => ({ ...prev, availableDates: prev.availableDates.filter((d) => d !== value) }));
  };

  const createMut = useMutation({
    mutationFn: createServicio,
    onSuccess: () => {
      closeModal();
      refetch();
    },
    onError: (e: any) => setErrMsg(e?.response?.data?.message || 'No se pudo crear el servicio'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<ServicioPayload> }) => updateServicio(id, body),
    onSuccess: () => {
      closeModal();
      refetch();
    },
    onError: (e: any) => setErrMsg(e?.response?.data?.message || 'No se pudo actualizar el servicio'),
  });

  const deleteMut = useMutation({
    mutationFn: deleteServicio,
    onSuccess: () => refetch(),
    onError: (e: any) => setErrMsg(e?.response?.data?.message || 'No se pudo eliminar el servicio'),
  });

  function openModal(servicio?: ServiceData) {
    if (servicio) {
      setEditingId(servicio.id);
      setForm({
        name: servicio.name || '',
        slug: servicio.slug || '',
        subtitle: servicio.subtitle || '',
        summary: servicio.summary || '',
        city: servicio.city || '',
        address: servicio.address || '',
        priceFrom: servicio.priceFrom != null ? String(servicio.priceFrom) : '',
        heroImage: servicio.heroImage || '',
        status: (servicio.status as ServiceStatus) || 'ABIERTO',
        statusMode: (servicio.statusMode as 'MANUAL' | 'AUTO') || 'MANUAL',
        contactHost: servicio.contact?.host || '',
        contactEmail: servicio.contact?.email || '',
        contactPhone: servicio.contact?.phone || '',
        scheduleText: scheduleToText(servicio.schedule),
        availableDates: servicio.availableDates || [],
        availabilityMode: (servicio.availabilityMode as 'FLEXIBLE' | 'MANUAL') || 'FLEXIBLE',
      });
      setGalleryUrls(servicio.gallery || []);
    } else {
      setEditingId(null);
      setForm(emptyForm);
      setGalleryUrls([]);
    }
    setGalleryInput('');
    setHeroUploading(false);
    setGalleryUploading(false);
    setErrMsg(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setGalleryUrls([]);
    setGalleryInput('');
    setHeroUploading(false);
    setGalleryUploading(false);
    setErrMsg(null);
  }

  function buildPayload(): ServicioPayload | null {
    const name = form.name.trim();
    if (!name) {
      setErrMsg('El nombre es obligatorio');
      return null;
    }
    const price = form.priceFrom ? Number(form.priceFrom) : undefined;
    if (form.priceFrom && Number.isNaN(price)) {
      setErrMsg('Precio desde debe ser válido');
      return null;
    }
    const schedule = parseScheduleInput(form.scheduleText);
    if (form.scheduleText && schedule === null) {
      setErrMsg('Formato de horario inválido. Usa: Día | 09:00 | 18:00 | Nota');
      return null;
    }
    const availableDates = form.availableDates.filter((v) => v && v.trim().length > 0);
    const contact = [form.contactHost, form.contactEmail, form.contactPhone].some((v) => v.trim().length > 0)
      ? {
          host: form.contactHost.trim() || undefined,
          email: form.contactEmail.trim() || undefined,
          phone: form.contactPhone.trim() || undefined,
        }
      : undefined;
    return {
      name,
      slug: form.slug.trim() || undefined,
      subtitle: form.subtitle.trim() || undefined,
      summary: form.summary.trim() || undefined,
      city: form.city.trim() || undefined,
      address: form.address.trim() || undefined,
      priceFrom: price,
      heroImage: form.heroImage.trim() || undefined,
      contact,
      gallery: galleryUrls.length ? galleryUrls : undefined,
      schedule: schedule && schedule.length ? schedule : undefined,
      availableDates: availableDates.length ? availableDates : undefined,
      availabilityMode: form.availabilityMode,
      status: form.status,
      statusMode: form.statusMode,
    };
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrMsg(null);
    const payload = buildPayload();
    if (!payload) return;
    if (editingId) {
      updateMut.mutate({ id: editingId, body: payload });
    } else {
      createMut.mutate(payload);
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
    setHeroUploading(true);
    setErrMsg(null);
    try {
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, heroImage: url }));
    } catch (err: any) {
      setErrMsg(err?.response?.data?.message || 'No se pudo subir la imagen');
    } finally {
      setHeroUploading(false);
      e.target.value = '';
    }
  }

  async function onGalleryFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setGalleryUploading(true);
    setErrMsg(null);
    try {
      const url = await uploadImage(file);
      setGalleryUrls((prev) => [...prev, url]);
    } catch (err: any) {
      setErrMsg(err?.response?.data?.message || 'No se pudo subir la imagen');
    } finally {
      setGalleryUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Mis servicios</h1>
          <p className="text-sm text-gray-500">Administra la información que se mostrará en el marketplace.</p>
        </div>
        <div className="flex items-center gap-2">
          <IconButton icon="refresh" label="Refrescar" onClick={() => refetch()} />
          <button onClick={() => openModal()} className="inline-flex items-center gap-2 px-3 py-2 rounded bg-brand-primary text-white text-sm shadow hover:brightness-110">
            <Icon name="plus" />
            Nuevo servicio
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      )}
      {error && <p className="text-red-600">No se pudieron cargar tus servicios.</p>}

      {!isLoading && !error && (
        <div className="grid gap-4">
          {(data || []).length ? (
            (data || []).map((serv) => (
              <div key={serv.id} className="border rounded-xl bg-white shadow-sm p-4 flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-52 h-40 bg-gray-100 rounded-xl overflow-hidden">
                  {serv.heroImage ? <img src={serv.heroImage} alt={serv.name} className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center text-gray-400 text-sm">Sin imagen</div>}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{serv.name}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${serv.status === 'ABIERTO' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {serv.status || 'SIN ESTADO'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{serv.subtitle || serv.summary || 'Sin descripción'}</p>
                  <div className="text-sm text-gray-500 flex flex-wrap gap-4 mt-2">
                    <span><strong>Ciudad:</strong> {serv.city || '-'}</span>
                    <span><strong>Dirección:</strong> {serv.address || '-'}</span>
                    <span><strong>Precio desde:</strong> {serv.priceFrom != null ? `S/ ${serv.priceFrom.toFixed(2)}` : '-'}</span>
                    <span><strong>Galería:</strong> {serv.gallery?.length || 0} fotos</span>
                    <span><strong>Fechas disponibles:</strong> {serv.availableDates?.length || 0}</span>
                    <span><strong>Contacto:</strong> {serv.contact?.phone || serv.contact?.email || serv.contact?.host || '-'}</span>
                    <span><strong>Disponibilidad:</strong> {serv.availabilityMode === 'MANUAL' ? 'Solo fechas listadas' : 'Flexible'}</span>
                  </div>
                </div>
                <div className="flex md:flex-col gap-2">
                  <button onClick={() => openModal(serv)} className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded border text-sm hover:bg-gray-50">
                    <Icon name="edit" />
                    Editar
                  </button>
                  <button onClick={() => { if (confirm('¿Eliminar este servicio?')) deleteMut.mutate(serv.id); }} className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded border border-red-200 text-sm text-red-700 hover:bg-red-50">
                    <Icon name="trash" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="border rounded-xl bg-white p-6 text-center text-gray-500">Aún no has publicado servicios.</div>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editingId ? 'Editar servicio' : 'Nuevo servicio'}>
        <div className="max-h-[75vh] overflow-y-auto pr-1">
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">Nombre</span>
            <input className="border rounded p-2 w-full" placeholder="Ej: Catering Deluxe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">Slug</span>
            <input className="border rounded p-2 w-full" placeholder="catering-deluxe" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <p className="text-xs text-gray-500">Identificador opcional para la URL.</p>
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">Subtítulo</span>
            <input className="border rounded p-2 w-full" placeholder="Servicios gourmet" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">Resumen</span>
            <textarea className="border rounded p-2 w-full" rows={2} placeholder="Describe brevemente tu oferta" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">Dirección</span>
            <input className="border rounded p-2 w-full" placeholder="Av. Primavera 123, Surco" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="text-sm font-medium text-gray-700">Ciudad</span>
              <input className="border rounded p-2 w-full" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-gray-700">Precio desde (S/)</span>
              <input className="border rounded p-2 w-full" value={form.priceFrom} onChange={(e) => setForm({ ...form, priceFrom: e.target.value })} />
            </label>
          </div>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">Estado</span>
            <select className="border rounded p-2 w-full" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ServiceStatus })}>
              <option value="ABIERTO">Abierto</option>
              <option value="CERRADO">Cerrado</option>
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">Modo de estado</span>
            <select
              className="border rounded p-2 w-full"
              value={form.statusMode}
              onChange={(e) => setForm({ ...form, statusMode: e.target.value as 'MANUAL' | 'AUTO' })}
            >
              <option value="MANUAL">Manual (tu eliges abierto/cerrado)</option>
              <option value="AUTO">Automático (según horario)</option>
            </select>
            <p className="text-xs text-gray-500">En modo automático se usará el horario y fechas para calcular si está abierto.</p>
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">Disponibilidad en la reserva</span>
            <select
              className="border rounded p-2 w-full"
              value={form.availabilityMode}
              onChange={(e) => setForm({ ...form, availabilityMode: e.target.value as 'FLEXIBLE' | 'MANUAL' })}
            >
              <option value="FLEXIBLE">Permitir que el cliente elija cualquier fecha</option>
              <option value="MANUAL">Mostrar solo las fechas listadas debajo</option>
            </select>
            <p className="text-xs text-gray-500">Si eliges “solo fechas listadas”, el calendario del cliente mostrará únicamente las fechas de la sección “Fechas disponibles”.</p>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="block space-y-1">
              <span className="text-sm font-medium text-gray-700">Nombre del contacto</span>
              <input className="border rounded p-2 w-full" placeholder="Coordinador" value={form.contactHost} onChange={(e) => setForm({ ...form, contactHost: e.target.value })} />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-gray-700">Email de contacto</span>
              <input className="border rounded p-2 w-full" placeholder="contacto@empresa.com" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-gray-700">Teléfono</span>
              <input className="border rounded p-2 w-full" placeholder="+51 999 999 999" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
            </label>
          </div>

          <div className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Horario</span>
            <textarea
              className="border rounded p-2 w-full"
              rows={3}
              placeholder="Lunes | 09:00 | 18:00 | Atención presencial"
              value={form.scheduleText}
              onChange={(e) => setForm({ ...form, scheduleText: e.target.value })}
            />
            <p className="text-xs text-gray-500">Una línea por día con el formato: Día | Hora inicio | Hora fin | Nota opcional.</p>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700">Fechas disponibles</span>
            <DayPicker
              mode="multiple"
              selected={selectedAvailableDates}
              onSelect={handleAvailableDateSelect}
              disabled={{ before: today }}
              className="rounded-xl border border-gray-200 p-3"
            />
            <p className="text-xs text-gray-500">Haz clic en los días del calendario para habilitar o deshabilitar fechas específicas.</p>
            <div className="flex flex-wrap gap-2">
              {form.availableDates.length ? (
                form.availableDates.map((date) => (
                  <span key={date} className="px-3 py-1 rounded-full bg-gray-100 text-sm flex items-center gap-2">
                    {formatHumanDate(date)}
                    <button type="button" aria-label={`Quitar ${date}`} onClick={() => removeAvailableDate(date)}>
                      <Icon name="x" className="h-3 w-3" />
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-xs text-gray-400">No hay fechas seleccionadas.</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700">Hero image</span>
            <input className="border rounded p-2 w-full" placeholder="https://..." value={form.heroImage} onChange={(e) => setForm({ ...form, heroImage: e.target.value })} />
            <div className="flex items-center gap-3 flex-wrap">
              <label className="inline-flex items-center gap-2 px-3 py-2 border rounded cursor-pointer text-sm">
                <input type="file" accept="image/*" className="hidden" onChange={onHeroFileChange} />
                <Icon name="upload" />
                {heroUploading ? 'Subiendo…' : 'Subir archivo'}
              </label>
              {form.heroImage && <img src={form.heroImage} alt="Hero preview" className="h-12 w-20 object-cover rounded border" />}
            </div>
          </div>

  <div className="space-y-2">
    <span className="text-sm font-medium text-gray-700">Galería</span>
    <div className="flex flex-wrap gap-2">
      <input className="border rounded p-2 flex-1 min-w-[140px]" placeholder="https://..." value={galleryInput} onChange={(e) => setGalleryInput(e.target.value)} />
      <button type="button" onClick={() => addGalleryUrl(galleryInput)} className="px-3 py-2 rounded bg-brand-primary text-white text-sm">Agregar URL</button>
      <label className="inline-flex items-center gap-2 px-3 py-2 border rounded cursor-pointer text-sm">
        <input type="file" accept="image/*" className="hidden" onChange={onGalleryFileChange} />
        <Icon name="upload" />
        {galleryUploading ? 'Subiendo…' : 'Subir archivo'}
      </label>
    </div>
    <div className="max-h-40 overflow-y-auto space-y-1">
      {galleryUrls.length ? galleryUrls.map((url, idx) => (
        <div key={`${url}-${idx}`} className="flex items-center gap-2 text-xs bg-gray-50 border rounded px-2 py-1">
          <span className="flex-1 truncate">{url}</span>
          <IconButton icon="trash" label="Quitar" variant="ghost" onClick={() => removeGalleryUrl(idx)} />
        </div>
      )) : <p className="text-xs text-gray-400">Aún no agregas imágenes.</p>}
    </div>
  </div>

          {errMsg && <p className="text-sm text-red-600">{errMsg}</p>}
          <div className="flex gap-2">
            <button disabled={createMut.isPending || updateMut.isPending} className="px-3 py-2 rounded bg-brand-primary text-white">
              {createMut.isPending || updateMut.isPending ? 'Guardando…' : editingId ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" className="px-3 py-2 rounded border" onClick={closeModal}>Cerrar</button>
          </div>
        </form>
        </div>
      </Modal>
    </div>
  );
}
