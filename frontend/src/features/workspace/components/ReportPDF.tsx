import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import type { LiveAnalysisResult } from '../data/normalizeAnalysisResult'
import { formatDisplayLabel } from '../../../utils/formatDisplayLabel'

Font.register({
  family: 'Inter',
  src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff',
})

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Inter',
    fontSize: 10,
    lineHeight: 1.5,
    color: '#1a1a1a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#6b21a8',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#6b21a8',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    width: 140,
    color: '#333',
  },
  value: {
    flex: 1,
    color: '#1a1a1a',
  },
  agentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  agentItem: {
    width: '48%',
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
  },
  defenceSegment: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#f5f3ff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  defenceSegmentTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#6b21a8',
  },
  bullet: {
    marginLeft: 16,
    marginBottom: 4,
  },
  escalationBox: {
    backgroundColor: '#fef2f2',
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  escalationTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#dc2626',
  },
})

interface ReportPDFProps {
  result: LiveAnalysisResult
  filename?: string
}

export function ReportPDF({ result, filename = 'Manipulation Analysis Report' }: ReportPDFProps) {
  const decision = result.metaJudge.decision || result.judge.decision
  const confidence = result.metaJudge.confidence ?? result.judge.confidence ?? 0
  const influential = [...result.agents].sort((a, b) => (b.contribution ?? 0) - (a.contribution ?? 0))[0]
  const riskLevel = decision === 'manipulation' 
    ? (confidence >= 90 ? 'Very High' : confidence >= 75 ? 'High' : confidence >= 50 ? 'Moderate' : 'Low')
    : 'Low'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Text style={styles.title}>{filename}</Text>
        <Text style={styles.subtitle}>Digital Mental Manipulation Detection Report</Text>

        {/* Risk Score */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Assessment</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Risk Score:</Text>
            <Text style={styles.value}>{confidence}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Risk Level:</Text>
            <Text style={styles.value}>{riskLevel}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Confidence:</Text>
            <Text style={styles.value}>{confidence}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Final Decision:</Text>
            <Text style={styles.value}>{formatDisplayLabel(decision)}</Text>
          </View>
        </View>

        {/* Executive Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <Text style={styles.value}>
            {result.metaJudge.summary || result.judge.reasoning}
          </Text>
        </View>

        {/* Decision Rationale */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Decision Rationale</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Primary Technique:</Text>
            <Text style={styles.value}>
              {result.technique !== 'Not available' ? formatDisplayLabel(result.technique) : 'N/A'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Dominant Emotion:</Text>
            <Text style={styles.value}>{formatDisplayLabel(result.primaryEmotion)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Most Influential Agent:</Text>
            <Text style={styles.value}>
              {influential?.name ?? 'N/A'} ({influential?.contribution ?? 0}% contribution)
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Confidence:</Text>
            <Text style={styles.value}>{confidence}%</Text>
          </View>
        </View>

        {/* Language Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language Analysis</Text>
          <Text style={styles.value}>
            {result.agents.find(a => a.key === 'intent')?.reasoning || 'No language analysis available.'}
          </Text>
        </View>

        {/* Emotion Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emotion Analysis</Text>
          <Text style={styles.value}>
            Dominant emotion: {formatDisplayLabel(result.primaryEmotion)} ({result.emotionConfidence ?? '—'}% confidence)
          </Text>
          <Text style={styles.value}>
            {result.agents.find(a => a.key === 'emotion_exploitation')?.reasoning || ''}
          </Text>
        </View>

        {/* Agent Results */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specialist Agent Results</Text>
          <View style={styles.agentGrid}>
            {result.agents.map((agent) => (
              <View key={agent.key} style={styles.agentItem}>
                <Text style={{ fontWeight: 'bold', fontSize: 9 }}>{agent.name}</Text>
                <Text style={{ fontSize: 8 }}>Label: {formatDisplayLabel(agent.status)}</Text>
                <Text style={{ fontSize: 8 }}>Confidence: {agent.confidence ?? 0}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Judge Decisions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Judge Decisions</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Judge Decision:</Text>
            <Text style={styles.value}>{formatDisplayLabel(result.judge.decision)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Judge Confidence:</Text>
            <Text style={styles.value}>{result.judge.confidence ?? 0}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Meta Judge Decision:</Text>
            <Text style={styles.value}>{formatDisplayLabel(result.metaJudge.decision)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Meta Judge Confidence:</Text>
            <Text style={styles.value}>{result.metaJudge.confidence ?? 0}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Agent Agreement:</Text>
            <Text style={styles.value}>{result.metaJudge.agreement ?? '—'}%</Text>
          </View>
        </View>

        {/* Defence Agent */}
        {result.defence && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Defence Agent</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Threat Category:</Text>
              <Text style={styles.value}>{result.defence.threat_category}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Risk Level:</Text>
              <Text style={styles.value}>{result.defence.risk_level}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Confidence:</Text>
              <Text style={styles.value}>{result.defence.confidence ?? 0}%</Text>
            </View>

            {result.defence.protective_actions && result.defence.protective_actions.length > 0 && (
              <View style={styles.defenceSegment}>
                <Text style={styles.defenceSegmentTitle}>⚠ Protective Actions</Text>
                {result.defence.protective_actions.map((action, i) => (
                  <Text key={i} style={styles.bullet}>• {action}</Text>
                ))}
              </View>
            )}

            {result.defence.communication_boundaries && result.defence.communication_boundaries.length > 0 && (
              <View style={styles.defenceSegment}>
                <Text style={styles.defenceSegmentTitle}>🛡 Communication Boundaries</Text>
                {result.defence.communication_boundaries.map((boundary, i) => (
                  <Text key={i} style={styles.bullet}>• {boundary}</Text>
                ))}
              </View>
            )}

            {result.defence.manipulation_education && (
              <View style={styles.defenceSegment}>
                <Text style={styles.defenceSegmentTitle}>📘 Manipulation Education</Text>
                <Text style={styles.value}>{result.defence.manipulation_education}</Text>
              </View>
            )}

            {result.defence.counter_strategies && result.defence.counter_strategies.length > 0 && (
              <View style={styles.defenceSegment}>
                <Text style={styles.defenceSegmentTitle}>🎯 Counter-Strategies</Text>
                {result.defence.counter_strategies.map((strategy, i) => (
                  <Text key={i} style={styles.bullet}>• {strategy}</Text>
                ))}
              </View>
            )}

            {result.defence.escalation_recommendation && (
              <View style={result.defence.escalation_recommendation.needed ? styles.escalationBox : styles.defenceSegment}>
                <Text style={result.defence.escalation_recommendation.needed ? styles.escalationTitle : styles.defenceSegmentTitle}>
                  🚨 Escalation
                </Text>
                {result.defence.escalation_recommendation.needed ? (
                  <>
                    {result.defence.escalation_recommendation.reason && (
                      <Text style={styles.value}>{result.defence.escalation_recommendation.reason}</Text>
                    )}
                    {result.defence.escalation_recommendation.suggested_action && (
                      <Text style={{ fontWeight: 'bold', marginTop: 4 }}>{result.defence.escalation_recommendation.suggested_action}</Text>
                    )}
                  </>
                ) : (
                  <Text style={styles.value}>No escalation needed</Text>
                )}
              </View>
            )}
          </View>
        )}
      </Page>
    </Document>
  )
}
