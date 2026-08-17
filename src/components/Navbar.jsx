import { motion } from 'framer-motion'
import { useState } from 'react'

const links = ['Levels', 'Arena', 'Leaderboard', 'Docs']

export default function Navbar({ onOpenCode, user, onLogin, onProfile }) {
  const [open, setOpen] = useState(false)
  const initials = user
    ? user.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : ''

  return (
    <motion.header
      className="navbar"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="nav-inner">
        <motion.div
          className="brand"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          <span className="brand-mark">{'{ }'}</span>
          <span className="brand-name">Vizara</span>
        </motion.div>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          {links.map((l, i) => (
            <motion.a
              key={l}
              href={`#${l.toLowerCase()}`}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              whileHover={{ scale: 1.06 }}
            >
              {l}
            </motion.a>
          ))}
          <motion.button
            className="nav-code-btn"
            onClick={onOpenCode}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.47 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
          >
            Code
          </motion.button>
        </nav>

        {user ? (
          <motion.button
            className="nav-user-btn"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={onProfile}
          >
            <span className="nav-avatar">{initials}</span>
            <span className="nav-user-name">{user.name.split(' ')[0]}</span>
            <span className="nav-user-caret">▾</span>
          </motion.button>
        ) : (
          <motion.button
            className="btn btn-ghost"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogin}
          >
            Login
          </motion.button>
        )}
      </div>
    </motion.header>
  )
}