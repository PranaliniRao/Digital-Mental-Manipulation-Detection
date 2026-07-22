import { icons } from '../../../config/icons'
import { MotionReveal } from '../../../motion/MotionReveal'
import { Card } from '../../../components/ui/card'

const features = [
  { icon: icons.shield, title: 'Evidence first', body: 'A foundation that makes space for provenance, confidence, and the evidence behind every future conclusion.' },
  { icon: icons.gauge, title: 'Calm under pressure', body: 'Clear hierarchy and intentional density keep high-stakes information readable when attention is limited.' },
  { icon: icons.sparkles, title: 'Built to explain', body: 'A modular interface prepared for agent reasoning, decision context, and human oversight.' },
]
export function FeaturesSection() { return <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32 lg:px-10"><MotionReveal className="max-w-2xl"><p className="eyebrow">A better operating surface</p><h2 className="section-title mt-5">Intelligence should earn trust, not demand it.</h2></MotionReveal><div className="mt-14 grid gap-4 md:grid-cols-3">{features.map(({ icon: Icon, title, body }, index) => <MotionReveal key={title} delay={index * 0.08}><Card className="group h-full p-7 transition-all duration-300 hover:-translate-y-1 hover:border-cyan/20 hover:shadow-glow"><span className="grid size-10 place-items-center rounded-xl bg-cyan/10 text-cyan"><Icon size={19} strokeWidth={1.7} /></span><h3 className="mt-8 text-lg font-semibold tracking-[-0.025em]">{title}</h3><p className="mt-3 text-sm leading-6 text-muted">{body}</p></Card></MotionReveal>)}</div></section> }

