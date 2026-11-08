import type { ComponentProps, ReactNode } from 'react';

export const inputClass =
  'w-full rounded-tile border border-grout bg-tile px-3.5 py-2.5 text-[16px] text-ink placeholder:text-ink-3 transition-colors hover:border-grout-2 focus:border-clay focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-clay/20 aria-[invalid=true]:border-danger';

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string | null; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      {error ? <span className="mt-1.5 block text-sm text-danger">{error}</span> : hint && <span className="mt-1.5 block text-sm text-ink-3">{hint}</span>}
    </label>
  );
}

export const Input = (p: ComponentProps<'input'>) => <input {...p} className={`${inputClass} ${p.className ?? ''}`} />;
export const Textarea = (p: ComponentProps<'textarea'>) => <textarea {...p} className={`${inputClass} min-h-24 resize-y ${p.className ?? ''}`} />;
