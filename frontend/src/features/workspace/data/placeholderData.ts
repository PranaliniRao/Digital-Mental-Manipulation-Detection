export type Analysis = { id: string; title: string; type: 'Text' | 'Image'; risk: number; status: 'Complete' | 'Review'; date: string; category: string; bookmarked?: boolean }

export const analyses: Analysis[] = [
  { id: 'AN-4821', title: 'Election claim thread', type: 'Text', risk: 82, status: 'Review', date: 'Today, 09:42', category: 'Emotional framing', bookmarked: true },
  { id: 'AN-4820', title: 'Product launch announcement', type: 'Image', risk: 18, status: 'Complete', date: 'Today, 08:17', category: 'Authentic' },
  { id: 'AN-4819', title: 'Market outlook newsletter', type: 'Text', risk: 61, status: 'Complete', date: 'Yesterday', category: 'Selective context' },
  { id: 'AN-4818', title: 'Breaking-news visual', type: 'Image', risk: 74, status: 'Review', date: 'Yesterday', category: 'Synthetic media' },
  { id: 'AN-4817', title: 'Health advisory excerpt', type: 'Text', risk: 35, status: 'Complete', date: '14 Jul', category: 'Unsupported claim' },
]

export const trend = [36, 42, 34, 55, 47, 69, 58, 74, 64, 81, 72, 88]
export const categories = [
  { label: 'Emotional framing', value: 42, color: '#8b5cf6' },
  { label: 'Selective context', value: 27, color: '#b18cff' },
  { label: 'Synthetic media', value: 19, color: '#f9b847' },
  { label: 'Other', value: 12, color: '#686174' },
]

export const activities = [
  ['09:42', 'Election claim thread', 'Flagged for review'],
  ['08:17', 'Product launch announcement', 'Analysis complete'],
  ['Yesterday', 'Breaking-news visual', 'Report bookmarked'],
  ['14 Jul', 'Health advisory excerpt', 'Export generated'],
] as const

export const reports = [
  { title: 'Election claim thread', subtitle: 'Text · 4 source patterns detected', risk: 82, tag: 'High risk' },
  { title: 'Market outlook newsletter', subtitle: 'Text · 2 source patterns detected', risk: 61, tag: 'Medium risk' },
  { title: 'Breaking-news visual', subtitle: 'Image · Metadata inconsistency', risk: 74, tag: 'High risk' },
]

export const recentImages = [
  { name: 'campaign-poster.jpg', size: '2.4 MB', date: 'Today' },
  { name: 'news-card.png', size: '1.8 MB', date: 'Yesterday' },
]
