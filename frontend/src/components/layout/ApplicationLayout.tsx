import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function ApplicationLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  return <div className="min-h-screen bg-canvas"><Sidebar open={sidebarOpen} collapsed={collapsed} onClose={() => setSidebarOpen(false)} onToggle={() => setCollapsed(!collapsed)} /><div className={`min-h-screen transition-[padding] duration-300 ${collapsed ? 'lg:pl-[5.5rem]' : 'lg:pl-[17.25rem]'}`}><Header onMenu={() => setSidebarOpen(true)} /><main className="mx-auto max-w-[110rem] px-5 py-9 sm:px-8 lg:px-10 lg:py-11"><motion.div key={location.pathname} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .16, ease: [0.22, 1, 0.36, 1] }}><Outlet /></motion.div></main></div></div>
}
