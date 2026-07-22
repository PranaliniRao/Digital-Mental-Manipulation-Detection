import { ArrowDownRight, ArrowUpRight, Minus, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import type { IntelligenceInsight } from '../data/intelligenceData'

export function InsightCard({ insight, index }: { insight: IntelligenceInsight; index: number }) {
  const DirectionIcon = insight.direction === 'up' ? ArrowUpRight : insight.direction === 'down' ? ArrowDownRight : Minus
  const tone = insight.direction === 'up' ? 'text-warning' : insight.direction === 'down' ? 'text-success' : 'text-violet'
  return <motion.article initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ delay: index * .07 }} whileHover={{ y: -3 }} className="group relative overflow-hidden rounded-panel border border-violet/15 bg-[#17131d]/75 p-5 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.04)]"><div className="absolute right-0 top-0 size-24 -translate-y-1/2 translate-x-1/2 rounded-full bg-violet/15 blur-2xl transition group-hover:bg-violet/25"/><div className="relative flex items-start justify-between gap-4"><span className="grid size-8 place-items-center rounded-lg border border-violet/20 bg-violet/10 text-violet"><Sparkles size={15}/></span><span className={`flex items-center gap-1 font-mono text-[.6rem] ${tone}`}><DirectionIcon size={13}/>{insight.metric}</span></div><h3 className="relative mt-5 text-sm font-semibold leading-6">{insight.title}</h3><p className="relative mt-2 text-xs leading-5 text-muted">{insight.detail}</p></motion.article>
}
