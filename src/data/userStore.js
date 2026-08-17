const USERS_KEY = 'vizara-users'
const SESSION_KEY = 'vizara-session'

const todayKey = () => new Date().toISOString().slice(0, 10)

const hash = (s) => {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
  return h.toString(36)
}

const load = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

const save = (key, v) => localStorage.setItem(key, JSON.stringify(v))

export const attemptKey = (uid) => `vizara-attempts-${uid}`

export function register(name, email, password) {
  const users = load(USERS_KEY, [])
  const id = email.trim().toLowerCase()
  if (!name.trim()) return { error: 'Please enter your name.' }
  if (!/^\S+@\S+\.\S+$/.test(id)) return { error: 'Please enter a valid email.' }
  if (password.length < 4) return { error: 'Password must be at least 4 characters.' }
  if (users.some((u) => u.id === id)) return { error: 'An account with this email already exists.' }
  const user = {
    id,
    name: name.trim(),
    email: id,
    pass: hash(password),
    rating: 250,
    joined: todayKey(),
  }
  users.push(user)
  save(USERS_KEY, users)
  save(SESSION_KEY, id)
  return { user }
}

export function login(email, password) {
  const users = load(USERS_KEY, [])
  const id = email.trim().toLowerCase()
  const user = users.find((u) => u.id === id)
  if (!user || user.pass !== hash(password)) return { error: 'Invalid email or password.' }
  save(SESSION_KEY, id)
  return { user }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}

export function getSession() {
  const id = load(SESSION_KEY, null)
  if (!id) return null
  const users = load(USERS_KEY, [])
  return users.find((u) => u.id === id) || null
}

export function recordAttempt({ qid, title, topic, difficulty, passed, timeTaken }) {
  const session = getSession()
  const uid = session ? session.id : 'guest'
  const list = load(attemptKey(uid), [])
  list.push({ qid, title, topic, difficulty, passed, timeTaken, date: todayKey() })
  save(attemptKey(uid), list)
}

export const topicColors = {
  Arrays: '#34d399',
  Strings: '#22d3ee',
  Hashing: '#a78bfa',
  Dynamic: '#f472b6',
  Graphs: '#fbbf24',
  Stacks: '#60a5fa',
  Trees: '#4ade80',
  'Binary Search': '#f87171',
  Backtracking: '#c084fc',
}

export const companies = [
  { name: 'Google', color: '#34d399', target: 90 },
  { name: 'Amazon', color: '#fbbf24', target: 75 },
  { name: 'Microsoft', color: '#22d3ee', target: 65 },
  { name: 'Meta', color: '#a78bfa', target: 80 },
  { name: 'Netflix', color: '#f87171', target: 100 },
]

const weekLabel = (d) => d.toLocaleDateString('en-US', { weekday: 'short' })

export function getStats(uid) {
  const attempts = load(attemptKey(uid), [])
  const solved = {}
  const byTopic = {}
  let hardSolved = 0
  let passedCount = 0
  let attemptsToday = 0

  for (const a of attempts) {
    if (!a.passed) continue
    passedCount++
    if (a.date === todayKey()) attemptsToday++
    if (!solved[a.qid]) {
      solved[a.qid] = true
      byTopic[a.topic] = (byTopic[a.topic] || 0) + 1
      if (a.difficulty === 'Hard') hardSolved++
    }
  }

  const total = Object.keys(solved).length
  const topicsCovered = Object.keys(byTopic).length
  const accuracy = attempts.length ? Math.round((passedCount / attempts.length) * 100) : 0

  const daily = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const count = attempts.filter((a) => a.passed && a.date === key).length
    daily.push({ date: key, label: weekLabel(d), count })
  }

  const streak = computeStreak(attempts)
  const rating = computeRating({ total, topicsCovered, accuracy, hardSolved, streak })
  const tier = tierFor(rating)
  const tips = buildTips({ total, topicsCovered, accuracy, hardSolved, streak, byTopic, attemptsToday })
  const prep = companies.map((c) => {
    const pct = Math.min(
      100,
      Math.round(100 * (0.5 * (total / c.target) + 0.3 * (topicsCovered / 9) + 0.2 * (hardSolved / 12)))
    )
    return { ...c, pct, needed: Math.max(0, c.target - total) }
  })

  return { total, byTopic, topicsCovered, hardSolved, accuracy, daily, streak, rating, tier, tips, prep, attemptsToday }
}

function computeStreak(attempts) {
  const days = new Set(attempts.filter((a) => a.passed).map((a) => a.date))
  let streak = 0
  const d = new Date()
  if (!days.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1)
  while (days.has(d.toISOString().slice(0, 10))) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

function computeRating({ total, topicsCovered, accuracy, hardSolved, streak }) {
  return Math.min(
    2600,
    Math.round(250 + total * 24 + topicsCovered * 60 + accuracy * 1.5 + hardSolved * 35 + streak * 30)
  )
}

export function tierFor(rating) {
  if (rating >= 2200) return { name: 'Legend', color: '#fbbf24', next: null }
  if (rating >= 1800) return { name: 'Elite', color: '#a78bfa', next: 2200 }
  if (rating >= 1400) return { name: 'Pro', color: '#34d399', next: 1800 }
  if (rating >= 1000) return { name: 'Competitor', color: '#22d3ee', next: 1400 }
  if (rating >= 600) return { name: 'Apprentice', color: '#fbbf24', next: 1000 }
  return { name: 'Rookie', color: '#f87171', next: 600 }
}

function buildTips({ total, topicsCovered, accuracy, hardSolved, streak, byTopic, attemptsToday }) {
  const tips = []
  if (total === 0) {
    tips.push('Solve your first question today to start building your rating.')
    return tips
  }
  const weakest = Object.entries(byTopic).sort((a, b) => a[1] - b[1])[0]
  if (weakest && topicsCovered < 9) {
    tips.push(`Expand your range — ${weakest[0]} is your weakest topic (${weakest[1]} solved).`)
  }
  if (accuracy < 60) {
    tips.push(`Accuracy is ${accuracy}% — slow down and test edge cases before running.`)
  }
  if (hardSolved === 0) {
    tips.push('No Hard questions yet. Push into Hard to earn big rating jumps.')
  }
  if (streak === 0) {
    tips.push('Solve today to start a streak — streaks give +30 rating each day.')
  }
  if (attemptsToday > 0 && tips.length === 0) {
    tips.push('Great consistency! Keep the streak alive tomorrow.')
  }
  if (tips.length === 0) {
    tips.push('You are on fire — try a Nightmare level next.')
  }
  return tips
}