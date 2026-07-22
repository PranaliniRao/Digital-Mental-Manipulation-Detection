import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => <textarea ref={ref} className={cn('min-h-28 w-full resize-y rounded-control border border-subtle bg-canvas/60 px-3.5 py-3 text-sm text-ink placeholder:text-muted/65 transition-colors hover:border-white/10 focus:border-violet/60', className)} {...props} />)
Textarea.displayName = 'Textarea'
