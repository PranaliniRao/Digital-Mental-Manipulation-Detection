import { motion } from 'framer-motion'
import { useState } from 'react'
import { Panel, SectionTitle } from './PageShell'

type Agent = { name: string; confidence: number; contribution: number; summary: string; reasoning: string; evidence: string[] }

const positions: [number, number][] = [[50, 15], [78, 29], [84, 58], [66, 82], [34, 82], [16, 58], [22, 29], [50, 50]]
const fallback: Agent = { name: 'No agent data', confidence: 0, contribution: 0, summary: 'No specialist details are available.', reasoning: 'This report does not contain agent-level reasoning.', evidence: [] }

export function AgentNetwork({ agents }: { agents: Agent[] }) {
  const nodes = agents.slice(0, 8)
  const [activeName, setActiveName] = useState(nodes[0]?.name ?? '')
  const active = nodes.find(a => a.name === activeName) ?? nodes[0] ?? fallback

  return (
    <Panel>
      <SectionTitle title="Agent collaboration network" description="Hover a node to inspect its contribution and reasoning" />
      <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <div className="relative aspect-[1.35] overflow-hidden rounded-control border border-subtle bg-canvas/40">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
            {nodes.map((_, index) => {
              const [x, y] = positions[index] ?? [50, 50]
              return <motion.line key={index} x1="50" y1="50" x2={x} y2={y} stroke="rgb(168 85 247 / .35)" strokeWidth=".5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: index * .08 }} />
            })}
          </svg>
          {nodes.map((agent, index) => {
            const [x, y] = positions[index] ?? [50, 50]
            return (
              <button onMouseEnter={() => setActiveName(agent.name)} onFocus={() => setActiveName(agent.name)} onClick={() => setActiveName(agent.name)} key={agent.name}
                style={{ left: `${x}%`, top: `${y}%` }}
                className={`absolute grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-[.55rem] font-semibold transition ${active.name === agent.name ? 'border-violet bg-violet text-white shadow-glow' : 'border-violet/35 bg-surface text-violet hover:bg-violet/15'}`}>
                {(agent.name.split(' ')[0] ?? '').slice(0, 2)}
              </button>
            )
          })}
        </div>
        <div className="rounded-control border border-subtle bg-canvas/35 p-4">
          <p className="font-mono text-[.61rem] uppercase tracking-[.12em] text-violet">{active.name}</p>
          <p className="mt-3 text-sm font-semibold">{active.confidence}% confidence · {active.contribution}% risk contribution</p>
          <p className="mt-3 text-xs leading-6 text-muted">{active.reasoning}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {active.evidence.map(item => <span key={item} className="rounded-full border border-violet/20 px-2 py-1 text-[.62rem] text-violet">{item}</span>)}
          </div>
        </div>
      </div>
    </Panel>
  )
}
