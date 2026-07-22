import { useParams } from 'react-router-dom'
import { icons } from '../../../config/icons'
import { Badge, EmptyState } from '../../../components/ui'

const labels: Record<string, string> = { dashboard: 'Dashboard', 'new-analysis': 'New Analysis', 'image-analysis': 'Image Analysis', 'text-analysis': 'Text Analysis', history: 'History', 'saved-reports': 'Saved Reports', analytics: 'Analytics', 'compare-reports': 'Compare Reports', 'community-intelligence': 'Community Intelligence', settings: 'Settings', profile: 'Profile' }
export function WorkspacePlaceholderPage() { const { workspace = 'dashboard' } = useParams(); const label = labels[workspace] ?? 'Workspace'; return <section className="max-w-4xl"><Badge>Foundation route</Badge><h1 className="mt-5 tracking-display text-4xl font-semibold sm:text-5xl">{label}</h1><p className="mt-4 max-w-xl text-sm leading-7 text-muted">This route is part of the application foundation. Its functional experience will be introduced in a future product phase.</p><div className="mt-12"><EmptyState icon={icons.command} title={`${label} is ready for its future module`} description="The route, responsive shell, navigation state, accessibility foundations, and design primitives are in place without introducing product functionality early." /></div></section> }

