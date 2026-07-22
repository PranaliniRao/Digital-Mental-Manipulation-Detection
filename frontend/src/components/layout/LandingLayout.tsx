import { Outlet } from 'react-router-dom'
import { BrandMark } from '../brand/BrandMark'
import { Button } from '../ui/button'
import { Footer } from './Footer'

export function LandingLayout() {
  return <div className="min-h-screen overflow-hidden"><header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10"><BrandMark /><nav className="hidden items-center gap-7 text-xs font-medium text-muted md:flex" aria-label="Landing navigation"><a href="#technology" className="hover:text-ink">Technology</a><a href="#research" className="hover:text-ink">Research</a></nav><div className="flex items-center gap-3"><Button variant="ghost" size="sm" onClick={() => { window.location.href = '/login' }}>Sign in</Button><Button size="sm" onClick={() => { window.location.href = '/app' }}>Open workspace</Button></div></header><main><Outlet /></main><Footer /></div>
}

