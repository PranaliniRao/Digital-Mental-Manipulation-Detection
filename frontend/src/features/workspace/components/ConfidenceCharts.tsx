import { motion } from 'framer-motion'
import { Panel, SectionTitle } from './PageShell'

type Agent = { name: string; confidence: number }

export function ConfidenceCharts({ agents }: { agents: Agent[] }) {
  const displayed = agents.slice(0, 6)
  const radar = displayed.map((agent, index) => {
    const angle = (Math.PI * 2 * index) / displayed.length - Math.PI / 2
    const radius = (agent.confidence / 100) * 36
    return `${50 + Math.cos(angle) * radius},${50 + Math.sin(angle) * radius}`
  }).join(' ')

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel className="relative border-violet/15 bg-[radial-gradient(circle_at_50%_50%,rgb(139_92_246_/_0.13),transparent_52%)]">
        <SectionTitle title="Confidence radar" description="Relative specialist confidence" />
        <div className="relative mx-auto max-w-[19rem]">
          <svg viewBox="0 0 100 100" className="h-64 w-full" preserveAspectRatio="xMidYMid meet">
            {[13, 25, 37].map(radius => <circle key={radius} cx="50" cy="50" r={radius} fill="none" stroke="rgb(216 180 254 / .14)" strokeWidth=".45" strokeDasharray="1 2" />)}
            {displayed.map((agent, index) => {
              const angle = (Math.PI * 2 * index) / displayed.length - Math.PI / 2
              return (
                <g key={agent.name}>
                  <line x1="50" y1="50" x2={50 + Math.cos(angle) * 41} y2={50 + Math.sin(angle) * 41} stroke="rgb(216 180 254 / .18)" strokeWidth=".45" />
                  <text x={50 + Math.cos(angle) * 47} y={50 + Math.sin(angle) * 47 + 1.5} textAnchor="middle" fill="rgb(166 160 178)" fontSize="3.4" fontFamily="JetBrains Mono, monospace">{agent.name.split(' ')[0]}</text>
                </g>
              )
            })}
            <motion.polygon points={radar} fill="rgb(139 92 246 / .20)" stroke="#d8b4fe" strokeWidth=".9" initial={{ opacity: 0, scale: .65 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 120, damping: 18 }} />
            {displayed.map((agent, index) => {
              const angle = (Math.PI * 2 * index) / displayed.length - Math.PI / 2
              const radius = (agent.confidence / 100) * 36
              return <motion.circle key={`${agent.name}-point`} cx={50 + Math.cos(angle) * radius} cy={50 + Math.sin(angle) * radius} r="1.7" fill="#17131e" stroke="#d8b4fe" strokeWidth=".7" initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: .25 + index * .07 }} />
            })}
          </svg>
          <span className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-violet/25 bg-[#19151f] font-mono text-[.59rem] text-violet shadow-[0_0_24px_rgb(139_92_246_/_0.16)]">AI</span>
        </div>
      </Panel>
      <Panel>
        <SectionTitle title="Agent confidence" description="Agreement across collaborative lenses" />
        {agents.map((agent, index) => (
          <div key={agent.name} className="mb-4 last:mb-0">
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="font-medium">{agent.name}</span>
              <span className="font-mono text-muted">{agent.confidence}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full border border-white/[.06] bg-black/20 p-px">
              <motion.div initial={{ width: 0 }} whileInView={{ width: `${agent.confidence}%` }} viewport={{ once: true }}
                transition={{ delay: .1 + index * .055, duration: .65, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-violet/65 via-violet to-[#d8b4fe] shadow-[0_0_12px_rgb(139_92_246_/_0.28)]" />
            </div>
          </div>
        ))}
      </Panel>
    </div>
  )
}
