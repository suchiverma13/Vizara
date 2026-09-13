import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { getStats, tierFor } from '../data/userStore.js'

const TIERS = ['All', 'Legend', 'Elite', 'Pro', 'Competitor', 'Apprentice', 'Rookie']

const MOCK_POOL = [
  { name: 'Aria Chen', country: '🇺🇸' },
  { name: 'Kenji Tanaka', country: '🇯🇵' },
  { name: 'Sofia Rossi', country: '🇮🇹' },
  { name: 'Ethan Park', country: '🇰🇷' },
  { name: 'Zara Ahmed', country: '🇦🇪' },
  { name: 'Liam O\'Connor', country: '🇮🇪' },
  { name: 'Maya Patel', country: '🇮🇳' },
  { name: 'Noah Müller', country: '🇩🇪' },
  { name: 'Isabella Silva', country: '🇧🇷' },
  { name: 'Omar Hassan', country: '🇪🇬' },
  { name: 'Chloe Kim', country: '🇨🇦' },
  { name: 'Raj Malhotra', country: '🇮🇳' },
  { name: 'Emma Wilson', country: '🇬🇧' },
  { name: 'Yuki Sato', country: '🇯🇵' },
  { name: 'Lucas Bernard', country: '🇫🇷' },
  { name: 'Nina Petrova', country: '🇷🇺' },
  { name: 'Diego Reyes', country: '🇲🇽' },
  { name: 'Ava Thompson', country: '🇦🇺' },
  { name: 'Hiroshi Yamamoto', country: '🇯🇵' },
  { name: 'Fatima Al-Zahra', country: '🇸🇦' },
  { name: 'Oliver Smith', country: '🇺🇸' },
  { name: 'Priya Nair', country: '🇮🇳' },
  { name: 'Jack Robinson', country: '🇬🇧' },
  { name: 'Sakura Ito', country: '🇯🇵' },
]

function seededRandom(seed) {
  let x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function generateMockUsers(count = 18) {
  return MOCK_POOL.slice(0, count).map((p, i) => {
    const seed = i * 997 + 13
    const total = Math.floor(8 + seededRandom(seed) * 85)
    const topicsCovered = Math.min(9, Math.max(1, Math.floor(seededRandom(seed + 1) * 9) + 1))
    const hardSolved = Math.floor(seededRandom(seed + 2) * Math.min(12, total * 0.3))
    const streak = Math.floor(seededRandom(seed + 3) * 35)
    const accuracy = Math.floor(42 + seededRandom(seed + 4) * 53)
    const rating = Math.min(2600, Math.round(250 + total * 24 + topicsCovered * 60 + accuracy * 1.5 + hardSolved * 35 + streak * 30 + (seededRandom(seed + 5) * 80 - 40)))
    const tier = tierFor(rating)
    return {
      id: `mock-${i}`,
      name: p.name,
      country: p.country,
      rating,
      total,
      tier: tier.name,
      tierColor: tier.color,
      streak,
      accuracy,
      isMock: true,
    }
  })
}

function initialsOf(name) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function Leaderboard({ user, onBack, onStartPlaying }) {
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('All')
  const [sortBy, setSortBy] = useState('rating')
  const [sortDir, setSortDir] = useState('desc')
  const [selected, setSelected] = useState(null)

  // build leaderboard entries
  const entries = useMemo(() => {
    let real = []
    try {
      const raw = JSON.parse(localStorage.getItem('vizara-users') || '[]')
      real = raw.map((u) => {
        const stats = getStats(u.id)
        return {
          id: u.id,
          name: u.name,
          country: '🏠',
          rating: stats.rating,
          total: stats.total,
          tier: stats.tier.name,
          tierColor: stats.tier.color,
          streak: stats.streak,
          accuracy: stats.accuracy,
          isMock: false,
          isMe: user ? u.id === user.id : false,
        }
      })
    } catch {}
    // if no real users or few, fill with mocks
    const mocks = generateMockUsers(22)
    // dedupe: if real user already in mocks by name, keep real
    const combined = [...real, ...mocks]
    // ensure current user is included even if not in storage (guest)
    if (user && !combined.some((e) => e.id === user.id)) {
      const stats = getStats(user.id)
      combined.push({
        id: user.id,
        name: user.name,
        country: '🏠',
        rating: stats.rating,
        total: stats.total,
        tier: stats.tier.name,
        tierColor: stats.tier.color,
        streak: stats.streak,
        accuracy: stats.accuracy,
        isMock: false,
        isMe: true,
      })
    }
    // if still not enough and guest
    if (combined.length === mocks.length && !user) {
      // add guest entry for demo
      combined.push({
        id: 'guest',
        name: 'Guest',
        country: '👤',
        rating: 250,
        total: 0,
        tier: 'Rookie',
        tierColor: '#f87171',
        streak: 0,
        accuracy: 0,
        isMock: false,
        isMe: true,
      })
    }
    // sort initially by rating desc before filters
    return combined.sort((a, b) => b.rating - a.rating).map((e, i) => ({ ...e, rank: i + 1 }))
  }, [user])

  const filtered = useMemo(() => {
    let list = [...entries]
    if (tierFilter !== 'All') list = list.filter((e) => e.tier === tierFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((e) => e.name.toLowerCase().includes(q) || e.tier.toLowerCase().includes(q))
    }
    list.sort((a, b) => {
      let va = a[sortBy]
      let vb = b[sortBy]
      if (typeof va === 'string') va = va.toLowerCase()
      if (typeof vb === 'string') vb = vb.toLowerCase()
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    // re-rank after filter/sort for display rank (keep global rank for podium logic, but show position in filtered list)
    return list.map((e, i) => ({ ...e, displayRank: i + 1 }))
  }, [entries, tierFilter, search, sortBy, sortDir])

  const top3 = useMemo(() => entries.slice(0, 3), [entries])
  const meEntry = useMemo(() => entries.find((e) => e.isMe), [entries])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onBack()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onBack])

  const toggleSort = (key) => {
    if (sortBy === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortBy(key)
      setSortDir('desc')
    }
  }

  const SortIcon = ({ active }) => (
    <span style={{ opacity: active ? 1 : 0.35, fontSize: '0.7rem' }}>{sortDir === 'asc' && active ? '▲' : '▼'}</span>
  )

  return (
    <motion.div
      className="leaderboard-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="leaderboard-panel"
        initial={{ y: 60, scale: 0.97, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 60, scale: 0.97, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      >
        {/* header */}
        <div className="lb-head">
          <div>
            <div className="lb-kicker">
              <span className="sq" /> 03 — Leaderboard
            </div>
            <h2>
              Global <span className="gradient">Arena</span> Rankings
            </h2>
            <p className="lb-sub">Compete with {entries.length} warriors · updates live as you solve</p>
          </div>
          <div className="lb-head-actions">
            {user ? (
              <span className="lb-me-badge">
                <span className="lb-me-av" style={{ borderColor: meEntry?.tierColor }}>
                  {initialsOf(user.name)}
                </span>
                #{meEntry?.rank} · {meEntry?.rating} pts
              </span>
            ) : (
              <span className="lb-guest">Guest mode — log in to rank</span>
            )}
            <motion.button className="results-close" onClick={onBack} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
              ✕
            </motion.button>
          </div>
        </div>

        {/* podium */}
        <div className="lb-podium">
          {top3.map((p, i) => {
            const order = i === 0 ? 1 : i === 1 ? 0 : 2
            const height = i === 0 ? 110 : 86
            const crown = i === 0 ? '👑' : i === 1 ? '🥈' : '🥉'
            return (
              <motion.div
                key={p.id}
                className={`lb-podium-card rank-${p.rank} ${p.isMe ? 'is-me' : ''}`}
                style={{ order, borderColor: p.tierColor, boxShadow: `0 0 30px ${p.tierColor}33` }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 220, damping: 18 }}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => setSelected(p)}
              >
                <span className="lb-crown">{crown}</span>
                <div className="lb-podium-av" style={{ borderColor: p.tierColor, background: `${p.tierColor}18` }}>
                  {initialsOf(p.name)}
                </div>
                <span className="lb-podium-name">
                  {p.country} {p.name} {p.isMe && '• you'}
                </span>
                <span className="lb-podium-rating" style={{ color: p.tierColor }}>
                  {p.rating}
                </span>
                <span className="tier-badge small" style={{ color: p.tierColor, borderColor: p.tierColor }}>
                  {p.tier}
                </span>
                <div className="lb-podium-bar" style={{ height, background: `linear-gradient(180deg, ${p.tierColor}33, transparent)` }} />
                <span className="lb-podium-rank">#{p.rank}</span>
              </motion.div>
            )
          })}
        </div>

        {/* controls */}
        <div className="lb-controls">
          <div className="lb-search-wrap">
            <span className="lb-search-icon">⌕</span>
            <input
              className="lb-search"
              placeholder="Search warrior, tier…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="lb-clear" onClick={() => setSearch('')}>
                ✕
              </button>
            )}
          </div>
          <div className="lb-filter-row">
            {TIERS.map((t) => (
              <button
                key={t}
                className={`filter-btn ${tierFilter === t ? 'active' : ''}`}
                onClick={() => setTierFilter(t)}
                style={
                  tierFilter === t && t !== 'All'
                    ? { background: `${tierFor(t === 'Legend' ? 2300 : t === 'Elite' ? 1900 : t === 'Pro' ? 1500 : t === 'Competitor' ? 1100 : t === 'Apprentice' ? 700 : 300).color}22` }
                    : undefined
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* your rank sticky */}
        {meEntry && tierFilter === 'All' && !search && (
          <motion.div className="lb-me-row" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <span className="lb-me-label">Your position</span>
            <div className="lb-row is-me" style={{ borderColor: meEntry.tierColor }}>
              <span className="lb-rank">#{meEntry.rank}</span>
              <span className="lb-av" style={{ borderColor: meEntry.tierColor }}>
                {initialsOf(meEntry.name)}
              </span>
              <span className="lb-name">
                {meEntry.name} <span className="lb-country">{meEntry.country}</span>
              </span>
              <span className="lb-tier" style={{ color: meEntry.tierColor, borderColor: `${meEntry.tierColor}55`, background: `${meEntry.tierColor}14` }}>
                {meEntry.tier}
              </span>
              <span className="lb-stat mono">{meEntry.rating}</span>
              <span className="lb-stat">{meEntry.total} solved</span>
              <span className="lb-stat">🔥 {meEntry.streak}</span>
              <motion.button className="btn btn-small" onClick={onStartPlaying} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Play →
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* table */}
        <div className="lb-table-wrap">
          <div className="lb-table-head">
            <button className="lb-th rank" onClick={() => toggleSort('rating')}>
              Rank <SortIcon active={sortBy === 'rating'} />
            </button>
            <button className="lb-th player" onClick={() => toggleSort('name')}>
              Player <SortIcon active={sortBy === 'name'} />
            </button>
            <button className="lb-th" onClick={() => toggleSort('tier')}>
              Tier <SortIcon active={sortBy === 'tier'} />
            </button>
            <button className="lb-th" onClick={() => toggleSort('rating')}>
              Rating <SortIcon active={sortBy === 'rating'} />
            </button>
            <button className="lb-th" onClick={() => toggleSort('total')}>
              Solved <SortIcon active={sortBy === 'total'} />
            </button>
            <button className="lb-th" onClick={() => toggleSort('streak')}>
              Streak <SortIcon active={sortBy === 'streak'} />
            </button>
            <button className="lb-th" onClick={() => toggleSort('accuracy')}>
              Acc <SortIcon active={sortBy === 'accuracy'} />
            </button>
            <span className="lb-th action">Action</span>
          </div>

          <div className="lb-table-body">
            <AnimatePresence initial={false}>
              {filtered.map((e) => (
                <motion.div
                  key={e.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  className={`lb-row ${e.isMe ? 'is-me' : ''} ${selected?.id === e.id ? 'is-selected' : ''}`}
                  onClick={() => setSelected(selected?.id === e.id ? null : e)}
                  whileHover={{ scale: 1.005 }}
                >
                  <span className="lb-rank">#{e.displayRank}</span>
                  <span className="lb-player">
                    <span className="lb-av small" style={{ borderColor: e.tierColor }}>
                      {initialsOf(e.name)}
                    </span>
                    <span className="lb-name">
                      {e.country} {e.name} {e.isMe && <span className="lb-you">(you)</span>}
                    </span>
                  </span>
                  <span className="lb-tier small" style={{ color: e.tierColor, borderColor: `${e.tierColor}55`, background: `${e.tierColor}14` }}>
                    {e.tier}
                  </span>
                  <span className="lb-stat mono" style={{ color: e.tierColor }}>
                    {e.rating}
                  </span>
                  <span className="lb-stat">{e.total}</span>
                  <span className="lb-stat">🔥 {e.streak}</span>
                  <span className="lb-stat">{e.accuracy}%</span>
                  <motion.button
                    className="btn btn-small lb-challenge"
                    onClick={(ev) => {
                      ev.stopPropagation()
                      setSelected(e)
                    }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                  >
                    View
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
            {filtered.length === 0 && <div className="lb-empty">No warriors match “{search}” in {tierFilter}</div>}
          </div>
        </div>

        {/* selected drawer */}
        <AnimatePresence>
          {selected && (
            <motion.div
              className="lb-drawer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="lb-drawer-head">
                <span className="lb-av" style={{ borderColor: selected.tierColor }}>
                  {initialsOf(selected.name)}
                </span>
                <div>
                  <h4>
                    {selected.country} {selected.name} {selected.isMe && '(you)'}
                  </h4>
                  <p className="muted">
                    #{selected.rank} globally · {selected.tier} · {selected.rating} pts · {selected.streak}d streak
                  </p>
                </div>
                <button className="lb-drawer-close" onClick={() => setSelected(null)}>
                  ✕
                </button>
              </div>
              <div className="lb-drawer-stats">
                <div className="mini-stat">
                  <span className="mini-label">Solved</span>
                  <span className="mini-value">{selected.total}</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-label">Accuracy</span>
                  <span className="mini-value">{selected.accuracy}%</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-label">Streak</span>
                  <span className="mini-value">🔥 {selected.streak}</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-label">Rating</span>
                  <span className="mini-value" style={{ color: selected.tierColor }}>
                    {selected.rating}
                  </span>
                </div>
              </div>
              <div className="lb-drawer-actions">
                <button className="btn btn-outline" onClick={() => setSelected(null)}>
                  Close
                </button>
                <button className="btn btn-primary" onClick={onStartPlaying}>
                  Challenge {selected.name.split(' ')[0]} →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="lb-foot">
          <span className="muted">{filtered.length} warriors shown · click headers to sort · rows are interactive</span>
          <span className="muted">Live from vizara-users · {new Date().toLocaleDateString()}</span>
        </div>
      </motion.div>
    </motion.div>
  )
}
