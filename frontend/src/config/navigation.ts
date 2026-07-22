import type { LucideIcon } from 'lucide-react'
import { icons } from './icons'

export type NavigationItem = { label: string; href: string; icon: LucideIcon; description?: string }

export const primaryNavigation: NavigationItem[] = [
  { label: 'Dashboard', href: '/app/dashboard', icon: icons.dashboard },
  { label: 'New Analysis', href: '/app/new-analysis', icon: icons.newAnalysis },
  { label: 'Image Analysis', href: '/app/image-analysis', icon: icons.image },
  { label: 'Text Analysis', href: '/app/text-analysis', icon: icons.text },
]

export const intelligenceNavigation: NavigationItem[] = [
  { label: 'History', href: '/app/history', icon: icons.history },
  { label: 'Saved Reports', href: '/app/saved-reports', icon: icons.reports },
  { label: 'Analytics', href: '/app/analytics', icon: icons.analytics },
  { label: 'Intelligence Center', href: '/app/intelligence', icon: icons.gauge },
  { label: 'Compare Reports', href: '/app/compare-reports', icon: icons.compare },
  { label: 'Community Intelligence', href: '/app/community-intelligence', icon: icons.community },
]

export const accountNavigation: NavigationItem[] = [
  { label: 'Settings', href: '/app/settings', icon: icons.settings },
  { label: 'Profile', href: '/app/profile', icon: icons.profile },
  { label: 'Help', href: '/app/help', icon: icons.help },
  { label: 'About', href: '/app/about', icon: icons.about },
]
