import api from './client';

export type ReservaPayload = {
  origen: string;
  nombre: string;
  email: string;
  telefono?: string;
  tipoEvento?: string;
  mensaje?: string;
  fechaEvento?: string | null;
  invitados?: number;
  servicioId?: string;
  servicioNombre?: string;
  cartItemIds?: string[];
};

export async function crearReserva(payload: ReservaPayload) {
  const body = {
    ...payload,
    fechaEvento: payload.fechaEvento || null,
    telefono: payload.telefono || undefined,
    tipoEvento: payload.tipoEvento || undefined,
    mensaje: payload.mensaje || undefined,
    servicioId: payload.servicioId || undefined,
    servicioNombre: payload.servicioNombre || undefined,
    invitados: typeof payload.invitados === 'number' ? payload.invitados : undefined,
    cartItemIds: payload.cartItemIds && payload.cartItemIds.length ? payload.cartItemIds : undefined,
  };
  const { data } = await api.post('/api/reservas', body);
  return data;
}
