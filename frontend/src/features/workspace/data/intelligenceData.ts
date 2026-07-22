export type IntelligenceMetric = { label: string; value: string; detail: string; trend: string; tone: 'violet' | 'success' | 'warning' }
export type IntelligenceInsight = { title: string; detail: string; metric: string; direction: 'up' | 'down' | 'stable' }
export type IntelligenceReport = { id: string; title: string; source: string; fileType: 'Text' | 'Image'; risk: number; confidence: number; judge: 'Review' | 'Clear'; metaJudge: 'Aligned' | 'Watch'; emotion: string; technique: string; agent: string; date: string }

export const intelligenceMetrics: IntelligenceMetric[] = [
  { label: 'AI health score', value: '98.4', detail: 'All decision layers nominal', trend: '+0.6%', tone: 'success' },
  { label: 'Total analyses', value: '2,481', detail: 'Across all workspace sources', trend: '+18.0%', tone: 'violet' },
  { label: 'Manipulations detected', value: '683', detail: '27.5% of completed analyses', trend: '+9.2%', tone: 'warning' },
  { label: 'Detection accuracy', value: '96.8%', detail: 'Validated review outcomes', trend: '+1.4%', tone: 'success' },
  { label: 'Average confidence', value: '91.7%', detail: 'Confidence-weighted result', trend: '+2.1%', tone: 'violet' },
  { label: 'Agent agreement', value: '88.9%', detail: 'Specialist consensus', trend: '+3.8%', tone: 'violet' },
  { label: 'Reports generated', value: '1,924', detail: 'Review-ready intelligence reports', trend: '+14.6%', tone: 'violet' },
  { label: 'Images processed', value: '814', detail: 'Visual integrity and media scans', trend: '+11.2%', tone: 'violet' },
  { label: 'Texts processed', value: '1,667', detail: 'Narrative and claim analysis', trend: '+21.3%', tone: 'violet' },
]

export const intelligenceInsights: IntelligenceInsight[] = [
  { title: 'Manipulation is increasing this week.', detail: 'High-risk signals rose after a cluster of time-sensitive claims entered the workspace.', metric: '+12.4% week over week', direction: 'up' },
  { title: 'Authority bias is becoming more common.', detail: 'Unsupported expertise cues now appear in 31% of the flagged narratives.', metric: '+18% in 30 days', direction: 'up' },
  { title: 'Fear-based manipulation has decreased.', detail: 'Fear appeal signals are lower while urgency framing is now the dominant pattern.', metric: '−8.6% in 30 days', direction: 'down' },
  { title: 'Emotion exploitation peaks on Fridays.', detail: 'Friday submissions show the highest combined urgency and concern score.', metric: '1.7× weekly baseline', direction: 'stable' },
]

export const intelligenceReports: IntelligenceReport[] = [
  { id: 'AN-4821', title: 'Election claim thread', source: 'Social capture', fileType: 'Text', risk: 82, confidence: 94, judge: 'Review', metaJudge: 'Aligned', emotion: 'Urgency', technique: 'Authority bias', agent: 'Intent', date: 'Today' },
  { id: 'AN-4820', title: 'Product launch announcement', source: 'Web capture', fileType: 'Image', risk: 18, confidence: 96, judge: 'Clear', metaJudge: 'Aligned', emotion: 'Neutral', technique: 'None detected', agent: 'Context', date: 'Today' },
  { id: 'AN-4819', title: 'Market outlook newsletter', source: 'Mail import', fileType: 'Text', risk: 61, confidence: 89, judge: 'Review', metaJudge: 'Watch', emotion: 'Concern', technique: 'Selective context', agent: 'Strategy', date: 'Yesterday' },
  { id: 'AN-4818', title: 'Breaking-news visual', source: 'Image upload', fileType: 'Image', risk: 74, confidence: 91, judge: 'Review', metaJudge: 'Aligned', emotion: 'Fear', technique: 'Emotional pressure', agent: 'Emotion', date: 'Yesterday' },
]

export const executiveSeries = { risk: [42, 47, 44, 53, 50, 61, 58, 69, 73, 68, 79, 84], confidence: [78, 81, 80, 84, 85, 87, 86, 90, 89, 92, 91, 94], activity: [24, 38, 44, 51, 48, 64, 72] }
