import { useLocation } from 'react-router-dom'
import { Search, Settings2 } from 'lucide-react'
import { icons } from '../../config/icons'
import { Avatar } from '../ui/avatar'
import { Tooltip } from '../ui/tooltip'

export function Header({ onMenu }: { onMenu: () => void }) {
  const location = useLocation()
  const currentPage = location.pathname.split('/').at(-1)?.split('-').map((word) => word[0]?.toUpperCase() + word.slice(1)).join(' ') ?? 'Workspace'
  const Menu = icons.menu
  const Bell = icons.bell
  return <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-subtle bg-canvas/80 px-5 backdrop-blur-xl sm:px-8 lg:px-10"><div className="flex items-center gap-4"><button aria-label="Open navigation" onClick={onMenu} className="grid size-9 place-items-center rounded-control text-muted hover:bg-white/[0.05] hover:text-ink lg:hidden"><Menu size={18} /></button><div><p className="font-mono text-[0.61rem] uppercase tracking-[0.16em] text-muted">Workspace / <span className="text-violet">{currentPage}</span></p><p className="mt-0.5 text-sm font-semibold text-ink">{currentPage}</p></div></div><div className="flex items-center gap-1.5 sm:gap-3"><div className="hidden h-9 w-48 items-center gap-2 rounded-control border border-subtle bg-surface/55 px-3 text-xs text-muted md:flex"><Search size={14}/>Search workspace</div><Tooltip label="Settings"><button aria-label="Settings" className="grid size-9 place-items-center rounded-control text-muted hover:bg-white/[0.05] hover:text-ink"><Settings2 size={16} /></button></Tooltip><Tooltip label="Notifications"><button aria-label="Notifications" className="relative grid size-9 place-items-center rounded-control text-muted hover:bg-white/[0.05] hover:text-ink"><Bell size={17} /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-violet"/></button></Tooltip><Avatar name="AS" /></div></header>
}
