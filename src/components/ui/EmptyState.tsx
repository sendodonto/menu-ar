import type { ReactNode } from 'react';
import { UtensilsCrossed } from 'lucide-react';

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <span className="mb-5 grid size-14 place-items-center rounded-full bg-glaze-2 text-ink-2"><UtensilsCrossed size={24} aria-hidden /></span>
      <h2 className="font-serif text-[26px] leading-tight">{title}</h2>
      {body && <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-ink-2">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
