import { findUserByEmail, verifyPassword, verifyLegacy, hashPassword, saveUsers, getUsers, createSession, setCors } from './_store.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
    const emailRaw = (body.email || '').trim()
    const password = body.password || ''
    const id = emailRaw.toLowerCase()

    if (!/^\S+@\S+\.\S+$/.test(id)) return res.status(400).json({ error: 'Please enter a valid email.' })
    if (!password) return res.status(400).json({ error: 'Please enter your password.' })

    const user = findUserByEmail(id)
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' })

    // try strong hash first, then legacy (migrates if needed)
    let ok = verifyPassword(password, user.pass)
    let needsMigrate = false
    if (!ok && verifyLegacy(password, user.pass, id)) {
      ok = true
      needsMigrate = true
    }
    if (!ok) return res.status(401).json({ error: 'Invalid email or password.' })

    if (needsMigrate) {
      user.pass = hashPassword(password)
      const users = getUsers()
      const idx = users.findIndex((u) => u.id === id)
      if (idx !== -1) {
        users[idx] = user
        saveUsers(users)
      }
    }

    const { token, expires } = createSession(id)
    res.setHeader('Set-Cookie', `vizara_token=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${new Date(expires).toUTCString()}`)

    const publicUser = { id: user.id, name: user.name, email: user.email, rating: user.rating, joined: user.joined }
    return res.status(200).json({ user: publicUser, token, expires })
  } catch (e) {
    console.error('[login]', e)
    return res.status(500).json({ error: 'Server error' })
  }
}
