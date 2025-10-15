import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) {
      document.addEventListener('keydown', onKey);
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', onKey);
        document.body.style.overflow = prev;
      };
    }
  }, [open, onClose]);

  if (!open) return null;

  const maxW = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[size];

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-start md:items-center justify-center p-4 md:p-6">
        <div className={`w-full ${maxW} bg-white rounded-xl shadow-xl overflow-hidden animate-[modalIn_.18s_ease-out]`} role="dialog" aria-modal="true">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <h3 className="font-semibold">{title}</h3>
            <button onClick={onClose} aria-label="Cerrar" className="h-8 w-8 grid place-items-center rounded hover:bg-gray-200">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="M6 6l12 12"/></svg>
            </button>
          </div>
          <div className="p-4 md:p-6">
            {children}
          </div>
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity: .7; transform: translateY(6px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1);} }`}</style>
    </div>,
    document.body
  );
}

