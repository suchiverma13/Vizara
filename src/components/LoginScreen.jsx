import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { login, register, requestPasswordReset, resetPassword, getLastResetEmail } from '../data/userStore.js'

const QUOTES = [
  '“The only way to beat the machine is to out-think it.”',
  '“Consistency beats intensity. One question a day.”',
  '“Your rating is just your potential, measured.”',
  '“Rookies rush. Legends read the constraints.”',
]

const TOPIC_PILLS = ['Arrays', 'Strings', 'DP', 'Graphs', 'Binary Search', 'Backtracking', 'Heaps', 'Trie']

export default function LoginScreen({ onDone, onBack }) {
  const [mode, setMode] = useState('login') // login | signup | forgot | reset
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [phase, setPhase] = useState('idle')
  const [logLines, setLogLines] = useState([])
  const [quoteIdx, setQuoteIdx] = useState(0)
  const logRef = useRef(null)

  // reset flow
  const [resetToken, setResetToken] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [lastSent, setLastSent] = useState(null)

  const handle = name.trim().toLowerCase().replace(/\s+/g, '.') || 'you'
  const busy = phase !== 'idle'

  useEffect(() => {
    const intro = [
      '$ vizara auth --arena connect',
      '> handshake ok · tls 1.3 · latency 12ms',
      '> identity chip detected … awaiting credentials',
    ]
    let i = 0
    const t = setInterval(() => {
      if (i < intro.length) {
        const line = intro[i]
        setLogLines((l) => [...l, line])
        i++
      } else {
        clearInterval(t)
      }
    }, 420)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx((q) => (q + 1) % QUOTES.length), 4500)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight })
  }, [logLines])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !busy && onBack()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onBack, busy])

  useEffect(() => {
    if (phase === 'done') {
      const t = setTimeout(onDone, 350)
      return () => clearTimeout(t)
    }
  }, [phase, onDone])

  const succeed = (msg, userName) => {
    setError(null)
    setLogLines((l) => [
      ...l,
      '> verifying identity…',
      '> cipher matched · bio-scan ✓',
      `> access granted ✓ · welcome, ${userName}@arena`,
    ])
    setPhase('auth')
    setTimeout(() => setPhase('done'), 900)
    if (msg) setInfo(msg)
  }

  const submit = (e) => {
    e.preventDefault()
    if (busy) return
    setError(null)
    setInfo(null)
    if (mode === 'forgot') {
      const res = requestPasswordReset(email)
      if (res.error) {
        setError(res.error)
        setLogLines((l) => [...l, `✕ reset denied · ${res.error}`])
        return
      }
      const rec = getLastResetEmail()
      setLastSent(rec)
      setInfo(`Reset code sent to ${res.email}. Check your inbox (expires in 15 min).`)
      setLogLines((l) => [...l, `> reset token generated → ${res.token}`, `> email queued → ${res.email} ✉️`, '> awaiting code verification…'])
      setMode('reset')
      // prefill token for demo convenience (in production you would NOT do this)
      setResetToken(res.token)
      return
    }
    if (mode === 'reset') {
      if (newPass !== confirmPass) {
        setError('Passwords do not match.')
        setLogLines((l) => [...l, '✕ reset denied · passwords mismatch'])
        return
      }
      const res = resetPassword(email, resetToken, newPass)
      if (res.error) {
        setError(res.error)
        setLogLines((l) => [...l, `✕ reset denied · ${res.error}`])
        return
      }
      setLogLines((l) => [...l, '> token verified ✓', '> password updated ✓', `> access granted ✓ · welcome, ${res.user.name.split(' ')[0].toLowerCase()}@arena`])
      setPhase('auth')
      setTimeout(() => setPhase('done'), 900)
      return
    }
    const res = mode === 'login' ? login(email, password) : register(name, email, password)
    if (res.error) {
      setError(res.error)
      setLogLines((l) => [...l, `✕ access denied · ${res.error}`])
      return
    }
    succeed(null, res.user.name.split(' ')[0].toLowerCase())
  }

  const switchMode = (m) => {
    setMode(m)
    setError(null)
    setInfo(null)
    setLogLines((l) => [...l, `> auth mode → ${m === 'login' ? 'sign-in' : m === 'signup' ? 'new-profile' : m === 'forgot' ? 'forgot-password' : 'reset-password'}`])
  }

  const isForgot = mode === 'forgot' || mode === 'reset'

  return (
    <motion.div
      className="auth-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="auth-shell"
        initial={{ y: 60, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 60, scale: 0.96, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      >
        <div className="auth-side">
          <div className="auth-ascii">VIZARA</div>
          <div className="auth-side-sub">COMBAT CODE · LIVE ARENA</div>

          <div className="auth-term">
            <div className="auth-term-head">
              <span className="t-red" />
              <span className="t-yellow" />
              <span className="t-green" />
              <span className="auth-term-title">vizara — auth.js</span>
            </div>
            <div className="auth-term-body" ref={logRef}>
              <AnimatePresence initial={false}>
                {logLines.map((line, i) => (
                  <motion.p
                    key={`${i}-${line}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className={String(line).startsWith('✕') ? 'fail-txt' : String(line).startsWith('>') ? 'auth-log-ok' : 'auth-log'}
                  >
                    {line}
                  </motion.p>
                ))}
              </AnimatePresence>
              {!busy && <motion.span className="blink-cursor" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} />}
              {busy && (
                <motion.p
                  className="auth-log-ok"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {phase === 'done' ? '> entering arena…' : '> decrypting…'}
                </motion.p>
              )}
            </div>
          </div>

          <div className="auth-quote">
            <AnimatePresence mode="wait">
              <motion.p
                key={quoteIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
              >
                {QUOTES[quoteIdx]}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="auth-live">
            <span className="auth-live-dot" />
            <span className="auth-live-item"><b>1,284</b> online</span>
            <span className="auth-live-item"><b>342</b> solving</span>
            <span className="auth-live-item"><b>12</b> in your arena</span>
          </div>

          <div className="auth-pills">
            {TOPIC_PILLS.map((p, i) => (
              <motion.span
                key={p}
                className="auth-pill"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.07 }}
              >
                {p}
              </motion.span>
            ))}
          </div>
        </div>

        <div className="auth-form-side">
          <div className="auth-head">
            <div className="auth-brand">
              <span className="brand-mark">{'{ }'}</span>
              <span className="brand-name">Vizara</span>
            </div>
            <motion.button className="results-close" onClick={onBack} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
              ✕
            </motion.button>
          </div>

          <div className="auth-tabs">
            <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => switchMode('login')} disabled={busy}>
              Login
            </button>
            <button className={`auth-tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => switchMode('signup')} disabled={busy}>
              Sign up
            </button>
            <button className={`auth-tab ${isForgot ? 'active' : ''}`} onClick={() => switchMode('forgot')} disabled={busy} style={{ fontSize: '0.82rem' }}>
              Forgot?
            </button>
          </div>

          <form className="auth-form" onSubmit={submit}>
            <motion.h2
              key={mode}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {mode === 'login' ? 'Welcome back, warrior' : mode === 'signup' ? 'Forge your identity' : mode === 'forgot' ? 'Reset your password' : 'Enter reset code'}
            </motion.h2>
            <p className="auth-sub">
              {mode === 'login'
                ? 'Log in to track your rating, streaks and company prep.'
                : mode === 'signup'
                ? 'Your solves, rating and analytics are saved to your profile.'
                : mode === 'forgot'
                ? 'Enter your registered email. We’ll mail you a 15-min reset code.'
                : 'Check your email for the code. Enter it with your new password.'}
            </p>

            <AnimatePresence initial={false}>
              {mode === 'signup' && (
                <motion.label
                  className="auth-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <span>Name</span>
                  <div className="auth-input-wrap">
                    <span className="auth-prefix">©</span>
                    <input
                      className="auth-input"
                      type="text"
                      placeholder="Ada Lovelace"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={busy}
                      autoFocus
                    />
                  </div>
                  {name.trim() && (
                    <motion.span className="auth-handle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      handle: <b>{handle}@arena</b>
                    </motion.span>
                  )}
                </motion.label>
              )}
            </AnimatePresence>

            <label className="auth-field">
              <span>Email</span>
              <div className="auth-input-wrap">
                <span className="auth-prefix">@</span>
                <input
                  className="auth-input"
                  type="email"
                  placeholder="you@arena.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={busy}
                  autoFocus={mode === 'login'}
                />
              </div>
            </label>

            {mode === 'forgot' ? null : mode === 'reset' ? (
              <>
                <label className="auth-field">
                  <span>Reset code</span>
                  <div className="auth-input-wrap">
                    <span className="auth-prefix">◐</span>
                    <input
                      className="auth-input"
                      type="text"
                      placeholder="AB12-CD34"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value.toUpperCase())}
                      disabled={busy}
                      style={{ letterSpacing: '0.12em', fontFamily: 'JetBrains Mono, monospace' }}
                    />
                  </div>
                  {lastSent && (
                    <span className="auth-hint" style={{ color: '#22d3ee', fontSize: '0.72rem', marginTop: 6, display: 'block' }}>
                      Demo: code is <b>{lastSent.token}</b> (also mailed to {lastSent.to})
                    </span>
                  )}
                </label>
                <label className="auth-field">
                  <span>New password</span>
                  <div className="auth-input-wrap">
                    <span className="auth-prefix">#</span>
                    <input
                      className="auth-input"
                      type={showNewPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      disabled={busy}
                    />
                    <button
                      type="button"
                      className="auth-eye"
                      onClick={() => setShowNewPass((s) => !s)}
                      tabIndex={-1}
                      aria-label={showNewPass ? 'Hide password' : 'Show password'}
                      title={showNewPass ? 'Hide password' : 'Show password'}
                    >
                      {showNewPass ? '🙈' : '👁'}
                    </button>
                  </div>
                </label>
                <label className="auth-field">
                  <span>Confirm new password</span>
                  <div className="auth-input-wrap">
                    <span className="auth-prefix">#</span>
                    <input
                      className="auth-input"
                      type={showConfirmPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      disabled={busy}
                    />
                    <button
                      type="button"
                      className="auth-eye"
                      onClick={() => setShowConfirmPass((s) => !s)}
                      tabIndex={-1}
                      aria-label={showConfirmPass ? 'Hide password' : 'Show password'}
                      title={showConfirmPass ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPass ? '🙈' : '👁'}
                    </button>
                  </div>
                </label>
              </>
            ) : (
              <label className="auth-field">
                <span>Password</span>
                <div className="auth-input-wrap">
                  <span className="auth-prefix">#</span>
                  <input
                    className="auth-input"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={busy}
                  />
                  <button
                    type="button"
                    className="auth-eye"
                    onClick={() => setShowPass((s) => !s)}
                    tabIndex={-1}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                    title={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
                {mode === 'login' && (
                  <button
                    type="button"
                    className="auth-link"
                    onClick={() => switchMode('forgot')}
                    disabled={busy}
                    style={{ marginTop: 8, fontSize: '0.82rem', alignSelf: 'flex-start' }}
                  >
                    Forgot password?
                  </button>
                )}
              </label>
            )}

            <AnimatePresence>
              {error && (
                <motion.p
                  className="auth-error"
                  initial={{ opacity: 0, y: -6, x: -4 }}
                  animate={{ opacity: 1, y: 0, x: [0, -6, 6, -3, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  ✕ {error}
                </motion.p>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {info && (
                <motion.p
                  className="auth-info"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    color: '#34d399',
                    background: 'rgba(52,211,153,0.08)',
                    border: '1px solid rgba(52,211,153,0.25)',
                    padding: '10px 12px',
                    borderRadius: 10,
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                  }}
                >
                  ✓ {info}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              className={`btn btn-primary auth-submit ${busy ? 'busy' : ''}`}
              whileHover={busy ? {} : { scale: 1.04 }}
              whileTap={busy ? {} : { scale: 0.96 }}
              disabled={busy}
            >
              {busy ? (
                <span className="auth-loading">
                  <motion.span
                    className="auth-spinner"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  >
                    ◐
                  </motion.span>
                  {phase === 'done' ? 'Granted!' : 'Authenticating…'}
                </span>
              ) : mode === 'login' ? (
                'Enter the arena →'
              ) : mode === 'signup' ? (
                'Create profile & enter →'
              ) : mode === 'forgot' ? (
                'Send reset code ✉️'
              ) : (
                'Update password ✓'
              )}
            </motion.button>

            <p className="auth-note">
              {mode === 'login' ? 'New here? ' : mode === 'signup' ? 'Already have an account? ' : 'Remembered? '}
              <button
                type="button"
                className="auth-link"
                onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                disabled={busy}
              >
                {mode === 'login' ? 'Create an account' : 'Log in'}
              </button>
              {isForgot && (
                <>
                  {' · '}
                  <button type="button" className="auth-link" onClick={() => switchMode('login')} disabled={busy}>
                    Back to login
                  </button>
                </>
              )}
            </p>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}
