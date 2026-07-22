import { CheckCircle2, Scale } from 'lucide-react'
import { Panel, SectionTitle } from './PageShell'
import type { LiveAnalysisResult } from '../data/normalizeAnalysisResult'
import { formatDisplayLabel } from '../../../utils/formatDisplayLabel'

export function JudgeDecisionPanel({ result }: { result: LiveAnalysisResult }) {
  const isManip = result.judge.decision === 'manipulation'
  const metaIsManip = result.metaJudge.decision === 'manipulation'

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel>
        <SectionTitle title="Judge" description="Decision aggregation layer" />
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-control bg-violet/12 text-violet"><Scale size={19} /></span>
          <div>
            <p className="text-sm font-semibold">{formatDisplayLabel(result.judge.decision)}</p>
            <p className="mt-1 text-sm leading-6 text-muted">{result.judge.reasoning}</p>
            <p className="mt-3 font-mono text-[.62rem] uppercase tracking-[.12em] text-violet">
              Confidence · {result.judge.confidence ?? '—'}%
            </p>
          </div>
        </div>
      </Panel>
      <Panel>
        <SectionTitle title="Meta Judge" description="Final arbitration and agreement" />
        <div className="flex items-start gap-3">
          <span className={`grid size-10 place-items-center rounded-control ${metaIsManip ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
            <CheckCircle2 size={19} />
          </span>
          <div>
            <p className="text-sm font-semibold">{formatDisplayLabel(result.metaJudge.decision)}</p>
            <p className="mt-1 text-sm leading-6 text-muted">{result.metaJudge.summary}</p>
            <p className="mt-3 font-mono text-[.62rem] uppercase tracking-[.12em] text-success">
              Agreement · {result.metaJudge.agreement ?? '—'}%
            </p>
          </div>
        </div>
      </Panel>
    </div>
  )
}
