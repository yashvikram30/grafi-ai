'use client';

import React, { useLayoutEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useCurrentAccount, useAutoConnectWallet } from '@mysten/dapp-kit';
import LandingPage from '@/components/Landing/LandingPage';
import Splash from '@/components/UI/Splash';

// Dynamically import CanvasEditor to avoid SSR issues with Fabric.js.
// It is only loaded once a wallet is connected.
const CanvasEditor = dynamic(() => import('@/components/Canvas/CanvasEditor'), {
  ssr: false,
  loading: () => <Splash label="Opening your studio…" />,
});

// Key dApp Kit uses to remember the last connected wallet
const WALLET_STORAGE_KEY = 'sui-dapp-kit:wallet-connection-info';

export default function Home() {
  const currentAccount = useCurrentAccount();
  const autoConnectStatus = useAutoConnectWallet();
  const [hasStoredWallet, setHasStoredWallet] = useState(false);

  // Runs before paint, so returning users never see the landing page flash,
  // while first-time visitors still get it in the server-rendered HTML.
  useLayoutEffect(() => {
    try {
      setHasStoredWallet(!!localStorage.getItem(WALLET_STORAGE_KEY));
    } catch {
      // storage unavailable: treat as a first-time visitor
    }
  }, []);

  if (autoConnectStatus === 'idle' && hasStoredWallet) {
    return <Splash label="Restoring your wallet…" />;
  }

  if (!currentAccount) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      <CanvasEditor />
    </div>
  );
}
