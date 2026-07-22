import { useState } from 'react'
import type { LiveAnalysisResult } from '../data/normalizeAnalysisResult'
import { formatDisplayLabel } from '../../../utils/formatDisplayLabel'
import { AgentNetwork } from './AgentNetwork'
import { AIReplay } from './AIReplay'
import { ConfidenceCharts } from './ConfidenceCharts'
import { EmotionDashboard } from './EmotionDashboard'
import { EvidenceExplorer } from './EvidenceExplorer'
import { ExecutiveSummary } from './ExecutiveSummary'
import { JudgeTree } from './JudgeTree'
import { ManipulationCards } from './ManipulationCards'
import { ReasoningTimeline } from './ReasoningTimeline'
import { TrendChart } from './ChartPrimitives'
import { WhyFlaggedCard } from './WhyFlaggedCard'
import type { ReasoningStep, EvidenceGroup } from '../data/explainabilityModel'

const sections = ['Overview', 'Timeline', 'Network', 'Evidence', 'Confidence', 'Techniques', 'Emotion', 'Replay'] as const

function buildTimeline(result: LiveAnalysisResult): ReasoningStep[] {
  const steps: ReasoningStep[] = [
    { title: 'Input received', detail: `Source text: "${result.extractedText.slice(0, 60)}${result.extractedText.length > 60 ? '…' : ''}"`, confidence: 100 },
    ...(result.vision ? [{ title: 'Vision analysis', detail: result.vision.summary, confidence: 88 }] : []),
    { title: 'RoBERTa', detail: `Prediction: ${formatDisplayLabel(result.roberta.prediction)}`, confidence: result.roberta.confidence ?? 0 },
    { title: 'Emotion detection', detail: `Primary emotion: ${formatDisplayLabel(result.primaryEmotion)}`, confidence: result.emotionConfidence ?? 0 },
    ...result.agents.map(a => ({ title: a.name, detail: a.reasoning, confidence: a.confidence ?? 0 })),
    { title: 'Judge', detail: result.judge.reasoning, confidence: result.judge.confidence ?? 0 },
    { title: 'Meta Judge', detail: result.metaJudge.summary, confidence: result.metaJudge.confidence ?? 0 },
    { title: 'Final decision', detail: `Decision: ${formatDisplayLabel(result.metaJudge.decision)}`, confidence: result.metaJudge.confidence ?? result.judge.confidence ?? 0 },
  ]
  return steps
}

function buildEvidence(result: LiveAnalysisResult): EvidenceGroup[] {
  return result.agents
    .filter(a => a.status && a.status !== 'none' && a.status !== 'no_manipulation')
    .map(a => ({
      title: a.name,
      items: [
        { label: a.status, detail: a.reasoning, confidence: a.confidence ?? 0 },
      ],
    }))
}

function buildEmotions(result: LiveAnalysisResult) {
  return [
    { label: formatDisplayLabel(result.primaryEmotion), value: result.emotionConfidence ?? 0 },
    ...result.agents
      .filter(a => a.key === 'emotion_exploitation' && a.confidence)
      .map(a => ({ label: formatDisplayLabel(a.status), value: a.confidence ?? 0 })),
  ].slice(0, 6)
}

function buildTechniques(result: LiveAnalysisResult) {
  return result.agents.map(a => ({
    title: a.name,
    definition: a.reasoning,
    confidence: a.confidence ?? 0,
    evidence: a.status,
    detected: a.status !== 'none' && a.status !== 'no_manipulation' && a.status !== 'Not available',
  }))
}

function buildAgents(result: LiveAnalysisResult) {
  return result.agents.map(a => ({
    name: a.name,
    confidence: a.confidence ?? 0,
    contribution: a.contribution ?? 0,
    summary: a.summary,
    reasoning: a.reasoning,
    evidence: a.status && a.status !== 'none' ? [a.status] : [],
  }))
}

export function ExplainabilityCenter({ result }: { result: LiveAnalysisResult }) {
  const [active, setActive] = useState<(typeof sections)[number]>('Overview')
  const [stage, setStage] = useState(0)

  const timeline = buildTimeline(result)
  const evidence = buildEvidence(result)
  const emotions = buildEmotions(result)
  const techniques = buildTechniques(result)
  const agents = buildAgents(result)

  return (
    <section className="mt-6">
      <div className="mb-4">
        <p className="eyebrow">AI explainability center</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Understand how the decision was reached.</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Interact with each reasoning layer to inspect the evidence, confidence, agreement, and final decision path.</p>
      </div>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {sections.map(section => (
          <button onClick={() => setActive(section)} key={section}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition ${active === section ? 'border-violet bg-violet/15 text-violet' : 'border-subtle bg-surface text-muted hover:text-ink'}`}>
            {section}
          </button>
        ))}
      </div>

      {active === 'Overview' && (
        <div className="space-y-4">
          <ExecutiveSummary result={result} />
          <div className="rounded-panel border border-subtle bg-surface/40 p-5 sm:p-6">
            <div className="mb-4">
              <p className="font-mono text-[.62rem] uppercase tracking-[.14em] text-violet">Decision telemetry</p>
              <h3 className="mt-1 text-base font-semibold">Risk signal over time</h3>
              <p className="mt-1 text-xs text-muted">How the confidence-weighted risk signal evolved through this review.</p>
            </div>
            <TrendChart values={timeline.slice(-9).map(s => s.confidence)} showRangeSwitcher />
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <ReasoningTimeline steps={timeline} active={stage} onSelect={setStage} />
            <JudgeTree result={result} />
          </div>
        </div>
      )}
      {active === 'Timeline' && <ReasoningTimeline steps={timeline} active={stage} onSelect={setStage} />}
      {active === 'Network' && <AgentNetwork agents={agents} />}
      {active === 'Evidence' && <EvidenceExplorer evidence={evidence} />}
      {active === 'Confidence' && <ConfidenceCharts agents={agents} />}
      {active === 'Techniques' && <ManipulationCards techniques={techniques} />}
      {active === 'Emotion' && <EmotionDashboard result={result} emotions={emotions} />}
      {active === 'Replay' && <AIReplay steps={timeline} />}
    </section>
  )
}
