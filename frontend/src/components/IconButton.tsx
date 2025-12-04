import Icon from './Icon';

type Variant = 'ghost' | 'primary' | 'danger';

export default function IconButton({
  icon,
  label,
  variant = 'ghost',
  onClick,
  className = '',
  disabled,
}: {
  icon: Parameters<typeof Icon>[0]['name'];
  label: string;
  variant?: Variant;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  const base = 'inline-flex items-center justify-center h-8 w-8 rounded transition focus:outline-none focus:ring-2 focus:ring-offset-1';
  const styles: Record<Variant, string> = {
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
    primary: 'text-white bg-brand-primary hover:brightness-110 focus:ring-brand-primary',
    danger: 'text-red-700 hover:bg-red-50 focus:ring-red-300',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${styles[variant]} ${className}`}
      title={label}
      aria-label={label}
      disabled={disabled}
    >
      <Icon name={icon as any} />
    </button>
  );
}

