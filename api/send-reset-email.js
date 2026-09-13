/**
 * Vercel Serverless Function — POST /api/send-reset-email
 * Body: { email: string, token: string, name: string }
 *
 * Mock: logs and returns success. For real email:
 * 1. npm i resend
 * 2. Set RESEND_API_KEY in Vercel env
 * 3. Uncomment Resend block below
 */

// Uncomment for real sending:
// import { Resend } from 'resend'
// const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { email, token, name } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body

    if (!email || !token) return res.status(400).json({ error: 'Missing email or token' })

    const appUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173'
    const resetLink = `${appUrl}?resetToken=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`

    console.log(`[Vizara] Password reset requested for ${email} (${name}) — token: ${token}`)

    // --- Real email via Resend (uncomment) ---
    // if (process.env.RESEND_API_KEY) {
    //   await resend.emails.send({
    //     from: 'Vizara <no-reply@vizara.dev>',
    //     to: email,
    //     subject: 'Reset your Vizara password — code expires in 15 min',
    //     html: `
    //       <div style="font-family:Inter, sans-serif; max-width:520px; margin:0 auto; padding:24px; background:#0b0920; color:#e2e8f0; border-radius:16px;">
    //         <h2 style="color:#a78bfa;">Reset your password</h2>
    //         <p>Hi ${name || 'warrior'},</p>
    //         <p>Your reset code is:</p>
    //         <div style="font-family:'JetBrains Mono',monospace; font-size:1.6rem; letter-spacing:0.18em; background:rgba(124,58,237,0.15); border:1px solid rgba(124,58,237,0.4); padding:14px 18px; border-radius:12px; text-align:center;">${token}</div>
    //         <p style="margin-top:16px;">Or click: <a href="${resetLink}" style="color:#22d3ee;">${resetLink}</a></p>
    //         <p style="color:#94a3b8; font-size:0.85rem;">Expires in 15 minutes. If you didn't request this, ignore.</p>
    //       </div>
    //     `,
    //   })
    // }

    // Mock success (always, even without API key — so local dev works offline)
    return res.status(200).json({
      success: true,
      message: `Mock email sent to ${email}`,
      preview: { email, token, resetLink },
      note: 'Set RESEND_API_KEY and uncomment Resend block to send real email.',
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Failed to send email' })
  }
}
