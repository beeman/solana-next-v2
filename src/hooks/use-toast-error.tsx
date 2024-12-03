import { useToast } from '@/hooks/use-toast'

export function useToastError() {
  const { toast } = useToast()

  return (title: string) => toast({ variant: 'destructive', title })
}