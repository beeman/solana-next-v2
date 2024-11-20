'use client'

import { ReactNode, useMemo } from 'react'
import { useLocalStorage } from '../use-local-storage'
import { SolanaChain, SolanaChainContext } from './solana-chain-context'

const STORAGE_KEY = 'placeholder:selected-chain'

export function SolanaChainProvider({ chains, children }: { chains: SolanaChain[]; children: ReactNode }) {
  const [chainId, setChainId] = useLocalStorage(STORAGE_KEY, 'solana:devnet')

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
