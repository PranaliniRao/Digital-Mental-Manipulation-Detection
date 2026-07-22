import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => <input ref={ref} className={cn('h-11 w-full rounded-control border border-subtle bg-canvas/60 px-3.5 text-sm text-ink placeholder:text-muted/65 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.025)] transition-[border-color,box-shadow,background-color] hover:border-white/10 focus:border-violet/60 focus:bg-canvas focus:shadow-[0_0_0_3px_rgb(139_92_246_/_0.12)]', className)} {...props} />)
Input.displayName = 'Input'
