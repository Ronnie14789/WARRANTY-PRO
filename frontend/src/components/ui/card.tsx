import type { PropsWithChildren } from 'react';
import { cn } from '../../lib/utils';

export const Card = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
  <section className={cn('rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900', className)}>
    {children}
  </section>
);
