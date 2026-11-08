import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clampQty, type CartLine } from '@/lib/cart';

type CartState = {
  lines: CartLine[];
  table: string;
  add: (dishId: string, qty?: number, note?: string) => void;
  setQty: (dishId: string, qty: number) => void;
  setNote: (dishId: string, note: string) => void;
  remove: (dishId: string) => void;
  clear: () => void;
  setTable: (table: string) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      table: '',
      add: (dishId, qty = 1, note = '') =>
        set((s) => {
          const found = s.lines.find((l) => l.dishId === dishId);
          if (found) return { lines: s.lines.map((l) => (l.dishId === dishId ? { ...l, qty: clampQty(l.qty + qty), note: note || l.note } : l)) };
          return { lines: [...s.lines, { dishId, qty: clampQty(qty), note }] };
        }),
      setQty: (dishId, qty) => set((s) => ({ lines: s.lines.map((l) => (l.dishId === dishId ? { ...l, qty: clampQty(qty) } : l)) })),
      setNote: (dishId, note) => set((s) => ({ lines: s.lines.map((l) => (l.dishId === dishId ? { ...l, note: note.slice(0, 200) } : l)) })),
      remove: (dishId) => set((s) => ({ lines: s.lines.filter((l) => l.dishId !== dishId) })),
      clear: () => set({ lines: [] }),
      setTable: (table) => set({ table: table.slice(0, 8) }),
    }),
    { name: 'menu-ar:cart' },
  ),
);

export const useCartCount = () => useCart((s) => s.lines.reduce((n, l) => n + l.qty, 0));
