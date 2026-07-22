import type { PropsWithChildren } from 'react'

export function ThemeProvider({ children }: PropsWithChildren) {
  return <div data-theme="dark" className="min-h-screen bg-canvas">{children}</div>
}

