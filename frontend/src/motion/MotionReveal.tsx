import type { PropsWithChildren } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { fadeUp } from './variants'

type MotionRevealProps = PropsWithChildren<{ className?: string; variants?: Variants; delay?: number }>

export function MotionReveal({ children, className, variants = fadeUp, delay = 0 }: MotionRevealProps) {
  const reducedMotion = useReducedMotion()
  return <motion.div className={className} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={reducedMotion ? undefined : variants} transition={{ delay }}>{children}</motion.div>
}

