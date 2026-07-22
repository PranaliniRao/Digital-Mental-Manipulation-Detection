import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn('rounded-panel border border-subtle bg-surface/90 shadow-panel transition-[transform,border-color,box-shadow] duration-300 motion-reduce:transition-none', className)} {...props} /> }
