import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { topicBriefs, dailyForLevel } from '../data/questions.js'

const diffColor = (d) =>
  d === 'Easy' ? '#34d399' : d === 'Medium' ? '#fbbf24' : '#f87171'

export default function TopicBrief({ level, onStart, onBack }) {
  const brief = topicBriefs[level.topic] || {
    about: 'Master this topic to dominate the arena.',
    patterns: ['Classic patterns'],
    tips: ['Practice daily.'],
  }
  const q = dailyForLevel(level)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onBack()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onBack])

  return (
    <motion.div
      className="brief-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="brief-panel"
        initial={{ y: 60, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 60, scale: 0.96, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      >
        <div className="brief-head">
          <div className="brief-title">
            <span className="level-id" style={{ color: level.color }}>{level.id}</span>
            <h2>{level.title}</h2>
            <span
              className="diff-badge"
              style={{ background: `${level.color}1f`, color: level.color, borderColor: `${level.color}55` }}
            >
              {level.diff}
            </span>
          </div>
          <motion.button className="results-close" onClick={onBack} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
            ✕
          </motion.button>
        </div>

        <div className="brief-body">
          <div className="brief-topic-label">
            Topic brief — {level.topic}
          </div>
          <p className="brief-about">{brief.about}</p>

          <div className="brief-section">
            <h4>Core patterns</h4>
            <div className="brief-chip-row">
              {brief.patterns.map((p) => (
                <span key={p} className="brief-chip" style={{ borderColor: `${level.color}55`, color: level.color }}>
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div className="brief-section">
            <h4>Watch out</h4>
            <ul className="brief-tips">
              {brief.tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>

          <div className="brief-daily">
            <span className="daily-label">Today's challenge</span>
            <span className="brief-q-title">{q.title}</span>
            <div className="brief-q-meta">
              <span
                className="diff-badge"
                style={{
                  background: `${diffColor(q.difficulty)}1f`,
                  color: diffColor(q.difficulty),
                  borderColor: `${diffColor(q.difficulty)}55`,
                }}
              >
                {q.difficulty} · Day {q.day}
              </span>
              <span className="code-example">{q.example}</span>
            </div>
          </div>
        </div>

        <div className="brief-actions">
          <motion.button className="btn btn-outline" onClick={onBack} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            ← Back
          </motion.button>
          <motion.button className="btn btn-primary" onClick={onStart} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            Start solving →
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}