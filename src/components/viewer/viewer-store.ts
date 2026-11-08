import { create } from 'zustand';
import type { Dish } from '@/types/menu';

/** One 3D dialog for the whole app; any tile or page opens it with a dish. */
export const useViewer = create<{ dish: Dish | null; open: (d: Dish) => void; close: () => void }>()((set) => ({
  dish: null,
  open: (dish) => set({ dish }),
  close: () => set({ dish: null }),
}));
