type BadgeColor = 'gray' | 'brand' | 'green' | 'yellow' | 'red';

export default function Badge({ color = 'gray', children, className = '' }: { color?: BadgeColor; children: React.ReactNode; className?: string }) {
  const styles: Record<BadgeColor, string> = {
    gray: 'bg-gray-100 text-gray-800 ring-gray-200',
    brand: 'bg-red-50 text-brand-primary ring-red-100',
    green: 'bg-green-50 text-green-700 ring-green-100',
    yellow: 'bg-amber-50 text-amber-700 ring-amber-100',
    red: 'bg-red-50 text-red-700 ring-red-100',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${styles[color]} ${className}`}>{children}</span>
  );
}

