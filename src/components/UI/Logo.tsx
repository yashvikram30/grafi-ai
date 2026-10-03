import React from 'react';
import { cn } from '@/utils/helpers';

interface LogoProps {
  /** Show the "Grafi AI" wordmark next to the mark */
  showWordmark?: boolean;
  /** Use light text, for dark backgrounds */
  inverted?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: { mark: 'w-8 h-8 text-base rounded-md', word: 'text-lg' },
  md: { mark: 'w-10 h-10 text-xl rounded-lg', word: 'text-xl' },
  lg: { mark: 'w-14 h-14 text-3xl rounded-xl', word: 'text-3xl' },
};

export default function Logo({ showWordmark = true, inverted = false, size = 'md', className }: LogoProps) {
  const s = SIZES[size];
  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)}>
      <div
        aria-hidden="true"
        className={cn(
          'relative flex items-center justify-center font-display font-bold leading-none',
          'bg-[var(--retro-accent)] text-black border-2 border-black shadow-[2px_2px_0_#000]',
          inverted && 'border-white shadow-[2px_2px_0_#fff]',
          s.mark
        )}
      >
        g
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[var(--pop-pink)] border-2 border-black" />
      </div>
      {showWordmark && (
        <span
          className={cn(
            'font-display font-bold tracking-tight',
            inverted ? 'text-white' : 'text-black',
            s.word
          )}
        >
          Grafi <span className={inverted ? 'text-[var(--retro-accent)]' : 'text-black'}>AI</span>
        </span>
      )}
    </div>
  );
}
