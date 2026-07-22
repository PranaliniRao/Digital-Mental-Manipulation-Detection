import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { cn } from '../../utils/cn'
export function Tabs({ children }: PropsWithChildren) { return <div role="tablist" className="inline-flex gap-1 rounded-control border border-subtle bg-canvas/40 p-1">{children}</div> }
export function Tab({ className, active = false, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) { return <button role="tab" aria-selected={active} className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', active ? 'bg-elevated text-ink shadow-sm' : 'text-muted hover:text-ink', className)} {...props} /> }

