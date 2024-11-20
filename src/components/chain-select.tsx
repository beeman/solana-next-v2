'use client'

import { useSolanaChain } from '@/components/solana/solana-chain-context'
import { useSolanaRpc } from '@/components/solana/solana-rpc-context'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useQuery } from '@tanstack/react-query'
import { ReactNode } from 'react'

export function ExplorerLink({ path, label, className }: { path: string; label: string; className?: string }) {
  const { chain } = useSolanaChain()

  return (
    <a
      href={`https://explorer.solana.com/${path}?cluster=${chain.solanaExplorerClusterName}`}
      target="_blank"
      rel="noopener noreferrer"
      className={className ? className : `link font-mono`}
    >
      {label}
    </a>
  )
}

export function ChainChecker({ children }: { children: ReactNode }) {
  const { chain } = useSolanaChain()
  const { rpc } = useSolanaRpc()

  const query = useQuery({
    queryKey: ['version', { chain }],
    queryFn: () => rpc.getVersion().send(),
    retry: 1,
  })
  if (query.isLoading) {
    return null
  }
  if (query.isError || !query.data) {
    return (
      <Alert>
        <div className="flex justify-between items-center">
          <span>
            Error connecting to chain <strong>{chain.displayName}</strong>
          </span>
          <Button onClick={() => query.refetch().catch((err) => console.log(err))}>Refresh</Button>
        </div>
      </Alert>
    )
  }
  return children
}

export function ChainSelect() {
  const { chain, chains, setChain } = useSolanaChain()

  if (!setChain) {
    return null
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {chain.displayName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {chains.map((item) => (
          <DropdownMenuItem key={item.chain} onClick={() => setChain(item.chain)}>
            {item.displayName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
