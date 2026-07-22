export type HealthResponse = { status: string; service: string }
export type ExplainabilityPayload = { risk?: number; confidence?: number; classification?: string; summary?: string; reasoning?: unknown; agents?: unknown; evidence?: unknown }
export type AnalysisSuccess = { success: true; analysis: Record<string, unknown> & ExplainabilityPayload }
export type AnalysisFailure = { success: false; error: string }
export type AnalysisResponse = AnalysisSuccess | AnalysisFailure
