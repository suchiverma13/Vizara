import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { snippet, rankFor } from '../data/levels.js'
import Verdict3D from './Verdict3D.jsx'

const confettiColors = ['#34d399', '#22d3ee', '#f472b6', '#fbbf24', '#a78bfa']

export default function ResultsScreen({ level, onClose, onNext, hasNext }) {
  const [phase, setPhase] = useState('running')
  const [lineCount, setLineCount] = useState(0)
  const [testIndex, setTestIndex] = useState(0)

  const total = level.tests.length
  const passed = level.tests.filter((t) => t.passed).length
  const ratio = passed / total
  const win = ratio >= 0.75
  const rank = rankFor(ratio)
  const userTime = Math.round(level.bestTime * (0.8 + 0.35 * ratio))
  const timeBonus = Math.max(0, level.bestTime - userTime) * 5
  const score = passed * 100 + Math.round(timeBonus)
  const xpGain = Math.round(level.xp * ratio)

  const runLines = useMemo(
    () => [
      `$ vizara submit solution.cpp --arena ${level.title.toLowerCase().replace(/\s+/g, '-')}`,
      '[compiler] g++ -O2 solution.cpp -o solution',
      '[compiler] ✓ compiled in 0.38s · 0 warnings',
      `[judge]    executing solution · ${total} test cases @ 1s limit`,
    ],
    [level, total]
  )

  useEffect(() => {
    setPhase('running')
    setLineCount(0)
    setTestIndex(0)
  }, [level.id])

  useEffect(() => {
    if (phase !== 'running') return
    if (lineCount >= runLines.length) {
      const t = setTimeout(() => setPhase('tests'), 650)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setLineCount((c) => c + 1), 430)
    return () => clearTimeout(t)
  }, [phase, lineCount, runLines.length])

  useEffect(() => {
    if (phase !== 'tests') return
    if (testIndex >= total) {
      const t = setTimeout(() => setPhase('verdict'), 700)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setTestIndex((i) => i + 1), 470)
    return () => clearTimeout(t)
  }, [phase, testIndex, total])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <motion.div
      className="results-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {win && phase === 'verdict' && (
        <>
          {Array.from({ length: 45 }).map((_, i) => (
            <motion.span
              key={i}
              className="confetti"
              style={{
                left: `${(i * 37) % 100}%`,
                width: 6 + (i % 3) * 2,
                height: 10 + (i % 4) * 3,
                background: confettiColors[i % confettiColors.length],
              }}
              initial={{ y: -30, rotate: 0, opacity: 1 }}
              animate={{ y: '108vh', rotate: 720 + i * 13, opacity: [1, 1, 0.5] }}
              transition={{ duration: 2.6 + (i % 5) * 0.35, delay: (i % 10) * 0.1, ease: 'easeIn' }}
            />
          ))}
        </>
      )}

      <motion.div
        className="results-panel"
        initial={{ y: 70, scale: 0.94, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 70, scale: 0.94, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      >
        <div className="results-head">
          <div className="results-title">
            <span className="level-id" style={{ color: level.color }}>{level.id}</span>
            <h2>{level.title}</h2>
            <span
              className="diff-badge"
              style={{ background: `${level.color}1f`, color: level.color, borderColor: `${level.color}55` }}
            >
              {level.diff}
            </span>
          </div>
          <motion.button className="results-close" onClick={onClose} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
            ✕
          </motion.button>
        </div>

        {phase === 'running' && (
          <div className="run-terminal">
            {runLines.slice(0, lineCount).map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className={line.startsWith('[') ? (line.includes('✓') ? 'ok' : 'muted') : 'prompt-line'}
              >
                {line.startsWith('[') ? <span className="judge">{line}</span> : <span className="prompt">{line}</span>}
              </motion.p>
            ))}
            {lineCount >= runLines.length && (
              <motion.pre
                className="user-code"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {snippet.map((l, i) => (
                  <div key={i}>
                    <span className="ln">{i + 1}</span>
                    <span className="code">{l}</span>
                  </div>
                ))}
              </motion.pre>
            )}
            <motion.span className="blink-cursor" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} />
          </div>
        )}

        {phase === 'tests' && (
          <div className="tests-phase">
            <div className="boss-bar-wrap">
              <div className="boss-bar-label">
                <span>RUNNING TESTS</span>
                <span>{Math.min(testIndex, total)}/{total}</span>
              </div>
              <motion.div
                className="boss-bar"
                initial={{ width: 0 }}
                animate={{ width: `${(Math.min(testIndex, total) / total) * 100}%` }}
                transition={{ duration: 0.45 }}
              />
            </div>
            <div className="test-grid">
              {level.tests.map((t, i) => {
                const shown = i < testIndex
                const current = i === testIndex - 1
                return (
                  <motion.div
                    key={t.name}
                    className={`test-card ${shown ? (t.passed ? 'pass' : 'fail') : ''} ${current ? 'flash' : ''}`}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={shown ? { opacity: 1, scale: 1 } : {}}
                    transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                  >
                    <span className="test-icon">{shown ? (t.passed ? '✓' : '✕') : '·'}</span>
                    <span className="test-name">{t.name}</span>
                    <span className="test-time">{t.time}ms</span>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {phase === 'verdict' && (
          <div className="verdict">
            <Verdict3D win={win} />
            <motion.h2
              className={`verdict-banner ${win ? 'win' : 'lose'}`}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 14 }}
            >
              {win ? 'LEVEL COMPLETE' : 'LEVEL FAILED'}
            </motion.h2>
            <motion.div
              className="rank-badge"
              style={{ color: rank.color, borderColor: rank.color, boxShadow: `0 0 40px ${rank.color}66` }}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 12, delay: 0.15 }}
            >
              {rank.letter}
            </motion.div>
            <p className="verdict-ratio">
              {passed}/{total} tests passed · {Math.round(ratio * 100)}% accuracy
            </p>
            <div className="stat-grid">
              <div className="mini-stat">
                <span className="mini-label">Score</span>
                <span className="mini-value">{score}</span>
              </div>
              <div className="mini-stat">
                <span className="mini-label">Time</span>
                <span className="mini-value mono">{fmtTime(userTime)}</span>
              </div>
              <div className="mini-stat">
                <span className="mini-label">Best</span>
                <span className="mini-value mono">{fmtTime(level.bestTime)}</span>
              </div>
              <div className="mini-stat">
                <span className="mini-label">XP</span>
                <span className="mini-value xp-color">+{xpGain}</span>
              </div>
            </div>
            <div className="verdict-actions">
              <motion.button className="btn btn-outline" onClick={onClose} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Close
              </motion.button>
              {hasNext && (
                <motion.button className="btn btn-primary" onClick={onNext} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  Next level →
                </motion.button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}