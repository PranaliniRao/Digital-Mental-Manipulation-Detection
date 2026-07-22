import type { PropsWithChildren, ReactNode } from 'react'
export function Dropdown({ trigger, children }: PropsWithChildren<{ trigger: ReactNode }>) { return <details className="relative"><summary className="list-none [&::-webkit-details-marker]:hidden">{trigger}</summary><div className="absolute right-0 z-30 mt-2 min-w-44 rounded-control border border-subtle bg-elevated p-1 shadow-panel">{children}</div></details> }

