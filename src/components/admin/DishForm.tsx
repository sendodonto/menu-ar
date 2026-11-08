'use client';
import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Box, ImageUp, Trash2, Upload } from 'lucide-react';
import { DishPhoto } from '@/components/menu/DishPhoto';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea, inputClass } from '@/components/ui/Field';
import { RealSize } from '@/components/viewer/ModelBadge';
import { ModelStage } from '@/components/viewer/ModelStage';
import { parsePrice } from '@/lib/format';
import { getRepository } from '@/services/repository';
import { toast } from '@/store/toast';
import type { Category, Dish, DishModel } from '@/types/menu';
import type { ModelViewerElement } from '@/types/model-viewer';
import { Switch } from './Switch';

const ALLERGENS = ['Glúten', 'Leite', 'Ovo', 'Peixe', 'Crustáceos', 'Moluscos', 'Amendoim', 'Amêndoa', 'Nozes', 'Soja', 'Sulfitos', 'Gergelim'];
const MAX_PHOTO = 5 * 1024 * 1024;
const MAX_MODEL = 20 * 1024 * 1024;

const slugify = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

async function isGlb(file: File) {
  const head = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  return String.fromCharCode(...head) === 'glTF';
}

type Errors = Partial<Record<'name' | 'price' | 'categoryId' | 'photo' | 'description', string>>;

export function DishForm({ dish, categories, existingIds }: { dish?: Dish; categories: Category[]; existingIds: string[] }) {
  const router = useRouter();
  const [d, setD] = useState<Dish>(
    dish ?? { id: '', name: '', description: '', price: 0, categoryId: categories[0]?.id ?? '', photo: '', prepMinutes: 15, serves: 1, ingredients: [], allergens: [], featured: false, active: true, model: null },
  );
  const [price, setPrice] = useState(dish ? (dish.price / 100).toFixed(2).replace('.', ',') : '');
  const [ingredients, setIngredients] = useState((dish?.ingredients ?? []).join(', '));
  const [errors, setErrors] = useState<Errors>({});
  const [uploading, setUploading] = useState<'photos' | 'models' | null>(null);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Dish>(k: K, v: Dish[K]) => setD((x) => ({ ...x, [k]: v }));

  const upload = async (kind: 'photos' | 'models', file: File | undefined) => {
    if (!file) return;
    if (kind === 'photos' && (!file.type.startsWith('image/') || file.size > MAX_PHOTO)) return toast('Envie uma imagem JPG, PNG ou WebP de até 5 MB.', 'error');
    if (kind === 'models' && (file.size > MAX_MODEL || !(await isGlb(file)))) return toast('Envie um arquivo .glb válido de até 20 MB.', 'error');
    setUploading(kind);
    try {
      const url = await (await getRepository()).uploadFile(kind, file);
      if (kind === 'photos') { set('photo', url); setErrors((e) => ({ ...e, photo: undefined })); }
      else set('model', { src: url, kind: 'upload', dimensions: undefined });
      toast(kind === 'photos' ? 'Foto enviada' : 'Modelo 3D enviado. Confira a escala abaixo.');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Falha no envio.', 'error');
    } finally {
      setUploading(null);
    }
  };

  // Real size is read from the GLB itself (meters, Y up) once it loads.
  const onModelLoad = useCallback((el: ModelViewerElement) => {
    const s = el.getDimensions();
    const r = (n: number) => Math.round(n * 1000) / 10;
    setD((x) => (x.model ? { ...x, model: { ...x.model, dimensions: { w: r(s.x), d: r(s.z), h: r(s.y) } } as DishModel } : x));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cents = parsePrice(price);
    const errs: Errors = {
      name: d.name.trim() ? undefined : 'Dê um nome ao prato.',
      price: cents !== null && cents > 0 ? undefined : 'Informe um preço válido, ex.: 62,00.',
      categoryId: categories.some((c) => c.id === d.categoryId) ? undefined : 'Escolha uma categoria.',
      photo: d.photo ? undefined : 'Envie uma foto do prato.',
      description: d.description.trim() ? undefined : 'Descreva o prato em uma ou duas frases.',
    };
    setErrors(errs);
    const first = Object.entries(errs).find(([, v]) => v)?.[0];
    if (first) return document.getElementById(`f-${first}`)?.focus();

    let id = d.id;
    if (!id) {
      const base = slugify(d.name) || 'prato';
      id = base;
      for (let n = 2; existingIds.includes(id); n++) id = `${base}-${n}`;
    }
    setSaving(true);
    try {
      await (await getRepository()).saveDish({
        ...d, id, name: d.name.trim(), description: d.description.trim(), price: cents!,
        ingredients: ingredients.split(',').map((s) => s.trim()).filter(Boolean),
        prepMinutes: Math.max(1, Math.round(d.prepMinutes)), serves: Math.max(1, Math.round(d.serves)),
      });
      toast(dish ? 'Prato atualizado' : 'Prato cadastrado');
      router.push('/admin/pratos/');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível salvar.', 'error');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="page-enter">
      <Link href="/admin/pratos/" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink"><ArrowLeft size={16} /> Pratos</Link>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-[34px] leading-none sm:text-[40px]">{dish ? dish.name : 'Novo prato'}</h1>
        <div className="flex items-center gap-2">
          <Switch checked={d.active} onChange={(v) => set('active', v)} label={d.active ? 'Ativo' : 'Inativo'} />
          <Button type="submit" size="lg" disabled={saving || !!uploading}>{saving ? 'Salvando…' : 'Salvar prato'}</Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="grid content-start gap-5 rounded-tile border border-grout bg-tile p-4 sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nome" error={errors.name}><Input id="f-name" value={d.name} onChange={(e) => set('name', e.target.value)} aria-invalid={!!errors.name} /></Field>
            <Field label="Categoria" error={errors.categoryId}>
              <select id="f-categoryId" value={d.categoryId} onChange={(e) => set('categoryId', e.target.value)} className={inputClass}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Descrição" error={errors.description}><Textarea id="f-description" rows={3} value={d.description} onChange={(e) => set('description', e.target.value)} aria-invalid={!!errors.description} /></Field>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            <Field label="Preço (R$)" error={errors.price}><Input id="f-price" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="62,00" className="tnum" aria-invalid={!!errors.price} /></Field>
            <Field label="Preparo (min)"><Input type="number" min={1} value={d.prepMinutes} onChange={(e) => set('prepMinutes', Number(e.target.value))} className="tnum" /></Field>
            <Field label="Serve (pessoas)"><Input type="number" min={1} value={d.serves} onChange={(e) => set('serves', Number(e.target.value))} className="tnum" /></Field>
          </div>
          <Field label="Ingredientes" hint="Separe por vírgula."><Textarea rows={2} value={ingredients} onChange={(e) => setIngredients(e.target.value)} /></Field>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Alérgenos</legend>
            <div className="flex flex-wrap gap-1.5">
              {ALLERGENS.map((a) => {
                const on = d.allergens.includes(a);
                return (
                  <label key={a} className={`press inline-flex h-9 cursor-pointer items-center gap-2 rounded-tile border px-3 text-[14px] ${on ? 'border-clay bg-clay-soft text-clay-ink' : 'border-grout hover:border-grout-2'}`}>
                    <input type="checkbox" className="sr-only" checked={on} onChange={() => set('allergens', on ? d.allergens.filter((x) => x !== a) : [...d.allergens, a])} />
                    {a}
                  </label>
                );
              })}
            </div>
          </fieldset>
          <label className="inline-flex items-center gap-2 text-[15px]">
            <input type="checkbox" checked={d.featured} onChange={(e) => set('featured', e.target.checked)} className="size-4" />
            Destaque da casa (aparece no topo do cardápio)
          </label>
        </div>

        <div className="grid content-start gap-6">
          <section className="rounded-tile border border-grout bg-tile p-4 sm:p-5" aria-labelledby="foto">
            <h2 id="foto" className="text-xl">Foto</h2>
            {d.photo ? <DishPhoto src={d.photo} alt="Foto do prato" className="mt-3 aspect-[4/3] rounded-tile" /> : <div className="mt-3 grid aspect-[4/3] place-items-center rounded-tile border border-dashed border-grout-2 text-sm text-ink-3">Nenhuma foto</div>}
            <label className={`press mt-3 flex h-11 cursor-pointer items-center justify-center gap-2 rounded-tile border text-[15px] font-medium ${errors.photo ? 'border-danger text-danger' : 'border-grout hover:bg-glaze-2'}`}>
              <ImageUp size={17} /> {uploading === 'photos' ? 'Enviando…' : d.photo ? 'Trocar foto' : 'Enviar foto'}
              <input id="f-photo" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => upload('photos', e.target.files?.[0])} />
            </label>
            {errors.photo && <p className="mt-1.5 text-sm text-danger">{errors.photo}</p>}
          </section>

          <section className="rounded-tile border border-grout bg-tile p-4 sm:p-5" aria-labelledby="modelo">
            <h2 id="modelo" className="flex items-center gap-2 text-xl"><Box size={18} className="text-clay" /> Modelo 3D</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-3">Arquivo GLB em metros, com a base do prato em y = 0. A escala real vem do próprio arquivo.</p>
            {d.model ? (
              <>
                <ModelStage key={d.model.src} src={d.model.src} alt="Pré-visualização do modelo" onLoad={onModelLoad} className="mt-3 aspect-square rounded-tile border border-grout bg-glaze" />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <RealSize model={d.model} />
                  <button type="button" onClick={() => set('model', null)} className="press inline-flex h-9 items-center gap-1.5 rounded-tile px-2.5 text-[14px] text-danger hover:bg-[#fbeeea]"><Trash2 size={15} /> Remover modelo</button>
                </div>
              </>
            ) : (
              <div className="mt-3 grid aspect-[4/3] place-items-center rounded-tile border border-dashed border-grout-2 px-6 text-center text-sm text-ink-3">Sem modelo: o prato aparece só com foto, sem botões de 3D e AR.</div>
            )}
            <label className="press mt-3 flex h-11 cursor-pointer items-center justify-center gap-2 rounded-tile border border-grout text-[15px] font-medium hover:bg-glaze-2">
              <Upload size={17} /> {uploading === 'models' ? 'Enviando…' : d.model ? 'Trocar arquivo GLB' : 'Enviar arquivo GLB'}
              <input type="file" accept=".glb,model/gltf-binary" className="sr-only" onChange={(e) => upload('models', e.target.files?.[0])} />
            </label>
          </section>
        </div>
      </div>
    </form>
  );
}
