'use client';

import React from 'react';
import { ConnectButton } from '@mysten/dapp-kit';
import { cn } from '@/utils/helpers';

interface ConnectWalletButtonProps {
  size?: 'md' | 'lg';
  variant?: 'solid' | 'outline';
  text?: string;
  className?: string;
}

// dApp Kit ships its own button styles, so the overrides below are marked important.
export default function ConnectWalletButton({
  size = 'md',
  variant = 'solid',
  text = 'Connect Wallet',
  className,
}: ConnectWalletButtonProps) {
  return (
    <ConnectButton
      connectText={text}
      className={cn(
        'border-2! border-black! rounded-lg! font-bold! cursor-pointer! transition-all!',
        'shadow-[4px_4px_0_#000]! hover:-translate-y-px! hover:shadow-[6px_6px_0_#000]!',
        variant === 'solid'
          ? 'bg-black! text-white! hover:bg-neutral-800!'
          : 'bg-white! text-black! hover:bg-[var(--retro-accent)]!',
        size === 'lg' ? 'h-14! px-8! text-lg!' : 'h-10! px-5! text-base!',
        className
      )}
    />
  );
}
