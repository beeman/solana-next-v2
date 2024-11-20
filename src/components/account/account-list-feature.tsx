'use client'

import { AppHero } from '@/components/app-layout'
import { useSolanaWallet } from '@/components/solana/solana-wallet-context'
import { ConnectWalletMenu } from '@/components/wallet'

import { redirect } from 'next/navigation'

export default function AccountListFeature() {
  const [selectedWallet] = useSolanaWallet()

  if (selectedWallet?.address) {
    return redirect(`/account/${selectedWallet.address}`)
  }

  return (
    <AppHero>
      <ConnectWalletMenu>Connect Wallet</ConnectWalletMenu>
    </AppHero>
  )
}
