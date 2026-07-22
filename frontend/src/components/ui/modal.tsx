import type { PropsWithChildren } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Dialog } from './dialog'
export function Modal({ open, title, children }: PropsWithChildren<{ open: boolean; title: string }>) { return <AnimatePresence>{open && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-canvas/80 p-4 backdrop-blur-sm"><Dialog title={title}>{children}</Dialog></motion.div>}</AnimatePresence> }
