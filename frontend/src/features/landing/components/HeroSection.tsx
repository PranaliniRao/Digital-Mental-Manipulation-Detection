import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { icons } from '../../../config/icons'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { stagger, fadeUp } from '../../../motion/variants'
import { DashboardHeroVisual } from '../../workspace/components/DashboardHeroVisual'

export function HeroSection() {
  const Arrow = icons.chevronRight
  return <section className="relative isolate overflow-hidden border-y border-subtle"><div className="absolute inset-0 -z-10 grid-line opacity-40"/><div className="absolute left-1/2 top-24 -z-10 size-[32rem] -translate-x-1/2 rounded-full bg-cyan/[0.045] blur-[100px]"/><div className="pointer-events-none absolute -right-44 -top-36 z-0 w-[39rem] opacity-[.16] blur-[1px]" aria-hidden="true"><DashboardHeroVisual ambient/></div><motion.div className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-20 sm:px-8 sm:pb-32 sm:pt-28 lg:px-10 lg:pb-40 lg:pt-36" initial="hidden" animate="visible" variants={stagger}><motion.div variants={fadeUp}><Badge>Digital manipulation intelligence</Badge></motion.div><motion.h1 variants={fadeUp} className="display-title mt-8 max-w-5xl">See the signal.<br/><span className="text-muted">Understand the influence.</span></motion.h1><motion.div variants={fadeUp} className="mt-9 flex max-w-xl flex-col gap-6 sm:mt-11"><p className="text-base leading-7 text-muted sm:text-lg">SignalGuard creates a deliberate, explainable foundation for investigating persuasive patterns across the content that reaches your organization.</p><div className="flex flex-wrap items-center gap-3"><Link to="/app"><Button size="lg">Enter workspace <Arrow size={16}/></Button></Link><a href="#technology"><Button variant="secondary" size="lg">Explore the system</Button></a></div></motion.div><motion.div variants={fadeUp} className="mt-20 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-panel border border-subtle bg-subtle sm:grid-cols-4"><Metric value="08" label="Specialist lenses"/><Metric value="01" label="Unified verdict"/><Metric value="0" label="Unexplained jumps"/><Metric value="∞" label="Future-ready"/></motion.div></motion.div></section>
}
function Metric({ value, label }: { value: string; label: string }) { return <div className="bg-surface/85 p-5 sm:p-6"><p className="font-mono text-xl text-cyan">{value}</p><p className="mt-2 text-xs leading-5 text-muted">{label}</p></div> }
