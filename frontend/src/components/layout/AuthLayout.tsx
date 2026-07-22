import { Outlet } from 'react-router-dom'
import { BrandMark } from '../brand/BrandMark'

export function AuthLayout() {
  return <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]"><section className="relative hidden overflow-hidden border-r border-subtle bg-surface p-12 lg:flex lg:flex-col"><div className="absolute inset-0 grid-line opacity-40" /><div className="relative"><BrandMark /></div><div className="relative my-auto max-w-lg"><p className="eyebrow">Manipulation intelligence</p><h1 className="mt-6 tracking-display text-5xl font-semibold leading-[1.02]">Evidence-led clarity for the signals that matter.</h1><p className="mt-6 max-w-md text-base leading-7 text-muted">A calm, auditable space for understanding the language and imagery that shapes decisions.</p></div><p className="relative font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted">SignalGuard / Secure workspace</p></section><main className="grid place-items-center px-5 py-14 sm:p-10"><div className="w-full max-w-md"><div className="mb-12 lg:hidden"><BrandMark /></div><Outlet /></div></main></div>
}

