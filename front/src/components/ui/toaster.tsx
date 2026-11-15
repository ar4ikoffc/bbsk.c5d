import * as React from 'react'
import { cn } from '@/utils/cn'
import { X } from 'lucide-react'

interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success'
  onClose?: () => void
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = 'default', children, onClose, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-2 rounded-md border p-4 shadow-lg',
          variant === 'destructive' && 'border-destructive bg-destructive text-destructive-foreground',
          variant === 'success' && 'border-green-500 bg-green-500 text-white',
          variant === 'default' && 'border-border bg-background text-foreground',
          className
        )}
        {...props}
      >
        <div className="flex-1">{children}</div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }
)
Toast.displayName = 'Toast'

const Toaster = () => {
  // Simple toast implementation - in production use a proper toast library
  return <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" id="toaster" />
}

export { Toast, Toaster }