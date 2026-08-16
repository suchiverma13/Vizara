import { motion } from 'framer-motion'

const footerCols = [
  { title: 'Game', links: ['Levels', 'Arena', 'Season 3', 'Rewards'] },
  { title: 'Community', links: ['Leaderboard', 'Discord', 'Cohorts', 'Merch'] },
  { title: 'Company', links: ['About', 'Careers', 'Blog', 'Press kit'] },
]

export default function Footer() {
  return (
    <motion.footer
      className="footer"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="brand">
            <span className="brand-mark">{'{ }'}</span>
            <span className="brand-name">Vizara</span>
          </div>
          <p>Train algorithms like a pro. Compete like a legend.</p>
        </div>
        {footerCols.map((col, i) => (
          <motion.div
            key={col.title}
            className="footer-col"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + i * 0.1 }}
          >
            <h4>{col.title}</h4>
            {col.links.map((l) => (
              <motion.a key={l} href="#" whileHover={{ x: 4, color: '#a78bfa' }}>
                {l}
              </motion.a>
            ))}
          </motion.div>
        ))}
      </div>
      <div className="footer-bottom">
        <span>© 2026 Vizara Studios. Crafted in the terminal.</span>
        <span className="footer-hearts">⚡ 128k coders and counting</span>
      </div>
    </motion.footer>
  )
}