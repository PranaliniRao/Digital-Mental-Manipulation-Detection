import { FileImage, ImagePlus, Info, RotateCcw, Sparkles, TriangleAlert, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '../../../components/ui'
import { useAnalysis } from '../../../providers/AnalysisProvider'
import { apiClient } from '../../../services/api/client'
import type { AnalysisResponse } from '../../../services/api/contracts'
import { AnalysisLoadingExperience } from '../components/AnalysisLoadingExperience'
import { LiveAnalysisResults } from '../components/LiveAnalysisResults'
import { PageShell, Panel, SectionTitle } from '../components/PageShell'
import { normalizeAnalysisResult, type LiveAnalysisResult } from '../data/normalizeAnalysisResult'
import { analysisStages } from '../data/analysisMockData'
import { recentImages } from '../data/placeholderData'
import { saveAnalysis } from '../../../services/sessionHistory'


export function ImageAnalysisPage() {
  const input = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
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

  const analyze = async () => {
    if (!file) return
    setRunning(true); setStage(0); setError(null)
    try {
      const response: AnalysisResponse = await apiClient.analyzeImage(file)
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
    <PageShell title="Image analysis" description="Upload a visual asset to prepare it for a future authenticity review workflow.">
      {!running && !result && (
        <div className="grid gap-5 xl:grid-cols-[1.5fr_.85fr]">
          <Panel>
            <SectionTitle title="Upload image" description="PNG, JPG, WEBP up to 20 MB" />
            <input ref={input} className="hidden" type="file" accept="image/png,image/jpeg,image/webp" onChange={e => setFile(e.target.files?.[0] ?? null)} />
            <button onClick={() => input.current?.click()} className="group grid min-h-[22rem] w-full place-items-center rounded-control border border-dashed border-violet/35 bg-violet/[.035] p-8 text-center transition hover:border-violet hover:bg-violet/[.07]">
              <div>
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-violet/15 text-violet transition group-hover:scale-110"><ImagePlus size={24}/></span>
                <p className="mt-4 text-sm font-semibold">{file ? file.name : 'Drop an image here or browse files'}</p>
                <p className="mt-1 text-xs text-muted">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB · ready to analyze` : 'Your original stays in this workspace.'}</p>
              </div>
            </button>
            <div className="mt-4 flex justify-end">
              <Button disabled={!file} onClick={analyze}><Sparkles size={15}/>Analyze image</Button>
            </div>
          </Panel>
          <div className="space-y-5">
            <Panel>
              <SectionTitle title="Image information" />
              {file ? <div className="space-y-3 text-sm"><p><span className="text-muted">Name</span><br/>{file.name}</p><p><span className="text-muted">Type</span><br/>{file.type || 'Unknown'}</p><p><span className="text-muted">Size</span><br/>{(file.size / 1024 / 1024).toFixed(2)} MB</p></div> : <div className="py-7 text-center text-sm text-muted"><Info className="mx-auto mb-2 text-violet" size={18}/>Choose a file to preview its details.</div>}
            </Panel>
            <Panel>
              <SectionTitle title="Supported formats" />
              <div className="flex flex-wrap gap-2">{['PNG', 'JPG', 'WEBP'].map(x => <span key={x} className="rounded-full border border-subtle bg-canvas/45 px-3 py-1 text-xs text-muted">{x}</span>)}</div>
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
