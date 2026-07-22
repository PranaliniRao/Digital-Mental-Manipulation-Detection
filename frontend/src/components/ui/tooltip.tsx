import type { PropsWithChildren } from 'react'
export function Tooltip({ label, children }: PropsWithChildren<{ label: string }>) { return <span className="group relative inline-flex"><span aria-label={label}>{children}</span><span role="tooltip" className="pointer-events-none absolute bottom-[calc(100%+0.55rem)] left-1/2 z-40 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-subtle bg-elevated px-2 py-1 text-[0.68rem] text-muted shadow-panel group-hover:block group-focus-within:block">{label}</span></span> }

