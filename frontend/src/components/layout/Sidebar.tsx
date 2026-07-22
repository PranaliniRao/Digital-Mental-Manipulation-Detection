import { ChevronLeft, ChevronRight } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { accountNavigation, intelligenceNavigation, primaryNavigation, type NavigationItem } from '../../config/navigation'
import { useProfile } from '../../providers/ProfileProvider'
import { cn } from '../../utils/cn'
import { BrandMark } from '../brand/BrandMark'
import { Avatar } from '../ui/avatar'

function NavigationGroup({ label, items, onNavigate, collapsed }: { label?: string; items: NavigationItem[]; onNavigate?: () => void; collapsed: boolean }) {
  return <div className="space-y-1">{label && !collapsed && <p className="px-3 pb-2 pt-5 font-mono text-[0.61rem] uppercase tracking-[0.16em] text-muted/70">{label}</p>}{items.map(({ label: itemLabel, href, icon: Icon }) => <NavLink title={collapsed ? itemLabel : undefined} key={href} to={href} onClick={onNavigate} className={({ isActive }) => cn('group relative flex items-center gap-3 rounded-control px-3 py-2.5 text-[0.79rem] font-medium transition-colors', collapsed && 'justify-center', isActive ? 'bg-violet/15 text-violet' : 'text-muted hover:bg-white/[0.045] hover:text-ink')}><Icon size={16} strokeWidth={1.8} /><span className={cn('whitespace-nowrap transition-opacity', collapsed && 'hidden')}>{itemLabel}</span></NavLink>)}</div>
}

export function Sidebar({ open, onClose, collapsed, onToggle }: { open: boolean; onClose: () => void; collapsed: boolean; onToggle: () => void }) {
  const { fullName, profile } = useProfile()
  return <><button aria-label="Close navigation" onClick={onClose} className={cn('fixed inset-0 z-30 bg-canvas/70 backdrop-blur-sm lg:hidden', open ? 'block' : 'hidden')} /><aside className={cn('fixed inset-y-0 left-0 z-40 flex flex-col border-r border-subtle bg-[#17151d]/95 px-3 py-5 shadow-panel backdrop-blur-xl transition-[width,transform] duration-300 lg:translate-x-0 lg:shadow-none', collapsed ? 'w-[5.5rem]' : 'w-[17.25rem]', open ? 'translate-x-0' : '-translate-x-full')}><div className={cn('flex items-center', collapsed ? 'justify-center' : 'justify-between px-3')}><BrandMark compact={collapsed} /><button onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} className="hidden size-8 place-items-center rounded-control text-muted hover:bg-white/[.05] hover:text-ink lg:grid">{collapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}</button></div><nav className="mt-8 flex-1 overflow-y-auto pr-1" aria-label="Application navigation"><NavigationGroup collapsed={collapsed} items={primaryNavigation} onNavigate={onClose} /><NavigationGroup collapsed={collapsed} label="Intelligence" items={intelligenceNavigation} onNavigate={onClose} /></nav><div className="border-t border-subtle pt-3"><NavigationGroup collapsed={collapsed} items={accountNavigation} onNavigate={onClose} />{!collapsed && <div className="mt-3 flex items-center gap-2.5 rounded-control px-3 py-2"><Avatar name="SG" /><div className="min-w-0"><p className="truncate text-xs font-semibold text-ink">{fullName}</p><p className="truncate text-[0.68rem] text-muted">{profile.role}</p></div></div>}</div></aside></>
}
