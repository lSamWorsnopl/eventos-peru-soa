import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import { FiShoppingCart, FiUser } from 'react-icons/fi';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../cart/CartContext';

type PublicNavbarProps = {
  activeSection?: string;
  mode?: 'landing' | 'external';
  ctaTo?: string;
  ctaLabel?: string;
  showAuthActions?: boolean;
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
  showAuthActions = false,
}: PublicNavbarProps) {
  const { user, logout } = useAuth();
  const { itemsCount } = useCart();
  const panelHref = user?.role === 'ADMIN' ? '/dashboard' : user?.role === 'PROVEEDOR' ? '/proveedor' : null;
  const hrefFor = (id: string) => (mode === 'landing' ? `#${id}` : `/#${id}`);

  return (
    <header className="w-full border-b sticky top-0 z-[2000] bg-white/90 backdrop-blur">
      <div className="relative flex items-center justify-center w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-10 h-20">
        <div className="flex items-center justify-center gap-6">
          <nav className="hidden md:flex items-center gap-5 text-sm lg:text-base whitespace-nowrap font-mont uppercase tracking-wide">
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

          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <BrandLogo className="h-20 w-auto" src="/brand/home-logo.png" alt="Eventos Peru" />
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-5 text-sm lg:text-base whitespace-nowrap font-mont uppercase tracking-wide">
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

        {showAuthActions && (
          <div className="hidden lg:flex items-center gap-3 absolute right-6 top-1/2 -translate-y-1/2">
            <Link
              to={user ? '/cart' : '/login'}
              className="relative inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 text-gray-600 hover:text-brand-primary transition"
            >
              <FiShoppingCart />
              <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-brand-primary text-white rounded-full h-4 w-4 flex items-center justify-center">
                {itemsCount}
              </span>
            </Link>
            {user ? (
              <>
                {panelHref && (
                  <Link
                    to={panelHref}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition"
                  >
                    <FiUser />
                    <span className="text-sm font-semibold">Panel</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:text-brand-primary transition"
                >
                  <FiUser />
                  <span className="text-sm font-semibold">Cerrar sesión</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:text-brand-primary transition"
              >
                <FiUser />
                <span className="text-sm font-semibold">Iniciar sesión</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
