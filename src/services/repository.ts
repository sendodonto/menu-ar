import type { Category, Dish, NewOrder, Order, OrderStatus } from '@/types/menu';

export type Session = { email: string } | null;

/** Everything the app reads or writes. Two implementations: browser demo storage and Supabase. */
export interface Repository {
  mode: 'demo' | 'supabase';
  listCategories(): Promise<Category[]>;
  saveCategory(c: Category): Promise<void>;
  deleteCategory(id: string): Promise<void>;
  listDishes(): Promise<Dish[]>;
  saveDish(d: Dish): Promise<void>;
  deleteDish(id: string): Promise<void>;
  createOrder(o: NewOrder): Promise<{ code: string }>;
  listOrders(): Promise<Order[]>;
  updateOrderStatus(id: string, status: OrderStatus): Promise<void>;
  uploadFile(kind: 'photos' | 'models', file: File): Promise<string>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  getSession(): Promise<Session>;
}

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

let repo: Promise<Repository> | null = null;

export function getRepository(): Promise<Repository> {
  repo ??= isSupabaseConfigured
    ? import('./supabase-repository').then((m) => m.createSupabaseRepository())
    : import('./demo-repository').then((m) => m.createDemoRepository());
  return repo;
}
