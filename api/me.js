import { getSessionByToken, findUserByEmail, setCors, getTokenFromReq } from './_store.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const token = getTokenFromReq(req)
    if (!token) return res.status(401).json({ error: 'Not authenticated' })

    const sess = getSessionByToken(token)
    if (!sess) return res.status(401).json({ error: 'Session expired or invalid' })

    const user = findUserByEmail(sess.email)
    if (!user) return res.status(401).json({ error: 'User not found' })

    const publicUser = { id: user.id, name: user.name, email: user.email, rating: user.rating, joined: user.joined }
    return res.status(200).json({ user: publicUser })
  } catch (e) {
    console.error('[me]', e)
    return res.status(500).json({ error: 'Server error' })
  }
}
