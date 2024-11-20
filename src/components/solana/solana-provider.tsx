'use client'

import { ReactNode } from 'react'
import { CHAIN_CONFIG_DEVNET, CHAIN_CONFIG_LOCAL, CHAIN_CONFIG_TESTNET } from './solana-chain-context'
import { SolanaChainProvider } from './solana-chain-provider'
import { SolanaRpcProvider } from './solana-rpc-provider'
import { SolanaWalletProvider } from './solana-wallet-provider'

export function SolanaProvider({ children }: { children: ReactNode }) {
  return (
    <SolanaChainProvider chains={[CHAIN_CONFIG_DEVNET, CHAIN_CONFIG_LOCAL, CHAIN_CONFIG_TESTNET]}>
      <SolanaRpcProvider>
        <SolanaWalletProvider>{children}</SolanaWalletProvider>
      </SolanaRpcProvider>
    </SolanaChainProvider>
  )
}
