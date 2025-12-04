import api from './client';
import type { ServiceData } from '../types/service';

export async function fetchServices() {
  const { data } = await api.get<ServiceData[]>('/api/servicios');
  return data;
}

export async function fetchService(idOrSlug: string) {
  const { data } = await api.get<ServiceData>(`/api/servicios/${idOrSlug}`);
  return data;
}
