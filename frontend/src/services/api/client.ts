import { env } from '../../config/env'
import type { AnalysisResponse, HealthResponse } from './contracts'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, init)
  if (!response.ok) throw new Error(`API request failed with ${response.status}`)
  return response.json() as Promise<T>
}

export const apiClient = {
  health: () => request<HealthResponse>('/'),
  analyzeText: (text: string) => request<AnalysisResponse>('/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) }),
  analyzeImage: (file: File) => { const formData = new FormData(); formData.append('file', file); return request<AnalysisResponse>('/analyze', { method: 'POST', body: formData }) },
}
