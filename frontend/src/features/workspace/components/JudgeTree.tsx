import { ChevronDown, GitBranch, ShieldCheck } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { Panel, SectionTitle } from './PageShell'
import type { LiveAnalysisResult } from '../data/normalizeAnalysisResult'
import { formatDisplayLabel } from '../../../utils/formatDisplayLabel'

export function JudgeTree({ result }: { result: LiveAnalysisResult }) {
  const [open, setOpen] = useState<number[]>([0])
  const toggle = (index: number) => setOpen(current =>
    current.includes(index) ? current.filter(i => i !== index) : [...current, index]
  )

  const branches = [
    ['Agent decisions', `${result.agents.length} specialist agents contributed weighted evidence.`],
    ['Judge evaluation', result.judge.reasoning],
    ['Meta Judge', result.metaJudge.summary],
    ['Final decision', `${formatDisplayLabel(result.metaJudge.decision)} — ${result.metaJudge.confidence ?? result.judge.confidence ?? '—'}% confidence`],
  ]

  return (
    <Panel>
      <SectionTitle title="Judge decision tree" description="Expandable decision path and agreement rationale" />
      {branches.map(([title, detail], index) => (
        <div className="relative border-t border-subtle py-3 first:border-0 first:pt-0" key={title}>
          <button onClick={() => toggle(index)} className="flex w-full items-center gap-3 text-left">
            <span className="grid size-8 place-items-center rounded-control bg-violet/10 text-violet">
              {index === 3 ? <ShieldCheck size={16} /> : <GitBranch size={16} />}
            </span>
            <span className="flex-1 text-sm font-semibold">{title}</span>
            <ChevronDown className={`text-muted transition ${open.includes(index) ? 'rotate-180' : ''}`} size={16} />
          </button>
          <AnimatePresence>
            {open.includes(index) && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="ml-11 mt-2 overflow-hidden text-xs leading-6 text-muted capitalize">
                {detail}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      ))}
    </Panel>
  )
}
