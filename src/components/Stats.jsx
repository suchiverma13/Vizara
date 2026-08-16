import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const stats = [
  { value: 128, suffix: 'K+', label: 'Active coders' },
  { value: 4.2, suffix: 'M', label: 'Challenges solved' },
  { value: 96, suffix: '%', label: 'Win rate tracked' },
  { value: 12, suffix: 'ms', label: 'Avg. judge latency' },
]

function Counter({ value, suffix, label }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const display = (v) =>
    suffix === 'M' ? v.toFixed(1) : Math.round(v).toString()

  return (
    <motion.div
      ref={ref}
      className="stat"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      whileHover={{ scale: 1.06, y: -6 }}
    >
      <motion.span
        className="stat-value"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
      >
        {inView ? display(value) : 0}
        <span className="stat-suffix">{suffix}</span>
      </motion.span>
      <span className="stat-label">{label}</span>
    </motion.div>
  )
}

export default function Stats() {
  return (
    <section className="stats" id="stats">
      <div className="section-label">
        <span className="sq" /> 01 — Global stats
      </div>
      <div className="stats-grid">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 200, damping: 18 }}
          >
            <Counter {...s} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}