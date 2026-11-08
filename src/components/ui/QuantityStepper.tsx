'use client';
import { Minus, Plus } from 'lucide-react';

export function QuantityStepper({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  const btn = 'press grid size-11 place-items-center rounded-full text-ink hover:bg-glaze disabled:opacity-30';
  return (
    <div role="group" aria-label={`Quantidade de ${label}`} className="inline-flex items-center rounded-full bg-tile shadow-[var(--shadow-card)]">
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Diminuir">
        <Minus size={16} />
      </button>
      <output className="tnum w-8 text-center text-[15px] font-medium" aria-live="polite">{value}</output>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= 20} aria-label="Aumentar">
        <Plus size={16} />
      </button>
    </div>
  );
}
