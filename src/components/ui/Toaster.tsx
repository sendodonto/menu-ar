'use client';
import { Check, CircleAlert } from 'lucide-react';
import { useToasts } from '@/store/toast';

export function Toaster() {
  const items = useToasts((s) => s.items);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+88px)] z-[60] flex flex-col items-center gap-2 px-4">
      {items.map((t) => (
        <div key={t.id} role="status" className="tile-set flex max-w-sm items-center gap-2.5 rounded-tile bg-ink px-4 py-3 text-sm text-glaze shadow-lift">
          {t.tone === 'ok' ? <Check size={16} className="text-[#c9d39a]" aria-hidden /> : <CircleAlert size={16} className="text-[#f0b9a6]" aria-hidden />}
          {t.message}
        </div>
      ))}
    </div>
  );
}
