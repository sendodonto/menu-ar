const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** Prefixes site-relative asset paths with the deploy base path; leaves absolute/blob URLs alone. */
export const asset = (src: string) => (src.startsWith('/') && !src.startsWith('//') ? BASE + src : src);
