import type { PropsWithChildren } from 'react'
import { MotionConfig } from 'framer-motion'

export function AnimationProvider({ children }: PropsWithChildren) {
  return <MotionConfig reducedMotion="user" transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}>{children}</MotionConfig>
}

