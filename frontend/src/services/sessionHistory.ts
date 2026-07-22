import type { AnalysisSuccess } from './api/contracts'
import { normalizeAnalysisResult, type LiveAnalysisResult } from '../features/workspace/data/normalizeAnalysisResult'

export type SessionHistoryEntry = {
  id: string
  timestamp: string
  inputType: 'text' | 'image' | string
  originalInput: string
  classification: string
  confidence: number | null
  primaryEmotion: string
  emotionConfidence: number | null
  judgeDecision: string
  metaJudgeDecision: string
  overallRisk: number | null
  summary: string
  response: AnalysisSuccess
  result: LiveAnalysisResult
}

const storageKey = 'signalguard.sessionHistory'
const maxEntries = 50

function readStoredEntries(): SessionHistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.sessionStorage.getItem(storageKey)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SessionHistoryEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeStoredEntries(entries: SessionHistoryEntry[]) {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(storageKey, JSON.stringify(entries))
}

function derivePreview(inputType: string, response: AnalysisSuccess): string {
  if (inputType === 'image') {
    const file = (response.analysis as Record<string, unknown>).file_name as string | undefined
    return file || 'Image analysis'
  }
  const text = String((response.analysis as Record<string, unknown>).text_analyzed ?? '')
  return text.length > 100 ? `${text.slice(0, 100)}…` : text || 'Text analysis'
}

export function saveAnalysis(response: AnalysisSuccess): SessionHistoryEntry {
  const result = normalizeAnalysisResult(response)
  const analysis = response.analysis as Record<string, unknown>
  const inputType = String(analysis.input_type || (analysis.text_analyzed ? 'text' : 'image'))
  const classification = result.metaJudge.decision || result.judge.decision
  const confidence = result.metaJudge.confidence ?? result.judge.confidence
  const risk = confidence === null ? null : (classification === 'manipulation' ? confidence : Math.round((confidence ?? 20) * 0.3))
  const entry: SessionHistoryEntry = {
    id: `analysis-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    inputType,
    originalInput: inputType === 'image' ? String((analysis.file_name as string | undefined) ?? 'Image') : String(analysis.text_analyzed ?? ''),
    classification,
    confidence,
    primaryEmotion: result.primaryEmotion,
    emotionConfidence: result.emotionConfidence,
    judgeDecision: result.judge.decision,
    metaJudgeDecision: result.metaJudge.decision,
    overallRisk: risk,
    summary: result.metaJudge.summary || result.judge.reasoning || 'Analysis completed',
    response,
    result,
  }
  const entries = [entry, ...readStoredEntries()].slice(0, maxEntries)
  writeStoredEntries(entries)
  return entry
}

export function getHistory(): SessionHistoryEntry[] {
  return readStoredEntries()
}

export function getAnalysisById(id: string): SessionHistoryEntry | undefined {
  return readStoredEntries().find(entry => entry.id === id)
}

export function deleteAnalysis(id: string): SessionHistoryEntry[] {
  const next = readStoredEntries().filter(entry => entry.id !== id)
  writeStoredEntries(next)
  return next
}

export function clearHistory(): void {
  writeStoredEntries([])
}

export function getHistoryPreview(entry: SessionHistoryEntry): { preview: string; type: 'Text' | 'Image' } {
  const preview = derivePreview(entry.inputType, entry.response)
  return { preview, type: entry.inputType === 'image' ? 'Image' : 'Text' }
}
