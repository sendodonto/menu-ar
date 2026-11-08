import type { Dimensions } from '@/types/menu';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatPrice = (cents: number) => brl.format(cents / 100);

/** Round dishes read as a diameter; anything else as width × depth. */
export function formatDimensions(d: Dimensions) {
  const n = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  if (Math.abs(d.w - d.d) < 0.5 && d.h < d.w) return `Ø ${n(d.w)} cm`;
  if (d.h > Math.max(d.w, d.d)) return `${n(d.h)} cm de altura`;
  return `${n(d.w)} × ${n(d.d)} cm`;
}

/** Parses "62,00" or "62.00" or "62" into cents; returns null when invalid. */
export function parsePrice(input: string): number | null {
  const clean = input.trim().replace(/[R$\s]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return null;
  return Math.round(Number(clean) * 100);
}

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
