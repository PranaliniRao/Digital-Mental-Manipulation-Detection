import { AnimatePresence, motion } from 'framer-motion'
import { useId, useMemo, useState } from 'react'
import { cn } from '../../../utils/cn'

type RiskPoint = { date: string; score: number; confidence: number; technique: string; emotion: string; agent: string }
type Range = '7d' | '30d' | 'all'

const defaults: Omit<RiskPoint, 'score'>[] = [
  { date: 'Jul 05', confidence: 89, technique: 'Selective context', emotion: 'Neutral', agent: 'Context' },
  { date: 'Jul 08', confidence: 91, technique: 'Urgency framing', emotion: 'Concern', agent: 'Intent' },
  { date: 'Jul 11', confidence: 88, technique: 'Authority bias', emotion: 'Trust', agent: 'Strategy' },
  { date: 'Jul 14', confidence: 94, technique: 'Emotional pressure', emotion: 'Urgency', agent: 'Emotion' },
  { date: 'Today', confidence: 94, technique: 'High-pressure narrative', emotion: 'Urgency', agent: 'Intent' },
]

function smoothPath(points: [number, number][]) {
  if (points.length < 2) return ''
  return points.reduce((path, [x, y], index) => {
    if (!index) return `M ${x} ${y}`
    const [previousX, previousY] = points[index - 1]!
    const controlX = (previousX + x) / 2
    return `${path} C ${controlX} ${previousY}, ${controlX} ${y}, ${x} ${y}`
  }, '')
}

function resample(values: number[], size = 9) {
  const source = values.length ? values : [0]
  if (source.length === size) return source
  if (source.length === 1) return Array.from({ length: size }, () => source[0]!)
  return Array.from({ length: size }, (_, index) => {
    const position = (index / (size - 1)) * (source.length - 1)
    const lower = Math.floor(position)
    const upper = Math.ceil(position)
    const progress = position - lower
    return Math.round(source[lower]! + (source[upper]! - source[lower]!) * progress)
  })
}

function rangedValues(values: number[], range: Range) {
  const all = resample(values)
  if (range === '30d') return all
  if (range === '7d') return resample(values.slice(-Math.min(7, values.length)))
  return all.map((value, index) => Math.max(0, Math.min(100, value! - 8 + ((index * 11) % 13))))
}

function rangeLabels(range: Range, count: number) {
  const labels: Record<Range, string[]> = {
    '7d': ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Today'],
    '30d': ['Jun 17', 'Jun 21', 'Jun 25', 'Jun 29', 'Jul 03', 'Jul 07', 'Jul 11', 'Jul 14', 'Today'],
    all: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Today'],
  }
  return resample(labels[range].map((_, index) => index), count).map(value => labels[range][Math.round(value)!] ?? 'Today')
}

export function TrendChart({ values, className, points, showRangeSwitcher = false }: { values: number[]; className?: string; points?: Partial<RiskPoint>[]; showRangeSwitcher?: boolean }) {
  const [active, setActive] = useState<number | null>(null)
  const [range, setRange] = useState<Range>('30d')
  const chartId = useId().replace(/:/g, '')
  const displayValues = useMemo(() => rangedValues(values, range), [range, values])
  const labels = useMemo(() => rangeLabels(range, displayValues.length), [displayValues.length, range])
  const chart = useMemo(() => {
    const width = 720
    const height = 280
    const padding = { x: 38, top: 26, bottom: 38 }
    const min = Math.max(0, Math.min(...displayValues) - 14)
    const max = Math.min(100, Math.max(...displayValues) + 14)
    const valueRange = max - min || 1
    const coordinates = displayValues.map((value, index) => [
      padding.x + (index / Math.max(1, displayValues.length - 1)) * (width - padding.x * 2),
      padding.top + (1 - (value! - min) / valueRange) * (height - padding.top - padding.bottom),
    ] as [number, number])
    const path = smoothPath(coordinates)
    return { width, height, coordinates, path, area: `${path} L ${coordinates.at(-1)?.[0] ?? width - padding.x} ${height - padding.bottom} L ${padding.x} ${height - padding.bottom} Z`, baseline: height - padding.bottom }
  }, [displayValues])
  const data = displayValues.map((score, index) => ({ ...defaults[index % defaults.length]!, ...points?.[index], date: labels[index] ?? defaults[index % defaults.length]!.date, score: score! }))
  const tooltip = active === null ? null : data[active]

  return <div className={cn('relative overflow-hidden rounded-[1rem] border border-violet/15 bg-[#16131c]/70 p-4 shadow-[0_20px_70px_rgb(0_0_0_/_0.22),inset_0_1px_0_rgb(255_255_255_/_0.04)] sm:p-5', className)}>
    <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-violet/45 to-transparent" />
    {showRangeSwitcher && <div className="mb-5 flex justify-end"><div className="relative inline-grid grid-cols-3 rounded-full border border-white/[.08] bg-black/20 p-1 text-[.62rem] font-semibold"><motion.span layout transition={{ type: 'spring', stiffness: 360, damping: 30 }} className="absolute inset-y-1 rounded-full border border-violet/30 bg-violet/20 shadow-[0_0_20px_rgb(139_92_246_/_0.18)]" style={{ width: 'calc(33.333% - .18rem)', left: range === '7d' ? '.18rem' : range === '30d' ? '33.333%' : 'calc(66.666% - .18rem)' }} />{([['7d', 'Last 7 Days'], ['30d', 'Last 30 Days'], ['all', 'All Time']] as const).map(([value, label]) => <button key={value} onClick={() => { setRange(value); setActive(null) }} className={cn('relative z-10 rounded-full px-3 py-1.5 transition-colors', range === value ? 'text-ink' : 'text-muted hover:text-ink')}>{label}</button>)}</div></div>}
    <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="h-56 w-full overflow-visible sm:h-64" role="img" aria-label="Risk signal over time">
      <defs>
        <linearGradient id={`risk-area-${chartId}`} x1="0" x2="0" y1="0" y2="1"><stop stopColor="#a78bfa" stopOpacity=".28"/><stop offset=".56" stopColor="#8b5cf6" stopOpacity=".09"/><stop offset="1" stopColor="#8b5cf6" stopOpacity="0"/></linearGradient>
        <linearGradient id={`risk-line-${chartId}`} x1="0" x2="1"><stop stopColor="#9f7aea"/><stop offset=".5" stopColor="#d8b4fe"/><stop offset="1" stopColor="#a78bfa"/></linearGradient>
        <filter id={`risk-glow-${chartId}`} x="-20%" y="-25%" width="140%" height="150%"><feGaussianBlur stdDeviation="4" result="blur"/></filter>
      </defs>
      {[.1, .4, .7].map((fraction, index) => <motion.line key={fraction} initial={{ opacity: 0, pathLength: 0 }} animate={{ opacity: 1, pathLength: 1 }} transition={{ delay: index * .1, duration: .5 }} x1="38" x2="682" y1={26 + fraction * 216} y2={26 + fraction * 216} stroke="rgb(255 255 255 / .075)" strokeWidth=".65" strokeDasharray="2 5"/>) }
      <motion.path d={chart.area} animate={{ d: chart.area, opacity: 1 }} initial={{ opacity: 0 }} transition={{ d: { type: 'spring', stiffness: 95, damping: 22 }, opacity: { delay: .32, duration: .65 } }} fill={`url(#risk-area-${chartId})`}/>
      <motion.path d={chart.path} animate={{ d: chart.path, pathLength: 1 }} initial={{ pathLength: 0 }} transition={{ d: { type: 'spring', stiffness: 100, damping: 22 }, pathLength: { delay: .46, duration: 1.2, ease: 'easeInOut' } }} fill="none" stroke="#8b5cf6" strokeWidth="6" strokeLinecap="round" opacity=".22" filter={`url(#risk-glow-${chartId})`}/>
      <motion.path d={chart.path} animate={{ d: chart.path, pathLength: 1 }} initial={{ pathLength: 0 }} transition={{ d: { type: 'spring', stiffness: 100, damping: 22 }, pathLength: { delay: .46, duration: 1.2, ease: 'easeInOut' } }} fill="none" stroke={`url(#risk-line-${chartId})`} strokeWidth="1.65" strokeLinecap="round"/>
      {chart.coordinates.map(([x, y], index) => <g key={index}>
        <motion.circle animate={{ cx: x, cy: y, scale: active === index ? 1.22 : 1, opacity: 1 }} initial={{ scale: 0, opacity: 0 }} transition={{ cx: { type: 'spring', stiffness: 120, damping: 18 }, cy: { type: 'spring', stiffness: 120, damping: 18 }, scale: { delay: .85 + index * .055, type: 'spring' }, opacity: { delay: .85 + index * .055 } }} r="4" fill="#17131e" stroke="#d8b4fe" strokeWidth="1.45"/>
        <circle cx={x} cy={y} r="15" fill="transparent" className="cursor-pointer" onMouseEnter={() => setActive(index)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(index)} onBlur={() => setActive(null)} tabIndex={0} aria-label={`View details for ${data[index]?.date ?? 'this data point'}`}/>
      </g>)}
      {chart.coordinates.map(([x], index) => <motion.text key={`label-${index}`} animate={{ x, opacity: 1 }} initial={{ opacity: 0 }} transition={{ x: { type: 'spring', stiffness: 110, damping: 20 }, opacity: { delay: 1.18 + index * .04 } }} y="268" textAnchor="middle" fill="rgb(166 160 178)" fontSize="8.5" fontFamily="JetBrains Mono, monospace">{labels[index]}</motion.text>)}
    </svg>
    <AnimatePresence>{tooltip && active !== null && <motion.div initial={{ opacity: 0, y: 8, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 5, scale: .98 }} transition={{ duration: .18 }} className="pointer-events-none absolute z-10 w-64 rounded-xl border border-violet/30 bg-[#1b1722]/95 p-3.5 shadow-[0_18px_48px_rgb(0_0_0_/_0.35),0_0_25px_rgb(139_92_246_/_0.12)] backdrop-blur-xl" style={{ left: `${Math.max(3, Math.min(62, (active / Math.max(1, displayValues.length - 1)) * 74))}%`, top: showRangeSwitcher ? '4.8rem' : '1.25rem' }}><p className="font-mono text-[.6rem] font-medium uppercase tracking-[.14em] text-violet">{tooltip.date}</p><div className="mt-2 flex items-baseline justify-between"><p className="text-lg font-semibold tracking-tight">Risk score {tooltip.score}</p><span className="text-xs text-violet">{tooltip.confidence}% confident</span></div><div className="mt-3 grid grid-cols-[.9fr_1.1fr] gap-x-3 gap-y-2 border-t border-white/[.07] pt-3 text-[.64rem]"><span className="text-muted">Technique</span><b className="text-right font-medium text-ink">{tooltip.technique}</b><span className="text-muted">Emotion</span><b className="text-right font-medium text-ink">{tooltip.emotion}</b><span className="text-muted">Top agent</span><b className="text-right font-medium text-ink">{tooltip.agent}</b></div></motion.div>}</AnimatePresence>
  </div>
}

export function BarChart({ values }: { values: number[] }) { return <div className="relative flex h-48 items-end gap-2 overflow-hidden rounded-[1rem] border border-violet/12 bg-[#16131c]/65 px-4 pb-4 pt-7"><div className="pointer-events-none absolute inset-x-4 top-1/3 border-t border-dashed border-white/[.06]"/><div className="pointer-events-none absolute inset-x-4 top-2/3 border-t border-dashed border-white/[.06]"/>{values.map((value, index) => <div key={index} className="group relative z-10 flex h-full flex-1 items-end"><motion.div initial={{ height: 0, opacity: 0 }} whileInView={{ height: `${value}%`, opacity: 1 }} viewport={{ once: true }} transition={{ delay: .12 + index * .055, duration: .7, ease: [0.22, 1, 0.36, 1] }} className="w-full rounded-t-[.45rem] bg-gradient-to-t from-violet/45 via-violet/75 to-[#d8b4fe] shadow-[0_0_20px_rgb(139_92_246_/_0.14)] transition-all duration-200 group-hover:brightness-125" title={`${value}%`}/></div>)}</div> }

export function Donut({ value, label }: { value: number; label: string }) { const circumference = 2 * Math.PI * 43; const gradientId = `donut-violet-${useId().replace(/:/g, '')}`; return <motion.div initial={{ opacity: 0, scale: .88 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 170, damping: 19 }} className="relative grid size-36 shrink-0 place-items-center"><svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-label={`${value}% ${label}`}><circle cx="50" cy="50" r="43" fill="none" stroke="rgb(255 255 255 / .075)" strokeWidth="7"/><motion.circle cx="50" cy="50" r="43" fill={`url(#${gradientId})`} strokeWidth="7" strokeLinecap="round" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} whileInView={{ strokeDashoffset: circumference * (1 - value / 100) }} viewport={{ once: true }} transition={{ duration: 1.05, ease: 'easeOut' }}/><defs><linearGradient id={gradientId} x1="0" x2="1"><stop stopColor="#8b5cf6"/><stop offset="1" stopColor="#d8b4fe"/></linearGradient></defs></svg><div className="absolute grid size-[5.4rem] place-items-center rounded-full border border-violet/15 bg-surface/90 text-center shadow-[inset_0_1px_0_rgb(255_255_255_/_0.05)]"><strong className="text-2xl tracking-tight">{value}%</strong><span className="max-w-14 text-[.58rem] leading-3 text-muted">{label}</span></div></motion.div> }

export function Heatmap() { return <div className="grid grid-cols-12 gap-1.5 rounded-[1rem] border border-violet/12 bg-[#16131c]/65 p-4">{Array.from({ length: 60 }, (_, index) => { const intensity = .1 + ((index * 17) % 9) * .075; return <motion.span initial={{ opacity: 0, scale: .7 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: .08 + index * .015, type: 'spring', stiffness: 260, damping: 19 }} key={index} className="aspect-square rounded-[.22rem] border border-violet/10 transition duration-200 hover:z-10 hover:scale-125 hover:border-violet/70" style={{ background: `linear-gradient(135deg, rgb(216 180 254 / ${intensity + .08}), rgb(139 92 246 / ${intensity}))`, boxShadow: intensity > .5 ? '0 0 12px rgb(139 92 246 / .18)' : undefined }} /> })}</div> }
