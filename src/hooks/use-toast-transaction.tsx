import { ExplorerLink } from '@/components/chain-select'
import { useToast } from '@/hooks/use-toast'

export function useToastTransaction() {
  const { toast } = useToast()

  return (signature: string) =>
    toast({
      variant: 'default',
      title: 'Transaction sent',
      description: (
        <ExplorerLink path={`tx/${signature}`} label={'View Transaction'} className="btn btn-xs btn-primary" />
      ),
    })
}
