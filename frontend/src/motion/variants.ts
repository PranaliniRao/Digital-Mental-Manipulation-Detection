import type { Variants } from 'framer-motion'
import { transitions } from './transitions'

export const fadeUp: Variants = { hidden: { opacity: 0, y: 22, filter: 'blur(8px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: transitions.page } }
export const fadeIn: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: transitions.measured } }
export const scaleIn: Variants = { hidden: { opacity: 0, scale: 0.97 }, visible: { opacity: 1, scale: 1, transition: transitions.measured } }
export const stagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } }

