import { ClipboardPaste, FileText, RotateCcw, Sparkles, Trash2, TriangleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button, Textarea } from '../../../components/ui'
import { useAnalysis } from '../../../providers/AnalysisProvider'
import { apiClient } from '../../../services/api/client'
import type { AnalysisResponse } from '../../../services/api/contracts'
import { AnalysisLoadingExperience } from '../components/AnalysisLoadingExperience'
import { LiveAnalysisResults } from '../components/LiveAnalysisResults'
import { PageShell, Panel, SectionTitle } from '../components/PageShell'
import { normalizeAnalysisResult, type LiveAnalysisResult } from '../data/normalizeAnalysisResult'
import { analysisStages } from '../data/analysisMockData'
import { saveAnalysis } from '../../../services/sessionHistory'

const example = 'Urgent: experts say this overlooked policy change will affect every household by Friday. Share this message before it is removed.'

export function TextAnalysisPage() {
  const [text, setText] = useState('')
  const [running, setRunning] = useState(false)
  const [stage, setStage] = useState(0)
  const [result, setResult] = useState<LiveAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { setCurrentAnalysis } = useAnalysis()
  const words = text.trim() ? text.trim().split(/\s+/).length : 0

  useEffect(() => {
    if (!running || result || stage >= analysisStages.length - 2) return
    const timer = window.setTimeout(() => setStage(current => current + 1), 680)
    return () => window.clearTimeout(timer)
  }, [result, running, stage])

  const reset = () => { setRunning(false); setStage(0); setResult(null); setError(null) }

  const analyze = async () => {
    const trimmed = text.trim()
    if (!trimmed) return
    setRunning(true); setStage(0); setError(null)
    try {
      const response: AnalysisResponse = await apiClient.analyzeText(trimmed)
      if (!response.success) throw new Error(response.error)
      setCurrentAnalysis(response)
      saveAnalysis(response)
      setStage(analysisStages.length - 1)
      setResult(normalizeAnalysisResult(response))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Analysis could not be completed.')
      setRunning(false)
    }
  }

  return (
    <PageShell title="Text analysis" description="Review written material for manipulation signals.">
      {!running && !result && (
        <div className="grid gap-5 xl:grid-cols-[1.6fr_.75fr]">
          <Panel>
            <SectionTitle title="Text to review" description="Paste text, draft a sample, or load an example." />
            <Textarea value={text} onChange={e => setText(e.target.value)} className="min-h-[22rem] bg-canvas/55 font-mono text-[.83rem] leading-7" placeholder="Paste content here…" />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-4 font-mono text-[.62rem] uppercase tracking-[.1em] text-muted">
                <span>{words} words</span>
                <span>{text.length} characters</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" onClick={() => setText('')}><Trash2 size={14}/>Clear</Button>
                <Button variant="secondary" size="sm" onClick={() => setText(example)}><FileText size={14}/>Example</Button>
                <Button size="sm" disabled={!text.trim()} onClick={analyze}><Sparkles size={14}/>Analyze text</Button>
              </div>
            </div>
          </Panel>
          <div className="space-y-5">
            <Panel>
              <SectionTitle title="Workspace guardrails" />
              <div className="space-y-4 text-sm">
                <p className="border-l-2 border-violet pl-3 text-muted">Analyses stay in your workspace and are ready for future model integration.</p>
                <p className="text-xs text-muted">Recommended input: complete paragraphs, source context, and original wording.</p>
              </div>
            </Panel>
            <Panel>
              <SectionTitle title="Quick actions" />
              <Button variant="secondary" className="w-full justify-start" onClick={() => navigator.clipboard?.readText().then(setText)}><ClipboardPaste size={15}/>Paste from clipboard</Button>
              <p className="mt-3 text-xs text-muted">Browser clipboard permission may be required.</p>
            </Panel>
          </div>
        </div>
      )}
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
