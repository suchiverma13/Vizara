import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { login, register } from '../data/userStore.js'

export default function LoginScreen({ onDone, onBack }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onBack()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onBack])

  const submit = (e) => {
    e.preventDefault()
    const res =
      mode === 'login' ? login(email, password) : register(name, email, password)
    if (res.error) {
      setError(res.error)
      return
    }
    onDone(res.user)
  }

  return (
    <motion.div
      className="auth-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="auth-panel"
        initial={{ y: 60, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 60, scale: 0.96, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      >
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
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(null) }}
          >
            Login
          </button>
          <button
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setError(null) }}
          >
            Sign up
          </button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <h2>{mode === 'login' ? 'Welcome back, warrior' : 'Create your profile'}</h2>
          <p className="auth-sub">
            {mode === 'login'
              ? 'Log in to track your rating, streaks and company prep.'
              : 'Your solves, rating and analytics are saved to your profile.'}
          </p>

          {mode === 'signup' && (
            <label className="auth-field">
              <span>Name</span>
              <input
                className="auth-input"
                type="text"
                placeholder="Ada Lovelace"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </label>
          )}

          <label className="auth-field">
            <span>Email</span>
            <input
              className="auth-input"
              type="email"
              placeholder="you@arena.dev"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus={mode === 'login'}
            />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input
              className="auth-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && (
            <motion.p
              className="auth-error"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            className="btn btn-primary auth-submit"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            {mode === 'login' ? 'Login & view profile →' : 'Create account & start →'}
          </motion.button>

          <p className="auth-note">
            {mode === 'login' ? "New here? " : "Already have an account? "}
            <button
              type="button"
              className="auth-link"
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null) }}
            >
              {mode === 'login' ? 'Create an account' : 'Log in'}
            </button>
          </p>
        </form>
      </motion.div>
    </motion.div>
  )
}