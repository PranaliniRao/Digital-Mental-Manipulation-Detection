import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg' }
const variants = { primary: 'bg-gradient-to-r from-[#7c3aed] to-[#c084fc] text-white shadow-[0_10px_30px_rgb(168_85_247_/_0.25)] hover:brightness-110', secondary: 'border border-subtle bg-elevated text-ink hover:border-violet/30 hover:bg-white/[0.06]', ghost: 'text-muted hover:bg-white/[0.05] hover:text-ink', danger: 'bg-danger text-white hover:bg-danger/90' }
const sizes = { sm: 'h-9 px-3.5 text-xs', md: 'h-10 px-4 text-sm', lg: 'h-12 px-5 text-sm' }
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => <button ref={ref} type={type} className={cn('button-ripple inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-all duration-200 hover:-translate-y-px active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transform-none', variants[variant], sizes[size], className)} {...props} />)
Button.displayName = 'Button'
