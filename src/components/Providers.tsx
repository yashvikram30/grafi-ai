'use client';

import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { getFullnodeUrl } from '@mysten/sui/client';
import { config } from '@/config/environment';

// Create QueryClient instance
const queryClient = new QueryClient();

// Create network configuration using official dApp Kit pattern
const { networkConfig } = createNetworkConfig({
  localnet: { url: getFullnodeUrl('localnet') },
  testnet: { url: config.suiRpcUrl },
  mainnet: { url: getFullnodeUrl('mainnet') },
});

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider
          slushWallet={{
            name: 'Grafi AI', // Required: Shows in Slush wallet UI
          }}
          autoConnect // Restore the last connected wallet; a manual disconnect clears it
          preferredWallets={['Slush']} // Optional: Show Slush first
        >
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}