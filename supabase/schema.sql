-- MENU AR · Supabase schema. Run once in the SQL editor of a new project.
-- After running: Authentication > Providers > Email: disable "Allow new users to sign up",
-- create the owner user by hand (Authentication > Users > Add user), then:
--   insert into admins (user_id) select id from auth.users where email = 'dono@restaurante.com';
-- Seed the menu with supabase/seed.sql (regenerate: node --experimental-strip-types tools/seed-sql.ts).

create table if not exists admins (user_id uuid primary key references auth.users on delete cascade);

create or replace function is_admin() returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from admins where user_id = auth.uid()) $$;

create table if not exists categories (
  id text primary key,
  name text not null,
  position int not null default 0,
  active boolean not null default true
);

create table if not exists dishes (
  id text primary key,
  name text not null,
  description text not null default '',
  price int not null check (price >= 0),           -- cents
  category_id text not null references categories(id),
  photo text not null default '',
  photo_credit text,
  prep_minutes int not null default 15,
  serves int not null default 1,
  ingredients text[] not null default '{}',
  allergens text[] not null default '{}',
  featured boolean not null default false,
  active boolean not null default true,
  model jsonb                                      -- { src, kind, dimensions: {w,d,h}, credit }
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  table_label text not null,
  customer_name text,
  items jsonb not null,
  total int not null,
  status text not null default 'novo' check (status in ('novo','preparo','pronto','entregue','cancelado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table admins enable row level security;
alter table categories enable row level security;
alter table dishes enable row level security;
alter table orders enable row level security;

-- Guests read the active menu; admins (allowlist, not just "authenticated") manage everything.
create policy "menu read" on categories for select using (active or is_admin());
create policy "menu admin" on categories for all using (is_admin()) with check (is_admin());
create policy "dish read" on dishes for select using (active or is_admin());
create policy "dish admin" on dishes for all using (is_admin()) with check (is_admin());
create policy "orders admin" on orders for all using (is_admin()) with check (is_admin());
create policy "admins self" on admins for select using (user_id = auth.uid());

-- Guests create orders only through this function: prices come from the dishes table.
create or replace function create_order(p_table text, p_customer text, p_items jsonb)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_items jsonb := '[]'::jsonb;
  v_total int := 0;
  v_code text;
  r record;
begin
  if coalesce(trim(p_table), '') = '' then raise exception 'Informe o número da mesa.'; end if;
  for r in
    select d.id, d.name, d.price, least(greatest((i->>'qty')::int, 1), 20) as qty, left(i->>'note', 200) as note
    from jsonb_array_elements(p_items) i join dishes d on d.id = i->>'dishId' and d.active
  loop
    v_items := v_items || jsonb_build_object('dishId', r.id, 'name', r.name, 'unitPrice', r.price, 'qty', r.qty, 'note', r.note);
    v_total := v_total + r.price * r.qty;
  end loop;
  if jsonb_array_length(v_items) = 0 then raise exception 'Pedido vazio.'; end if;
  v_code := 'CN-' || upper(substr(md5(gen_random_uuid()::text), 1, 4));
  insert into orders (code, table_label, customer_name, items, total)
  values (v_code, left(trim(p_table), 8), left(nullif(trim(p_customer), ''), 60), v_items, v_total);
  return v_code;
end $$;
grant execute on function create_order(text, text, jsonb) to anon, authenticated;

-- Public buckets for photos and GLB models; only admins write.
insert into storage.buckets (id, name, public) values ('photos', 'photos', true), ('models', 'models', true)
  on conflict (id) do nothing;
create policy "files admin write" on storage.objects for insert with check (bucket_id in ('photos','models') and is_admin());
create policy "files admin update" on storage.objects for update using (bucket_id in ('photos','models') and is_admin());
create policy "files admin delete" on storage.objects for delete using (bucket_id in ('photos','models') and is_admin());
