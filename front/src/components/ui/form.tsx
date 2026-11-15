import * as React from 'react'
import { cn } from '@/utils/cn'

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('space-y-2', className)}
      {...props}
    />
  )
)
FormField.displayName = 'FormField'

const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
    {...props}
  />
))
FormLabel.displayName = 'FormLabel'

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-destructive', className)}
    {...props}
  >
    {children}
  </p>
))
FormMessage.displayName = 'FormMessage'

export { FormField, FormLabel, FormMessage }