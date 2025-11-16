import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import {
  FiFilter,
  FiGrid,
  FiMap,
  FiHeart,
  FiStar,
  FiChevronRight,
  FiMapPin,
  FiCoffee,
  FiHome,
  FiScissors,
  FiFeather,
  FiLayers,
  FiBookOpen,
  FiMonitor,
  FiCheckCircle,
} from 'react-icons/fi';
import PublicNavbar from '../components/PublicNavbar';
import type { ServiceData } from '../data/services';
import { servicesData } from '../data/services';
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

const categories = [
  { id: 'todos', label: 'Todos', icon: FiGrid },
  { id: 'Animación y entretenimiento', label: 'Animación y entretenimiento', icon: FiFeather },
  { id: 'Alojamientos', label: 'Alojamientos', icon: FiHome },
  { id: 'Belleza y moda', label: 'Belleza y moda', icon: FiScissors },
  { id: 'Catering y bebidas', label: 'Catering y bebidas', icon: FiCoffee },
  { id: 'Decoración y ambientación', label: 'Decoración y ambientación', icon: FiLayers },
  { id: 'Espacios y locaciones', label: 'Espacios y locaciones', icon: FiBookOpen },
  { id: 'Invitaciones y recuerdos', label: 'Invitaciones y recuerdos', icon: FiMonitor },
  { id: 'Organización y planificación', label: 'Organización y planificación', icon: FiFilter },
  { id: 'Tecnología y sonido', label: 'Tecnología y sonido', icon: FiMonitor },
];

const statusColor: Record<string, string> = {
  Abierto: 'bg-green-100 text-green-700',
  Cerrado: 'bg-red-100 text-red-600',
};

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const filteredServices = useMemo(() => {
    if (selectedCategory === 'todos') return servicesData;
    return servicesData.filter((service) => service.categories.includes(selectedCategory));
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900">
      <PublicNavbar mode="external" activeSection="servicios" />
      <section className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-20 py-10">
        <header className="flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full bg-white shadow-sm hover:shadow-md transition text-sm font-semibold">
                <FiFilter className="text-brand-primary" />
                Mostrar filtros
              </button>
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                <button className="p-2 rounded-full border border-gray-200 bg-white text-brand-primary">
                  <FiGrid />
                </button>
                <button className="p-2 rounded-full border border-gray-200 bg-white text-gray-400">
                  <FiMap />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              Ordenar:
              <button className="font-semibold text-brand-primary inline-flex items-center gap-1">
                Mejor resultado
                <FiChevronRight className="text-xs" />
              </button>
            </div>
          </div>
          <div className="flex items-center overflow-x-auto gap-3 pb-3">
            {categories.map(({ id, label, icon: Icon }) => {
              const isActive = selectedCategory === id;
              return (
                <button
                  key={id}
                  onClick={() => setSelectedCategory(id)}
                  className={`flex flex-col items-center justify-center min-w-[120px] px-4 py-2 rounded-2xl border text-xs font-semibold transition ${
                    isActive ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' : 'bg-white border-gray-200 text-gray-700 hover:border-brand-primary/60'
                  }`}
                >
                  <Icon className="text-lg mb-1" />
                  <span className="text-center leading-tight">{label}</span>
                </button>
              );
            })}
          </div>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-5 pb-10">
            {filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
          <aside
            className="hidden lg:block sticky top-28 self-start"
            style={{ height: 'calc(100vh - 150px)' }}
          >
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
              <div className="p-4 border-b border-gray-100 text-sm text-gray-500">
                <span className="font-semibold text-gray-900">{filteredServices.length}</span> listados
                disponibles
              </div>
              <div className="relative flex-1" style={{ height: 'calc(100vh - 210px)' }}>
                <MapContainer
                  center={[-12.4634, -76.8544]}
                  zoom={5}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {filteredServices.map((service) => (
                    <Marker
                      position={[service.coordinates.lat, service.coordinates.lng]}
                      key={service.id}
                      icon={defaultMarker}
                    >
                      <Popup>
                        <div className="text-sm">
                          <p className="font-semibold text-gray-900">{service.name}</p>
                          <p className="text-gray-500">{service.city}</p>
                          <Link to={`/servicios/${service.id}`} className="text-brand-primary text-xs font-semibold">
                            Ver detalle
                          </Link>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
                <button className="absolute top-4 right-4 z-20 bg-white/95 text-xs font-semibold px-4 py-2 rounded-full shadow hover:shadow-md">
                  Mostrar los siguientes {filteredServices.length} listados
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ service }: { service: ServiceData }) {
  return (
    <article className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition overflow-hidden">
      <div className="grid md:grid-cols-2 gap-0">
        <div className="relative">
          <img
            src={service.heroImage}
            alt={service.name}
            className="h-full w-full object-cover min-h-[240px]"
            loading="lazy"
          />
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {service.categories.map((category) => (
                  <span
                    key={category}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary shadow-sm"
                  >
                {category}
              </span>
            ))}
          </div>
          <button className="absolute top-4 right-4 p-2 rounded-full bg-white/90 hover:bg-white text-brand-primary transition">
            <FiHeart />
          </button>
          {service.tags.includes('Destacado') && (
            <span className="absolute bottom-4 left-4 bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">
              Destacado
            </span>
          )}
          <span
            className={`absolute bottom-4 right-4 text-xs font-semibold px-3 py-1 rounded-full ${statusColor[service.status] || 'bg-gray-100 text-gray-600'}`}
          >
            {service.status}
          </span>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <FiMapPin className="text-brand-primary" />
              {service.address} — {service.city}
            </p>
            <Link
              to={`/servicios/${service.id}`}
              className="mt-1 inline-flex items-center gap-2 text-2xl font-semibold text-gray-900 hover:text-brand-primary transition"
            >
              {service.name}
              <FiChevronRight className="text-base" />
            </Link>
            <p className="text-sm text-gray-500">{service.subtitle}</p>
          </div>
          <p className="text-gray-600 text-sm max-h-[3.8rem] overflow-hidden">{service.summary}</p>

          <div className="flex flex-wrap gap-2">
            {service.amenities.slice(0, 5).map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600"
              >
                <FiCheckCircle className="text-brand-primary" />
                {amenity}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm">
              <FiStar className="text-yellow-500" />
              <div>
                <span className="font-semibold text-gray-900">{service.rating.toFixed(1)}</span>{' '}
                <span className="text-gray-500">({service.reviews} reseñas)</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Comienza desde</p>
              <p className="text-lg font-semibold text-brand-primary">S/{service.priceFrom.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
