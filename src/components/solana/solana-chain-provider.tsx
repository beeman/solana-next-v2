'use client'

import { ReactNode, useMemo, useState } from 'react'

import { SolanaChain, SolanaChainContext } from './solana-chain-context'

const STORAGE_KEY = 'solana-example-react-app:selected-chain'

export function SolanaChainProvider({ chains, children }: { chains: SolanaChain[]; children: ReactNode }) {
  const [chainId, setChainId] = useState(() => localStorage.getItem(STORAGE_KEY) ?? chains[0].chain)

  if (!chains.length) {
    throw new Error('No chains provided')
  }

  const chain = useMemo<SolanaChain>(() => {
    for (const chain of chains) {
      if (chain.chain === chainId) {
        return chain
      }
    }
    return chains[0]
  }, [chainId, chains])

  return (
    <SolanaChainContext.Provider
      value={useMemo(
        () => ({
          chain,
          chains,
          setChain(chain) {
            localStorage.setItem(STORAGE_KEY, chain)
            setChainId(chain)
          },
        }),
        [chain, chains],
      )}
    >
      {children}
    </SolanaChainContext.Provider>
  )
}
