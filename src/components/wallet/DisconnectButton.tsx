'use client'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { UiWallet } from '@wallet-standard/react'
import { useDisconnect } from '@wallet-standard/react'
import { LogOut, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { NO_ERROR } from '../errors'

interface DisconnectButtonProps extends React.ComponentProps<typeof Button> {
  wallet: UiWallet
}

type ErrorType = typeof NO_ERROR | Error | unknown

function getErrorMessage(error: ErrorType): string {
  if (error === NO_ERROR) return ''
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  return String(error)
}

export function DisconnectButton({ wallet, className, ...props }: Omit<DisconnectButtonProps, 'variant' | 'size'>) {
  const [isDisconnecting, disconnect] = useDisconnect(wallet)
  const [lastError, setLastError] = useState<ErrorType>(NO_ERROR)

  return (
    <TooltipProvider>
      <Tooltip open={lastError !== NO_ERROR}>
        <TooltipTrigger asChild>
          <Button
            variant="destructive"
            size="sm"
            className={className}
            disabled={isDisconnecting}
            onClick={async () => {
              setLastError(NO_ERROR)
              try {
                await disconnect()
              } catch (e) {
                setLastError(e)
              }
            }}
            {...props}
          >
            {lastError === NO_ERROR ? <LogOut className="h-4 w-4" /> : <TriangleAlert className="h-4 w-4" />}
            Disconnect
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Error: {getErrorMessage(lastError)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
