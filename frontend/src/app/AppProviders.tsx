import type { PropsWithChildren } from 'react'
import { AnimationProvider } from '../providers/AnimationProvider'
import { ThemeProvider } from '../providers/ThemeProvider'
import { ToastProvider } from '../components/ui'
import { ProfileProvider } from '../providers/ProfileProvider'
import { AnalysisProvider } from '../providers/AnalysisProvider'

export function AppProviders({ children }: PropsWithChildren) {
  return <ThemeProvider><AnimationProvider><AnalysisProvider><ProfileProvider><ToastProvider>{children}</ToastProvider></ProfileProvider></AnalysisProvider></AnimationProvider></ThemeProvider>
}
