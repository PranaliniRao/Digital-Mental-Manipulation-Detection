import type { AnalysisSuccess } from '../../../services/api/contracts'

type RecordValue = Record<string, unknown>
export type LiveAgentResult = { key: string; name: string; status: string; confidence: number | null; summary: string; reasoning: string; contribution: number | null }
export type LiveAnalysisResult = { classification: string; confidence: number | null; primaryEmotion: string; emotionConfidence: number | null; technique: string; influentialAgent: string; extractedText: string; roberta: { prediction: string; confidence: number | null }; vision?: { ocr: string; summary: string }; agents: LiveAgentResult[]; judge: { decision: string; confidence: number | null; reasoning: string }; metaJudge: { decision: string; confidence: number | null; agreement: number | null; summary: string }; defence?: { threat_category: string; risk_level: string; confidence: number | null; protective_actions: string[]; communication_boundaries: string[]; manipulation_education: string; counter_strategies: string[]; escalation_recommendation: { needed: boolean; reason: string; suggested_action: string } } }
const labels: Record<string, string> = { intent: 'Intent Agent', vulnerability: 'Vulnerability Agent', emotion_exploitation: 'Emotion Agent', strategy: 'Strategy Agent', bias: 'Bias Agent', context: 'Context Agent', relationship: 'Relationship Agent', motive: 'Motive Agent' }
const record = (value: unknown): RecordValue => value && typeof value === 'object' && !Array.isArray(value) ? value as RecordValue : {}
const text = (value: unknown, fallback = 'Not available'): string => typeof value === 'string' && value.trim() ? value : fallback
const confidence = (value: unknown): number | null => typeof value === 'number' && Number.isFinite(value) ? Math.round((value <= 1 ? value * 100 : value) * 10) / 10 : null
const stringArray = (value: unknown): string[] => Array.isArray(value) ? value.filter(v => typeof v === 'string' && v.trim()) : []

export function normalizeAnalysisResult(response: AnalysisSuccess): LiveAnalysisResult {
  const analysis = response.analysis as RecordValue
  const roberta = record(analysis.roberta_output)
  const emotion = record(analysis.emotion_output)
  const vision = record(analysis.vision_output)
  const facts = record(vision.visual_facts)
  const judge = record(analysis.judge)
  const meta = record(analysis.meta_judge)
  const defence = record(analysis.defence)
  const agentsRecord = record(analysis.agents)
  const agents = Object.entries(agentsRecord).map(([key, value]) => { const agent = record(value); return { key, name: labels[key] ?? text(agent.agent_name, key), status: text(agent.label), confidence: confidence(agent.confidence), summary: text(agent.summary, text(agent.label)), reasoning: text(agent.reasoning), contribution: confidence(agent.risk_contribution) } })
  
  // Normalize defence data separately
  let normalizedDefence = undefined
  if (Object.keys(defence).length > 0 && defence.label !== 'defensive_analysis_unavailable') {
    const escRec = record(defence.escalation_recommendation)
    normalizedDefence = {
      threat_category: text(defence.threat_category, 'none'),
      risk_level: text(defence.risk_level, 'low'),
      confidence: confidence(defence.confidence),
      protective_actions: stringArray(defence.protective_actions),
      communication_boundaries: stringArray(defence.communication_boundaries),
      manipulation_education: text(defence.manipulation_education, ''),
      counter_strategies: stringArray(defence.counter_strategies),
      escalation_recommendation: {
        needed: Boolean(escRec.needed),
        reason: text(escRec.reason, ''),
        suggested_action: text(escRec.suggested_action, '')
      }
    }
  }
  
  const influential = [...agents].sort((a, b) => (b.contribution ?? -1) - (a.contribution ?? -1))[0]
  const hasVision = Object.keys(vision).length > 0
  return { classification: text(meta.final_decision, text(judge.decision, text(roberta.label))), confidence: confidence(meta.confidence) ?? confidence(judge.confidence) ?? confidence(roberta.confidence), primaryEmotion: text(emotion.primary_emotion), emotionConfidence: confidence(emotion.confidence), technique: influential?.status ?? 'Not available', influentialAgent: influential?.name ?? 'Not available', extractedText: text(analysis.text_analyzed), roberta: { prediction: text(roberta.label), confidence: confidence(roberta.confidence) }, vision: hasVision ? { ocr: text(vision.ocr_text, text(vision.extracted_text, text(analysis.text_analyzed))), summary: text(facts.scene_description, text(vision.description, 'Not available')) } : undefined, agents, judge: { decision: text(judge.decision), confidence: confidence(judge.confidence), reasoning: text(judge.reasoning) }, metaJudge: { decision: text(meta.final_decision), confidence: confidence(meta.confidence), agreement: confidence(meta.agreement_score), summary: text(meta.final_summary, text(meta.reasoning)) }, defence: normalizedDefence }
}
