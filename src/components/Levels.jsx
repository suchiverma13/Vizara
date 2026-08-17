import { motion } from 'framer-motion'
import { useState } from 'react'
import { levels } from '../data/levels.js'
import { dailyForLevel } from '../data/questions.js'

const filters = ['All', 'Easy', 'Medium', 'Hard', 'Nightmare']

const diffColor = (d) =>
  d === 'Easy' ? '#34d399' : d === 'Medium' ? '#fbbf24' : '#f87171'

export default function Levels({ onEnter }) {
  const [filter, setFilter] = useState('All')
  const shown = levels.filter((l) => filter === 'All' || l.diff === filter)

  return (
    <section className="levels" id="levels">
      <motion.div
        className="section-head"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="section-label">
          <span className="sq" /> 02 — Arenas
        </div>
        <h2>Choose your <span className="gradient">arena</span></h2>
        <p>Six gauntlets. One leaderboard. Zero mercy.</p>
      </motion.div>

      <motion.div
        className="filters"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        {filters.map((f) => (
          <motion.button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
          >
            {f}
          </motion.button>
        ))}
      </motion.div>

      <motion.div layout className="level-grid">
        {shown.map((l, i) => (
          <motion.article
            key={l.id}
            className="level-card"
            layout
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: (i % 3) * 0.08 }}
            whileHover={{ y: -10, scale: 1.02 }}
          >
            <div className="level-top">
              <span className="level-id" style={{ color: l.color }}>{l.id}</span>
              <motion.span
                className="diff-badge"
                style={{ background: `${l.color}1f`, color: l.color, borderColor: `${l.color}55` }}
                whileHover={{ scale: 1.1 }}
              >
                {l.diff}
              </motion.span>
            </div>
            <h3>{l.title}</h3>
            <p>{l.desc}</p>
            <div className="level-daily">
              <span className="daily-label">Today's challenge</span>
              <span className="daily-title">{dailyForLevel(l).title}</span>
              <span
                className="diff-badge"
                style={{
                  background: `${diffColor(dailyForLevel(l).difficulty)}1f`,
                  color: diffColor(dailyForLevel(l).difficulty),
                  borderColor: `${diffColor(dailyForLevel(l).difficulty)}55`,
                }}
              >
                {dailyForLevel(l).difficulty} · Day {dailyForLevel(l).day}
              </span>
            </div>
            <div className="level-foot">
              <span className="xp">+{l.xp} XP</span>
              <motion.button
                className="btn btn-small"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onEnter(l)}
              >
                Enter →
              </motion.button>
            </div>
            <motion.div
              className="glow"
              style={{ background: `radial-gradient(circle at 50% 100%, ${l.color}33, transparent 70%)` }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
            />
          </motion.article>
        ))}
      </motion.div>
    </section>
  )
}