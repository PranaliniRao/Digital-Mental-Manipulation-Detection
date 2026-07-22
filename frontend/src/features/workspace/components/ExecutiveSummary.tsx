import { BrainCircuit, ShieldAlert, Sparkles } from 'lucide-react'
import type { LiveAnalysisResult } from '../data/normalizeAnalysisResult'
import { Panel, SectionTitle } from './PageShell'
import { formatDisplayLabel } from '../../../utils/formatDisplayLabel'

export function ExecutiveSummary({ result }: { result: LiveAnalysisResult }) {
  const influential = [...result.agents].sort((a, b) => (b.contribution ?? 0) - (a.contribution ?? 0))[0]
  const decision = result.metaJudge.decision || result.judge.decision
  const confidence = result.metaJudge.confidence ?? result.judge.confidence ?? 0

  return (
    <Panel className="textured-panel">
      <SectionTitle title="Executive explainability summary" description="A concise decision-ready view of the reasoning" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SummaryItem icon={ShieldAlert} label="Final decision" value={formatDisplayLabel(decision)} detail={decision === 'manipulation' ? 'Manipulation detected' : 'No manipulation'} />
        <SummaryItem icon={Sparkles} label="Confidence" value={`${confidence}%`} detail="Meta Judge confidence" />
        <SummaryItem icon={BrainCircuit} label="Top technique" value={result.technique !== 'Not available' ? formatDisplayLabel(result.technique) : 'N/A'} detail="Primary signal" />
        <SummaryItem icon={BrainCircuit} label="Influential agent" value={influential?.name ?? 'N/A'} detail={`${influential?.contribution ?? 0}% contribution`} />
        <SummaryItem icon={BrainCircuit} label="Primary emotion" value={formatDisplayLabel(result.primaryEmotion)} detail={`${result.emotionConfidence ?? '—'}% confidence`} />
      </div>
    </Panel>
  )
}

function SummaryItem({ icon: Icon, label, value, detail }: { icon: typeof ShieldAlert; label: string; value: string; detail: string }) {
  return (
    <div className="rounded-control border border-subtle bg-canvas/40 p-4">
      <Icon size={16} className="text-violet" />
      <p className="mt-4 font-mono text-[.6rem] uppercase tracking-[.1em] text-muted">{label}</p>
      <p className="mt-1 text-base font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted">{detail}</p>
    </div>
  )
}
