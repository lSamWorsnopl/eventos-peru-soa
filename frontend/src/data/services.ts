export type ServiceStatus = 'Abierto' | 'Cerrado';

export interface ServiceSocial {
  label: string;
  icon: 'facebook' | 'instagram' | 'whatsapp' | 'tiktok';
  handle: string;
}

export interface ServiceData {
  id: string;
  name: string;
  subtitle: string;
  categories: string[];
  tags: string[];
  status: ServiceStatus;
  address: string;
  city: string;
  priceFrom: number;
  rating: number;
  reviews: number;
  description: string;
  summary: string;
  services: string[];
  events: string[];
  amenities: string[];
  heroImage: string;
  gallery: string[];
  coordinates: { lat: number; lng: number };
  contact: {
    phone: string;
    email: string;
    host: string;
  };
  social: ServiceSocial[];
}

export const servicesData: ServiceData[] = [
  {
    id: 'bartender-pro',
    name: 'BARTENDER PRO',
    subtitle: 'Coctelería Móvil y Mixología Creativa',
    categories: ['Catering y bebidas'],
    tags: ['Destacado', 'Tacna'],
    status: 'Abierto',
    address: 'Calle 2 de diciembre',
    city: 'Tacna, Perú',
    priceFrom: 50,
    rating: 4.8,
    reviews: 18,
    description:
      'Bartender Pro es una empresa especializada en coctelería móvil para eventos sociales, corporativos y culturales. Combinamos técnica con show para ofrecer barras temáticas, coctelería molecular y experiencias líquidas memorables.',
    summary:
      'Ofrecemos barras clásicas, mixología molecular y experiencias personalizadas con bartenders uniformados y cristalería premium.',
    services: [
      'Barra clásica premium',
      'Mixología molecular',
      'Coctelería temática',
      'Menaje y cristalería incluida',
    ],
    events: [
      'Bodas',
      'Cumpleaños',
      'Aniversarios',
      'Fiestas privadas',
      'Despedidas',
      'Eventos corporativos',
    ],
    amenities: ['Personal uniformado', 'Transporte', 'Montaje', 'Menaje premium'],
    heroImage:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1447078806655-40579c2520d6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1447078806655-40579c2520d6?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: { lat: -18.0066, lng: -70.2463 },
    contact: { phone: '+51 913 876 535', email: 'hola@bartenderpro.pe', host: 'Evie' },
    social: [
      { label: 'Facebook', icon: 'facebook', handle: '@bartenderpro' },
      { label: 'WhatsApp', icon: 'whatsapp', handle: '+51 913 876 535' },
      { label: 'TikTok', icon: 'tiktok', handle: '@bartenderpro' },
    ],
  },
  {
    id: 'ritmo-pasion',
    name: 'Academia Ritmo & Pasión',
    subtitle: 'Shows coreográficos y animación',
    categories: ['Animación y entretenimiento'],
    tags: ['Servicios', 'Cerrado'],
    status: 'Cerrado',
    address: 'Dirección amigable',
    city: 'Arequipa, Perú',
    priceFrom: 25,
    rating: 4.6,
    reviews: 12,
    description:
      'Nuestro staff de bailarines profesionales crea shows dinámicos con vestuario temático, coreografías personalizadas y animación participativa.',
    summary: 'Shows coreográficos personalizables para aperturas, vals y fiestas temáticas.',
    services: ['Vals personalizado', 'Flashmob', 'Animación interactiva', 'Shows temáticos'],
    events: ['Bodas', 'Quinceañeros', 'Graduaciones', 'Eventos corporativos'],
    amenities: ['Vestuario propio', 'Coreógrafo', 'Ensayos', 'Transporte'],
    heroImage:
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1472653431158-6364773b2a56?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1453090927415-5f45085b65c0?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: { lat: -16.4041, lng: -71.5562 },
    contact: { phone: '+51 912 222 333', email: 'contacto@ritmopasion.pe', host: 'Marcos' },
    social: [
      { label: 'Facebook', icon: 'facebook', handle: '@ritmopasion' },
      { label: 'Instagram', icon: 'instagram', handle: '@ritmopasion' },
    ],
  },
  {
    id: 'kapkas-studio',
    name: 'Kapkas Studio',
    subtitle: 'Espacios y locaciones para eventos',
    categories: ['Espacios y locaciones'],
    tags: ['Espacios y locaciones'],
    status: 'Abierto',
    address: 'Jr. Cnel. Miguel Gamarra 100',
    city: 'Lima, Perú',
    priceFrom: 120,
    rating: 4.7,
    reviews: 24,
    description:
      'Locación boutique con salones modulares, áreas verdes y servicio integral de coordinación.',
    summary: 'Espacio flexible para ceremonias íntimas y recepciones modernas.',
    services: ['Salón principal', 'Zona lounge', 'Coordinador onsite', 'Decoración base'],
    events: ['Bodas', 'Conferencias', 'Cocktails', 'Sesiones fotográficas'],
    amenities: ['Estacionamiento', 'Wifi', 'Climatización', 'Seguridad'],
    heroImage:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515168833906-d2a3b82b302a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520066391310-ffd4dbc0f389?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: { lat: -12.0901, lng: -77.0465 },
    contact: { phone: '+51 901 111 222', email: 'info@kapkasstudio.pe', host: 'María' },
    social: [
      { label: 'Instagram', icon: 'instagram', handle: '@kapkasstudio' },
      { label: 'Facebook', icon: 'facebook', handle: '@kapkasstudio' },
    ],
  },
  {
    id: 'bosque-hadas',
    name: 'Bosque de Hadas Eventos y Catering',
    subtitle: 'Experiencias gastronómicas y wedding planning',
    categories: ['Catering y bebidas', 'Organización y planificación'],
    tags: ['Destacado'],
    status: 'Cerrado',
    address: 'Bosque de Hadas Eventos, Cusco',
    city: 'Cusco, Perú',
    priceFrom: 460,
    rating: 4.9,
    reviews: 32,
    description:
      'Especialistas en bodas destino con menús creativos, ambientación floral y coordinación integral.',
    summary: 'Experiencia culinaria y wedding planning para bodas de ensueño.',
    services: ['Catering alta cocina', 'Decoración floral', 'Wedding planner', 'Pastelería'],
    events: ['Bodas', 'Bautizos', 'Eventos corporativos', 'Cenas privadas'],
    amenities: ['Chef ejecutivo', 'Personal completo', 'Transporte', 'Menaje premium'],
    heroImage:
      'https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1478145057713-7ffb8310d6b6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: { lat: -13.5319, lng: -71.9675 },
    contact: { phone: '+51 944 666 777', email: 'hola@bosquedehadas.pe', host: 'Ana' },
    social: [
      { label: 'Instagram', icon: 'instagram', handle: '@bosquedehadas' },
      { label: 'Facebook', icon: 'facebook', handle: '@bosquedehadas' },
      { label: 'WhatsApp', icon: 'whatsapp', handle: '+51 944 666 777' },
    ],
  },
  {
    id: 'andes-sounds',
    name: 'Andes Sounds',
    subtitle: 'Tecnología y sonido para eventos',
    categories: ['Tecnología y sonido'],
    tags: ['Tecnología'],
    status: 'Abierto',
    address: 'Av. Ejército 541',
    city: 'Arequipa, Perú',
    priceFrom: 80,
    rating: 4.4,
    reviews: 20,
    description:
      'Proveedor de sonido profesional, iluminación inteligente y estructuras para escenarios portátiles.',
    summary: 'Sonido, iluminación y staging para eventos medianos y masivos.',
    services: [
      'Line array completo',
      'Iluminación inteligente',
      'Escenarios modulares',
      'DJ booth & backline',
    ],
    events: ['Conciertos', 'Festivales', 'Lanzamientos', 'Conferencias'],
    amenities: ['Ingeniero de sonido', 'Transporte', 'Montaje y desmontaje'],
    heroImage:
      'https://images.unsplash.com/photo-1511376777868-611b54f68947?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1511376777868-611b54f68947?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1454922915609-78549ad709bb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1464375117522-1311d6a5b81c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: { lat: -16.3989, lng: -71.535 },
    contact: { phone: '+51 987 222 111', email: 'ventas@andessounds.pe', host: 'Diego' },
    social: [
      { label: 'Facebook', icon: 'facebook', handle: '@andessounds' },
      { label: 'WhatsApp', icon: 'whatsapp', handle: '+51 987 222 111' },
    ],
  },
  {
    id: 'sierra-host',
    name: 'Sierra Host Lodge',
    subtitle: 'Alojamiento boutique para eventos',
    categories: ['Alojamientos'],
    tags: ['Alojamientos', 'Experiencial'],
    status: 'Abierto',
    address: 'Carretera Cusco - Urubamba km 57',
    city: 'Urubamba, Perú',
    priceFrom: 210,
    rating: 4.5,
    reviews: 14,
    description:
      'Lodge boutique rodeado de montañas con suites cálidas, fogatas al aire libre y experiencias gastronómicas de kilómetro cero.',
    summary: 'Hospedaje exclusivo con 12 suites y terrazas panorámicas.',
    services: ['12 suites', 'Spa con vista', 'Experiencia gastronómica', 'Transporte privado'],
    events: ['Retreats', 'Bodas íntimas', 'Workations', 'Producciones'],
    amenities: ['Desayuno incluido', 'Piscina temperada', 'Coordinador onsite'],
    heroImage:
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505692794400-5e0ba0d56b16?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
    ],
    coordinates: { lat: -13.304, lng: -72.1167 },
    contact: { phone: '+51 933 888 777', email: 'hola@sierrahost.pe', host: 'Lucía' },
    social: [
      { label: 'Instagram', icon: 'instagram', handle: '@sierrahost' },
      { label: 'Facebook', icon: 'facebook', handle: '@sierrahost' },
    ],
  },
];

export function getServiceById(id: string) {
  return servicesData.find((item) => item.id === id);
}
