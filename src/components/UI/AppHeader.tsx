'use client';

import React from 'react';
import Logo from './Logo';
import WalletStatus from '../Wallet/WalletStatus';

export default function AppHeader() {
  return (
    <header className="header flex-none h-16 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Logo inverted />
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/40 text-xs font-semibold text-white/90">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--retro-accent)]" />
          Sui Testnet
        </span>
      </div>
      <WalletStatus />
    </header>
  );
}
