import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';

type PublicNavbarProps = {
  activeSection?: string;
  mode?: 'landing' | 'external';
  ctaTo?: string;
  ctaLabel?: string;
};

const navLinks = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'nosotros', label: 'Nosotros' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'galeria', label: 'Galeria' },
  { id: 'contacto', label: 'Contacto' },
];

export default function PublicNavbar({
  activeSection,
  mode = 'landing',
  ctaTo = '/servicios',
  ctaLabel = 'Hacer reserva',
}: PublicNavbarProps) {
  const hrefFor = (id: string) => (mode === 'landing' ? `#${id}` : `/#${id}`);

  return (
    <header className="w-full border-b sticky top-0 z-[2000] bg-white/90 backdrop-blur">
      <div className="grid grid-cols-3 items-center w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 h-20">
        <nav className="hidden md:flex items-center gap-6 justify-end text-sm lg:text-base whitespace-nowrap font-mont uppercase tracking-wide">
          {navLinks.slice(0, 3).map((link) => (
            <a
              key={link.id}
              href={hrefFor(link.id)}
              className={`pb-0.5 transition-all ${
                activeSection === link.id
                  ? 'text-brand-primary border-b-2 border-brand-primary'
                  : 'text-gray-800 hover:text-brand-primary link-underline-animate hover:-translate-y-0.5'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="justify-self-center">
          <Link to="/" className="flex items-center">
            <BrandLogo className="h-20 w-auto" src="/brand/home-logo.png" alt="Eventos Peru" />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6 justify-start text-sm lg:text-base whitespace-nowrap font-mont uppercase tracking-wide">
          {navLinks.slice(3).map((link) => (
            <a
              key={link.id}
              href={hrefFor(link.id)}
              className={`hidden md:inline pb-0.5 transition-all ${
                activeSection === link.id
                  ? 'text-brand-primary border-b-2 border-brand-primary'
                  : 'text-gray-800 hover:text-brand-primary link-underline-animate hover:-translate-y-0.5'
              }`}
            >
              {link.label}
            </a>
          ))}
          <Link
            to={ctaTo}
            className="hidden md:inline px-3 py-1.5 rounded-md bg-brand-primary text-white transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
