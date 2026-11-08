import type { ReactNode } from 'react';
import { TileMotif } from '@/components/brand/TileMotif';

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <TileMotif className="mb-5 size-14 opacity-90" />
      <h2 className="text-2xl">{title}</h2>
      {body && <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-ink-2">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
