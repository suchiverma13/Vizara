import { findUserByEmail, getUsers, saveUsers, getResets, saveResets, hashPassword, createSession, setCors } from './_store.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
    const id = (body.email || '').trim().toLowerCase()
    const token = (body.token || '').trim().toUpperCase()
    const newPassword = body.newPassword || body.password || ''

    if (!/^\S+@\S+\.\S+$/.test(id)) return res.status(400).json({ error: 'Please enter a valid email.' })
    if (!token) return res.status(400).json({ error: 'Please enter the reset code.' })
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' })
    if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) return res.status(400).json({ error: 'Password needs letters & numbers.' })

    const resets = getResets()
    const rec = resets[id]
    if (!rec || rec.token !== token) return res.status(400).json({ error: 'Invalid reset code. Check your email.' })
    if (Date.now() > rec.expires) {
      delete resets[id]
      saveResets(resets)
      return res.status(400).json({ error: 'Reset code expired. Please request a new one.' })
    }

    const users = getUsers()
    const user = users.find((u) => u.id === id)
    if (!user) return res.status(404).json({ error: 'No account found.' })

    user.pass = hashPassword(newPassword)
    saveUsers(users)

    delete resets[id]
    saveResets(resets)

    const { token: sessionToken, expires } = createSession(id)
    res.setHeader('Set-Cookie', `vizara_token=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Expires=${new Date(expires).toUTCString()}`)

    const publicUser = { id: user.id, name: user.name, email: user.email, rating: user.rating, joined: user.joined }
    return res.status(200).json({ user: publicUser, token: sessionToken, expires })
  } catch (e) {
    console.error('[reset-password]', e)
    return res.status(500).json({ error: 'Server error' })
  }
}
