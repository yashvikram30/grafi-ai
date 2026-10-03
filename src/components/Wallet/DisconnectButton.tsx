'use client';

import React from 'react';
import { LogOut } from 'lucide-react';
import { useDisconnectWallet } from '@mysten/dapp-kit';

export default function DisconnectButton() {
  const { mutateAsync: disconnectWallet, isPending } = useDisconnectWallet();

  return (
    <button
      onClick={() => disconnectWallet()}
      disabled={isPending}
      className="retro-button w-full !py-2 flex items-center justify-center gap-2 text-sm font-bold hover:!bg-red-500 hover:!text-white"
      title="Disconnect your wallet and return to the home page"
    >
      <LogOut className="w-4 h-4" />
      {isPending ? 'Disconnecting…' : 'Disconnect'}
    </button>
  );
}
