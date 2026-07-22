import {
  Bell, BarChart3, BookOpenCheck, ChevronDown, ChevronRight, CircleHelp, GitCompareArrows,
  Command, FileSearch, Gauge, History, Image, LayoutDashboard, Menu, MessageSquareText,
  Network, PanelsTopLeft, ScanSearch, Settings, ShieldCheck, Sparkles, UserRound, Users, Info,
  type LucideIcon,
} from 'lucide-react'

export const icons = {
  bell: Bell, analytics: BarChart3, reports: BookOpenCheck, chevronDown: ChevronDown,
  chevronRight: ChevronRight, help: CircleHelp, compare: GitCompareArrows, command: Command,
  text: FileSearch, dashboard: LayoutDashboard, history: History, image: Image, menu: Menu,
  community: Users, graph: Network, newAnalysis: ScanSearch, settings: Settings,
  shield: ShieldCheck, sparkles: Sparkles, profile: UserRound, timeline: PanelsTopLeft,
  chat: MessageSquareText, gauge: Gauge,
  about: Info,
} satisfies Record<string, LucideIcon>
