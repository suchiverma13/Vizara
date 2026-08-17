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
import TopicBrief from './components/TopicBrief.jsx'
import LoginScreen from './components/LoginScreen.jsx'
import Profile from './components/Profile.jsx'
import { levels } from './data/levels.js'
import { getSession, logout } from './data/userStore.js'

export default function App() {
  const [activeId, setActiveId] = useState(null)
  const [codeLevelId, setCodeLevelId] = useState(null)
  const [briefLevelId, setBriefLevelId] = useState(null)
  const [view, setView] = useState('home')
  const [user, setUser] = useState(getSession)
  const activeLevel = levels.find((l) => l.id === activeId) || null
  const activeIndex = levels.findIndex((l) => l.id === activeId)

  const openCode = () => {
    setCodeLevelId(null)
    setView('code')
  }

  const nextLevel = () => {
    if (activeIndex < levels.length - 1) setActiveId(levels[activeIndex + 1].id)
  }

  return (
    <div className="app">
      <Scene3D />
      <div className="content">
        <Navbar
          onOpenCode={openCode}
          user={user}
          onLogin={() => setView('login')}
          onProfile={() => setView('profile')}
        />
        <main>
          <Hero
            user={user}
            onStart={() => (user ? openCode() : setView('login'))}
          />
          <Stats />
          <Levels onEnter={(l) => { setBriefLevelId(l.id); setView('brief') }} />
        </main>
        <Footer />
      </div>

      <AnimatePresence>
        {view === 'brief' && (
          <TopicBrief
            level={levels.find((l) => l.id === briefLevelId)}
            onStart={() => { setCodeLevelId(briefLevelId); setView('code') }}
            onBack={() => setView('home')}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {view === 'code' && (
          <CodingScreen
            level={levels.find((l) => l.id === codeLevelId) || null}
            onBack={() => setView('home')}
            onResults={(l) => setActiveId(l.id)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {view === 'login' && (
          <LoginScreen
            onDone={() => { setUser(getSession()); setView('profile') }}
            onBack={() => setView('home')}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {view === 'profile' && user && (
          <Profile
            user={user}
            onBack={() => setView('home')}
            onStartPlaying={openCode}
            onLogout={() => { logout(); setUser(null); setView('home') }}
          />
        )}
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