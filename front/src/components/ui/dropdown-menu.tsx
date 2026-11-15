import * as React from 'react'
import { cn } from '@/utils/cn'

interface DropdownMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

const DropdownMenu = React.forwardRef<HTMLDivElement, DropdownMenuProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('relative', className)} {...props}>
      {children}
    </div>
  )
)
DropdownMenu.displayName = 'DropdownMenu'

interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
)
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger'

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'end'
  sideOffset?: number
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, align = 'start', sideOffset = 4, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
        align === 'end' && 'right-0',
        className
      )}
      style={{ marginTop: sideOffset }}
      {...props}
    >
      {children}
    </div>
  )
)
DropdownMenuContent.displayName = 'DropdownMenuContent'

interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  inset?: boolean
}

const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ className, inset, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        inset && 'pl-8',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
)
DropdownMenuItem.displayName = 'DropdownMenuItem'

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem }