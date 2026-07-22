import { HeartPulse } from 'lucide-react'
import { motion } from 'framer-motion'
import type { LiveAnalysisResult } from '../data/normalizeAnalysisResult'
import { Panel, SectionTitle } from './PageShell'
import { formatDisplayLabel } from '../../../utils/formatDisplayLabel'

type EmotionEntry = { label: string; value: number }

export function EmotionDashboard({ result, emotions }: { result: LiveAnalysisResult; emotions: EmotionEntry[] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
      <Panel className="relative overflow-hidden">
        <div className="absolute -right-12 -top-12 size-44 rounded-full bg-violet/12 blur-3xl" />
        <SectionTitle title="Emotional analysis" description="Primary emotional pressure in the content" />
        <div className="relative flex items-center gap-5">
          <div className="relative grid size-28 place-items-center rounded-full border border-violet/35 bg-violet/10 shadow-[0_0_30px_rgb(139_92_246_/_0.15)]">
            <motion.span animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.8, repeat: Infinity }} className="absolute inset-2 rounded-full border border-violet/25" />
            <HeartPulse className="text-[#d8b4fe]" size={28} />
          </div>
          <div>
            <p className="text-2xl font-semibold tracking-tight">{formatDisplayLabel(result.primaryEmotion)}</p>
            <p className="mt-1 font-mono text-[.62rem] uppercase tracking-[.1em] text-violet">{result.emotionConfidence ?? '—'}% primary emotion</p>
            <p className="mt-3 text-xs leading-5 text-muted">Dominant emotional signal detected in the source content.</p>
          </div>
        </div>
      </Panel>
      <Panel>
        <SectionTitle title="Emotion distribution" description="Signal composition across the source" />
        <div className="space-y-5">
          {emotions.map((emotion, index) => (
            <div key={emotion.label}>
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="font-medium">{formatDisplayLabel(emotion.label)}</span>
                <span className="font-mono text-muted">{emotion.value}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full border border-white/[.06] bg-black/20 p-px">
                <motion.div initial={{ width: 0 }} whileInView={{ width: `${emotion.value}%` }} viewport={{ once: true }}
                  transition={{ delay: .12 + index * .09, duration: .7, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-violet/60 via-violet to-[#d8b4fe] shadow-[0_0_12px_rgb(139_92_246_/_0.25)]" />
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
