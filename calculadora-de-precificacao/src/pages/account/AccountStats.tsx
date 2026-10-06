import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

import CountUp from '@/shared/components/react-bits/CountUp';
import { cn } from '@/shared/lib/utils';

export interface AccountStat {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  onPress: () => void;
  /** Destaca o cartão (ex.: há mensagens não lidas). */
  highlight?: boolean;
}

/** Números da conta: cada cartão leva para onde aquele número mora. */
export function AccountStats({ stats }: { stats: AccountStat[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map(({ label, value, hint, icon: Icon, onPress, highlight }, i) => (
        <motion.li
          key={label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.06, ease: [0.22, 1, 0.36, 1], duration: 0.45 }}
        >
          <button
            type="button"
            onClick={onPress}
            className={cn(
              'group flex h-full w-full flex-col gap-3 p-4 text-left transition-all duration-300 outline-none hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-focus sm:p-5',
              highlight
                ? 'card-hero'
                : 'card-soft hover:shadow-[0_24px_40px_-26px_rgb(92_58_30/0.55)]',
            )}
          >
            <span className="flex items-center justify-between">
              <span
                className={cn(
                  'grid size-10 place-items-center rounded-xl',
                  highlight ? 'bg-white/20 text-white' : 'bg-accent/12 text-accent',
                )}
              >
                <Icon className="size-[18px]" aria-hidden />
              </span>
              <ArrowUpRight
                aria-hidden
                className={cn(
                  'size-4 transition-transform duration-300 group-hover:rotate-45',
                  highlight ? 'text-white/80' : 'text-muted group-hover:text-accent',
                )}
              />
            </span>
            <span className="flex flex-col gap-0.5">
              <CountUp
                to={value}
                duration={1}
                className={cn('font-display text-4xl tabular', !highlight && 'text-foreground')}
              />
              <span className={cn('text-sm font-medium', !highlight && 'text-foreground')}>
                {label}
              </span>
              <span className={cn('text-xs', highlight ? 'text-white/80' : 'text-muted')}>
                {hint}
              </span>
            </span>
          </button>
        </motion.li>
      ))}
    </ul>
  );
}
