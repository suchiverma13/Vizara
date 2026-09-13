import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { getStats, topicColors, tierFor } from '../data/userStore.js'

function Donut({ data, total }) {
  const r = 48
  const C = 2 * Math.PI * r
  let acc = 0
  return (
    <svg viewBox="0 0 120 120" className="donut">
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
      {data.map((d) => {
        const frac = total ? d.count / total : 0
        const dash = frac * C
        const offset = -acc * C
        acc += frac
        return (
          <motion.circle
            key={d.topic}
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={d.color}
            strokeWidth="14"
            strokeDasharray={`${dash} ${C - dash}`}
            strokeDashoffset={offset}
            transform="rotate(-90 60 60)"
            initial={{ strokeDasharray: `0 ${C}` }}
            animate={{ strokeDasharray: `${dash} ${C - dash}` }}
            transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
          />
        )
      })}
      <text x="60" y="55" textAnchor="middle" className="donut-total">{total}</text>
      <text x="60" y="72" textAnchor="middle" className="donut-label">solved</text>
    </svg>
  )
}

export default function Profile({ user, onBack, onStartPlaying, onLogout }) {
  const stats = getStats(user.id)
  const pieData = Object.entries(stats.byTopic).map(([topic, count]) => ({
    topic,
    count,
    color: topicColors[topic] || '#8b5cf6',
  }))
  const maxDaily = Math.max(...stats.daily.map((d) => d.count), 1)
  const tier = tierFor(stats.rating)
  const tierPct = tier.next
    ? Math.round(((stats.rating - tierBase(stats.rating)) / (tier.next - tierBase(stats.rating))) * 100)
    : 100

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onBack()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onBack])

  const initials = user.name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <motion.div
      className="auth-overlay profile-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="profile-panel"
        initial={{ y: 60, scale: 0.97, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 60, scale: 0.97, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      >
        <div className="profile-head">
          <div className="profile-title">
            <span className="avatar" style={{ borderColor: tier.color, boxShadow: `0 0 24px ${tier.color}44` }}>
              {initials}
            </span>
            <div>
              <h2>{user.name}</h2>
              <p className="profile-email">{user.email} · joined {user.joined}</p>
            </div>
          </div>
          <motion.button className="results-close" onClick={onBack} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
            ✕
          </motion.button>
        </div>

        <div className="profile-grid">
          <div className="profile-card rating-card">
            <div className="card-title">Rating analyzer</div>
            <div className="rating-num" style={{ color: tier.color }}>{stats.rating}</div>
            <span className="tier-badge" style={{ color: tier.color, borderColor: tier.color, boxShadow: `0 0 22px ${tier.color}33` }}>
              {tier.name}
            </span>
            <div className="tier-track">
              <motion.div
                className="tier-fill"
                style={{ background: tier.color }}
                initial={{ width: 0 }}
                animate={{ width: `${tierPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <p className="tier-hint">
              {tier.next
                ? `${tier.next - stats.rating} points to reach ${tierFor(tier.next).name}`
                : 'Maximum tier reached. Legend status!'}
            </p>
            <div className="mini-stats">
              <div className="mini-stat">
                <span className="mini-label">Accuracy</span>
                <span className="mini-value">{stats.accuracy}%</span>
              </div>
              <div className="mini-stat">
                <span className="mini-label">Streak</span>
                <span className="mini-value">🔥 {stats.streak}d</span>
              </div>
              <div className="mini-stat">
                <span className="mini-label">Hard</span>
                <span className="mini-value">{stats.hardSolved}</span>
              </div>
              <div className="mini-stat">
                <span className="mini-label">Topics</span>
                <span className="mini-value">{stats.topicsCovered}/9</span>
              </div>
            </div>
            <ul className="tip-list">
              {stats.tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>

          <div className="profile-card">
            <div className="card-title">Solved by topic</div>
            <div className="pie-wrap">
              <Donut data={pieData} total={stats.total} />
              <div className="pie-legend">
                {pieData.length === 0 && <span className="muted">Solve questions to fill the pie.</span>}
                {pieData.map((d) => (
                  <div className="legend-row" key={d.topic}>
                    <span className="legend-dot" style={{ background: d.color }} />
                    <span className="legend-name">{d.topic}</span>
                    <span className="legend-count">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="profile-card daily-card">
            <div className="card-title">Questions solved · last 7 days</div>
            <div className="daily-chart">
              {stats.daily.map((d) => (
                <div className="daily-col" key={d.date}>
                  <span className="daily-val">{d.count || ''}</span>
                  <div className="daily-bar-wrap">
                    <motion.div
                      className="daily-bar"
                      initial={{ height: 0 }}
                      animate={{ height: `${(d.count / maxDaily) * 100}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="daily-label">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="profile-card company-card">
            <div className="card-title">Company crack readiness</div>
            <div className="company-grid">
              {stats.prep.map((c) => (
                <div className="company-row" key={c.name}>
                  <div className="company-head">
                    <span className="company-name" style={{ color: c.color }}>{c.name}</span>
                    <span className="company-pct">{c.pct}%</span>
                  </div>
                  <div className="company-bar">
                    <motion.div
                      className="company-fill"
                      style={{ background: c.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${c.pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="company-hint">
                    {c.pct >= 100 ? 'Interview-ready!' : `≈ ${c.needed} more solved questions to crack ${c.name}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <motion.button className="btn btn-outline" onClick={onLogout} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            Log out
          </motion.button>
          <motion.button className="btn btn-primary" onClick={onStartPlaying} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            Start playing →
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function tierBase(rating) {
  if (rating >= 1800) return 1800
  if (rating >= 1400) return 1400
  if (rating >= 1000) return 1000
  if (rating >= 600) return 600
  return 0
}