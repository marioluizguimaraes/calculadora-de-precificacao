import { cn } from '@/shared/lib/utils';

import { initials } from '../utils/return-to';

/** Círculo com as iniciais — mesmo visual para a conta, as ofertas e o chat. */
export function UserAvatar({
  name,
  size = 'md',
  className,
}: {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-accent/15 font-semibold text-accent',
        size === 'sm' && 'size-8 text-xs',
        size === 'md' && 'size-10 text-sm',
        size === 'lg' && 'size-14 text-lg',
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
