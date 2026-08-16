import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Scene3D from './components/Scene3D.jsx'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Stats from './components/Stats.jsx'
import Levels from './components/Levels.jsx'
import Footer from './components/Footer.jsx'
import ResultsScreen from './components/ResultsScreen.jsx'
import CodingScreen from './components/CodingScreen.jsx'
import { levels } from './data/levels.js'

export default function App() {
  const [activeId, setActiveId] = useState(null)
  const [view, setView] = useState('home')
  const activeLevel = levels.find((l) => l.id === activeId) || null
  const activeIndex = levels.findIndex((l) => l.id === activeId)

  const nextLevel = () => {
    if (activeIndex < levels.length - 1) setActiveId(levels[activeIndex + 1].id)
  }

  return (
    <div className="app">
      <Scene3D />
      <div className="content">
        <Navbar onOpenCode={() => setView('code')} />
        <main>
          <Hero onStart={() => setActiveId('01')} />
          <Stats />
          <Levels onEnter={(l) => setActiveId(l.id)} />
        </main>
        <Footer />
      </div>

      <AnimatePresence>
        {view === 'code' && <CodingScreen onBack={() => setView('home')} />}
      </AnimatePresence>

      <AnimatePresence>
        {activeLevel && (
          <ResultsScreen
            key={activeLevel.id}
            level={activeLevel}
            onClose={() => setActiveId(null)}
            onNext={nextLevel}
            hasNext={activeIndex < levels.length - 1}
          />
        )}
      </AnimatePresence>
    </div>
  )
}