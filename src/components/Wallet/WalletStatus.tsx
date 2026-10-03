'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, LogOut } from 'lucide-react';
import { useCurrentAccount, useSuiClient, useDisconnectWallet } from '@mysten/dapp-kit';
import ConnectWalletButton from './ConnectWalletButton';

interface WalletStatusProps {
  onConnect?: () => void;
}

const formatAddress = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

export default function WalletStatus({ onConnect: _onConnect }: WalletStatusProps) {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [balance, setBalance] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { mutateAsync: disconnectWallet, isPending: isDisconnecting } = useDisconnectWallet();

  const address = currentAccount?.address ?? null;

  const refreshBalance = useCallback(async () => {
    if (!address) return;
    try {
      const result = await suiClient.getBalance({ owner: address, coinType: '0x2::sui::SUI' });
      setBalance((parseFloat(result.totalBalance) / 1e9).toFixed(2));
    } catch (error) {
      // The balance chip is optional, so a failed lookup just hides it
      console.warn('Could not load wallet balance:', error);
      setBalance(null);
    }
  }, [address, suiClient]);

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  const handleCopyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  if (!address) {
    return <ConnectWalletButton variant="outline" />;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 h-10 pl-3 pr-1.5 bg-white text-black border-2 border-white rounded-lg">
        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" aria-hidden="true" />
        <span className="font-mono text-sm font-semibold" title={address}>
          {formatAddress(address)}
        </span>
        {balance !== null && (
          <span className="hidden sm:inline text-xs font-bold px-2 py-0.5 bg-[var(--retro-accent)] border border-black rounded">
            {balance} SUI
          </span>
        )}
        <button
          onClick={handleCopyAddress}
          className="p-1.5 rounded hover:bg-black/10 transition-colors"
          title={copied ? 'Copied!' : 'Copy address'}
          aria-label="Copy wallet address"
        >
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <button
        onClick={() => disconnectWallet()}
        disabled={isDisconnecting}
        className="header-secondary-button flex items-center gap-2 h-10 px-3 text-sm disabled:opacity-60"
        title="Disconnect wallet"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">{isDisconnecting ? 'Disconnecting…' : 'Disconnect'}</span>
      </button>
    </div>
  );
}
