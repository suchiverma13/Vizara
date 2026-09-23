const USERS_KEY = 'vizara-users'
const SESSION_KEY = 'vizara-session'
const TOKEN_KEY = 'vizara-token'
const CACHED_USER_KEY = 'vizara-cached-user'
const LAST_EMAIL_KEY = 'vizara-last-reset-email'

const todayKey = () => new Date().toISOString().slice(0, 10)

// legacy client hash (kept for offline fallback only)
const hash = (s, salt = 'vizara-v2') => {
  const str = salt + s + salt
  let h = 5381
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0
  for (let r = 0; r < 2; r++) {
    const hs = h.toString(36) + salt
    let nh = 5381
    for (let i = 0; i < hs.length; i++) nh = ((nh << 5) + nh + hs.charCodeAt(i)) >>> 0
    h = nh
  }
  return h.toString(36) + '-' + (h >>> 0).toString(16).padStart(8, '0')
}

const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined'

const load = (key, fallback) => {
  if (!isBrowser) return fallback
  try {
    const v = localStorage.getItem(key)
    if (v == null) return fallback
    return JSON.parse(v) ?? fallback
  } catch {
    return fallback
  }
}

const save = (key, v) => {
  if (!isBrowser) return
  try { localStorage.setItem(key, JSON.stringify(v)) } catch {}
}

const loadStr = (key) => {
  if (!isBrowser) return null
  try { return localStorage.getItem(key) } catch { return null }
}
const saveStr = (key, v) => {
  if (!isBrowser) return
  try { localStorage.setItem(key, v) } catch {}
}
const removeKey = (key) => {
  if (!isBrowser) return
  try { localStorage.removeItem(key) } catch {}
}

export const attemptKey = (uid) => `vizara-attempts-${uid}`

const oldHash = (s) => {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
  return h.toString(36)
}

// ---------- Backend helpers ----------
const getToken = () => loadStr(TOKEN_KEY)
const setToken = (t) => (t ? saveStr(TOKEN_KEY, t) : removeKey(TOKEN_KEY))
const getCachedUser = () => load(CACHED_USER_KEY, null)
const setCachedUser = (u) => (u ? save(CACHED_USER_KEY, u) : removeKey(CACHED_USER_KEY))

async function apiFetch(path, opts = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
  if (token) headers['Authorization'] = `Bearer ${token}`
  // include credentials to send httpOnly cookie
  const res = await fetch(path, { ...opts, headers, credentials: 'include' })
  let data = null
  try { data = await res.json() } catch {}
  return { res, data }
}

// fallback local implementations (offline)
function registerLocal(name, email, password) {
  const users = load(USERS_KEY, [])
  const id = email.trim().toLowerCase()
  if (!name.trim()) return { error: 'Please enter your name.' }
  if (name.trim().length < 2) return { error: 'Name must be at least 2 characters.' }
  if (!/^\S+@\S+\.\S+$/.test(id)) return { error: 'Please enter a valid email.' }
  if (password.length < 6) return { error: 'Password must be at least 6 characters.' }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return { error: 'Password needs letters & numbers.' }
  if (users.some((u) => u.id === id)) return { error: 'An account with this email already exists.' }
  const user = {
    id,
    name: name.trim().slice(0, 40),
    email: id,
    pass: hash(password, id),
    rating: 250,
    joined: todayKey(),
  }
  users.push(user)
  save(USERS_KEY, users)
  save(SESSION_KEY, id)
  setCachedUser({ id: user.id, name: user.name, email: user.email, rating: user.rating, joined: user.joined })
  return { user: { id: user.id, name: user.name, email: user.email, rating: user.rating, joined: user.joined } }
}

function loginLocal(email, password) {
  const users = load(USERS_KEY, [])
  const id = email.trim().toLowerCase()
  const user = users.find((u) => u.id === id)
  if (!user) return { error: 'Invalid email or password.' }
  const ok = user.pass === hash(password, id) || user.pass === oldHash(password) || user.pass === hash(password)
  if (!ok) return { error: 'Invalid email or password.' }
  if (user.pass === oldHash(password)) {
    user.pass = hash(password, id)
    save(USERS_KEY, users)
  }
  save(SESSION_KEY, id)
  const pub = { id: user.id, name: user.name, email: user.email, rating: user.rating, joined: user.joined }
  setCachedUser(pub)
  return { user: pub }
}

// ---------- Public async API (backend-first) ----------
export async function register(name, email, password) {
  // try backend first
  try {
    const { res, data } = await apiFetch('/api/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })
    if (res.ok && data?.user) {
      if (data.token) setToken(data.token)
      setCachedUser(data.user)
      save(SESSION_KEY, data.user.id)
      // also keep local copy for offline fallback (optional)
      try {
        const users = load(USERS_KEY, [])
        if (!users.some((u) => u.id === data.user.id)) {
          users.push({ ...data.user, pass: hash(password, data.user.id) })
          save(USERS_KEY, users)
        }
      } catch {}
      return { user: data.user }
    }
    if (data?.error) {
      // if backend says duplicate etc, return error directly
      // if backend is unavailable (404) fallback to local
      if (res.status === 404) throw new Error('no-backend')
      return { error: data.error }
    }
    throw new Error('no-backend')
  } catch (e) {
    // fallback to local if backend unreachable (dev without vite middleware, or offline)
    if (e?.message === 'no-backend' || e instanceof TypeError) {
      // TypeError = fetch failed
      return registerLocal(name, email, password)
    }
    // for other network errors, try local as well
    try { return registerLocal(name, email, password) } catch { return { error: 'Failed to register. Please try again.' } }
  }
}

export async function login(email, password) {
  try {
    const { res, data } = await apiFetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (res.ok && data?.user) {
      if (data.token) setToken(data.token)
      setCachedUser(data.user)
      save(SESSION_KEY, data.user.id)
      try {
        const users = load(USERS_KEY, [])
        if (!users.some((u) => u.id === data.user.id)) {
          users.push({ ...data.user, pass: hash(password, data.user.id) })
          save(USERS_KEY, users)
        }
      } catch {}
      return { user: data.user }
    }
    if (data?.error) {
      if (res.status === 404) throw new Error('no-backend')
      return { error: data.error }
    }
    throw new Error('no-backend')
  } catch (e) {
    if (e?.message === 'no-backend' || e instanceof TypeError) {
      return loginLocal(email, password)
    }
    try { return loginLocal(email, password) } catch { return { error: 'Invalid email or password.' } }
  }
}

export async function logout() {
  try {
    await apiFetch('/api/logout', { method: 'POST' })
  } catch {}
  removeKey(TOKEN_KEY)
  removeKey(CACHED_USER_KEY)
  if (!isBrowser) return
  try { localStorage.removeItem(SESSION_KEY) } catch {}
}

export function getSession() {
  // sync cached session for initial render; prefers backend cached user, fallback to local
  const cached = getCachedUser()
  if (cached) return cached
  const token = getToken()
  // if we have token but no cached user, try to return local session as fallback (will be revalidated async)
  const id = load(SESSION_KEY, null)
  if (!id) return null
  const users = load(USERS_KEY, [])
  const local = users.find((u) => u.id === id) || null
  if (local) {
    const pub = { id: local.id, name: local.name, email: local.email, rating: local.rating, joined: local.joined }
    return pub
  }
  // if token exists but no local user, return null initially (will fetch)
  if (token) return null
  return null
}

export async function fetchSession() {
  const token = getToken()
  if (!token) {
    // no token, fallback to sync local session
    return getSession()
  }
  try {
    const { res, data } = await apiFetch('/api/me', { method: 'GET' })
    if (res.ok && data?.user) {
      setCachedUser(data.user)
      save(SESSION_KEY, data.user.id)
      return data.user
    }
    // token invalid/expired
    if (res.status === 401) {
      removeKey(TOKEN_KEY)
      removeKey(CACHED_USER_KEY)
      return null
    }
    throw new Error('no-backend')
  } catch (e) {
    // fallback to cached/local
    const cached = getCachedUser()
    if (cached) return cached
    return getSession()
  }
}

// ---------- Password Reset ----------
const RESETS_KEY = 'vizara-resets'

export async function requestPasswordReset(email) {
  const id = email.trim().toLowerCase()
  if (!/^\S+@\S+\.\S+$/.test(id)) return { error: 'Please enter a valid email.' }
  try {
    const { res, data } = await apiFetch('/api/request-reset', {
      method: 'POST',
      body: JSON.stringify({ email: id }),
    })
    if (res.ok && data?.token) {
      const rec = { to: id, token: data.token, expires: data.expires, sentAt: new Date().toISOString() }
      save(LAST_EMAIL_KEY, rec)
      return { token: data.token, email: id }
    }
    if (data?.error) {
      if (res.status === 404) throw new Error('no-backend')
      return { error: data.error }
    }
    throw new Error('no-backend')
  } catch (e) {
    // fallback local
    if (e?.message === 'no-backend' || e instanceof TypeError) {
      const users = load(USERS_KEY, [])
      const user = users.find((u) => u.id === id)
      if (!user) return { error: 'No account found with this email.' }
      const token = Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase()
      const expires = Date.now() + 15 * 60 * 1000
      const resets = load(RESETS_KEY, {})
      resets[id] = { token, expires }
      save(RESETS_KEY, resets)
      const emailRecord = { to: id, token, expires, sentAt: new Date().toISOString(), name: user.name }
      save(LAST_EMAIL_KEY, emailRecord)
      try { fetch('/api/send-reset-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: id, token, name: user.name }) }).catch(() => {}) } catch {}
      return { token, email: id }
    }
    return { error: 'Failed to request reset.' }
  }
}

export function getLastResetEmail() {
  return load(LAST_EMAIL_KEY, null)
}

export async function resetPassword(email, token, newPassword) {
  const id = email.trim().toLowerCase()
  const t = (token || '').trim().toUpperCase()
  if (!/^\S+@\S+\.\S+$/.test(id)) return { error: 'Please enter a valid email.' }
  if (!t) return { error: 'Please enter the reset code.' }
  if (newPassword.length < 6) return { error: 'Password must be at least 6 characters.' }
  if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) return { error: 'Password needs letters & numbers.' }
  try {
    const { res, data } = await apiFetch('/api/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email: id, token: t, newPassword }),
    })
    if (res.ok && data?.user) {
      if (data.token) setToken(data.token)
      setCachedUser(data.user)
      save(SESSION_KEY, data.user.id)
      return { user: data.user }
    }
    if (data?.error) {
      if (res.status === 404) throw new Error('no-backend')
      return { error: data.error }
    }
    throw new Error('no-backend')
  } catch (e) {
    if (e?.message === 'no-backend' || e instanceof TypeError) {
      const resets = load(RESETS_KEY, {})
      const rec = resets[id]
      if (!rec || rec.token !== t) return { error: 'Invalid reset code. Check your email.' }
      if (Date.now() > rec.expires) {
        delete resets[id]
        save(RESETS_KEY, resets)
        return { error: 'Reset code expired. Please request a new one.' }
      }
      const users = load(USERS_KEY, [])
      const user = users.find((u) => u.id === id)
      if (!user) return { error: 'No account found.' }
      user.pass = hash(newPassword, id)
      save(USERS_KEY, users)
      delete resets[id]
      save(RESETS_KEY, resets)
      const pub = { id: user.id, name: user.name, email: user.email, rating: user.rating, joined: user.joined }
      save(SESSION_KEY, id)
      setCachedUser(pub)
      // also set a token-like local marker so fetchSession thinks logged in offline
      saveStr(TOKEN_KEY, 'local-' + id)
      return { user: pub }
    }
    return { error: 'Failed to reset password.' }
  }
}

export function verifyResetToken(email, token) {
  const id = email.trim().toLowerCase()
  const rec = load(RESETS_KEY, {})[id]
  if (!rec) return false
  return rec.token === token.trim().toUpperCase() && Date.now() <= rec.expires
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
