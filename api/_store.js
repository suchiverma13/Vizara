import fs from 'fs'
import path from 'path'
import os from 'os'
import crypto from 'crypto'

// Persistence path: in Vercel use /tmp (ephemeral but warm) — for real prod plug in Vercel KV/Postgres via env
const isVercel = !!process.env.VERCEL
const dataDir = isVercel ? os.tmpdir() : path.join(process.cwd(), 'api')
const usersFile = path.join(dataDir, '_vizara-users.json')
const sessionsFile = path.join(dataDir, '_vizara-sessions.json')
const resetsFile = path.join(dataDir, '_vizara-resets.json')

// In-memory cache for warm lambdas + faster dev
let memUsers = null
let memSessions = null
let memResets = null

function ensureFile(file, fallback) {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(fallback, null, 2))
    }
  } catch {}
}

function readJson(file, fallback) {
  try {
    ensureFile(file, fallback)
    const raw = fs.readFileSync(file, 'utf8')
    return JSON.parse(raw || JSON.stringify(fallback))
  } catch {
    return fallback
  }
}

function writeJson(file, data) {
  try {
    ensureFile(file, Array.isArray(data) ? [] : {})
    fs.writeFileSync(file, JSON.stringify(data, null, 2))
  } catch (e) {
    console.error('[store] write failed', file, e.message)
  }
}

export function getUsers() {
  if (memUsers) return memUsers
  const data = readJson(usersFile, [])
  memUsers = Array.isArray(data) ? data : []
  return memUsers
}

export function saveUsers(users) {
  memUsers = users
  writeJson(usersFile, users)
}

export function getSessions() {
  if (memSessions) return memSessions
  const data = readJson(sessionsFile, {})
  memSessions = data && typeof data === 'object' ? data : {}
  return memSessions
}

export function saveSessions(sessions) {
  memSessions = sessions
  writeJson(sessionsFile, sessions)
}

export function getResets() {
  if (memResets) return memResets
  const data = readJson(resetsFile, {})
  memResets = data && typeof data === 'object' ? data : {}
  return memResets
}

export function saveResets(resets) {
  memResets = resets
  writeJson(resetsFile, resets)
}

// ---- crypto ----
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  try {
    const derived = crypto.scryptSync(password, salt, 64).toString('hex')
    const a = Buffer.from(hash, 'hex')
    const b = Buffer.from(derived, 'hex')
    if (a.length !== b.length) return false
    return crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}

// legacy djb2 fallback for migrating old localStorage accounts if they are imported
function oldHash(s) {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
  return h.toString(36)
}
function hashV2(s, salt = 'vizara-v2') {
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

export function verifyLegacy(password, stored, email) {
  if (!stored) return false
  const id = (email || '').trim().toLowerCase()
  return stored === hashV2(password, id) || stored === oldHash(password) || stored === hashV2(password)
}

export function createToken() {
  return crypto.randomBytes(32).toString('hex')
}

export function createSession(email) {
  const token = createToken()
  const sessions = getSessions()
  // 30 days
  const expires = Date.now() + 30 * 24 * 60 * 60 * 1000
  sessions[token] = { email: email.toLowerCase(), expires }
  saveSessions(sessions)
  return { token, expires }
}

export function getSessionByToken(token) {
  if (!token) return null
  const sessions = getSessions()
  const rec = sessions[token]
  if (!rec) return null
  if (Date.now() > rec.expires) {
    delete sessions[token]
    saveSessions(sessions)
    return null
  }
  return rec
}

export function deleteSession(token) {
  if (!token) return
  const sessions = getSessions()
  if (sessions[token]) {
    delete sessions[token]
    saveSessions(sessions)
  }
}

export function findUserByEmail(email) {
  const id = email.trim().toLowerCase()
  return getUsers().find((u) => u.id === id) || null
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function parseCookies(req) {
  const out = {}
  const hdr = req.headers?.cookie || ''
  hdr.split(';').forEach((p) => {
    const [k, ...rest] = p.trim().split('=')
    if (!k) return
    out[k] = decodeURIComponent(rest.join('='))
  })
  return out
}

export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
}

export function getTokenFromReq(req) {
  const auth = req.headers?.authorization || ''
  if (auth.startsWith('Bearer ')) return auth.slice(7).trim()
  const cookies = parseCookies(req)
  if (cookies['vizara_token']) return cookies['vizara_token']
  // also support query ?token=
  try {
    const url = new URL(req.url, 'http://local')
    const q = url.searchParams.get('token')
    if (q) return q
  } catch {}
  return null
}
