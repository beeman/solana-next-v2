'use client'

import { useSolanaWallet } from '@/components/solana/solana-wallet-context'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { StandardConnect, StandardDisconnect } from '@wallet-standard/core'
import type { UiWallet } from '@wallet-standard/react'
import { uiWalletAccountBelongsToUiWallet, useWallets } from '@wallet-standard/react'
import { ChevronDownIcon, TriangleAlert } from 'lucide-react'
import { useRef, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { ConnectWalletMenuItem } from './ConnectWalletMenuItem'
import { ErrorDialog } from './ErrorDialog'
import { UnconnectableWalletMenuItem } from './UnconnectableWalletMenuItem'
import { WalletAccountIcon } from './WalletAccountIcon'

interface Props {
  children: React.ReactNode
}

export function ConnectWalletMenu({ children }: Props) {
  const { current: NO_ERROR } = useRef(Symbol())
  const wallets = useWallets()
  const [selectedWalletAccount, setSelectedWalletAccount] = useSolanaWallet()
  const [error, setError] = useState(NO_ERROR)
  const [open, setOpen] = useState(false)

  function renderItem(wallet: UiWallet) {
    return (
      <ErrorBoundary
        fallbackRender={({ error }) => <UnconnectableWalletMenuItem error={error} wallet={wallet} />}
        key={`wallet:${wallet.name}`}
      >
        <ConnectWalletMenuItem
          onAccountSelect={(account) => {
            setSelectedWalletAccount(account)
            setOpen(false)
          }}
          onDisconnect={(wallet) => {
            if (selectedWalletAccount && uiWalletAccountBelongsToUiWallet(selectedWalletAccount, wallet)) {
              setSelectedWalletAccount(undefined)
            }
          }}
          onError={setError}
          wallet={wallet}
        />
      </ErrorBoundary>
    )
  }

  const walletsThatSupportStandardConnect = wallets.filter(
    (wallet) => wallet.features.includes(StandardConnect) && wallet.features.includes(StandardDisconnect),
  )

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            {selectedWalletAccount ? (
              <>
                <WalletAccountIcon className="w-4 h-4" account={selectedWalletAccount} />
                <span>{selectedWalletAccount.address.slice(0, 8)}</span>
              </>
            ) : (
              children
            )}
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-[240px]">
          {wallets.length === 0 ? (
            <Alert variant="destructive" className="m-2">
              <TriangleAlert className="h-4 w-4" />
              <AlertDescription>This browser has no wallets installed.</AlertDescription>
            </Alert>
          ) : (
            <>{walletsThatSupportStandardConnect.map(renderItem)}</>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {error !== NO_ERROR && <ErrorDialog error={error} onClose={() => setError(NO_ERROR)} />}
    </>
  )
}
