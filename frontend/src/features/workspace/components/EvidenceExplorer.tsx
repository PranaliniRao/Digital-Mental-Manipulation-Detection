import { ChevronDown, FileSearch } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { EvidenceGroup } from '../data/explainabilityModel'
import { Panel, SectionTitle } from './PageShell'
import { formatDisplayLabel } from '../../../utils/formatDisplayLabel'

export function EvidenceExplorer({ evidence }: { evidence: EvidenceGroup[] }) {
  const [open, setOpen] = useState<string | null>(evidence[0]?.title ?? null)

  useEffect(() => {
    setOpen(evidence[0]?.title ?? null)
  }, [evidence])

  return (
    <Panel>
      <SectionTitle title="Evidence explorer" description="Inspectable support behind each inference" />
      <div className="grid gap-2 md:grid-cols-2">
        {evidence.map(group => (
          <div key={group.title} className="rounded-control border border-subtle bg-canvas/35">
            <button onClick={() => setOpen(open === group.title ? null : group.title)} className="flex w-full items-center gap-3 p-3 text-left">
              <FileSearch size={15} className="text-violet" />
              <span className="flex-1 text-xs font-semibold">{group.title}</span>
              <ChevronDown className={`text-muted transition ${open === group.title ? 'rotate-180' : ''}`} size={15} />
            </button>
            <AnimatePresence>
              {open === group.title && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-subtle">
                  {group.items.map(item => (
                    <div className="p-3" key={item.label}>
                      <div className="flex justify-between gap-3">
                        <p className="text-xs font-semibold">{formatDisplayLabel(item.label)}</p>
                        <span className="font-mono text-[.6rem] text-violet">{item.confidence}%</span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-muted">{item.detail}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </Panel>
  )
}
