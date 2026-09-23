import { setCors, getTokenFromReq, deleteSession } from './_store.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const token = getTokenFromReq(req)
    if (token) deleteSession(token)
    // clear cookie
    res.setHeader('Set-Cookie', `vizara_token=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT`)
    return res.status(200).json({ success: true })
  } catch (e) {
    console.error('[logout]', e)
    return res.status(500).json({ error: 'Server error' })
  }
}
