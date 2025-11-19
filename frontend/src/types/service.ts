export type ServiceStatus = 'ABIERTO' | 'CERRADO';

export interface ServiceSchedule {
  day: string;
  open: string;
  close: string;
  note?: string;
}

export interface ServiceSocial {
  label: string;
  icon: string;
  handle: string;
}

export interface ServiceCoordinates {
  lat: number;
  lng: number;
}

export interface ServiceContact {
  phone: string;
  email: string;
  host: string;
}

export interface ServiceData {
  id: string;
  slug: string;
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
  schedule: ServiceSchedule[];
  heroImage: string;
  gallery: string[];
  coordinates?: ServiceCoordinates;
  contact?: ServiceContact;
  social?: ServiceSocial[];
  ownerUserId?: string | null;
  availableDates?: string[];
  availabilityMode?: 'FLEXIBLE' | 'MANUAL';
  statusMode?: 'MANUAL' | 'AUTO';
}
