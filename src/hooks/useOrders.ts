'use client';
import { useCallback, useEffect, useState } from 'react';
import { getRepository } from '@/services/repository';
import type { Order, OrderStatus } from '@/types/menu';

/** Orders for the admin, refreshed every few seconds and when another tab writes demo data. */
export function useOrders(pollMs = 4000) {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setOrders(await (await getRepository()).listOrders());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao carregar pedidos.');
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, pollMs);
    const onStorage = (e: StorageEvent) => e.key?.endsWith('orders') && load();
    window.addEventListener('storage', onStorage);
    return () => { clearInterval(t); window.removeEventListener('storage', onStorage); };
  }, [load, pollMs]);

  const setStatus = useCallback(async (id: string, status: OrderStatus) => {
    setOrders((list) => list?.map((o) => (o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o)) ?? null);
    await (await getRepository()).updateOrderStatus(id, status);
  }, []);

  return { orders, error, reload: load, setStatus };
}
