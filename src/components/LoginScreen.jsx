import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { login, register } from '../data/userStore.js'

const QUOTES = [
  '“The only way to beat the machine is to out-think it.”',
  '“Consistency beats intensity. One question a day.”',
  '“Your rating is just your potential, measured.”',
  '“Rookies rush. Legends read the constraints.”',
]

const TOPIC_PILLS = ['Arrays', 'Strings', 'DP', 'Graphs', 'Binary Search', 'Backtracking', 'Heaps', 'Trie']

export default function LoginScreen({ onDone, onBack }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState(null)
  const [phase, setPhase] = useState('idle')
  const [logLines, setLogLines] = useState([])
  const [quoteIdx, setQuoteIdx] = useState(0)
  const logRef = useRef(null)

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
        setLogLines((l) => [...l, intro[i]])
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

  const submit = (e) => {
    e.preventDefault()
    if (busy) return
    const res = mode === 'login' ? login(email, password) : register(name, email, password)
    if (res.error) {
      setError(res.error)
      setLogLines((l) => [...l, `✕ access denied · ${res.error}`])
      return
    }
    setError(null)
    setLogLines((l) => [
      ...l,
      '> verifying identity…',
      '> cipher matched · bio-scan ✓',
      `> access granted ✓ · welcome, ${res.user.name.split(' ')[0].toLowerCase()}@arena`,
    ])
    setPhase('auth')
    setTimeout(() => setPhase('done'), 1100)
  }

  const switchMode = (m) => {
    setMode(m)
    setError(null)
    setLogLines((l) => [...l, `> auth mode → ${m === 'login' ? 'sign-in' : 'new-profile'}`])
  }

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
                {logLines.map((line, i) => {
                  console.log('VIZDEBUG map:', JSON.stringify(line), 'logLines:', JSON.stringify(logLines))
                  return (
                  <motion.p
                    key={`${i}-${line}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className={line.startsWith('✕') ? 'fail-txt' : line.startsWith('>') ? 'auth-log-ok' : 'auth-log'}
                  >
                    {line}
                  </motion.p>
                  )
                })}
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
          </div>

          <form className="auth-form" onSubmit={submit}>
            <motion.h2
              key={mode}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {mode === 'login' ? 'Welcome back, warrior' : 'Forge your identity'}
            </motion.h2>
            <p className="auth-sub">
              {mode === 'login'
                ? 'Log in to track your rating, streaks and company prep.'
                : 'Your solves, rating and analytics are saved to your profile.'}
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
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </label>

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
              ) : (
                'Create profile & enter →'
              )}
            </motion.button>

            <p className="auth-note">
              {mode === 'login' ? 'New here? ' : 'Already have an account? '}
              <button
                type="button"
                className="auth-link"
                onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                disabled={busy}
              >
                {mode === 'login' ? 'Create an account' : 'Log in'}
              </button>
            </p>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}