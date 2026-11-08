'use client';
import { useEffect, useState } from 'react';
import { getRepository, type Session } from '@/services/repository';

export function useSession() {
  const [session, setSession] = useState<Session | undefined>(undefined);
  useEffect(() => {
    getRepository().then((r) => r.getSession()).then(setSession).catch(() => setSession(null));
  }, []);
  return session; // undefined while checking
}
