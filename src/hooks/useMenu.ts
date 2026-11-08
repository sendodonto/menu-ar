'use client';
import { useCallback, useEffect, useState } from 'react';
import { getRepository } from '@/services/repository';
import type { Category, Dish } from '@/types/menu';

type MenuState = { categories: Category[]; dishes: Dish[]; loading: boolean; error: string | null };

/** Loads the menu. Guests see only active items; admin passes includeInactive. */
export function useMenu({ includeInactive = false } = {}) {
  const [state, setState] = useState<MenuState>({ categories: [], dishes: [], loading: true, error: null });

  const load = useCallback(async () => {
    try {
      const repo = await getRepository();
      const [categories, dishes] = await Promise.all([repo.listCategories(), repo.listDishes()]);
      setState({
        categories: includeInactive ? categories : categories.filter((c) => c.active),
        dishes: includeInactive ? dishes : dishes.filter((d) => d.active && categories.some((c) => c.id === d.categoryId && c.active)),
        loading: false,
        error: null,
      });
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message : 'Não foi possível carregar o cardápio.' }));
    }
  }, [includeInactive]);

  useEffect(() => { load(); }, [load]);
  return { ...state, reload: load };
}
