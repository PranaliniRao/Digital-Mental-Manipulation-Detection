import { motion, useScroll, useTransform } from 'framer-motion'

const nodes: [number, number][] = [[275, 70], [410, 130], [462, 278], [382, 406], [244, 465], [102, 376], [78, 220], [158, 115], [275, 272]]
const links: [number, number][] = [[0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 8], [7, 8], [0, 1], [2, 3], [4, 5], [6, 7]]

const spin = (duration: number) => ({ duration, ease: 'linear' as const, repeat: Infinity, repeatType: 'loop' as const })

export function DashboardHeroVisual({ ambient = false }: { ambient?: boolean }) {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 800], [0, -48])

  return <motion.div style={{ y }} className={`relative mx-auto aspect-square w-full max-w-[31rem] [will-change:transform] ${ambient ? 'block' : 'hidden lg:block'}`} aria-hidden="true">
    <svg viewBox="0 0 540 540" className="size-full overflow-visible" fill="none">
      <motion.g animate={{ rotate: 360 }} transition={spin(35)} style={{ transformOrigin: '270px 270px', willChange: 'transform' }}>
        <circle cx="270" cy="270" r="229" stroke="rgb(168 85 247 / .28)" strokeWidth="1.15" />
        <path d="M56 270C110 80 366 41 471 204S390 489 220 469" stroke="rgb(192 132 252 / .27)" strokeWidth="1.1" />
      </motion.g>
      <motion.g animate={{ rotate: -360 }} transition={spin(28)} style={{ transformOrigin: '270px 270px', willChange: 'transform' }}>
        <circle cx="270" cy="270" r="186" stroke="rgb(168 85 247 / .24)" strokeWidth="1.1" strokeDasharray="3 14" />
        <path d="M100 164C212 260 304 344 440 366" stroke="rgb(168 85 247 / .24)" strokeWidth="1" strokeDasharray="4 10" />
      </motion.g>
      <motion.g animate={{ rotate: 360 }} transition={spin(22)} style={{ transformOrigin: '270px 270px', willChange: 'transform' }}>
        <circle cx="270" cy="270" r="135" stroke="rgb(192 132 252 / .3)" strokeWidth="1.1" />
        <circle cx="270" cy="270" r="77" stroke="rgb(168 85 247 / .25)" strokeWidth="1" strokeDasharray="2 10" />
        {links.map(([start, end]) => <line key={`${start}-${end}`} x1={nodes[start]![0]} y1={nodes[start]![1]} x2={nodes[end]![0]} y2={nodes[end]![1]} stroke="rgb(192 132 252 / .27)" strokeWidth="1" />)}
        {nodes.map(([cx, cy], index) => <motion.circle key={index} cx={cx} cy={cy} r={index === 8 ? 7 : 3.5} fill={index === 8 ? 'rgb(192 132 252 / .78)' : 'rgb(168 85 247 / .62)'} animate={{ opacity: [.35, .95, .35], r: index === 8 ? [6, 8, 6] : [3, 4.5, 3] }} transition={{ duration: 2.8 + index * .2, delay: index * .18, repeat: Infinity }} />)}
      </motion.g>
    </svg>
    <motion.span animate={{ y: [0, -13, 0], x: [0, 4, 0], opacity: [.3, .9, .3] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} className="absolute left-[17%] top-[28%] size-2 rounded-full bg-violet/80 shadow-[0_0_22px_rgb(168_85_247_/_0.72)]" />
    <motion.span animate={{ y: [0, 10, 0], opacity: [.3, .9, .3] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: .8 }} className="absolute bottom-[20%] right-[17%] size-1.5 rounded-full bg-violet/90 shadow-[0_0_20px_rgb(192_132_252_/_0.72)]" />
  </motion.div>
}
