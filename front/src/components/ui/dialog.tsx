import * as React from 'react'
import { cn } from '@/utils/cn'

interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  ({ className, children, open, onOpenChange, ...props }, ref) => {
    if (!open) return null
    return (
      <div
        ref={ref}
        className={cn('fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto', className)}
        {...props}
      >
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={() => onOpenChange?.(false)} />
        {children}
      </div>
    )
  }
)
Dialog.displayName = 'Dialog'

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
    {...props}
  />
))
DialogHeader.displayName = 'DialogHeader'

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))
DialogTitle.displayName = 'DialogTitle'

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
DialogDescription.displayName = 'DialogDescription'

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative z-50 w-full max-w-lg rounded-xl bg-background p-6 shadow-2xl border my-auto transition-all',
      className
    )}
    {...props}
  >
    {children}
  </div>
))
DialogContent.displayName = 'DialogContent'

const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
))
DialogFooter.displayName = 'DialogFooter'

export { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter }