import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) { return <span className={cn('inline-flex items-center rounded-full border border-violet/20 bg-violet/10 px-2.5 py-1 font-mono text-[0.64rem] font-medium uppercase tracking-[0.12em] text-violet', className)} {...props} /> }
