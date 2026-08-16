import { motion } from 'framer-motion'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
}

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
}

const badges = ['Array', 'Strings', 'DP', 'Graphs', 'Binary', 'Backtracking']

export default function Hero({ onStart }) {
  return (
    <section className="hero" id="home">
      <div className="geo geo-ring" aria-hidden="true" />
      <div className="geo geo-square" aria-hidden="true" />
      <div className="geo geo-circle" aria-hidden="true" />
      <div className="geo geo-triangle" aria-hidden="true" />
      <div className="geo geo-big-square" aria-hidden="true" />

      <motion.div variants={container} initial="hidden" animate="show" className="hero-text">
        <motion.div variants={item} className="hero-label">
          <span className="dot" />
          Vizara · Coding Arena
        </motion.div>

        <motion.h1 variants={item} className="hero-title">
          Level up your code.
          <br />
          <span className="gradient">Beat the machine.</span>
        </motion.h1>

        <motion.p variants={item} className="hero-sub">
          Vizara turns algorithmic puzzles into a fast-paced arcade duel. Solve, optimize,
          and race the clock against rivals from around the globe.
        </motion.p>

        <motion.div variants={item} className="hero-cta">
          <motion.button
            className="btn btn-primary"
            whileHover={{ scale: 1.06, boxShadow: '0 0 40px rgba(124, 58, 237, 0.55)' }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
          >
            Start playing
          </motion.button>
          <motion.button
            className="btn btn-outline"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
          >
            Watch trailer
          </motion.button>
        </motion.div>

        <motion.div variants={item} className="badge-row">
          {badges.map((b, i) => (
            <motion.span
              key={b}
              className="pill"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + i * 0.08, type: 'spring', stiffness: 250, damping: 16 }}
              whileHover={{ y: -4, scale: 1.08 }}
            >
              {b}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        className="hero-terminal"
        initial={{ opacity: 0, y: 60, rotateX: 18 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ delay: 0.7, duration: 0.9, ease: 'easeOut' }}
        whileHover={{ y: -8, rotateX: -2, rotateY: -2 }}
      >
        <div className="terminal-head">
          <span className="t-red" />
          <span className="t-yellow" />
          <span className="t-green" />
          <span className="t-title">vizara — challenge_07.cpp</span>
        </div>
        <div className="terminal-body">
          <p>
            <span className="prompt">$</span> vizara solve <span className="tok">two-sum</span>{' '}
            --timer 120s
          </p>
          <p className="out">
            <span className="ok">✓</span> Challenge loaded · difficulty <b>medium</b> · best
            time 00:41
          </p>
          <p>
            <span className="prompt">$</span> vizara run
          </p>
          <p className="code">
            <span className="kw">for</span> (i,j) <span className="kw">in</span> pairs(nums):
          </p>
          <p className="code">
            &nbsp;&nbsp;<span className="kw">if</span> nums[i] + nums[j] == target:
          </p>
          <p className="code">
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="fn">return</span> [i, j]
          </p>
          <p className="out ok">
            <span className="ok">✓</span> All 512 tests passed · O(n²) → O(n) suggested
          </p>
          <p className="blink-cursor" />
        </div>
      </motion.div>
    </section>
  )
}