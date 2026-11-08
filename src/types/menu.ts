export type Category = {
  id: string;
  name: string;
  position: number;
  active: boolean;
};

/** Physical size of the 3D model in centimetres (width × depth × height), used for the real-scale label. */
export type Dimensions = { w: number; d: number; h: number };

export type DishModel = {
  src: string;
  /** scan = photogrammetry scan; demo = modeled for the demo; upload = sent by the restaurant */
  kind: 'scan' | 'demo' | 'upload';
  dimensions?: Dimensions;
  credit?: string;
};

export type Dish = {
  id: string;
  name: string;
  description: string;
  /** Price in cents (BRL) to keep money math exact. */
  price: number;
  categoryId: string;
  photo: string;
  photoCredit?: string;
  prepMinutes: number;
  serves: number;
  ingredients: string[];
  allergens: string[];
  featured: boolean;
  active: boolean;
  model?: DishModel | null;
};

export type OrderStatus = 'novo' | 'preparo' | 'pronto' | 'entregue' | 'cancelado';

export type OrderItem = {
  dishId: string;
  name: string;
  unitPrice: number;
  qty: number;
  note?: string;
};

export type Order = {
  id: string;
  code: string;
  table: string;
  customerName?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

export type NewOrder = {
  table: string;
  customerName?: string;
  items: { dishId: string; qty: number; note?: string }[];
};
