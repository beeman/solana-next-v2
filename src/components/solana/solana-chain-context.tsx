'use client'

import { ClusterUrl, devnet, testnet } from '@solana/web3.js'
import { createContext, useContext } from 'react'

export type SolanaChain = Readonly<{
  chain: `solana:${string}`
  displayName: string
  solanaExplorerClusterName: 'devnet' | 'custom' | 'mainnet-beta' | 'testnet'
  solanaRpcSubscriptionsUrl: ClusterUrl
  solanaRpcUrl: ClusterUrl
}>

export type SolanaChainContextProps = Readonly<{
  chain: SolanaChain
  chains: SolanaChain[]
  setChain?(chain: `solana:${string}`): void
}>

export const CHAIN_CONFIG_DEVNET: SolanaChain = Object.freeze({
  chain: 'solana:devnet',
  displayName: 'Devnet',
  solanaExplorerClusterName: 'devnet',
  solanaRpcSubscriptionsUrl: devnet('wss://api.devnet.solana.com'),
  solanaRpcUrl: devnet('https://api.devnet.solana.com'),
})
export const CHAIN_CONFIG_LOCAL: SolanaChain = Object.freeze({
  chain: 'solana:local',
  displayName: 'Local',
  solanaExplorerClusterName: 'custom',
  solanaRpcSubscriptionsUrl: 'ws://localhost:8900',
  solanaRpcUrl: 'http://localhost:8899',
})
export const CHAIN_CONFIG_TESTNET: SolanaChain = Object.freeze({
  chain: 'solana:testnet',
  displayName: 'Testnet',
  solanaExplorerClusterName: 'testnet',
  solanaRpcSubscriptionsUrl: testnet('wss://api.testnet.solana.com'),
  solanaRpcUrl: testnet('https://api.testnet.solana.com'),
})

export const SolanaChainContext = createContext<SolanaChainContextProps>({} as SolanaChainContextProps)

export function useSolanaChain() {
  return useContext(SolanaChainContext)
}
