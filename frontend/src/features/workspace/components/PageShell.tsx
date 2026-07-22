import type { PropsWithChildren, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../../../components/ui'
import { cn } from '../../../utils/cn'

export function PageShell({ eyebrow, title, description, action, children, hideIntro = false }: PropsWithChildren<{ eyebrow?: string; title: string; description: string; action?: ReactNode; hideIntro?: boolean }>) {
  return <motion.section initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .24, ease: [0.22, 1, 0.36, 1] }}>
    {!hideIntro && <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">{eyebrow ?? 'SignalGuard workspace'}</p><h1 className="mt-2 tracking-display text-3xl font-semibold sm:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-7 text-muted">{description}</p></div>{action}</div>}{children}
  </motion.section>
}

export function Panel({ children, className }: PropsWithChildren<{ className?: string }>) { return <Card className={cn('textured-panel overflow-hidden p-5 sm:p-6', className)}>{children}</Card> }

export function MetricCard({ label, value, detail, tone = 'violet' }: { label: string; value: string; detail: string; tone?: 'violet' | 'success' | 'warning' }) {
  const toneClass = { violet: 'text-violet', success: 'text-success', warning: 'text-warning' }[tone]
  return <motion.div whileHover={{ y: -3 }} transition={{ duration: .2 }}><Panel className="h-full"><p className="font-mono text-[.63rem] uppercase tracking-[.14em] text-muted">{label}</p><p className={cn('mt-3 text-3xl font-semibold tracking-tight', toneClass)}>{value}</p><p className="mt-2 text-xs text-muted">{detail}</p></Panel></motion.div>
}

export function SectionTitle({ title, description, action }: { title: string; description?: string; action?: ReactNode }) { return <div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-base font-semibold text-ink">{title}</h2>{description && <p className="mt-1 text-xs text-muted">{description}</p>}</div>{action}</div> }
