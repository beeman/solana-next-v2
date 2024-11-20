'use client'

import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/web3.js'
import { ReactNode, useMemo } from 'react'
import { useSolanaChain } from './solana-chain-context'
import { SolanaRpc, SolanaRpcContext } from './solana-rpc-context'

type Props = Readonly<{
  children: ReactNode
}>

export function SolanaRpcProvider({ children }: Props) {
  const { chain } = useSolanaChain()

  return (
    <SolanaRpcContext.Provider
      value={useMemo(
        () => ({
          rpc: createSolanaRpc(chain.solanaRpcUrl) as SolanaRpc,
          rpcSubscriptions: createSolanaRpcSubscriptions(chain.solanaRpcSubscriptionsUrl),
        }),
        [chain],
      )}
    >
      {children}
    </SolanaRpcContext.Provider>
  )
}
