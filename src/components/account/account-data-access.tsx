'use client'

import { useSolanaChain } from '@/components/solana/solana-chain-context'
import { useSolanaRpc } from '@/components/solana/solana-rpc-context'
import { TOKEN_PROGRAM_ADDRESS } from '@solana-program/token'
import { TOKEN_2022_PROGRAM_ADDRESS } from '@solana-program/token-2022'
import { Address, airdropFactory, lamports } from '@solana/web3.js'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

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

export function useTransferSol({ address }: { address: Address }) {
  const { chain } = useSolanaChain()

  // const transactionToast = useTransactionToast()
  // const wallet = useWallet()
  const client = useQueryClient()

  return useMutation({
    mutationKey: ['transfer-sol', { chain, address }],
    mutationFn: async (input: { destination: Address; amount: number }) => {
      console.log('transfer sol', input)
      // let signature: TransactionSignature = ''
      // try {
      //   const { transaction, latestBlockhash } = await createTransaction({
      //     publicKey: address,
      //     destination: input.destination,
      //     amount: input.amount,
      //     connection,
      //   })
      //
      //   // Send transaction and await for signature
      //   signature = await wallet.sendTransaction(transaction, connection)
      //
      //   // Send transaction and await for signature
      //   await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')
      //
      //   console.log(signature)
      //   return signature
      // } catch (error: unknown) {
      //   console.log('error', `Transaction failed! ${error}`, signature)
      //
      //   return
      // }
      return ''
    },
    onSuccess: (signature) => {
      if (signature.length) {
        // FIXME: Enable toast
        console.log('FIXME: toast signature link', signature)
        // transactionToast(signature)
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
      // FIXME: Enable toast
      console.log(`FIXME: toast signature link: ${error}`)
      // toast.error(`Transaction failed! ${error}`)
    },
  })
}

//

export function useRequestAirdrop({ address }: { address: Address }) {
  const { chain } = useSolanaChain()
  const { rpc, rpcSubscriptions } = useSolanaRpc()

  // const transactionToast = useTransactionToast()
  const client = useQueryClient()

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
      console.log('FIXME: toast signature link', signature)
      // transactionToast(signature)
      return Promise.all([
        client.invalidateQueries({ queryKey: ['get-balance', { chain, address }] }),
        client.invalidateQueries({ queryKey: ['get-signatures', { chain, address }] }),
      ])
    },
  })
}

//
// async function createTransaction({
//   publicKey,
//   destination,
//   amount,
//   connection,
// }: {
//   publicKey: Address
//   destination: Address
//   amount: number
//   connection: Connection
// }): Promise<{
//   transaction: VersionedTransaction
//   latestBlockhash: { blockhash: string; lastValidBlockHeight: number }
// }> {
//   // Get the latest blockhash to use in our transaction
//   const latestBlockhash = await connection.getLatestBlockhash()
//
//   // Create instructions to send, in this case a simple transfer
//   const instructions = [
//     SystemProgram.transfer({
//       fromPubkey: publicKey,
//       toPubkey: destination,
//       lamports: amount * LAMPORTS_PER_SOL,
//     }),
//   ]
//
//   // Create a new TransactionMessage with version and compile it to legacy
//   const messageLegacy = new TransactionMessage({
//     payerKey: publicKey,
//     recentBlockhash: latestBlockhash.blockhash,
//     instructions,
//   }).compileToLegacyMessage()
//
//   // Create a new VersionedTransaction which supports legacy and v0
//   const transaction = new VersionedTransaction(messageLegacy)
//
//   return {
//     transaction,
//     latestBlockhash,
//   }
// }
