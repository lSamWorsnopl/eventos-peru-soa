import { useState, useEffect, type ChangeEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import PublicNavbar from '../components/PublicNavbar';
import { useCart } from '../cart/CartContext';
import { crearReserva } from '../api/reservas';

const initialCheckout = {
  nombre: '',
  email: '',
  telefono: '',
  mensaje: '',
};

export default function CartPage() {
  const { cart, isLoading, isMutating, removeItem, clear, refreshCart } = useCart();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [checkout, setCheckout] = useState(initialCheckout);

  const reservaMutation = useMutation({
    mutationFn: async () => {
      if (!selectedIds.length) throw new Error('Debe seleccionar al menos un servicio.');
      return crearReserva({
        origen: 'cart-checkout',
        nombre: checkout.nombre.trim(),
        email: checkout.email.trim(),
        telefono: checkout.telefono.trim() || undefined,
        mensaje: checkout.mensaje.trim() || undefined,
        servicioNombre: 'Carrito personalizado',
        cartItemIds: selectedIds,
      });
    },
    onSuccess: () => {
      setSelectedIds([]);
      setCheckout(initialCheckout);
      refreshCart();
    },
  });

  const toggleSelect = (itemId: string) => {
    setSelectedIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
    );
  };

  const allSelected = cart?.items?.length ? selectedIds.length === cart.items.length : false;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCheckout((prev) => ({ ...prev, [name]: value }));
  };

  const disabledCheckout =
    reservaMutation.isPending ||
    isMutating ||
    !selectedIds.length ||
    !checkout.nombre.trim() ||
    !checkout.email.trim();

  useEffect(() => {
    if (!cart?.items) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds((prev) => prev.filter((id) => cart.items?.some((item) => item.itemId === id)));
  }, [cart]);

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900">
      <PublicNavbar mode="external" activeSection="servicios" showAuthActions />

      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Tu carrito</h1>
          <p className="text-gray-600">Selecciona los servicios que deseas confirmar para tu evento.</p>
        </header>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <p className="font-semibold">Servicios guardados</p>
              <p className="text-sm text-gray-500">
                {isLoading ? 'Cargando...' : `${cart?.items?.length || 0} elemento(s)`}
              </p>
            </div>
            {cart?.items?.length ? (
              <button
                type="button"
                onClick={() => {
                  if (allSelected) {
                    setSelectedIds([]);
                  } else {
                    setSelectedIds(cart.items.map((item) => item.itemId));
                  }
                }}
                className="text-sm font-semibold text-brand-primary"
              >
                {allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
              </button>
            ) : null}
          </div>

          <div className="divide-y divide-gray-100">
            {cart?.items?.length ? (
              cart.items.map((item) => (
                <div key={item.itemId} className="flex flex-col md:flex-row md:items-center gap-4 px-6 py-4">
                  <label className="flex items-start gap-3 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.itemId)}
                      onChange={() => toggleSelect(item.itemId)}
                      className="mt-1 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                    />
                    <div>
                      <p className="font-semibold">{item.servicioNombre || 'Servicio sin nombre'}</p>
                      <p className="text-sm text-gray-500">
                        {item.tipoEvento || 'Sin categoría'} •{' '}
                        {item.fechaEvento ? new Date(item.fechaEvento).toLocaleDateString() : 'Fecha por definir'}
                      </p>
                      {item.mensaje && <p className="text-sm text-gray-600 mt-1">{item.mensaje}</p>}
                    </div>
                  </label>
                  <div className="flex items-center gap-3">
                    {item.priceFrom && (
                      <span className="text-sm font-semibold text-gray-700">S/{item.priceFrom.toFixed(2)}</span>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        await removeItem(item.itemId);
                        setSelectedIds((prev) => prev.filter((id) => id !== item.itemId));
                      }}
                      disabled={isMutating}
                      className="text-sm text-red-500 hover:text-red-600 disabled:opacity-50"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="px-6 py-8 text-center text-gray-500">
                {isLoading ? 'Cargando carrito...' : 'Aún no tienes servicios guardados.'}
              </p>
            )}
          </div>

          {cart?.items?.length ? (
            <div className="px-6 py-4 border-t border-gray-100 flex justify-between text-sm text-gray-600">
              <span>{selectedIds.length} seleccionado(s)</span>
              <button
                type="button"
                onClick={async () => {
                  await clear();
                  setSelectedIds([]);
                }}
                disabled={isMutating}
                className="text-red-500 font-semibold hover:text-red-600 disabled:opacity-50"
              >
                Vaciar carrito
              </button>
            </div>
          ) : null}
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-4">Confirmar reserva</h2>
          <p className="text-sm text-gray-500 mb-6">
            Completa tus datos de contacto y confirma la reserva de los servicios seleccionados.
          </p>

          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              reservaMutation.mutate();
            }}
          >
            <div className="grid md:grid-cols-2 gap-4">
              <label className="text-sm font-semibold text-gray-700">
                Nombre completo *
                <input
                  name="nombre"
                  value={checkout.nombre}
                  onChange={handleInputChange}
                  required
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
                />
              </label>
              <label className="text-sm font-semibold text-gray-700">
                Email *
                <input
                  type="email"
                  name="email"
                  value={checkout.email}
                  onChange={handleInputChange}
                  required
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
                />
              </label>
            </div>
            <label className="text-sm font-semibold text-gray-700">
              Teléfono
              <input
                name="telefono"
                value={checkout.telefono}
                onChange={handleInputChange}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
              />
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Mensaje adicional
              <textarea
                name="mensaje"
                value={checkout.mensaje}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
              />
            </label>

            <button
              type="submit"
              disabled={disabledCheckout}
              className="mt-2 inline-flex items-center justify-center px-4 py-3 rounded-lg bg-brand-primary text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {reservaMutation.isPending ? 'Enviando...' : 'Confirmar reserva seleccionada'}
            </button>
            {reservaMutation.isError && (
              <p className="text-sm text-red-600">No se pudo confirmar la reserva. Revisa los datos e intenta otra vez.</p>
            )}
            {reservaMutation.isSuccess && (
              <p className="text-sm text-green-600">¡Recibimos tu solicitud! Te escribiremos pronto.</p>
            )}
          </form>
        </section>
      </main>
    </div>
  );
}
