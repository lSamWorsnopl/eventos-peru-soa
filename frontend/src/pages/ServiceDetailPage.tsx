import { Fragment, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
} from 'react-icons/fi';
import PublicNavbar from '../components/PublicNavbar';
import { getServiceById } from '../data/services';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png?url';
import markerIcon from 'leaflet/dist/images/marker-icon.png?url';
import markerShadow from 'leaflet/dist/images/marker-shadow.png?url';

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
  { id: 'descripcion', label: 'Descripción' },
  { id: 'galeria', label: 'Galería' },
  { id: 'ubicacion', label: 'Ubicación' },
  { id: 'opiniones', label: 'Añadir opinión' },
];

const socialIcons = {
  facebook: FiFacebook,
  instagram: FiInstagram,
  whatsapp: FiMessageCircle,
  tiktok: FiInstagram,
};

export default function ServiceDetailPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const service = serviceId ? getServiceById(serviceId) : undefined;
  const [activeTab, setActiveTab] = useState('descripcion');

  if (!service) {
    return (
      <div className="min-h-screen bg-slate-50 text-gray-900">
        <PublicNavbar mode="external" activeSection="servicios" />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <p className="text-2xl font-semibold mb-4">No encontramos el servicio solicitado.</p>
          <Link to="/servicios" className="text-brand-primary font-semibold hover:underline">
            Volver a la lista de servicios
          </Link>
        </div>
      </div>
    );
  }

  const calendar = useMemo(() => buildCalendarGrid(2025, 10), []);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <PublicNavbar mode="external" activeSection="servicios" />
      <main className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-20 py-8">
        <Link to="/servicios" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-primary transition">
          <FiArrowLeft />
          Volver a resultados
        </Link>

        <section className="mt-6 space-y-6">
          <div>
            <div className="flex flex-wrap gap-3 text-sm">
              {service.categories.map((category) => (
                <span key={category} className="px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary font-semibold">
                  {category}
                </span>
              ))}
              {service.tags.map((tag) => (
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
              <button className="ml-auto flex items-center gap-2 text-sm font-semibold text-brand-primary border border-brand-primary px-4 py-2 rounded-full hover:bg-brand-primary hover:text-white transition">
                <FiHeart />
                Guardar en favoritos
              </button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <img src={service.gallery[0]} alt={service.name} className="rounded-3xl object-cover w-full h-full min-h-[320px]" />
            <div className="grid grid-cols-2 gap-3">
              {service.gallery.slice(1, 5).map((image, idx) => (
                <img
                  key={`${image}-${idx}`}
                  src={image}
                  alt={service.name}
                  className="rounded-2xl object-cover w-full h-full min-h-[150px]"
                />
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
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Descripción general</h2>
                    <p className="text-gray-600 leading-relaxed">{service.description}</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Servicios principales</h3>
                      <ul className="space-y-2 text-gray-600">
                        {service.services.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <FiCheckCircle className="mt-1 text-brand-primary" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Eventos que cubre</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {service.events.map((event) => (
                          <span key={event} className="flex items-center gap-2 text-gray-600">
                            <FiCheckCircle className="text-brand-primary" />
                            {event}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Amenidades incluidas</h3>
                    <div className="flex flex-wrap gap-2">
                      {service.amenities.map((amenity) => (
                        <span key={amenity} className="px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700 font-medium">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'galeria' && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {service.gallery.map((image, idx) => (
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
                </div>
              )}

              {activeTab === 'opiniones' && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 p-6 rounded-3xl border border-gray-100 bg-slate-50">
                    <div>
                      <p className="text-sm text-gray-500">Calificación general</p>
                      <div className="flex items-center gap-2">
                        <span className="text-4xl font-bold text-gray-900">{service.rating.toFixed(1)}</span>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <FiStar
                              key={idx}
                              className={`text-xl ${idx < Math.round(service.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">{service.reviews} opiniones</p>
                    </div>
                  </div>
                  <AddReviewForm />
                </div>
              )}

              <section>
                <h3 className="text-xl font-semibold mb-3">Vista de Calendario</h3>
                <CalendarView calendar={calendar} price={service.priceFrom} />
              </section>
            </section>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Reserva</p>
                    <p className="text-2xl font-bold text-brand-primary">S/{service.priceFrom.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">por hora</p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                    No verificado
                  </span>
                </div>
                <form className="mt-6 space-y-4">
                  <label className="text-sm font-semibold text-gray-700 flex flex-col gap-2">
                    <span>Seleccionar fechas</span>
                    <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm">
                      <FiCalendar className="text-gray-400" />
                      <input type="text" placeholder="dd/mm/aaaa" className="flex-1 border-none focus:ring-0 focus:outline-none" />
                    </div>
                  </label>
                  <label className="text-sm font-semibold text-gray-700 flex flex-col gap-2">
                    <span>Invitados</span>
                    <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm">
                      <FiUsers className="text-gray-400" />
                      <select className="flex-1 border-none focus:ring-0 focus:outline-none bg-transparent">
                        <option>50 invitados</option>
                        <option>100 invitados</option>
                        <option>150 invitados</option>
                      </select>
                    </div>
                  </label>
                  <button type="button" className="w-full bg-brand-primary text-white rounded-xl py-3 font-semibold hover:-translate-y-0.5 hover:shadow-lg transition">
                    Solicitar Reserva
                  </button>
                </form>
              </div>

              <div className="rounded-3xl border border-gray-100 p-6 space-y-3 shadow-sm">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Anfitrión</p>
                <h4 className="text-lg font-semibold text-gray-900">{service.contact.host}</h4>
                <p className="text-sm text-gray-500">Coordinador del servicio</p>
                <button className="text-sm font-semibold text-brand-primary">Ver perfil</button>
              </div>

              <div className="rounded-3xl border border-gray-100 p-6 space-y-4 shadow-sm">
                <h4 className="font-semibold text-gray-900">Contacto rápido</h4>
                <div className="space-y-3 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <FiPhone className="text-brand-primary" /> {service.contact.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <FiMail className="text-brand-primary" /> {service.contact.email}
                  </p>
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
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}

function CalendarView({ calendar, price }: { calendar: (number | null)[]; price: number }) {
  const weeks = [];
  for (let i = 0; i < calendar.length; i += 7) {
    weeks.push(calendar.slice(i, i + 7));
  }

  return (
    <div className="rounded-3xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <button className="p-2 rounded-full border border-gray-200 text-gray-500 hover:text-brand-primary">
          <FiChevronLeft />
        </button>
        <div className="text-center">
          <p className="text-sm text-gray-500">November 2025</p>
          <p className="text-xl font-semibold text-gray-900">Disponibilidad</p>
        </div>
        <button className="p-2 rounded-full border border-gray-200 text-gray-500 hover:text-brand-primary">
          <FiChevronRight />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold text-gray-500">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-2 text-center text-sm">
        {weeks.map((week, idx) => (
          <Fragment key={idx}>
            {week.map((day, index) =>
              day ? (
                <div key={`${idx}-${index}`} className="border border-gray-100 rounded-xl py-3 flex flex-col items-center justify-center text-xs">
                  <span className="text-gray-700">{day}</span>
                  <span className="mt-1 text-green-600 font-semibold text-[11px]">S/{price.toFixed(2)}</span>
                </div>
              ) : (
                <div key={`${idx}-${index}`} />
              )
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function AddReviewForm() {
  return (
    <form className="rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
      <h3 className="text-xl font-semibold text-gray-900">Añadir opinión</h3>
      <p className="text-sm text-gray-500">Tu correo no será publicado. Todos los campos marcados con * son obligatorios.</p>
      {['Servicio', 'Relación calidad-precio', 'Ubicación', 'Limpieza'].map((criterion) => (
        <div key={criterion} className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <span className="w-48 font-semibold">{criterion}</span>
          <div className="flex gap-1 text-yellow-500">
            {Array.from({ length: 5 }).map((_, idx) => (
              <FiStar key={idx} />
            ))}
          </div>
        </div>
      ))}
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="text-sm font-semibold text-gray-700">
          Nombre *
          <input type="text" className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-brand-primary/50 focus:outline-none" />
        </label>
        <label className="text-sm font-semibold text-gray-700">
          Email *
          <input type="email" className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-brand-primary/50 focus:outline-none" />
        </label>
      </div>
      <label className="text-sm font-semibold text-gray-700">
        Comentario *
        <textarea rows={4} className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-brand-primary/50 focus:outline-none" />
      </label>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
        <label className="inline-flex items-center gap-2 text-gray-600">
          <input type="checkbox" className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
          Verifica que eres un ser humano
        </label>
        <label className="inline-flex items-center gap-2 text-gray-600">
          <input type="checkbox" className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
          Guardar mi información para la próxima vez
        </label>
      </div>
      <button type="button" className="bg-brand-primary text-white rounded-xl px-6 py-3 font-semibold hover:-translate-y-0.5 hover:shadow-lg transition">
        Enviar comentario
      </button>
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
