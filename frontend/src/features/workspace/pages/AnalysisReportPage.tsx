import { ArrowLeft, Clock3, ShieldAlert } from 'lucide-react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { Button, Badge } from '../../../components/ui'
import { AgentInsightCard } from '../components/AgentInsightCard'
import { BarChart, Donut, TrendChart } from '../components/ChartPrimitives'
import { DefenceAgentCard } from '../components/DefenceAgentCard'
import { ExplainabilityPanel } from '../components/ExplainabilityPanel'
import { JudgeDecisionPanel } from '../components/JudgeDecisionPanel'
import { PageShell, Panel, SectionTitle } from '../components/PageShell'
import { ReportActions } from '../components/ReportActions'
import { useAnalysis } from '../../../providers/AnalysisProvider'
import { normalizeAnalysisResult, type LiveAnalysisResult } from '../data/normalizeAnalysisResult'
import { formatDisplayLabel } from '../../../utils/formatDisplayLabel'

function riskLabel(confidence: number | null, decision: string): string {
  if (decision !== 'manipulation') return 'Low risk'
  if (!confidence) return 'Unknown risk'
  if (confidence >= 90) return 'Very high risk'
  if (confidence >= 75) return 'High risk'
  if (confidence >= 50) return 'Moderate risk'
  return 'Low risk'
}

function riskScore(confidence: number | null, decision: string): number {
  if (decision !== 'manipulation') return Math.round((confidence ?? 20) * 0.3)
  return confidence ?? 50
}

export function AnalysisReportPage() {
  const { reportId } = useParams()
  const { currentAnalysis, currentAnalysisResult } = useAnalysis()

  if (!currentAnalysis || !currentAnalysisResult) return <Navigate to="/app/new-analysis" replace />

  const result: LiveAnalysisResult = currentAnalysisResult ?? normalizeAnalysisResult(currentAnalysis)
  const decision = result.metaJudge.decision || result.judge.decision
  const confidence = result.metaJudge.confidence ?? result.judge.confidence
  const risk = riskLabel(confidence, decision)
  const score = riskScore(confidence, decision)
  const isManipulation = decision === 'manipulation'

  // Extract filename from original input if it's a file path, otherwise use generic title
  const originalInput = (currentAnalysis as any).original_input || result.extractedText
  const displayTitle = originalInput.includes('\\') || originalInput.includes('/')
    ? originalInput.split(/[/\\]/).pop() || 'Manipulation Analysis Report'
    : result.extractedText.slice(0, 60) + (result.extractedText.length > 60 ? '…' : '')

  const agentCards = result.agents.map(a => ({
    name: a.name,
    confidence: a.confidence ?? 0,
    contribution: a.contribution ?? 0,
    summary: a.summary,
    reasoning: a.reasoning,
    evidence: a.status && a.status !== 'none' ? [a.status] : [],
  }))

  const rawEmo = (currentAnalysis.analysis as Record<string, unknown>)
  const allEmotions = (rawEmo?.emotion_output as Record<string, unknown>)?.all_emotions as Record<string, number> | undefined
  const emotionEntries: [string, string][] = allEmotions
    ? Object.entries(allEmotions).sort((a, b) => b[1] - a[1]).slice(0, 4)
        .map(([k, v]) => [k.charAt(0).toUpperCase() + k.slice(1), `${Math.round(v * 100)}%`])
    : [['Neutral', '100%']]

  return (
    <PageShell
      eyebrow={reportId === 'current' ? 'Current analysis report' : reportId ? `Report ${reportId}` : 'Analysis Report'}
      title={displayTitle}
      description="Complete analysis report from the most recently completed pipeline run."
      action={<Link to="/app/new-analysis"><Button variant="secondary"><ArrowLeft size={15} />New analysis</Button></Link>}
    >
      {/* Hero */}
      <Panel className="relative overflow-hidden">
        <div className="absolute right-0 top-0 size-80 -translate-y-1/2 translate-x-1/3 rounded-full bg-violet/10 blur-3xl" />
        <div className="relative grid gap-7 lg:grid-cols-[.75fr_1.25fr]">
          <div className="flex flex-col items-center justify-center rounded-panel border border-violet/20 bg-canvas/40 p-7 text-center">
            <Donut value={score} label="risk score" />
            <p className="mt-4 text-lg font-semibold">{risk}</p>
            <Badge className={`mt-2 ${isManipulation ? 'border-danger/30 bg-danger/10 text-danger' : 'border-success/30 bg-success/10 text-success'}`}>
              {isManipulation ? 'Human review advised' : 'No manipulation detected'}
            </Badge>
            <p className="mt-5 font-mono text-[.62rem] uppercase tracking-[.12em] text-muted">Confidence · {confidence ?? '—'}%</p>
          </div>
          <div>
            <p className="font-mono text-[.62rem] uppercase tracking-[.14em] text-violet">Executive summary</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">{formatDisplayLabel(decision)}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">{result.metaJudge.summary || result.judge.reasoning}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {result.agents.filter(a => a.status && a.status !== 'none' && a.status !== 'no_manipulation').slice(0, 4).map(a => (
                <div key={a.key} className="flex gap-2 rounded-control border border-subtle bg-canvas/35 p-3 text-xs leading-5">
                  <span className="mt-0.5 shrink-0 text-violet">▸</span>{a.name}: {formatDisplayLabel(a.status)}
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
              <span><Clock3 className="mr-1 inline text-violet" size={14} />Completed just now</span>
              <span><ShieldAlert className="mr-1 inline text-warning" size={14} />Live result</span>
            </div>
          </div>
        </div>
      </Panel>

      {/* Defence Agent - 2nd card */}
      <div className="mt-4"><DefenceAgentCard defence={result.defence} /></div>

      <div className="mt-4"><ReportActions result={result} /></div>

      {/* Charts */}
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_.85fr]">
        <Panel>
          <SectionTitle title="Agent confidence timeline" description="Confidence across specialist agents" />
          <TrendChart values={result.agents.map(a => a.confidence ?? 0)} />
          <div className="mt-1 flex justify-between font-mono text-[.6rem] uppercase text-muted">
            {result.agents.slice(0, 3).map(a => <span key={a.key}>{a.name.split(' ')[0]}</span>)}
          </div>
        </Panel>
        <Panel>
          <SectionTitle title="Emotion distribution" description="Primary emotion signals" />
          <div className="grid grid-cols-2 gap-3 pt-2">
            {emotionEntries.map(([name, value]) => (
              <div className="rounded-control border border-subtle bg-canvas/40 p-3" key={name}>
                <p className="text-xl font-semibold text-violet">{value}</p>
                <p className="text-xs text-muted">{name}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Agent cards */}
      <div className="mt-4">
        <SectionTitle title="Specialist lenses" description="Results from each analysis agent" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {agentCards.map(agent => <AgentInsightCard key={agent.name} agent={agent} />)}
        </div>
      </div>

      <div className="mt-4"><JudgeDecisionPanel result={result} /></div>

      {/* Bottom charts */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel>
          <SectionTitle title="Agent confidence" description="Confidence per specialist agent" />
          <BarChart values={result.agents.map(a => a.confidence ?? 0)} />
        </Panel>
        <Panel>
          <SectionTitle title="RoBERTa output" description="Base model prediction" />
          <div className="space-y-3 pt-2">
            <div className="rounded-control border border-subtle bg-canvas/40 p-3">
              <p className="text-xl font-semibold text-violet capitalize">{result.roberta.prediction}</p>
              <p className="text-xs text-muted">Prediction</p>
            </div>
            <div className="rounded-control border border-subtle bg-canvas/40 p-3">
              <p className="text-xl font-semibold text-violet">{result.roberta.confidence ?? '—'}%</p>
              <p className="text-xs text-muted">Confidence</p>
            </div>
          </div>
        </Panel>
        <Panel>
          <SectionTitle title="Meta Judge" description="Final arbitration" />
          <div className="space-y-3 pt-2">
            <div className="rounded-control border border-subtle bg-canvas/40 p-3">
              <p className="text-xl font-semibold text-violet">{formatDisplayLabel(result.metaJudge.decision)}</p>
              <p className="text-xs text-muted">Final decision</p>
            </div>
            <div className="rounded-control border border-subtle bg-canvas/40 p-3">
              <p className="text-xl font-semibold text-violet">{result.metaJudge.agreement ?? '—'}%</p>
              <p className="text-xs text-muted">Agent agreement</p>
            </div>
          </div>
        </Panel>
      </div>

      <div className="mt-4"><ExplainabilityPanel result={result} /></div>
    </PageShell>
  )
}
