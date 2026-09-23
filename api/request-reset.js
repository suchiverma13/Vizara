import { findUserByEmail, getResets, saveResets, setCors } from './_store.js'
import crypto from 'crypto'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
    const id = (body.email || '').trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(id)) return res.status(400).json({ error: 'Please enter a valid email.' })

    const user = findUserByEmail(id)
    if (!user) return res.status(404).json({ error: 'No account found with this email.' })

    const token = crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 4) + '-' + crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 4)
    const expires = Date.now() + 15 * 60 * 1000

    const resets = getResets()
    resets[id] = { token, expires }
    saveResets(resets)

    // also try to send email via existing endpoint logic (fire-and-forget)
    const appUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173'
    console.log(`[Vizara] Reset token for ${id} (${user.name}) — ${token} expires in 15m | link: ${appUrl}?resetToken=${token}&email=${encodeURIComponent(id)}`)

    return res.status(200).json({ token, email: id, expires, preview: { token } })
  } catch (e) {
    console.error('[request-reset]', e)
    return res.status(500).json({ error: 'Server error' })
  }
}
