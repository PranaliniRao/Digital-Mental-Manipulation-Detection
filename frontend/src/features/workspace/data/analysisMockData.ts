export type AgentInsight = { name: string; confidence: number; contribution: number; summary: string; reasoning: string; evidence: string[] }

export const analysisStages = ['Uploading', 'Vision', 'RoBERTa', 'Emotion', 'Agents', 'Judge', 'Meta Judge', 'Completed']

export const agentInsights: AgentInsight[] = [
  { name: 'Intent', confidence: 91, contribution: 18, summary: 'The message directs the reader toward immediate sharing.', reasoning: 'Urgency and imperatives are concentrated in the opening and close.', evidence: ['“Share this message”', 'Time-sensitive framing'] },
  { name: 'Vulnerability', confidence: 84, contribution: 13, summary: 'The source may target anxiety around personal security.', reasoning: 'The phrasing implies a broad, unavoidable personal consequence.', evidence: ['“Every household”', 'Implied threat'] },
  { name: 'Emotion', confidence: 88, contribution: 17, summary: 'Urgency is the dominant emotional signal.', reasoning: 'Compressed timeframes and removal language increase emotional pressure.', evidence: ['“By Friday”', '“Before it is removed”'] },
  { name: 'Influence Strategy', confidence: 79, contribution: 14, summary: 'The narrative relies on scarcity and authority cues.', reasoning: 'It pairs an unnamed expert group with a disappearing-information claim.', evidence: ['Unattributed experts', 'Scarcity framing'] },
  { name: 'Bias', confidence: 72, contribution: 8, summary: 'The source presents a single outcome without counter-context.', reasoning: 'No underlying policy or qualification is supplied.', evidence: ['Missing source link', 'Absolute outcome'] },
  { name: 'Context', confidence: 87, contribution: 16, summary: 'Critical context needed to assess the claim is absent.', reasoning: 'There is no date, jurisdiction, or primary source attached.', evidence: ['No provenance', 'No scope'] },
  { name: 'Relationship', confidence: 68, contribution: 6, summary: 'The language creates a peer-to-peer sharing dynamic.', reasoning: 'The reader is cast as responsible for warning others.', evidence: ['Collective call to action'] },
  { name: 'Motive', confidence: 76, contribution: 8, summary: 'The source may be seeking rapid reach over clarity.', reasoning: 'The claim optimizes for forwarding behavior rather than substantiation.', evidence: ['Virality-oriented phrasing'] },
]

export const reportMock = {
  id: 'RP-4821', title: 'Election claim thread', risk: 82, confidence: 94, classification: 'High-pressure narrative', summary: 'This content combines urgency, broad personal consequence, and limited context in a way that may pressure readers to share before verifying the claim.', findings: ['Unsupported time-sensitive claim', 'High emotional urgency', 'Missing provenance and policy context', 'Strong peer-sharing call to action'], timeline: [24, 35, 49, 63, 59, 78, 82], distribution: [32, 54, 46, 73, 61, 82, 70],
}
