import api from './client';

export type CartItemInput = {
  servicioId?: string;
  servicioNombre: string;
  tipoEvento?: string;
  mensaje?: string;
  invitados?: number;
  fechaEvento?: string | null;
  priceFrom?: number;
  origen?: string;
};

export type CartItem = {
  itemId: string;
  servicioId?: string;
  servicioNombre?: string;
  tipoEvento?: string;
  mensaje?: string;
  invitados?: number;
  fechaEvento?: string | null;
  priceFrom?: number;
  origen?: string;
  addedAt?: string;
};

export type CartResponse = {
  id: string;
  userId: string;
  items: CartItem[];
  updatedAt?: string;
};

function normalizePayload(payload: CartItemInput) {
  return {
    ...payload,
    servicioId: payload.servicioId || undefined,
    tipoEvento: payload.tipoEvento || undefined,
    mensaje: payload.mensaje || undefined,
    invitados: typeof payload.invitados === 'number' ? payload.invitados : undefined,
    fechaEvento: payload.fechaEvento || null,
    priceFrom: typeof payload.priceFrom === 'number' ? payload.priceFrom : undefined,
    origen: payload.origen || undefined,
  };
}

export async function fetchCart() {
  const { data } = await api.get<CartResponse>('/api/cart', { skipAuthRedirect: true } as any);
  return data;
}

export async function addCartItem(payload: CartItemInput) {
  const { data } = await api.post<CartResponse>('/api/cart/items', normalizePayload(payload));
  return data;
}

export async function updateCartItem(itemId: string, payload: CartItemInput) {
  const { data } = await api.put<CartResponse>(`/api/cart/items/${itemId}`, normalizePayload(payload));
  return data;
}

export async function removeCartItem(itemId: string) {
  await api.delete(`/api/cart/items/${itemId}`);
}

export async function clearCart() {
  await api.delete('/api/cart');
}
