import * as React from 'react'
import { cn } from '@/utils/cn'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onValueChange?: (value: string) => void
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, onValueChange, value, defaultValue, ...props }, ref) => {
    const [selectedValue, setSelectedValue] = React.useState(value || defaultValue || '')
    
    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value)
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = e.target.value
      setSelectedValue(newValue)
      onValueChange?.(newValue)
      props.onChange?.(e)
    }

    return (
      <select
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:py-2',
          className
        )}
        ref={ref}
        value={selectedValue}
        onChange={handleChange}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = 'Select'

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: 'popper' | 'inline'
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, position = 'popper', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
        position === 'inline' ? 'w-full' : '',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
SelectContent.displayName = 'SelectContent'

interface SelectItemProps extends React.HTMLAttributes<HTMLOptionElement> {
  value: string
  disabled?: boolean
}

const SelectItem = React.forwardRef<HTMLOptionElement, SelectItemProps>(
  ({ className, value, disabled, children, ...props }, ref) => (
    <option
      ref={ref}
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      value={value}
      disabled={disabled}
      {...props}
    >
      {children}
    </option>
  )
)
SelectItem.displayName = 'SelectItem'

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value?: string
  placeholder?: string
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, value, placeholder, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
        className
      )}
      {...props}
    >
      <span>{children || value || placeholder || 'Select...'}</span>
    </button>
  )
)
SelectTrigger.displayName = 'SelectTrigger'

interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string
}

const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ className, placeholder, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn('text-sm', className)}
      {...props}
    >
      {children || placeholder}
    </span>
  )
)
SelectValue.displayName = 'SelectValue'

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }