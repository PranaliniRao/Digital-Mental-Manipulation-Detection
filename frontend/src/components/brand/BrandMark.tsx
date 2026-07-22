import { Link } from 'react-router-dom'
import { icons } from '../../config/icons'

export function BrandMark({ compact = false }: { compact?: boolean }) {
  const Shield = icons.shield
  return <Link to="/" className="group inline-flex items-center gap-2.5 rounded-control focus-visible:ring-offset-canvas" aria-label="SignalGuard home">
    <span className="grid size-8 place-items-center rounded-lg border border-violet/30 bg-violet/10 text-violet transition-colors group-hover:bg-violet/15"><Shield size={17} strokeWidth={2.1} /></span>
    {!compact && <span className="text-[0.94rem] font-semibold tracking-[-0.035em] text-ink">Signal<span className="text-violet">Guard</span></span>}
  </Link>
}
