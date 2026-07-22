import { BrandMark } from '../brand/BrandMark'

export function Footer() {
  return <footer className="border-t border-subtle"><div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10"><BrandMark /><p className="max-w-sm text-xs leading-5 text-muted">SignalGuard is designed for accountable analysis of digital influence and manipulation.</p><p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-muted">© 2026 SignalGuard</p></div></footer>
}

