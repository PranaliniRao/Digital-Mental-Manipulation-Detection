const labelOverrides: Record<string, string> = {
  no_manipulation: 'Non-Manipulative',
  manipulation: 'Manipulative',
  authority_bias: 'Authority Bias',
  fear_appeal: 'Fear Appeal',
  social_proof: 'Social Proof',
  emotional_manipulation: 'Emotional Manipulation',
  reciprocity: 'Reciprocity',
  guilt_tripping: 'Guilt Tripping',
  gaslighting: 'Gaslighting',
  scarcity: 'Scarcity',
  urgency: 'Urgency',
  none: 'None',
  not_available: 'Not available',
  'not available': 'Not available',
  na: 'N/A',
  n_a: 'N/A',
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function formatDisplayLabel(value: string | null | undefined, fallback = 'Not available'): string {
  if (typeof value !== 'string') return fallback

  const trimmed = value.trim()
  if (!trimmed) return fallback

  const normalized = trimmed.replace(/\s+/g, ' ')
  const directKey = normalized.toLowerCase()
  const override = labelOverrides[directKey]
  if (override) return override

  if (normalized.includes('_')) {
    return normalized
      .split('_')
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ')
  }

  return titleCase(normalized)
}
