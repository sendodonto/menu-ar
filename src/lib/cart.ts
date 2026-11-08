import type { Dish, OrderItem } from '@/types/menu';

export type CartLine = { dishId: string; qty: number; note: string };

/** Prices always come from the current menu, never from what was stored in the cart. */
export function priceLines(lines: CartLine[], dishes: Dish[]): OrderItem[] {
  return lines.flatMap((l) => {
    const dish = dishes.find((d) => d.id === l.dishId && d.active);
    return dish ? [{ dishId: dish.id, name: dish.name, unitPrice: dish.price, qty: l.qty, note: l.note || undefined }] : [];
  });
}

export const totalOf = (items: OrderItem[]) => items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);

export const clampQty = (n: number) => Math.max(1, Math.min(20, Math.round(n)));
