import type { Category, Dish } from '@/types/menu';

// Demo data for Casa Nostra (fictional). Photos: Unsplash License; renders: tools/models/build_models.py.
export const SEED_CATEGORIES: Category[] = [
  { id: 'entradas', name: 'Entradas', position: 1, active: true },
  { id: 'massas', name: 'Massas', position: 2, active: true },
  { id: 'pizzas', name: 'Pizzas', position: 3, active: true },
  { id: 'principais', name: 'Pratos principais', position: 4, active: true },
  { id: 'sobremesas', name: 'Sobremesas', position: 5, active: true },
  { id: 'bebidas', name: 'Bebidas', position: 6, active: true },
];

const photo = (slug: string) => `/images/dishes/${slug}.webp`;
const model = (slug: string, kind: 'scan' | 'demo', w: number, d: number, h: number, credit?: string) =>
  ({ src: `/models/${slug}.glb`, kind, dimensions: { w, d, h }, credit });
const UNSPLASH = 'Foto ilustrativa · Unsplash';
const RENDER = 'Render do modelo 3D';
const POLYHAVEN = 'Escaneamento 3D · Poly Haven (CC0)';

export const SEED_DISHES: Dish[] = [
  {
    id: 'bruschetta-al-pomodoro', name: 'Bruschetta al pomodoro', categoryId: 'entradas', price: 3800,
    description: 'Pão de fermentação natural tostado na brasa, esfregado com alho, coberto com tomates italianos em cubos, manjericão fresco e azeite extravirgem da Puglia.',
    photo: photo('bruschetta-al-pomodoro'), photoCredit: UNSPLASH, prepMinutes: 10, serves: 2,
    ingredients: ['Pão de fermentação natural', 'Tomate italiano', 'Alho', 'Manjericão', 'Azeite extravirgem', 'Flor de sal'],
    allergens: ['Glúten'], featured: false, active: true, model: null,
  },
  {
    id: 'insalata-di-anatra', name: 'Insalata tiepida di anatra', categoryId: 'entradas', price: 5600,
    description: 'Peito de pato selado e fatiado sobre folhas amargas, framboesas, figos assados e redução de vinho tinto com mel de laranjeira.',
    photo: photo('insalata-di-anatra'), photoCredit: UNSPLASH, prepMinutes: 18, serves: 1,
    ingredients: ['Peito de pato', 'Rúcula e radicchio', 'Framboesa', 'Figo', 'Vinho tinto', 'Mel de laranjeira'],
    allergens: ['Sulfitos'], featured: false, active: true, model: null,
  },
  {
    id: 'spaghetti-alle-vongole', name: 'Spaghetti alle vongole', categoryId: 'massas', price: 7400,
    description: 'Spaghetti de grano duro com vôngoles frescos abertos no vinho branco, alho, pimenta calabresa, salsinha e um fio de azeite cru.',
    photo: photo('spaghetti-alle-vongole'), photoCredit: UNSPLASH, prepMinutes: 20, serves: 1,
    ingredients: ['Spaghetti de grano duro', 'Vôngoles', 'Vinho branco', 'Alho', 'Pimenta calabresa', 'Salsinha'],
    allergens: ['Glúten', 'Moluscos', 'Sulfitos'], featured: true, active: true, model: null,
  },
  {
    id: 'spaghetti-alla-carbonara', name: 'Spaghetti alla carbonara', categoryId: 'massas', price: 6200,
    description: 'A receita romana sem creme: guanciale crocante, gemas caipiras, pecorino romano e pimenta-do-reino moída na hora.',
    photo: photo('spaghetti-alla-carbonara'), photoCredit: UNSPLASH, prepMinutes: 16, serves: 1,
    ingredients: ['Spaghetti', 'Guanciale', 'Gema de ovo', 'Pecorino romano', 'Pimenta-do-reino'],
    allergens: ['Glúten', 'Ovo', 'Leite'], featured: false, active: true, model: null,
  },
  {
    id: 'fettuccine-al-ragu-bianco', name: 'Fettuccine al ragù bianco', categoryId: 'massas', price: 6800,
    description: 'Fettuccine feito na casa com ragù branco de vitela cozido lentamente por seis horas, cogumelos paris e parmigiano reggiano 24 meses.',
    photo: photo('fettuccine-al-ragu-bianco'), photoCredit: UNSPLASH, prepMinutes: 18, serves: 1,
    ingredients: ['Fettuccine fresco', 'Vitela', 'Cogumelo paris', 'Vinho branco', 'Parmigiano reggiano', 'Sálvia'],
    allergens: ['Glúten', 'Ovo', 'Leite', 'Sulfitos'], featured: false, active: true, model: null,
  },
  {
    id: 'penne-all-arrabbiata', name: "Penne all'arrabbiata", categoryId: 'massas', price: 4900,
    description: 'Penne rigate em molho de tomate San Marzano com alho dourado e peperoncino, finalizado com salsinha. Picante na medida.',
    photo: photo('penne-all-arrabbiata'), photoCredit: UNSPLASH, prepMinutes: 14, serves: 1,
    ingredients: ['Penne rigate', 'Tomate San Marzano', 'Alho', 'Peperoncino', 'Salsinha', 'Azeite'],
    allergens: ['Glúten'], featured: false, active: true, model: null,
  },
  {
    id: 'pizza-margherita', name: 'Pizza Margherita', categoryId: 'pizzas', price: 6200,
    description: 'Massa de longa fermentação (48 h) assada no forno a lenha a 450 °C: tomate San Marzano, fior di latte, manjericão e azeite. A pizza da casa.',
    photo: photo('pizza-margherita'), photoCredit: UNSPLASH, prepMinutes: 15, serves: 2,
    ingredients: ['Massa de fermentação natural', 'Tomate San Marzano', 'Fior di latte', 'Manjericão', 'Azeite extravirgem'],
    allergens: ['Glúten', 'Leite'], featured: true, active: true,
    model: model('pizza-margherita', 'demo', 34, 34, 2.8),
  },
  {
    id: 'pizza-diavola', name: 'Pizza Diavola', categoryId: 'pizzas', price: 6900,
    description: 'Tomate San Marzano, fior di latte e salame picante calabrês em fatias finas, que douram e se curvam no forno a lenha.',
    photo: photo('pizza-diavola'), photoCredit: UNSPLASH, prepMinutes: 15, serves: 2,
    ingredients: ['Massa de fermentação natural', 'Tomate San Marzano', 'Fior di latte', 'Salame picante', 'Orégano'],
    allergens: ['Glúten', 'Leite'], featured: false, active: true,
    model: model('pizza-diavola', 'demo', 34, 34, 2.8),
  },
  {
    id: 'pizza-quattro-formaggi', name: 'Pizza Quattro formaggi', categoryId: 'pizzas', price: 7200,
    description: 'Pizza branca com mozzarella, gorgonzola dolce, fontina e parmigiano, finalizada com mel de castanha e pimenta-do-reino.',
    photo: photo('pizza-quattro-formaggi'), photoCredit: UNSPLASH, prepMinutes: 15, serves: 2,
    ingredients: ['Massa de fermentação natural', 'Mozzarella', 'Gorgonzola', 'Fontina', 'Parmigiano', 'Mel de castanha'],
    allergens: ['Glúten', 'Leite'], featured: false, active: true, model: null,
  },
  {
    id: 'risotto-al-parmigiano', name: 'Risotto al parmigiano e limone', categoryId: 'principais', price: 7800,
    description: 'Arroz carnaroli mantecado com manteiga de leite cru e parmigiano reggiano 36 meses, raspas de limão-siciliano e lascas de parmesão.',
    photo: photo('risotto-al-parmigiano'), photoCredit: UNSPLASH, prepMinutes: 25, serves: 1,
    ingredients: ['Arroz carnaroli', 'Caldo de legumes', 'Parmigiano reggiano 36 meses', 'Manteiga', 'Limão-siciliano', 'Vinho branco'],
    allergens: ['Leite', 'Sulfitos'], featured: true, active: true,
    model: model('risotto-al-parmigiano', 'demo', 28, 28, 5.1),
  },
  {
    id: 'tagliata-di-manzo', name: 'Tagliata di manzo', categoryId: 'principais', price: 11800,
    description: 'Contrafilé maturado grelhado na brasa e fatiado, servido com batatas rústicas ao alecrim, rúcula e redução de balsâmico.',
    photo: photo('tagliata-di-manzo'), photoCredit: UNSPLASH, prepMinutes: 25, serves: 1,
    ingredients: ['Contrafilé maturado', 'Batata', 'Alecrim', 'Rúcula', 'Aceto balsâmico', 'Flor de sal'],
    allergens: ['Sulfitos'], featured: false, active: true, model: null,
  },
  {
    id: 'branzino-in-brodetto', name: 'Branzino in brodetto', categoryId: 'principais', price: 9800,
    description: 'Filé de robalo com pele crocante sobre brodetto de tomate e açafrão, mexilhões, erva-doce e torrada de alho.',
    photo: photo('branzino-in-brodetto'), photoCredit: UNSPLASH, prepMinutes: 22, serves: 1,
    ingredients: ['Robalo', 'Mexilhão', 'Tomate', 'Açafrão', 'Erva-doce', 'Pão'],
    allergens: ['Peixe', 'Moluscos', 'Glúten'], featured: false, active: true, model: null,
  },
  {
    id: 'tiramisu', name: 'Tiramisù', categoryId: 'sobremesas', price: 3600,
    description: 'Camadas de savoiardi embebidos em espresso e marsala, creme de mascarpone batido com gemas e cacau amargo peneirado na hora.',
    photo: photo('tiramisu'), photoCredit: UNSPLASH, prepMinutes: 5, serves: 1,
    ingredients: ['Savoiardi', 'Mascarpone', 'Espresso', 'Marsala', 'Ovo', 'Cacau'],
    allergens: ['Glúten', 'Ovo', 'Leite'], featured: true, active: true,
    model: model('tiramisu', 'demo', 21, 21, 7.5),
  },
  {
    id: 'torta-cioccolato-e-fragole', name: 'Torta al cioccolato e fragole', categoryId: 'sobremesas', price: 24000,
    description: 'Torta inteira para a mesa: mousse de chocolate 70% sobre base de amêndoas, coberta com morangos frescos e lascas de chocolate. Encomende com o garçom.',
    photo: photo('torta-cioccolato-e-fragole'), photoCredit: RENDER, prepMinutes: 10, serves: 10,
    ingredients: ['Chocolate 70%', 'Amêndoa', 'Morango', 'Creme de leite', 'Ovo', 'Açúcar'],
    allergens: ['Leite', 'Ovo', 'Amêndoa'], featured: false, active: true,
    model: model('torta-cioccolato-e-fragole', 'scan', 32, 32, 9, POLYHAVEN),
  },
  {
    id: 'torta-di-carote', name: 'Torta di carote', categoryId: 'sobremesas', price: 19800,
    description: 'Bolo de cenoura com nozes e especiarias em forma de anel, coberto com creme de mascarpone e limão. Inteiro, para compartilhar.',
    photo: photo('torta-di-carote'), photoCredit: RENDER, prepMinutes: 10, serves: 12,
    ingredients: ['Cenoura', 'Nozes', 'Canela', 'Mascarpone', 'Limão', 'Farinha de trigo'],
    allergens: ['Glúten', 'Ovo', 'Leite', 'Nozes'], featured: false, active: true,
    model: model('torta-di-carote', 'scan', 31, 31, 10.8, POLYHAVEN),
  },
  {
    id: 'panna-cotta-ai-frutti-rossi', name: 'Panna cotta ai frutti rossi', categoryId: 'sobremesas', price: 3200,
    description: 'Creme cozido de baunilha do Taiti, servido no copo com compota de frutas vermelhas e morangos frescos.',
    photo: photo('panna-cotta-ai-frutti-rossi'), photoCredit: UNSPLASH, prepMinutes: 5, serves: 1,
    ingredients: ['Creme de leite', 'Baunilha', 'Morango', 'Framboesa', 'Açúcar'],
    allergens: ['Leite'], featured: false, active: true, model: null,
  },
  {
    id: 'cornetto-alla-crema', name: 'Cornetto alla crema', categoryId: 'sobremesas', price: 1800,
    description: 'Cornetto folhado na manteiga, assado na hora e recheado com creme de confeiteiro de baunilha. Perfeito com um espresso.',
    photo: photo('cornetto-alla-crema'), photoCredit: RENDER, prepMinutes: 6, serves: 1,
    ingredients: ['Farinha de trigo', 'Manteiga', 'Ovo', 'Leite', 'Baunilha'],
    allergens: ['Glúten', 'Ovo', 'Leite'], featured: false, active: true,
    model: model('cornetto-alla-crema', 'scan', 24, 24, 7.2, POLYHAVEN),
  },
  {
    id: 'prosecco-rose', name: 'Prosecco Rosé DOC', categoryId: 'bebidas', price: 16900,
    description: 'Espumante rosé do Vêneto, de perlage fino, aromas de frutas vermelhas e final fresco. Garrafa de 750 ml.',
    photo: photo('prosecco-rose'), photoCredit: RENDER, prepMinutes: 2, serves: 4,
    ingredients: ['Uva glera', 'Uva pinot nero'],
    allergens: ['Sulfitos'], featured: false, active: true,
    model: model('prosecco-rose', 'scan', 8.1, 8.1, 31.6, POLYHAVEN),
  },
  {
    id: 'espresso', name: 'Espresso', categoryId: 'bebidas', price: 900,
    description: 'Blend da casa de arábica com 10% de robusta, extraído em 25 segundos. Crema avelã, corpo denso e final de cacau.',
    photo: photo('espresso'), photoCredit: RENDER, prepMinutes: 3, serves: 1,
    ingredients: ['Café arábica', 'Café robusta'],
    allergens: [], featured: false, active: true,
    model: model('espresso', 'demo', 13.8, 13.8, 6.2),
  },
];
