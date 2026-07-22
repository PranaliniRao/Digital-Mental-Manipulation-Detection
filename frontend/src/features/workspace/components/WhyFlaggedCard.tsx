import { BrainCircuit, ChevronDown, CircleAlert, HeartPulse, Scale, ShieldAlert, Sparkles, Target } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import type { LiveAnalysisResult } from '../data/normalizeAnalysisResult'
import { Panel } from './PageShell'
import { formatDisplayLabel } from '../../../utils/formatDisplayLabel'

const ICON_MAP = [BrainCircuit, HeartPulse, Target, CircleAlert, ShieldAlert, BrainCircuit, Scale, Scale]
const SECTION_KEYS = [
  'intent', 'emotion_exploitation', 'strategy', 'vulnerability',
  'bias', 'context', 'judge', 'meta_judge',
] as const

const stages = ['Input', 'Vision / Text Understanding', 'Emotion Detection', 'Agent Collaboration', 'Judge', 'Meta Judge', 'Final Decision']

export function WhyFlaggedCard({ result }: { result: LiveAnalysisResult }) {
  const [expanded, setExpanded] = useState(true)
  const [open, setOpen] = useState<number[]>([0, 1])
  const toggle = (index: number) => setOpen(current =>
    current.includes(index) ? current.filter(i => i !== index) : [...current, index]
  )

  const influential = [...result.agents].sort((a, b) => (b.contribution ?? 0) - (a.contribution ?? 0))[0]
  const technique = result.technique !== 'Not available' ? result.technique : (influential?.status ?? 'N/A')
  const confidence = result.confidence ?? result.judge.confidence ?? 0
  const primaryEmotion = result.primaryEmotion !== 'Not available' ? result.primaryEmotion : 'N/A'

  // Build reasoning rows from live agent data + judge + meta judge
  const agentMap = Object.fromEntries(result.agents.map(a => [a.key, a]))

  const reasoning: [typeof BrainCircuit, string, string, string][] = [
    [BrainCircuit, 'Language Analysis',
      agentMap['intent']?.reasoning ?? 'No intent analysis available.',
      agentMap['intent']?.status ? `"${agentMap['intent'].status}"` : 'No evidence'],
    [HeartPulse, 'Emotion Analysis',
      `Dominant emotion: ${primaryEmotion}. ${agentMap['emotion_exploitation']?.reasoning ?? ''}`,
      `Dominant emotion: ${primaryEmotion} · ${result.emotionConfidence ?? '—'}% confidence`],
    [Target, 'Intent Analysis',
      agentMap['intent']?.reasoning ?? 'No intent analysis available.',
      `Influential agent: ${influential?.name ?? 'N/A'} · ${influential?.contribution ?? 0}% contribution`],
    [CircleAlert, 'Vulnerability Analysis',
      agentMap['vulnerability']?.reasoning ?? 'No vulnerability analysis available.',
      agentMap['vulnerability']?.status ?? 'No evidence'],
    [ShieldAlert, 'Influence Strategy',
      agentMap['strategy']?.reasoning ?? 'No strategy analysis available.',
      agentMap['strategy']?.status ?? 'No evidence'],
    [BrainCircuit, 'Bias Analysis',
      agentMap['bias']?.reasoning ?? 'No bias analysis available.',
      `${agentMap['bias']?.status ?? 'No bias detected'} · ${agentMap['bias']?.confidence ?? '—'}% confidence`],
    [Scale, 'Judge Decision',
      result.judge.reasoning ?? 'No judge reasoning available.',
      `Judge confidence: ${result.judge.confidence ?? '—'}%`],
    [Scale, 'Meta Judge Decision',
      result.metaJudge.summary ?? 'No meta judge summary available.',
      `Agreement: ${result.metaJudge.agreement ?? '—'}%`],
  ]

  return (
    <Panel className="relative overflow-hidden border-violet/20 bg-[linear-gradient(135deg,rgb(139_92_246_/_0.10),transparent_42%),rgb(22_19_28_/_.78)] p-0 shadow-[0_24px_80px_rgb(0_0_0_/_0.26),0_0_0_1px_rgb(139_92_246_/_0.06)]">
      <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-violet/15 blur-3xl" />
      <button onClick={() => setExpanded(v => !v)} className="relative flex w-full items-start justify-between gap-6 p-5 text-left sm:p-6" aria-expanded={expanded}>
        <div>
          <p className="font-mono text-[.62rem] uppercase tracking-[.17em] text-violet">Decision rationale</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">Why was this flagged?</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">A clear, evidence-led explanation of the AI decision — designed for fast review and deeper investigation.</p>
        </div>
        <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-full border border-violet/25 bg-violet/10 text-violet">
          <ChevronDown size={17} className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .32, ease: [0.22, 1, 0.36, 1] }} className="relative overflow-hidden">
            <div className="px-5 pb-5 sm:px-6 sm:pb-6">
              <div className="rounded-xl border border-violet/20 bg-[#17131d]/75 p-4 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.04)] sm:p-5">
                <p className="max-w-3xl text-sm leading-7 text-ink">
                  This content was analysed and classified as{' '}
                    <mark className="rounded bg-violet/20 px-1.5 py-0.5 font-medium text-ink">
                    {formatDisplayLabel(result.metaJudge.decision || result.judge.decision)}
                  </mark>
                  {'. '}
                  {result.metaJudge.summary || result.judge.reasoning}
                </p>
                <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  <Insight label="Primary technique" value={technique} />
                  <Insight label="Dominant emotion" value={primaryEmotion} />
                  <Insight label="Most influential agent" value={influential?.name ?? 'N/A'} />
                  <Insight label="Confidence" value={`${confidence}%`} />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/[.07] pt-3 text-xs">
                  <span className="text-muted">
                    Supporting evidence: <b className="font-medium text-ink">{agentMap['intent']?.status ?? 'see agent results'}</b>
                  </span>
                  <span className="font-mono uppercase tracking-[.1em] text-violet">{confidence}% confidence</span>
                </div>
              </div>

              {/* Per-section reasoning rows */}
              <div className="mt-5 grid gap-2 md:grid-cols-2">
                {reasoning.map(([Icon, title, detail, evidence], index) => (
                  <div key={title} className="overflow-hidden rounded-xl border border-white/[.08] bg-[#15121a]/60 transition-colors hover:border-violet/25">
                    <button onClick={() => toggle(index)} className="flex w-full items-center gap-3 p-3.5 text-left">
                      <span className="grid size-8 place-items-center rounded-lg border border-violet/15 bg-violet/10 text-violet"><Icon size={15} /></span>
                      <span className="flex-1 text-xs font-semibold tracking-[.01em]">{title}</span>
                      <ChevronDown className={`text-muted transition-transform duration-250 ${open.includes(index) ? 'rotate-180' : ''}`} size={15} />
                    </button>
                    <AnimatePresence initial={false}>
                      {open.includes(index) && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .24 }} className="overflow-hidden border-t border-white/[.07]">
                          <p className="px-3.5 pb-1 pt-3 text-xs leading-6 text-muted">{detail}</p>
                          <p className="px-3.5 pb-3.5 font-mono text-[.6rem] text-violet">{evidence}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Visual AI reasoning flow */}
              <div className="mt-6 rounded-xl border border-violet/15 bg-black/15 p-4 sm:p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="font-mono text-[.6rem] uppercase tracking-[.14em] text-violet">Visual AI reasoning flow</p>
                    <p className="mt-1 text-xs text-muted">Signals are evaluated progressively, then reconciled by two decision layers.</p>
                  </div>
                  <span className="hidden font-mono text-[.58rem] uppercase tracking-[.1em] text-muted sm:block">Live reasoning path</span>
                </div>
                <div className="relative mt-5 grid gap-2 sm:grid-cols-7 sm:gap-1">
                  {stages.map((stage, index) => (
                    <div key={stage} className="relative flex items-center sm:block">
                      <motion.span
                        initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        transition={{ delay: .12 + index * .09, duration: .35 }}
                        className={`relative z-10 flex min-h-12 flex-1 items-center rounded-lg border px-3 text-center text-[.61rem] font-semibold leading-4 sm:min-h-[4.5rem] sm:justify-center ${index === stages.length - 1 ? 'border-violet/50 bg-violet/20 text-[#e8dcff] shadow-[0_0_22px_rgb(139_92_246_/_0.17)]' : 'border-white/[.09] bg-white/[.025] text-muted'}`}
                      >{stage}</motion.span>
                      {index < stages.length - 1 && (
                        <motion.span initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ delay: .28 + index * .09 }}
                          className="mx-2 h-4 w-px origin-top bg-gradient-to-b from-violet/80 to-violet/20 sm:absolute sm:-right-1 sm:top-1/2 sm:mx-0 sm:h-px sm:w-2 sm:-translate-y-1/2 sm:bg-gradient-to-r"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  )
}

function Insight({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[.07] bg-white/[.025] p-3">
      <p className="font-mono text-[.55rem] uppercase tracking-[.11em] text-muted">{label}</p>
      <p className="mt-1 truncate text-xs font-semibold text-[#dcc7ff]" title={value}>{value}</p>
    </div>
  )
}
