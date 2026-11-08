import { createClient } from '@supabase/supabase-js';
import type { Category, Dish, Order } from '@/types/menu';
import type { Repository } from './repository';

type DishRow = {
  id: string; name: string; description: string; price: number; category_id: string; photo: string; photo_credit: string | null;
  prep_minutes: number; serves: number; ingredients: string[]; allergens: string[]; featured: boolean; active: boolean;
  model: Dish['model'];
};

const toDish = (r: DishRow): Dish => ({
  id: r.id, name: r.name, description: r.description, price: r.price, categoryId: r.category_id, photo: r.photo,
  photoCredit: r.photo_credit ?? undefined, prepMinutes: r.prep_minutes, serves: r.serves, ingredients: r.ingredients,
  allergens: r.allergens, featured: r.featured, active: r.active, model: r.model,
});

const fromDish = (d: Dish): DishRow => ({
  id: d.id, name: d.name, description: d.description, price: d.price, category_id: d.categoryId, photo: d.photo,
  photo_credit: d.photoCredit ?? null, prep_minutes: d.prepMinutes, serves: d.serves, ingredients: d.ingredients,
  allergens: d.allergens, featured: d.featured, active: d.active, model: d.model ?? null,
});

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

export function createSupabaseRepository(): Repository {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  return {
    mode: 'supabase',
    async listCategories() {
      return check(await sb.from('categories').select('id,name,position,active').order('position')) as Category[];
    },
    async saveCategory(c) { check(await sb.from('categories').upsert(c)); },
    async deleteCategory(id) { check(await sb.from('categories').delete().eq('id', id)); },
    async listDishes() { return (check(await sb.from('dishes').select('*')) as DishRow[]).map(toDish); },
    async saveDish(d) { check(await sb.from('dishes').upsert(fromDish(d))); },
    async deleteDish(id) { check(await sb.from('dishes').delete().eq('id', id)); },
    async createOrder(o) {
      // RPC: prices are read from the database, anonymous guests never need SELECT on orders.
      const code = check(await sb.rpc('create_order', { p_table: o.table, p_customer: o.customerName ?? null, p_items: o.items })) as string;
      return { code };
    },
    async listOrders() {
      const rows = check(await sb.from('orders').select('*').order('created_at', { ascending: false }).limit(200)) as {
        id: string; code: string; table_label: string; customer_name: string | null; items: Order['items']; total: number;
        status: Order['status']; created_at: string; updated_at: string;
      }[];
      return rows.map((r) => ({ id: r.id, code: r.code, table: r.table_label, customerName: r.customer_name ?? undefined, items: r.items, total: r.total, status: r.status, createdAt: r.created_at, updatedAt: r.updated_at }));
    },
    async updateOrderStatus(id, status) {
      check(await sb.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id));
    },
    async uploadFile(kind, file) {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
      const path = `${crypto.randomUUID()}.${ext}`;
      check(await sb.storage.from(kind).upload(path, file, { contentType: file.type || (ext === 'glb' ? 'model/gltf-binary' : undefined) }));
      return sb.storage.from(kind).getPublicUrl(path).data.publicUrl;
    },
    async signIn(email, password) {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw new Error('E-mail ou senha incorretos.');
    },
    async signOut() { await sb.auth.signOut(); },
    async getSession() {
      const { data } = await sb.auth.getSession();
      return data.session?.user.email ? { email: data.session.user.email } : null;
    },
  };
}
