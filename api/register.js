import { getUsers, saveUsers, findUserByEmail, hashPassword, createSession, setCors, todayKey } from './_store.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
    const name = (body.name || '').trim()
    const emailRaw = (body.email || '').trim()
    const password = body.password || ''
    const id = emailRaw.toLowerCase()

    if (!name) return res.status(400).json({ error: 'Please enter your name.' })
    if (name.length < 2) return res.status(400).json({ error: 'Name must be at least 2 characters.' })
    if (!/^\S+@\S+\.\S+$/.test(id)) return res.status(400).json({ error: 'Please enter a valid email.' })
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' })
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return res.status(400).json({ error: 'Password needs letters & numbers.' })

    if (findUserByEmail(id)) return res.status(409).json({ error: 'An account with this email already exists.' })

    const user = {
      id,
      name: name.slice(0, 40),
      email: id,
      pass: hashPassword(password),
      rating: 250,
      joined: todayKey(),
    }

    const users = getUsers()
    users.push(user)
    saveUsers(users)

    const { token, expires } = createSession(id)

    // httpOnly cookie + response
    res.setHeader('Set-Cookie', `vizara_token=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${new Date(expires).toUTCString()}`)

    const publicUser = { id: user.id, name: user.name, email: user.email, rating: user.rating, joined: user.joined }
    return res.status(201).json({ user: publicUser, token, expires })
  } catch (e) {
    console.error('[register]', e)
    return res.status(500).json({ error: 'Server error' })
  }
}
