import { useEffect, useMemo, useRef, useState } from 'react';
import PublicNavbar from '../components/PublicNavbar';

export default function LandingPage() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const [active, setActive] = useState('inicio');

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

  // autoplay con pausa en hover
  useEffect(() => {
    if (paused || !canSlide) return;
    const id = setInterval(() => slide(1), 5000);
    return () => clearInterval(id);
  }, [paused, page, canSlide]);

  // Resalte activo del navbar
  useEffect(() => {
    const ids = ['inicio', 'nosotros', 'servicios', 'galeria', 'contacto'];
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver((entries) => {
      const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target?.id) setActive(visible.target.id);
    }, { rootMargin: '-30% 0px -60% 0px', threshold: [0,0.25,0.5,0.75,1] });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <PublicNavbar activeSection={active} />

      {/* Hero / Inicio (3 en 3) */}
      <section id="inicio" className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-20 py-10">
        <div className="relative">
          <div className="overflow-hidden" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            <div ref={trackRef} className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${page * 100}%)` }}>
              {pages.map((group, gi) => (
                <div key={gi} className="shrink-0 grow-0 basis-full w-full">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {group.map((src, i) => (
                      <img key={`${gi}-${i}`} src={src} alt={`Hero ${gi * 3 + i + 1}`} className="w-full h-[60vh] object-cover rounded-lg bg-gray-100 transition-transform duration-300 hover:scale-[1.01]" onError={onImgError} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {canSlide && (
            <>
              <button aria-label="Anterior" onClick={() => slide(-1)} className="hidden sm:grid place-items-center absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 ring-1 ring-black/5 hover:ring-black/10 hover:bg-white shadow transition transform hover:scale-105 active:scale-95">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button aria-label="Siguiente" onClick={() => slide(1)} className="hidden sm:grid place-items-center absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 ring-1 ring-black/5 hover:ring-black/10 hover:bg-white shadow transition transform hover:scale-105 active:scale-95">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg>
              </button>
            </>
          )}

          {canSlide && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {pages.map((_, i) => (
                <button key={i} aria-label={`Ir a pagina ${i+1}`} onClick={() => setPage(i)} className={`h-2.5 w-2.5 rounded-full ${page===i?'bg-gray-900':'bg-gray-300'} transition`} />
              ))}
            </div>
          )}
        </div>
        <div className="text-center mt-8">
          <h1 className="text-3xl sm:text-4xl font-semibold">#ItsAllInTheDetails</h1>
          <p className="text-gray-600 mt-2">Event & Wedding Planner in Peru</p>
        </div>
      </section>

      {/* Nosotros */}
      <section id="nosotros" className="bg-gray-50 border-y">
        <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-20 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl font-semibold">Nosotros</h2>
            <p className="mt-4 text-gray-600 leading-relaxed">Creamos experiencias unicas y memorables para bodas y eventos corporativos. Nuestro equipo se encarga de cada detalle: diseno, logistica, proveedores y coordinacion integral.</p>
            <div className="mt-6 flex gap-3">
              <a href="#servicios" className="px-4 py-2 rounded-md bg-brand-primary text-white">Ver servicios</a>
              <a href="#contacto" className="px-4 py-2 rounded-md border">Contactanos</a>
            </div>
          </div>
          <img src="/landing/nosotros.png" alt="Nuestro equipo" className="rounded-lg object-cover w-full h-64 md:h-80 bg-gray-100" onError={onImgError} />
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-20 py-16">
        <h2 className="text-2xl font-semibold text-center">Servicios</h2>
        <p className="text-center text-gray-600 mt-2">Planeacion integral para que solo te preocupes por disfrutar.</p>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Bodas', desc: 'Diseno, logistica y coordinacion total.' },
            { title: 'Eventos corporativos', desc: 'Lanzamientos, conferencias y activaciones.' },
            { title: 'Decoracion y styling', desc: 'Ambientacion, flores, iluminacion y mas.' },
            { title: 'Catering y barra', desc: 'Menus personalizados y cocteleria.' },
            { title: 'Musica y entretenimiento', desc: 'DJs, bandas y performances.' },
            { title: 'Destination weddings', desc: 'Bodas en playa, campo o sierra.' },
          ].map((s) => (
            <div key={s.title} className="rounded-xl border p-6 hover:shadow-sm">
              <div className="h-12 w-12 rounded bg-brand-primary/10 text-brand-primary grid place-items-center text-lg font-bold">★</div>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="text-gray-600 mt-1 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Galeria */}
      <section id="galeria" className="bg-gray-50 border-y">
        <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-20 py-16">
          <h2 className="text-2xl font-semibold text-center">Galeria</h2>
          <p className="text-center text-gray-600 mt-2">Algunos momentos de nuestros eventos.</p>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map((i) => (
              <img key={i} src={`/landing/galeria-${i}.png`} alt={`Galeria ${i}`} className="w-full h-48 object-cover rounded-lg bg-gray-100" onError={onImgError} />
            ))}
          </div>
        </div>
      </section>

      {/* Contacto / Cotiza */}
      <section id="contacto" className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-20 py-16">
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-semibold">Contacto</h2>
            <p className="text-gray-600 mt-2">Cuentanos sobre tu evento y te enviaremos una cotizacion.</p>
            <ul className="mt-6 text-sm text-gray-700 space-y-2">
              <li><strong>WhatsApp:</strong> +51 999 999 999</li>
              <li><strong>Email:</strong> hola@eventosperu.com</li>
              <li><strong>Ubicacion:</strong> Lima, Peru</li>
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
                <label className="text-sm">Telefono</label>
                <input className="mt-1 w-full border rounded-md px-3 py-2" placeholder="+51 ..." />
              </div>
            </div>
            <div>
              <label className="text-sm">Tipo de evento</label>
              <select className="mt-1 w-full border rounded-md px-3 py-2">
                <option>Boda</option>
                <option>Corporativo</option>
                <option>Cumpleanos</option>
                <option>Otro</option>
              </select>
            </div>
            <div>
              <label className="text-sm">Mensaje</label>
              <textarea className="mt-1 w-full border rounded-md px-3 py-2 h-28" placeholder="Cuentanos fecha, invitados, estilo..." />
            </div>
            <button type="button" className="px-4 py-2 rounded-md bg-brand-primary text-white">Enviar solicitud</button>
          </form>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-gray-500">
        {String.fromCharCode(169)} {new Date().getFullYear()} Eventos Peru - Todos los derechos reservados.
      </footer>
    </div>
  );
}
