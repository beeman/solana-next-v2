'use client'

import { useToastError } from '@/hooks/use-toast-error'
import { useToastTransaction } from '@/hooks/use-toast-transaction'
import { getTransferSolInstruction } from '@solana-program/system'
import { TOKEN_PROGRAM_ADDRESS } from '@solana-program/token'
import { TOKEN_2022_PROGRAM_ADDRESS } from '@solana-program/token-2022'
import { useWalletAccountTransactionSendingSigner } from '@solana/react'
import type { Blockhash } from '@solana/rpc-types'
import {
  address,
  Address,
  airdropFactory,
  appendTransactionMessageInstruction,
  assertIsTransactionMessageWithSingleSendingSigner,
  createTransactionMessage,
  getBase58Decoder,
  lamports,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signAndSendTransactionMessageWithSigners,
  TransactionSendingSigner,
} from '@solana/web3.js'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { UiWalletAccount } from '@wallet-standard/react'
import { SolanaRpc, useSolanaChain, useSolanaRpc } from '@wallet-ui/react'

export function useGetBalance({ address }: { address: Address }) {
  const { chain } = useSolanaChain()
  const { rpc } = useSolanaRpc()

  return useQuery({
    queryKey: ['get-balance', { chain, address }],
    queryFn: () =>
      rpc
        .getBalance(address)
        .send()
        .then((res) => res.value),
  })
}

export function useGetSignatures({ address }: { address: Address }) {
  const { chain } = useSolanaChain()
  const { rpc } = useSolanaRpc()

  return useQuery({
    queryKey: ['get-signatures', { chain, address }],
    queryFn: () => rpc.getSignaturesForAddress(address).send(),
  })
}

export function useGetTokenAccounts({ address }: { address: Address }) {
  const { chain } = useSolanaChain()
  const { rpc } = useSolanaRpc()

  return useQuery({
    queryKey: ['get-token-accounts', { chain, address }],
    queryFn: async () =>
      Promise.all([
        rpc
          .getTokenAccountsByOwner(
            address,
            { programId: TOKEN_PROGRAM_ADDRESS },
            { commitment: 'confirmed', encoding: 'jsonParsed' },
          )
          .send()
          .then((res) => res.value ?? []),
        rpc
          .getTokenAccountsByOwner(
            address,
            { programId: TOKEN_2022_PROGRAM_ADDRESS },
            { commitment: 'confirmed', encoding: 'jsonParsed' },
          )
          .send()
          .then((res) => res.value ?? []),
      ]).then(([tokenAccounts, token2022Accounts]) => [...tokenAccounts, ...token2022Accounts]),
  })
}

export function useTransferSol({ address, account }: { address: Address; account: UiWalletAccount }) {
  const { chain } = useSolanaChain()
  const toastError = useToastError()
  const toastTransaction = useToastTransaction()
  const { rpc } = useSolanaRpc()
  const txSigner = useWalletAccountTransactionSendingSigner(account, chain.id)
  const client = useQueryClient()

  return useMutation({
    mutationKey: ['transfer-sol', { chain, address }],
    mutationFn: async (input: { destination: Address; amount: number }) => {
      try {
        const { signature } = await createTransaction({
          txSigner,
          destination: input.destination,
          amount: input.amount,
          rpc,
        })

        console.log(signature)
        return signature
      } catch (error: unknown) {
        console.log('error', `Transaction failed! ${error}`)

        return
      }
    },
    onSuccess: (signature) => {
      if (signature?.length) {
        toastTransaction(signature)
      }
      return Promise.all([
        client.invalidateQueries({
          queryKey: ['get-balance', { chain, address }],
        }),
        client.invalidateQueries({
          queryKey: ['get-signatures', { chain, address }],
        }),
      ])
    },
    onError: (error) => {
      toastError(`Transaction failed! ${error}`)
    },
  })
}

export function useRequestAirdrop({ address }: { address: Address }) {
  const { chain } = useSolanaChain()
  const { rpc, rpcSubscriptions } = useSolanaRpc()
  const client = useQueryClient()
  const toastTransaction = useToastTransaction()
  const airdrop = airdropFactory({ rpc, rpcSubscriptions })

  return useMutation({
    mutationKey: ['airdrop', { chain, address }],
    mutationFn: async (amount: number = 1) =>
      airdrop({
        commitment: 'confirmed',
        recipientAddress: address,
        lamports: lamports(BigInt(Math.round(amount * 1_000_000_000))),
      }),
    onSuccess: (signature) => {
      toastTransaction(signature)
      return Promise.all([
        client.invalidateQueries({ queryKey: ['get-balance', { chain, address }] }),
        client.invalidateQueries({ queryKey: ['get-signatures', { chain, address }] }),
      ])
    },
  })
}

async function createTransaction({
  amount,
  destination,
  rpc,
  txSigner,
}: {
  amount: number
  destination: Address
  rpc: SolanaRpc
  txSigner: TransactionSendingSigner
}): Promise<{
  signature: string
  latestBlockhash: {
    blockhash: Blockhash
    lastValidBlockHeight: bigint
  }
}> {
  const { value: latestBlockhash } = await rpc.getLatestBlockhash({ commitment: 'confirmed' }).send()

  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (m) => setTransactionMessageFeePayerSigner(txSigner, m),
    (m) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
    (m) =>
      appendTransactionMessageInstruction(
        getTransferSolInstruction({
          amount,
          destination: address(destination),
          source: txSigner,
        }),
        m,
      ),
  )
  assertIsTransactionMessageWithSingleSendingSigner(message)

  const signature = await signAndSendTransactionMessageWithSigners(message)

  return {
    signature: getBase58Decoder().decode(signature),
    latestBlockhash,
  }
}
