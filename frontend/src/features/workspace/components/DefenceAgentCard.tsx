import { ShieldAlert, AlertTriangle, Shield, BookOpen, Target, AlertCircle } from 'lucide-react'
import { Panel } from './PageShell'
import type { LiveAnalysisResult } from '../data/normalizeAnalysisResult'

interface DefenceAgentCardProps {
  defence: LiveAnalysisResult['defence']
}

function getRiskColor(level: string): string {
  switch (level.toLowerCase()) {
    case 'high': return 'text-danger border-danger/30 bg-danger/10'
    case 'medium': return 'text-amber-500 border-amber-500/30 bg-amber-500/10'
    case 'low': return 'text-success border-success/30 bg-success/10'
    default: return 'text-muted border-subtle bg-canvas/40'
  }
}

export function DefenceAgentCard({ defence }: DefenceAgentCardProps) {
  if (!defence) return null

  const riskColor = getRiskColor(defence.risk_level)

  return (
    <Panel className="relative overflow-hidden">
      <div className="absolute right-0 top-0 size-64 -translate-y-1/2 translate-x-1/3 rounded-full bg-violet/10 blur-3xl" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert size={20} className="text-violet" />
            <h3 className="text-lg font-semibold">Defence Agent</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-[.65rem] font-semibold uppercase tracking-wider ${riskColor}`}>
              {defence.risk_level}
            </span>
            <span className="font-mono text-[.65rem] text-violet">
              {defence.confidence === null ? '—' : `${defence.confidence}%`}
            </span>
          </div>
        </div>

        {/* Threat Category */}
        <p className="mt-3 font-semibold text-ink">{defence.threat_category}</p>

        {/* Segments */}
        <div className="mt-4 space-y-3">
          {/* Protective Actions */}
          {defence.protective_actions && defence.protective_actions.length > 0 && (
            <div className="rounded-control border border-subtle bg-canvas/40 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={14} className="text-violet" />
                <p className="text-[.7rem] font-semibold uppercase tracking-wider text-violet">Protective Actions</p>
              </div>
              <ul className="space-y-1 text-xs text-muted">
                {defence.protective_actions.map((action, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-violet">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Communication Boundaries */}
          {defence.communication_boundaries && defence.communication_boundaries.length > 0 && (
            <div className="rounded-control border border-subtle bg-canvas/40 p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-violet" />
                <p className="text-[.7rem] font-semibold uppercase tracking-wider text-violet">Communication Boundaries</p>
              </div>
              <ul className="space-y-1 text-xs text-muted">
                {defence.communication_boundaries.map((boundary, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-violet">•</span>
                    <span>{boundary}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Manipulation Education */}
          {defence.manipulation_education && (
            <div className="rounded-control border border-subtle bg-canvas/40 p-3">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={14} className="text-violet" />
                <p className="text-[.7rem] font-semibold uppercase tracking-wider text-violet">Manipulation Education</p>
              </div>
              <p className="text-xs text-muted leading-5">{defence.manipulation_education}</p>
            </div>
          )}

          {/* Counter Strategies */}
          {defence.counter_strategies && defence.counter_strategies.length > 0 && (
            <div className="rounded-control border border-subtle bg-canvas/40 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Target size={14} className="text-violet" />
                <p className="text-[.7rem] font-semibold uppercase tracking-wider text-violet">Counter-Strategies</p>
              </div>
              <ul className="space-y-1 text-xs text-muted">
                {defence.counter_strategies.map((strategy, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-violet">•</span>
                    <span>{strategy}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Escalation */}
          {defence.escalation_recommendation && (
            <div className={`rounded-control border p-3 ${
              defence.escalation_recommendation.needed 
                ? 'border-danger/30 bg-danger/10' 
                : 'border-subtle bg-canvas/40'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={14} className={defence.escalation_recommendation.needed ? 'text-danger' : 'text-muted'} />
                <p className={`text-[.7rem] font-semibold uppercase tracking-wider ${
                  defence.escalation_recommendation.needed ? 'text-danger' : 'text-muted'
                }`}>Escalation</p>
              </div>
              {defence.escalation_recommendation.needed ? (
                <div className="space-y-2 text-xs">
                  {defence.escalation_recommendation.reason && (
                    <p className="text-ink">{defence.escalation_recommendation.reason}</p>
                  )}
                  {defence.escalation_recommendation.suggested_action && (
                    <p className="font-semibold text-danger">{defence.escalation_recommendation.suggested_action}</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted">No escalation needed</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Panel>
  )
}
