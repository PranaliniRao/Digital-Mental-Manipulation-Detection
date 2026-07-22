import type { LiveAnalysisResult } from '../data/normalizeAnalysisResult'
import { ExplainabilityCenter } from './ExplainabilityCenter'

export function ExplainabilityPanel({ result }: { result: LiveAnalysisResult }) {
  return <ExplainabilityCenter result={result} />
}
