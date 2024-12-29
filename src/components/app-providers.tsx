'use client'

import { chainDevnet, chainLocal, chainTestnet, SolanaChain } from '@wallet-ui/core'
import { SolanaProvider } from '@wallet-ui/react'
import { ReactQueryProvider } from './react-query-provider'

// Add your chains here.
const chains: SolanaChain[] = [
  chainDevnet({
    // Customize the chains here
    // rpcUrl: 'https://api.devnet.solana.com',
  }),
  chainLocal(),
  chainTestnet(),
  // Enable mainnet when it's ready.
  // You will need a custom RPC URL for mainnet as the public RPC url can't be used for production.
  // chainMainnet(),
]

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <SolanaProvider chains={chains}>{children}</SolanaProvider>
    </ReactQueryProvider>
  )
}
