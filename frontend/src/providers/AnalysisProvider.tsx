import { createContext, useContext, useState } from 'react'
import type { PropsWithChildren } from 'react'
import type { AnalysisSuccess } from '../services/api/contracts'
import { normalizeAnalysisResult, type LiveAnalysisResult } from '../features/workspace/data/normalizeAnalysisResult'

type AnalysisContextValue = {
  /** The raw backend response for the most recently completed analysis. */
  currentAnalysis: AnalysisSuccess | null
  /** The normalized report snapshot for the most recently completed analysis. */
  currentAnalysisResult: LiveAnalysisResult | null
  /** Replace the current analysis with a new one. */
  setCurrentAnalysis: (response: AnalysisSuccess | null) => void
  /** Clear the stored analysis (e.g. on reset). */
  clearAnalysis: () => void
}

const AnalysisContext = createContext<AnalysisContextValue | null>(null)

export function AnalysisProvider({ children }: PropsWithChildren) {
  const [currentAnalysis, setCurrentAnalysisState] = useState<AnalysisSuccess | null>(null)
  const [currentAnalysisResult, setCurrentAnalysisResult] = useState<LiveAnalysisResult | null>(null)

  const setCurrentAnalysis = (response: AnalysisSuccess | null) => {
    setCurrentAnalysisState(response)
    setCurrentAnalysisResult(response ? normalizeAnalysisResult(response) : null)
  }

  const clearAnalysis = () => {
    setCurrentAnalysisState(null)
    setCurrentAnalysisResult(null)
  }

  return (
    <AnalysisContext.Provider value={{ currentAnalysis, currentAnalysisResult, setCurrentAnalysis, clearAnalysis }}>
      {children}
    </AnalysisContext.Provider>
  )
}

export function useAnalysis(): AnalysisContextValue {
  const ctx = useContext(AnalysisContext)
  if (!ctx) throw new Error('useAnalysis must be used inside <AnalysisProvider>')
  return ctx
}
