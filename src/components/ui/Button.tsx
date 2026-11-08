import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg' | 'sm';

const base = 'press inline-flex items-center justify-center gap-2 rounded-tile font-medium select-none disabled:pointer-events-none disabled:opacity-45';
const variants: Record<Variant, string> = {
  primary: 'bg-clay text-glaze hover:bg-clay-ink shadow-[inset_0_-1px_0_rgb(0_0_0/0.18)]',
  secondary: 'bg-tile text-ink border border-grout hover:border-grout-2 hover:bg-glaze-2',
  ghost: 'text-ink hover:bg-glaze-2',
  danger: 'bg-tile text-danger border border-grout hover:border-danger/40 hover:bg-[#fbeeea]',
};
const sizes: Record<Size, string> = { sm: 'h-9 px-3 text-sm', md: 'h-11 px-4 text-[15px]', lg: 'h-12 px-5 text-base' };

export const buttonClass = (variant: Variant = 'primary', size: Size = 'md', extra = '') => `${base} ${variants[variant]} ${sizes[size]} ${extra}`;

type Common = { variant?: Variant; size?: Size; icon?: ReactNode; className?: string };

export function Button({ variant, size, icon, className = '', children, ...rest }: Common & ComponentProps<'button'>) {
  return (
    <button type="button" className={buttonClass(variant, size, className)} {...rest}>
      {icon}
      {children}
    </button>
  );
}

export function ButtonLink({ variant, size, icon, className = '', children, ...rest }: Common & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonClass(variant, size, className)} {...rest}>
      {icon}
      {children}
    </Link>
  );
}
