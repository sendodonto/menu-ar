import { SEED_CATEGORIES, SEED_DISHES } from '@/data/seed';
import { priceLines, totalOf } from '@/lib/cart';
import type { Category, Dish, NewOrder, Order } from '@/types/menu';
import { putBlob } from './blob-store';
import type { Repository } from './repository';

// shortcut: demo mode keeps data in this browser only and checks a fixed password client-side; set the Supabase env vars for real multi-device data and auth.
export const DEMO_LOGIN = { email: 'admin@casanostra.demo', password: 'casanostra' };

const KEY = 'menu-ar:v1:';
const read = <T,>(k: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(KEY + k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (k: string, v: unknown) => {
  try {
    localStorage.setItem(KEY + k, JSON.stringify(v));
  } catch {
    throw new Error('Não foi possível salvar neste navegador (armazenamento cheio ou bloqueado).');
  }
};

function exampleOrders(): Order[] {
  const at = (minAgo: number) => new Date(Date.now() - minAgo * 60_000).toISOString();
  const mk = (code: string, table: string, status: Order['status'], minAgo: number, lines: [string, number][]): Order => {
    const items = priceLines(lines.map(([dishId, qty]) => ({ dishId, qty, note: '' })), SEED_DISHES);
    return { id: code, code, table, items, total: totalOf(items), status, createdAt: at(minAgo), updatedAt: at(minAgo) };
  };
  return [
    mk('CN-7Q2K', '4', 'preparo', 12, [['pizza-margherita', 1], ['spaghetti-alle-vongole', 1], ['espresso', 2]]),
    mk('CN-3HXA', '9', 'novo', 3, [['risotto-al-parmigiano', 2], ['prosecco-rose', 1]]),
    mk('CN-M8TD', '2', 'entregue', 48, [['bruschetta-al-pomodoro', 1], ['tagliata-di-manzo', 1], ['tiramisu', 2]]),
  ];
}

const code = () => 'CN-' + Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[b % 31]).join('');

export function createDemoRepository(): Repository {
  const cats = () => read<Category[]>('categories', SEED_CATEGORIES);
  const dishes = () => read<Dish[]>('dishes', SEED_DISHES);
  const orders = () => read<Order[]>('orders', exampleOrders());
  const upsert = <T extends { id: string }>(list: T[], item: T) =>
    list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item];

  return {
    mode: 'demo',
    async listCategories() { return cats().sort((a, b) => a.position - b.position); },
    async saveCategory(c) { write('categories', upsert(cats(), c)); },
    async deleteCategory(id) {
      if (dishes().some((d) => d.categoryId === id)) throw new Error('Mova ou exclua os pratos desta categoria antes.');
      write('categories', cats().filter((c) => c.id !== id));
    },
    async listDishes() { return dishes(); },
    async saveDish(d) { write('dishes', upsert(dishes(), d)); },
    async deleteDish(id) { write('dishes', dishes().filter((d) => d.id !== id)); },
    async createOrder(input: NewOrder) {
      const items = priceLines(input.items.map((i) => ({ ...i, note: i.note ?? '' })), dishes());
      if (!items.length) throw new Error('Seu pedido está vazio ou os pratos não estão mais disponíveis.');
      if (!input.table.trim()) throw new Error('Informe o número da mesa.');
      const now = new Date().toISOString();
      const order: Order = { id: crypto.randomUUID(), code: code(), table: input.table.trim().slice(0, 8), customerName: input.customerName?.trim().slice(0, 60) || undefined, items, total: totalOf(items), status: 'novo', createdAt: now, updatedAt: now };
      write('orders', [order, ...orders()]);
      return { code: order.code };
    },
    async listOrders() { return orders().sort((a, b) => b.createdAt.localeCompare(a.createdAt)); },
    async updateOrderStatus(id, status) {
      write('orders', orders().map((o) => (o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o)));
    },
    async uploadFile(_kind, file) { return putBlob(file); },
    async signIn(email, password) {
      if (email.trim().toLowerCase() !== DEMO_LOGIN.email || password !== DEMO_LOGIN.password) throw new Error('E-mail ou senha incorretos.');
      write('session', { email: DEMO_LOGIN.email });
    },
    async signOut() { localStorage.removeItem(KEY + 'session'); },
    async getSession() { return read<{ email: string } | null>('session', null); },
  };
}
