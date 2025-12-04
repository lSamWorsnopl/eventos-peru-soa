import { Fragment, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import {
  FiArrowLeft,
  FiHeart,
  FiStar,
  FiMapPin,
  FiPhone,
  FiMail,
  FiFacebook,
  FiInstagram,
  FiMessageCircle,
  FiCalendar,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiClock,
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import PublicNavbar from '../components/PublicNavbar';
import type { ServiceData, ServiceSchedule } from '../types/service';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png?url';
import markerIcon from 'leaflet/dist/images/marker-icon.png?url';
import markerShadow from 'leaflet/dist/images/marker-shadow.png?url';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../cart/CartContext';
import { fetchService } from '../api/services';
import api from '../api/client';

const defaultMarker = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const tabItems = [
  { id: 'descripcion', label: 'Descripcion' },
  { id: 'galeria', label: 'Galeria' },
  { id: 'ubicacion', label: 'Ubicacion' },
  { id: 'opiniones', label: 'Anadir opinion' },
];

const socialIcons: Record<string, IconType> = {
  facebook: FiFacebook,
  instagram: FiInstagram,
  whatsapp: FiMessageCircle,
  tiktok: FiInstagram,
};

const reviewCriteria = ['Servicio', 'Relacion calidad-precio', 'Ubicacion', 'Limpieza'];
const dayNames = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

function getTodaySchedule(schedule?: ServiceSchedule[]) {
  if (!schedule) return null;
  const today = dayNames[new Date().getDay()];
  return schedule.find((item) => item.day.toLowerCase() === today);
}

const createEmptyReservaForm = () => ({
  fechaEvento: '',
  invitados: '',
  nombre: '',
  email: '',
  telefono: '',
  mensaje: '',
});

export default function ServiceDetailPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const [activeTab, setActiveTab] = useState('descripcion');
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [reserveForm, setReserveForm] = useState(createEmptyReservaForm);
  const [cartStatus, setCartStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isAdding, setIsAdding] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const calendar = useMemo(
    () => buildCalendarGrid(calendarMonth.getFullYear(), calendarMonth.getMonth()),
    [calendarMonth],
  );
  const {
    data: service,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['servicio', serviceId],
    queryFn: () => fetchService(serviceId as string),
    enabled: !!serviceId,
  });

  useEffect(() => {
    if (!service) return;
    if (service.availabilityMode === 'MANUAL' && service.availableDates && service.availableDates.length) {
      setReserveForm((prev) => (prev.fechaEvento ? prev : { ...prev, fechaEvento: service.availableDates![0] }));
      setCalendarMonth(new Date(service.availableDates[0]));
    } else {
      setCalendarMonth(new Date());
    }
  }, [service]);

  const manualDates = service?.availableDates ?? [];
  const manualDatesSet = useMemo(
    () => new Set(manualDates.map((d) => normalizeDateString(d))),
    [manualDates],
  );
  const manualDatesMap = useMemo(() => {
    const map = new Map<string, string>();
    manualDates.forEach((d) => map.set(normalizeDateString(d), d));
    return map;
  }, [manualDates]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-gray-900 grid place-items-center">
        <p className="text-gray-500">Cargando servicio...</p>
      </div>
    );
  }

  if (isError || !service) {
    return (
      <div className="min-h-screen bg-slate-50 text-gray-900">
        <PublicNavbar mode="external" activeSection="servicios" showAuthActions />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <p className="text-2xl font-semibold mb-4">No encontramos el servicio solicitado.</p>
          <Link to="/servicios" className="text-brand-primary font-semibold hover:underline">
            Volver a la lista de servicios
          </Link>
        </div>
      </div>
    );
  }

  const todaySchedule = getTodaySchedule(service.schedule);
  const fav = isFavorite(service.id);
  const isManualAvailability = service.availabilityMode === 'MANUAL';
  const hasManualDates = isManualAvailability && manualDates.length > 0;
  const manualDatesUnavailable = isManualAvailability && !manualDates.length;
  const manualSelectionMissing = isManualAvailability && hasManualDates && !reserveForm.fechaEvento;
  const todayIso = new Date().toISOString().split('T')[0];
  const addButtonDisabled = isAdding || !user || manualSelectionMissing || manualDatesUnavailable;

  const handleCalendarDateSelect = (isoKey: string) => {
    if (isManualAvailability && !manualDatesSet.has(isoKey)) return;
    const selectedValue = isManualAvailability ? manualDatesMap.get(isoKey) ?? isoKey : isoKey;
    setReserveForm((prev) => ({ ...prev, fechaEvento: selectedValue }));
    setCartStatus('idle');
  };

  const handleReservaChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCartStatus('idle');
    setReserveForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReservaSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!service) return;
    if (isManualAvailability && manualDates.length === 0) {
      setCartStatus('error');
      return;
    }
    if (isManualAvailability && manualDates.length > 0 && !reserveForm.fechaEvento) {
      setCartStatus('error');
      return;
    }
    setCartStatus('idle');
    setIsAdding(true);
    const invitadosRaw = reserveForm.invitados.trim();
    const invitadosValue = invitadosRaw ? Number(invitadosRaw) : undefined;
    try {
      await addItem({
        servicioId: service.id,
        servicioNombre: service.name,
        tipoEvento: service.subtitle,
        mensaje: reserveForm.mensaje.trim() || undefined,
        invitados: invitadosValue && !Number.isNaN(invitadosValue) ? invitadosValue : undefined,
        fechaEvento: reserveForm.fechaEvento || undefined,
        priceFrom: service.priceFrom,
        origen: 'service-detail',
      });
      setCartStatus('success');
      setReserveForm(() => ({
        ...createEmptyReservaForm(),
        fechaEvento:
          service.availabilityMode === 'MANUAL' && manualDates.length ? manualDates[0] : '',
      }));
    } catch (err) {
      console.error(err);
      setCartStatus('error');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <PublicNavbar mode="external" activeSection="servicios" showAuthActions />
      <main className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-20 py-8">
        <Link to="/servicios" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-primary transition">
          <FiArrowLeft />
          Volver a resultados
        </Link>

        <section className="mt-6 space-y-6">
          <div>
            <div className="flex flex-wrap gap-3 text-sm">
              {service.categories?.map((category) => (
                <span key={category} className="px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary font-semibold">
                  {category}
                </span>
              ))}
              {service.tags?.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-start gap-3">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">{service.name}</h1>
                <p className="text-lg text-gray-600">{service.subtitle}</p>
                <p className="flex items-center gap-1 text-gray-500 mt-1">
                  <FiMapPin className="text-brand-primary" />
                  {service.address} — {service.city}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleFavorite(service.id)}
                aria-pressed={fav}
                className={`ml-auto flex items-center gap-2 text-sm font-semibold border px-4 py-2 rounded-full transition ${
                  fav ? 'bg-brand-primary text-white border-brand-primary' : 'text-brand-primary border-brand-primary hover:bg-brand-primary hover:text-white'
                }`}
              >
                <FiHeart className={fav ? 'fill-current' : ''} />
                {fav ? 'Favorito' : 'Guardar en favoritos'}
              </button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            {service.gallery?.[0] ? (
              <img src={service.gallery[0]} alt={service.name} className="rounded-3xl object-cover w-full h-full min-h-[320px]" />
            ) : (
              <div className="rounded-3xl bg-gray-100 min-h-[320px] grid place-items-center text-gray-500">Sin imagen</div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {(service.gallery ?? []).slice(1, 5).map((image, idx) => (
                <img key={`${image}-${idx}`} src={image} alt={service.name} className="rounded-2xl object-cover w-full h-full min-h-[150px]" />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-b border-gray-200">
            {tabItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-semibold border-b-2 ${
                  activeTab === tab.id ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-brand-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,2.3fr)_minmax(0,0.9fr)]">
            <section className="space-y-12">
              {activeTab === 'descripcion' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h2 className="text-xl font-semibold">Descripción general</h2>
                    {todaySchedule && (
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full">
                        <FiClock />
                        {`Hoy: ${todaySchedule.open} - ${todaySchedule.close}${todaySchedule.note ? ` · ${todaySchedule.note}` : ''}`}
                      </div>
                    )}
                    <p className="text-gray-600 leading-relaxed">{service.description}</p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-3xl border border-gray-100 shadow-sm p-5 space-y-3">
                      <p className="text-xs uppercase text-gray-500 tracking-wide">Servicios destacados</p>
                      <ul className="space-y-2 text-sm text-gray-700">
                        {(service.services ?? []).map((item) => (
                          <li key={item} className="flex items-center gap-2">
                            <FiCheckCircle className="text-brand-primary" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-3xl border border-gray-100 shadow-sm p-5 space-y-3">
                      <p className="text-xs uppercase text-gray-500 tracking-wide">Eventos cubiertos</p>
                      <ul className="space-y-2 text-sm text-gray-700">
                        {(service.events ?? []).map((item) => (
                          <li key={item} className="flex items-center gap-2">
                            <FiCheckCircle className="text-brand-primary" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {hasManualDates && (
                      <div className="rounded-3xl border border-gray-100 shadow-sm p-5 space-y-3 md:col-span-2">
                        <p className="text-xs uppercase text-gray-500 tracking-wide">Fechas disponibles</p>
                        <ul className="flex flex-wrap gap-2 text-sm text-gray-700">
                          {service.availableDates!.map((date) => (
                            <li key={date} className="px-3 py-1 rounded-full bg-gray-100">
                              {formatPeruDate(date)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'galeria' && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {(service.gallery ?? []).map((image, idx) => (
                    <img key={`${image}-${idx}`} src={image} alt={service.name} className="rounded-2xl object-cover w-full h-full min-h-[220px]" />
                  ))}
                </div>
              )}

              {activeTab === 'ubicacion' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Ubicación</h2>
                    <p className="text-gray-600">{service.address} — {service.city}</p>
                  </div>
                  {service.coordinates ? (
                    <MapContainer center={[service.coordinates.lat, service.coordinates.lng]} zoom={14} className="h-80 w-full rounded-3xl overflow-hidden" scrollWheelZoom={false}>
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[service.coordinates.lat, service.coordinates.lng]} icon={defaultMarker}>
                        <Popup>
                          <strong>{service.name}</strong>
                          <p className="text-xs text-gray-600">{service.address}</p>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-gray-200 h-80 grid place-items-center text-sm text-gray-500">
                      Este proveedor no ha cargado su coordenada exacta.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'opiniones' && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 p-6 rounded-3xl border border-gray-100 bg-slate-50">
                    <div>
                      <p className="text-sm text-gray-500">Calificación general</p>
                      <div className="flex items-center gap-2">
                        <span className="text-4xl font-bold text-gray-900">{service.rating?.toFixed(1) ?? '4.5'}</span>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <FiStar
                              key={idx}
                              className={`text-xl ${idx < Math.round(service.rating ?? 4.5) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">{service.reviews ?? 0} opiniones</p>
                    </div>
                  </div>
                  <AddReviewForm serviceId={service.id} />
                </div>
              )}

            <section>
              <h3 className="text-xl font-semibold mb-3">Vista de Calendario</h3>
              <CalendarView
                calendar={calendar}
                price={service.priceFrom ?? 0}
                month={calendarMonth}
                onPrev={() => setCalendarMonth((prev) => addMonths(prev, -1))}
                onNext={() => setCalendarMonth((prev) => addMonths(prev, 1))}
                availableDates={manualDatesSet}
                availabilityMode={service.availabilityMode}
                onDateSelect={handleCalendarDateSelect}
              />
            </section>
            </section>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Reserva</p>
                    <p className="text-2xl font-bold text-brand-primary">S/{(service.priceFrom ?? 0).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">por hora</p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                    {service.status === 'ABIERTO' ? 'Abierto' : 'Cerrado'}
                  </span>
                </div>
                <form className="mt-6 space-y-4" onSubmit={handleReservaSubmit}>
                  {!user && (
                    <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-sm text-amber-700">
                      Debes iniciar sesión para agregar servicios al carrito.
                      <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="ml-2 underline text-brand-primary"
                      >
                        Iniciar sesión
                      </button>
                    </div>
                  )}
                  <label className="text-sm font-semibold text-gray-700 flex flex-col gap-2">
                    <span>Fecha tentativa</span>
                    <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm">
                      <FiCalendar className="text-gray-400" />
                      {isManualAvailability ? (
                        hasManualDates ? (
                          <select
                            name="fechaEvento"
                            value={reserveForm.fechaEvento}
                            onChange={handleReservaChange}
                            className="flex-1 border-none focus:ring-0 focus:outline-none bg-transparent"
                            disabled={!user}
                          >
                            <option value="">Selecciona una fecha</option>
                          {manualDates.map((date) => (
                            <option key={date} value={date}>
                              {formatPeruDate(date)}
                            </option>
                          ))}
                        </select>
                        ) : (
                          <span className="text-gray-500 text-sm">Sin fechas publicadas por ahora.</span>
                        )
                      ) : (
                        <input
                          type="date"
                          min={todayIso}
                          name="fechaEvento"
                          value={reserveForm.fechaEvento}
                          onChange={handleReservaChange}
                          className="flex-1 border-none focus:ring-0 focus:outline-none bg-transparent"
                          disabled={!user}
                        />
                      )}
                    </div>
                    {isManualAvailability && hasManualDates && !reserveForm.fechaEvento && (
                      <p className="text-xs text-red-600">Selecciona una fecha disponible.</p>
                    )}
                    {isManualAvailability && !hasManualDates && (
                      <p className="text-xs text-red-600">El proveedor aún no ha publicado fechas disponibles.</p>
                    )}
                  </label>
                  <label className="text-sm font-semibold text-gray-700 flex flex-col gap-2">
                    <span>Invitados estimados</span>
                    <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm">
                      <FiUsers className="text-gray-400" />
                      <input
                        type="number"
                        min={1}
                        name="invitados"
                        value={reserveForm.invitados}
                        onChange={handleReservaChange}
                        placeholder="Ej. 120"
                        className="flex-1 border-none focus:ring-0 focus:outline-none bg-transparent"
                        disabled={!user}
                      />
                    </div>
                  </label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <label className="text-sm font-semibold text-gray-700 flex flex-col gap-2">
                      <span>Nombre completo</span>
                      <input
                        name="nombre"
                        value={reserveForm.nombre}
                        onChange={handleReservaChange}
                        required
                        className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/50 focus:outline-none"
                        disabled={!user}
                      />
                    </label>
                    <label className="text-sm font-semibold text-gray-700 flex flex-col gap-2">
                      <span>Email</span>
                      <input
                        type="email"
                        name="email"
                        value={reserveForm.email}
                        onChange={handleReservaChange}
                        required
                        className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/50 focus:outline-none"
                        disabled={!user}
                      />
                    </label>
                  </div>
                  <label className="text-sm font-semibold text-gray-700 flex flex-col gap-2">
                    <span>Teléfono</span>
                    <input
                      name="telefono"
                      value={reserveForm.telefono}
                      onChange={handleReservaChange}
                      className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/50 focus:outline-none"
                      disabled={!user}
                    />
                  </label>
                  <label className="text-sm font-semibold text-gray-700 flex flex-col gap-2">
                    <span>Cuéntanos más detalles</span>
                    <textarea
                      name="mensaje"
                      value={reserveForm.mensaje}
                      onChange={handleReservaChange}
                      rows={4}
                      className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/50 focus:outline-none"
                      placeholder="Fechas, estilo, presupuesto aproximado..."
                      disabled={!user}
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={addButtonDisabled}
                    className="w-full bg-brand-primary text-white rounded-xl py-3 font-semibold hover:-translate-y-0.5 hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {!user ? 'Inicia sesión para continuar' : isAdding ? 'Guardando...' : 'Agregar al carrito'}
                  </button>
                  <p className="text-sm" aria-live="polite">
                    {cartStatus === 'success' && (
                      <span className="text-green-600">
                        ¡Listo! El servicio se añadió a tu carrito.{' '}
                        <button type="button" onClick={() => navigate('/cart')} className="underline">
                          Ver carrito
                        </button>
                      </span>
                    )}
                    {cartStatus === 'error' && (
                      <span className="text-red-600">No pudimos guardar tu selección. Intenta nuevamente.</span>
                    )}
                  </p>
                </form>
              </div>

              {service.contact && (
                <div className="rounded-3xl border border-gray-100 p-6 space-y-3 shadow-sm">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Anfitrión</p>
                  <h4 className="text-lg font-semibold text-gray-900">{service.contact.host}</h4>
                  <p className="text-sm text-gray-500">Coordinador del servicio</p>
                  <button className="text-sm font-semibold text-brand-primary">Ver perfil</button>
                </div>
              )}

              {(service.contact || service.social) && (
                <div className="rounded-3xl border border-gray-100 p-6 space-y-4 shadow-sm">
                  <h4 className="font-semibold text-gray-900">Contacto rápido</h4>
                  <div className="space-y-3 text-sm text-gray-600">
                    {service.contact && (
                      <>
                        <p className="flex items-center gap-2">
                          <FiPhone className="text-brand-primary" /> {service.contact.phone}
                        </p>
                        <p className="flex items-center gap-2">
                          <FiMail className="text-brand-primary" /> {service.contact.email}
                        </p>
                      </>
                    )}
                    {service.social && (
                      <div className="flex flex-wrap gap-2">
                        {service.social.map((social) => {
                          const Icon = socialIcons[social.icon] || FiInstagram;
                          return (
                            <span key={social.label} className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-gray-600 text-xs font-semibold">
                              <Icon />
                              {social.label}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}

function formatPeruDate(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function CalendarView({
  calendar,
  price,
  month,
  onPrev,
  onNext,
  availableDates,
  availabilityMode,
  onDateSelect,
}: {
  calendar: (number | null)[];
  price: number;
  month: Date;
  onPrev: () => void;
  onNext: () => void;
  availableDates: Set<string>;
  availabilityMode?: ServiceData['availabilityMode'];
  onDateSelect?: (iso: string) => void;
}) {
  const weeks = [];
  for (let i = 0; i < calendar.length; i += 7) {
    weeks.push(calendar.slice(i, i + 7));
  }
  const monthLabel = month.toLocaleString('es-PE', { month: 'long', year: 'numeric' });
  const isManual = availabilityMode === 'MANUAL';

  return (
    <div className="rounded-3xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <button
          className="p-2 rounded-full border border-gray-200 text-gray-500 hover:text-brand-primary"
          onClick={onPrev}
          aria-label="Mes anterior"
        >
          <FiChevronLeft />
        </button>
        <div className="text-center">
          <p className="text-sm text-gray-500 capitalize">{monthLabel}</p>
          <p className="text-xl font-semibold text-gray-900">Disponibilidad</p>
        </div>
        <button
          className="p-2 rounded-full border border-gray-200 text-gray-500 hover:text-brand-primary"
          onClick={onNext}
          aria-label="Mes siguiente"
        >
          <FiChevronRight />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold text-gray-500">
        {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-2 text-center text-sm">
        {weeks.map((week, idx) => (
          <Fragment key={idx}>
            {week.map((day, index) => {
              if (!day) return <div key={`${idx}-${index}`} />;
              const isoKey = formatDateKey(month.getFullYear(), month.getMonth(), day);
              const indicator = renderAvailabilityIndicator(
                month.getFullYear(),
                month.getMonth(),
                day,
                availableDates,
                isManual,
                price,
              );
              const isAvailable = !isManual || availableDates.has(isoKey);
              const hasHandler = typeof onDateSelect === 'function';
              const canSelect = hasHandler && isAvailable;
              return (
                <button
                  type="button"
                  key={`${idx}-${index}`}
                  className={`border border-gray-100 rounded-xl py-3 flex flex-col items-center justify-center text-xs transition ${
                    canSelect ? 'hover:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40 cursor-pointer' : 'cursor-not-allowed opacity-60'
                  }`}
                  onClick={canSelect ? () => onDateSelect(isoKey) : undefined}
                  disabled={!canSelect}
                >
                  <span className="text-gray-700">{day}</span>
                  {indicator}
                </button>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function AddReviewForm({ serviceId }: { serviceId: string }) {
  const queryClient = useQueryClient();
  const [ratings, setRatings] = useState<Record<string, number>>(() =>
    reviewCriteria.reduce((acc, key) => ({ ...acc, [key]: 0 }), {}),
  );
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [comentario, setComentario] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleRating = (criterion: string, value: number) => {
    setRatings((prev) => ({ ...prev, [criterion]: value }));
    setStatus('idle');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    const valores = Object.values(ratings).filter((n) => n > 0);
    const avg = valores.length ? Math.round(valores.reduce((a, b) => a + b, 0) / valores.length) : 0;
    if (!avg || !comentario.trim() || !nombre.trim()) {
      setStatus('error');
      return;
    }
    setSubmitting(true);
    setStatus('idle');
    try {
      await api.post(`/api/servicios/${serviceId}/opiniones`, {
        rating: avg,
        comentario: comentario.trim(),
        nombre: nombre.trim(),
        email: email.trim() || undefined,
      });
      setStatus('success');
      setComentario('');
      setNombre('');
      setEmail('');
      setRatings(reviewCriteria.reduce((acc, key) => ({ ...acc, [key]: 0 }), {}));
      queryClient.invalidateQueries({ queryKey: ['servicio', serviceId] });
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4" onSubmit={handleSubmit}>
      <h3 className="text-xl font-semibold text-gray-900">Anadir opinion</h3>
      <p className="text-sm text-gray-500">Tu correo no sera publicado. Todos los campos marcados con * son obligatorios.</p>
      {reviewCriteria.map((criterion) => (
        <div key={criterion} className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <span className="w-48 font-semibold">{criterion} *</span>
          <div className="flex gap-1 text-yellow-500">
            {Array.from({ length: 5 }).map((_, idx) => {
              const value = idx + 1;
              const active = value <= (ratings[criterion] || 0);
              return (
                <button
                  type="button"
                  key={`${criterion}-${value}`}
                  onClick={() => handleRating(criterion, value)}
                  className="focus:outline-none"
                  aria-label={`${criterion} ${value} estrellas`}
                >
                  <FiStar className={`text-xl transition ${active ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="text-sm font-semibold text-gray-700">
          Nombre *
          <input
            type="text"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              setStatus('idle');
            }}
            required
            className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-brand-primary/50 focus:outline-none"
          />
        </label>
        <label className="text-sm font-semibold text-gray-700">
          Email *
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setStatus('idle');
            }}
            required
            className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-brand-primary/50 focus:outline-none"
          />
        </label>
      </div>
      <label className="text-sm font-semibold text-gray-700">
        Comentario *
        <textarea
          rows={4}
          value={comentario}
          onChange={(e) => {
            setComentario(e.target.value);
            setStatus('idle');
          }}
          required
          className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-brand-primary/50 focus:outline-none"
        />
      </label>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
        <label className="inline-flex items-center gap-2 text-gray-600">
          <input type="checkbox" className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
          Verifica que eres un ser humano
        </label>
        <label className="inline-flex items-center gap-2 text-gray-600">
          <input type="checkbox" className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
          Guardar mi informacion para la proxima vez
        </label>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="bg-brand-primary text-white rounded-xl px-6 py-3 font-semibold hover:-translate-y-0.5 hover:shadow-lg transition disabled:opacity-60"
        >
          {submitting ? 'Enviando...' : 'Enviar comentario'}
        </button>
        {status === 'success' && <span className="text-green-600 text-sm">Gracias por tu opinion.</span>}
        {status === 'error' && <span className="text-red-600 text-sm">Completa los campos obligatorios.</span>}
      </div>
    </form>
  );
}

function buildCalendarGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const start = firstDay.getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < start; i += 1) days.push(null);
  for (let day = 1; day <= totalDays; day += 1) days.push(day);
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function renderAvailabilityIndicator(
  year: number,
  monthIndex: number,
  day: number,
  availableDates: Set<string>,
  isManual: boolean,
  price: number,
) {
  const key = formatDateKey(year, monthIndex, day);
  const isAvailable = isManual ? availableDates.has(key) : true;
  if (!isAvailable) {
    return <span className="mt-1 text-[11px] font-semibold text-gray-300">No disp.</span>;
  }
  return <span className="mt-1 text-green-600 font-semibold text-[11px]">S/{price.toFixed(2)}</span>;
}

function formatDateKey(year: number, monthIndex: number, day: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function normalizeDateString(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return formatDateKey(date.getFullYear(), date.getMonth(), date.getDate());
}

function addMonths(date: Date, amount: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + amount);
  return next;
}
