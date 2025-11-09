import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';

function PublicNavbar() {
  return (
    <header className="w-full border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
        <nav className="hidden md:flex items-center gap-6 text-sm whitespace-nowrap">
          <a href="#inicio" className="hover:text-brand-primary">Inicio</a>
          <a href="#nosotros" className="hover:text-brand-primary">Nosotros</a>
          <a href="#servicios" className="hover:text-brand-primary">Servicios</a>
        </nav>
        <div className="absolute inset-x-0 flex justify-center">
          <Link to="/" className="flex items-center">
            <BrandLogo className="h-14 w-14" src="/brand/home-logo.png" alt="Eventos Peru" />
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-6 text-sm whitespace-nowrap">
          <a href="#galeria" className="hidden md:inline hover:text-brand-primary">Galería</a>
          <a href="#contacto" className="hidden md:inline hover:text-brand-primary">Contacto</a>
          <a href="#cotiza" className="hidden md:inline px-3 py-1.5 rounded-md bg-brand-primary text-white">Hacer reserva</a>
          <Link to="/login" className="md:hidden text-sm px-3 py-1.5 rounded border">Ingresar</Link>
        </div>
      </div>
    </header>
  );
}

export default function LandingPage() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);

  const images = [
    '/landing/hero-1.png',
    '/landing/hero-2.png',
    '/landing/hero-3.png',
    '/landing/hero-4.png',
    '/landing/hero-5.png',
    '/landing/hero-6.png',
  ];

  const pages = useMemo(() => {
    const size = 3;
    const out: string[][] = [];
    for (let i = 0; i < images.length; i += size) out.push(images.slice(i, i + size));
    return out;
  }, [images]);

  const onImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.target as HTMLImageElement;
    if (!img.dataset.fallbackTried && /\.png(\?|$)/.test(img.src)) {
      img.dataset.fallbackTried = '1';
      img.src = img.src.replace(/\.png(\?|$)/, '.jpg$1');
      return;
    }
    img.src = 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1600&auto=format&fit=crop';
  };

  const canSlide = pages.length > 1;
  const slide = (dir: -1 | 1) => {
    if (!canSlide) return;
    setPage((p) => {
      const next = p + dir;
      if (next < 0) return pages.length - 1;
      if (next >= pages.length) return 0;
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <PublicNavbar />

      {/* Hero / Inicio (3 en 3) */}
      <section id="inicio" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="relative">
          <div className="overflow-hidden">
            <div
              ref={trackRef}
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${page * 100}%)` }}
            >
              {pages.map((group, gi) => (
                <div key={gi} className="shrink-0 grow-0 basis-full w-full">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {group.map((src, i) => (
                      <img
                        key={`${gi}-${i}`}
                        src={src}
                        alt={`Hero ${gi * 3 + i + 1}`}
                        className="w-full h-[60vh] object-cover rounded-lg bg-gray-100"
                        onError={onImgError}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {canSlide && (
            <>
              <button aria-label="Anterior" onClick={() => slide(-1)} className="hidden sm:grid place-items-center absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow">‹</button>
              <button aria-label="Siguiente" onClick={() => slide(1)} className="hidden sm:grid place-items-center absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow">›</button>
            </>
          )}
        </div>
        <div className="text-center mt-8">
          <h1 className="text-3xl sm:text-4xl font-semibold">#ItsAllInTheDetails</h1>
          <p className="text-gray-600 mt-2">Event & Wedding Planner in Peru</p>
        </div>
      </section>

      {/* Nosotros */}
      <section id="nosotros" className="bg-gray-50 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl font-semibold">Nosotros</h2>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Creamos experiencias únicas y memorables para bodas y eventos corporativos. Nuestro equipo se encarga de cada detalle: diseño, logística, proveedores y coordinación integral.
            </p>
            <div className="mt-6 flex gap-3">
              <a href="#servicios" className="px-4 py-2 rounded-md bg-brand-primary text-white">Ver servicios</a>
              <a href="#contacto" className="px-4 py-2 rounded-md border">Contáctanos</a>
            </div>
          </div>
          <img src="/landing/nosotros.png" alt="Nuestro equipo" className="rounded-lg object-cover w-full h-64 md:h-80 bg-gray-100" onError={onImgError} />
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-semibold text-center">Servicios</h2>
        <p className="text-center text-gray-600 mt-2">Planeación integral para que solo te preocupes por disfrutar.</p>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Bodas', desc: 'Diseño, logística y coordinación total.' },
            { title: 'Eventos corporativos', desc: 'Lanzamientos, conferencias y activaciones.' },
            { title: 'Decoración y styling', desc: 'Ambientación, flores, iluminación y más.' },
            { title: 'Catering y barra', desc: 'Menús personalizados y coctelería.' },
            { title: 'Música y entretenimiento', desc: 'DJs, bandas y performances.' },
            { title: 'Destination weddings', desc: 'Bodas en playa, campo o sierra.' },
          ].map((s) => (
            <div key={s.title} className="rounded-xl border p-6 hover:shadow-sm">
              <div className="h-12 w-12 rounded bg-brand-primary/10 text-brand-primary grid place-items-center text-lg font-bold">â˜…</div>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="text-gray-600 mt-1 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Galería */}
      <section id="galeria" className="bg-gray-50 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-semibold text-center">Galería</h2>
          <p className="text-center text-gray-600 mt-2">Algunos momentos de nuestros eventos.</p>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map((i) => (
              <img key={i} src={`/landing/galeria-${i}.png`} alt={`Galería ${i}`} className="w-full h-48 object-cover rounded-lg bg-gray-100" onError={onImgError} />
            ))}
          </div>
        </div>
      </section>

      {/* Contacto / Cotiza */}
      <section id="contacto" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-semibold">Contacto</h2>
            <p className="text-gray-600 mt-2">Cuéntanos sobre tu evento y te enviaremos una cotización.</p>
            <ul className="mt-6 text-sm text-gray-700 space-y-2">
              <li><strong>WhatsApp:</strong> +51 999 999 999</li>
              <li><strong>Email:</strong> hola@eventosperu.com</li>
              <li><strong>Ubicación:</strong> Lima, Perú</li>
            </ul>
          </div>
          <form id="cotiza" className="space-y-4">
            <div>
              <label className="text-sm">Nombre y apellido</label>
              <input className="mt-1 w-full border rounded-md px-3 py-2" placeholder="Tu nombre" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm">Email</label>
                <input className="mt-1 w-full border rounded-md px-3 py-2" placeholder="tucorreo@dominio.com" />
              </div>
              <div>
                <label className="text-sm">Teléfono</label>
                <input className="mt-1 w-full border rounded-md px-3 py-2" placeholder="+51 ..." />
              </div>
            </div>
            <div>
              <label className="text-sm">Tipo de evento</label>
              <select className="mt-1 w-full border rounded-md px-3 py-2">
                <option>Boda</option>
                <option>Corporativo</option>
                <option>Cumpleaños</option>
                <option>Otro</option>
              </select>
            </div>
            <div>
              <label className="text-sm">Mensaje</label>
              <textarea className="mt-1 w-full border rounded-md px-3 py-2 h-28" placeholder="Cuéntanos fecha, invitados, estilo..." />
            </div>
            <button type="button" className="px-4 py-2 rounded-md bg-brand-primary text-white">Enviar solicitud</button>
          </form>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Eventos Perú — Todos los derechos reservados.
      </footer>
    </div>
  );
}




