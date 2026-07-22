import { ArrowDownUp, Search, SlidersHorizontal } from 'lucide-react'
import { Button, Input } from '../../../components/ui'
import { AnalysisTable } from '../components/AnalysisTable'
import { PageShell, Panel } from '../components/PageShell'
export function HistoryPage() { return <PageShell title="Analysis history" description="Search, sort, and revisit every placeholder review in this workspace."><Panel><div className="mb-5 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3.5 top-3 text-muted" size={16}/><Input className="pl-10" placeholder="Search analyses, categories, or IDs"/></div><Button variant="secondary"><SlidersHorizontal size={15}/>Filter</Button><Button variant="secondary"><ArrowDownUp size={15}/>Sort</Button></div><AnalysisTable /></Panel></PageShell> }
