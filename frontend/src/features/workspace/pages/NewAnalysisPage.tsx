import { RotateCcw, TriangleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../../components/ui'
import { apiClient } from '../../../services/api/client'
import type { AnalysisResponse } from '../../../services/api/contracts'
import { AnalysisInputWorkspace, type AnalysisInput } from '../components/AnalysisInputWorkspace'
import { AnalysisLoadingExperience } from '../components/AnalysisLoadingExperience'
import { LiveAnalysisResults } from '../components/LiveAnalysisResults'
import { PageShell, Panel } from '../components/PageShell'
import { normalizeAnalysisResult, type LiveAnalysisResult } from '../data/normalizeAnalysisResult'
import { analysisStages } from '../data/analysisMockData'
import { useAnalysis } from '../../../providers/AnalysisProvider'

export function NewAnalysisPage() {
  const [running, setRunning] = useState(false)
  const [stage, setStage] = useState(0)
  const [result, setResult] = useState<LiveAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { setCurrentAnalysis } = useAnalysis()

  useEffect(() => {
    if (!running || result || stage >= analysisStages.length - 2) return
    const timer = window.setTimeout(() => setStage(current => current + 1), 680)
    return () => window.clearTimeout(timer)
  }, [result, running, stage])

  const reset = () => { setRunning(false); setStage(0); setResult(null); setError(null) }

  const analyze = async (input: AnalysisInput) => {
    setRunning(true); setStage(0); setError(null)
    try {
      const response: AnalysisResponse = input.kind === 'text'
        ? await apiClient.analyzeText(input.text)
        : await apiClient.analyzeImage(input.file)
      if (!response.success) throw new Error(response.error)
      // Store as single source of truth BEFORE normalizing
      setCurrentAnalysis(response)
      setStage(analysisStages.length - 1)
      setResult(normalizeAnalysisResult(response))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Analysis could not be completed.')
      setRunning(false)
    }
  }

  return (
    <PageShell
      eyebrow="Analysis workspace"
      title={result ? 'Analysis results' : running ? 'Analyzing your source' : 'Start a new analysis'}
      description={result ? 'Your core decision signals are ready. Open the full report when you need advanced visualizations and explainability.' : running ? 'The current endpoint returns one completed analysis payload. Progress remains visible while the request is running.' : 'Provide text or an image to begin a guided review.'}
    >
      {!running && !result && <AnalysisInputWorkspace onAnalyze={analyze} />}
      {running && !result && <AnalysisLoadingExperience activeStage={stage} />}
      {error && (
        <Panel className="mt-5 flex flex-col items-start gap-4 border-danger/25 sm:flex-row sm:items-center">
          <TriangleAlert className="text-danger" size={20} />
          <div className="flex-1">
            <p className="text-sm font-semibold">Analysis unavailable</p>
            <p className="mt-1 text-xs text-muted">{error}</p>
          </div>
          <Button variant="secondary" onClick={reset}><RotateCcw size={15} />Try again</Button>
        </Panel>
      )}
      {result && <LiveAnalysisResults result={result} onReset={reset} />}
    </PageShell>
  )
}
