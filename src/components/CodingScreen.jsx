import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import CodeEditor from './CodeEditor.jsx'
import CodeVisualizer from './CodeVisualizer.jsx'
import {
  topics,
  difficulties,
  days,
  questions,
  pickQuestion,
  dailyQuestion,
  dailyForLevel,
} from '../data/questions.js'
import { recordAttempt } from '../data/userStore.js'

const SOLVED_KEY = 'vizara-solved'

const diffColor = (d) =>
  d === 'Easy' ? '#34d399' : d === 'Medium' ? '#fbbf24' : '#f87171'

const timeLimitFor = (d) =>
  d === 'Easy' ? 300 : d === 'Medium' ? 600 : 900

const chancesFor = (d) => (d === 'Easy' ? 5 : d === 'Medium' ? 3 : 2)

const fmtTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

const loadSolved = () => {
  try {
    return JSON.parse(localStorage.getItem(SOLVED_KEY) || '[]')
  } catch {
    return []
  }
}

export default function CodingScreen({ onBack, level = null, onResults }) {
  const [topic, setTopic] = useState('All')
  const [difficulty, setDifficulty] = useState('All')
  const [day, setDay] = useState('Daily')
  const [index, setIndex] = useState(() => {
    if (level) {
      const q = dailyForLevel(level)
      return questions.findIndex((x) => x.id === q.id)
    }
    const daily = dailyQuestion()
    return questions.findIndex((q) => q.id === daily.id)
  })
  const [code, setCode] = useState(questions[index].starter)
  const [runId, setRunId] = useState(0)
  const [activeLine, setActiveLine] = useState(-1)
  const [solved, setSolved] = useState(loadSolved)
  const [elapsed, setElapsed] = useState(0)
  const [chancesLeft, setChancesLeft] = useState(chancesFor(questions[index].difficulty))
  const [solutionUnlocked, setSolutionUnlocked] = useState(false)
  const [shuffling, setShuffling] = useState(false)
  const shuffleTimer = useRef(null)

  const question = questions[index]
  const timeLimit = timeLimitFor(question.difficulty)
  const maxChances = chancesFor(question.difficulty)
  const timeUp = elapsed >= timeLimit
  const isSolved = solved.includes(question.id)
  const progress = Math.round((solved.length / questions.length) * 100)

  const loadAt = (i) => {
    const q = questions[(i + questions.length) % questions.length]
    setIndex(questions.findIndex((x) => x.id === q.id))
    setCode(q.starter)
    setRunId(0)
    setActiveLine(-1)
    setElapsed(0)
    setChancesLeft(chancesFor(q.difficulty))
  }

  const handleRun = () => {
    if (chancesLeft <= 0 || timeUp || shuffling) return
    setSolutionUnlocked(true)
    setChancesLeft((c) => c - 1)
    setRunId((r) => r + 1)
  }

  const shuffleDice = () => {
    if (shuffling) return
    setShuffling(true)
    let ticks = 0
    shuffleTimer.current = setInterval(() => {
      ticks++
      const q = pickQuestion({ topic, difficulty, day })
      loadAt(questions.findIndex((x) => x.id === q.id))
      if (ticks >= 9) {
        clearInterval(shuffleTimer.current)
        setShuffling(false)
      }
    }, 90)
  }

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => () => clearInterval(shuffleTimer.current), [])

  const markSolved = (id) => {
    setSolved((prev) => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      localStorage.setItem(SOLVED_KEY, JSON.stringify(next))
      return next
    })
  }

  const applyFilter = (type, value) => {
    let t = type === 'topic' ? value : topic
    let d = type === 'difficulty' ? value : difficulty
    let dy = type === 'day' ? value : day
    if (dy === 'Daily' && (type === 'topic' || type === 'difficulty')) {
      dy = 'All'
    }
    setTopic(t)
    setDifficulty(d)
    setDay(dy)
    if (dy === 'Daily') {
      const daily = dailyQuestion()
      if (daily.id !== question.id) loadAt(questions.findIndex((q) => q.id === daily.id))
    } else if (!questionMatches(question, t, d, dy)) {
      const q = pickQuestion({ topic: t, difficulty: d, day: dy })
      loadAt(questions.findIndex((x) => x.id === q.id))
    }
  }

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onBack()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onBack])

  return (
    <motion.div
      className="coding-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="code-head">
        <div className="code-head-left">
          <motion.button
            className="back-btn"
            onClick={onBack}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
          >
            ← Home
          </motion.button>
          <h2>{question.title}</h2>
          {level && (
            <span
              className="diff-badge"
              style={{ background: `${level.color}1f`, color: level.color, borderColor: `${level.color}55` }}
            >
              {level.title}
            </span>
          )}
          <span
            className="diff-badge"
            style={{ background: '#8b5cf626', color: '#a78bfa', borderColor: '#8b5cf655' }}
          >
            {question.topic}
          </span>
          <span
            className="diff-badge"
            style={{
              background: `${diffColor(question.difficulty)}1f`,
              color: diffColor(question.difficulty),
              borderColor: `${diffColor(question.difficulty)}55`,
            }}
          >
            {question.difficulty}
          </span>
          <span className="diff-badge" style={{ background: '#22d3ee1a', color: '#22d3ee', borderColor: '#22d3ee44' }}>
            Day {question.day}
          </span>
          {isSolved && (
            <motion.span
              className="solved-badge"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              ✓ Solved
            </motion.span>
          )}
        </div>
        <div className="code-head-right">
          <div className="timer-row">
            <span className={`timer-chip ${timeUp ? 'over' : ''}`}>
              <span className="timer-label">Limit</span>
              {fmtTime(timeLimit)}
            </span>
            <span className={`timer-chip taken ${timeUp ? 'over' : ''}`}>
              <span className="timer-label">Taken</span>
              {fmtTime(Math.min(elapsed, timeLimit))}
            </span>
            <span className={`timer-chip ${chancesLeft <= 1 ? 'low' : ''}`}>
              <span className="timer-label">Chances</span>
              {'●'.repeat(chancesLeft)}
              {'○'.repeat(maxChances - chancesLeft)}
            </span>
          </div>
          <div className="progress-wrap">
            <div className="progress-text">
              {solved.length}/{questions.length} solved
            </div>
            <div className="progress-track">
              <motion.div
                className="progress-fill"
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="code-desc">
        <p>{question.description}</p>
        <span className="code-example">{question.example}</span>
      </div>

      <div className="code-filters">
        <div className="filter-block">
          <span className="filter-label">Topic</span>
          <div className="filter-group">
            {['All', ...topics].map((t) => (
              <button key={t} className={`filter-btn ${topic === t ? 'active' : ''}`} onClick={() => applyFilter('topic', t)}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-block">
          <span className="filter-label">Difficulty</span>
          <div className="filter-group">
            {['All', ...difficulties].map((d) => (
              <button key={d} className={`filter-btn ${difficulty === d ? 'active' : ''}`} onClick={() => applyFilter('difficulty', d)}>
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-block">
          <span className="filter-label">Day to solve</span>
          <select
            className="filter-select"
            value={day}
            onChange={(e) => applyFilter('day', e.target.value)}
          >
            <option value="Daily">Daily</option>
            <option value="All">All</option>
            {days.map((d) => (
              <option key={d} value={d}>Day {d}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="code-controls">
        <motion.button className="ctrl-btn" onClick={() => loadAt(index - 1)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}>
          ← Prev
        </motion.button>
        <motion.button className="ctrl-btn" onClick={() => loadAt(index + 1)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}>
          Next Question →
        </motion.button>
        <motion.button
          className={`ctrl-btn dice-btn ${shuffling ? 'rolling' : ''}`}
          onClick={shuffleDice}
          disabled={shuffling}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.93 }}
        >
          <span className="dice">🎲</span>
          <span className="dice">🎲</span>
          {shuffling ? 'shuffling…' : 'Random'}
        </motion.button>
        <motion.button
          className="ctrl-btn"
          onClick={() => {
            setCode(question.starter)
            setRunId(0)
            setActiveLine(-1)
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.93 }}
        >
          Reset code
        </motion.button>
        {level && (
          <motion.button
            className="btn btn-primary run-btn"
            onClick={() => onResults(level)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Submit · {level.title} →
          </motion.button>
        )}
        <motion.button
          className={`btn btn-primary run-btn ${chancesLeft <= 0 || timeUp ? 'disabled' : ''}`}
          onClick={handleRun}
          disabled={chancesLeft <= 0 || timeUp}
          whileHover={chancesLeft <= 0 || timeUp ? {} : { scale: 1.05 }}
          whileTap={chancesLeft <= 0 || timeUp ? {} : { scale: 0.95 }}
        >
          {timeUp ? 'Time is up' : chancesLeft <= 0 ? 'No chances left' : `Run solution · ${chancesLeft} left`}
        </motion.button>
      </div>

      <div className="code-grid">
        <div className="code-editor-col">
          <div className="code-label">solution.js</div>
          <div className="editor-frame">
            <CodeEditor
              value={code}
              onChange={setCode}
              onRun={handleRun}
              activeLine={activeLine}
            />
            <div className="editor-statusbar">
              <span>JavaScript</span>
              <span>{code.split('\n').length} lines · {code.length} chars</span>
              <span>Ctrl+Enter to run</span>
            </div>
          </div>
        </div>
        <CodeVisualizer
          key={runId}
          code={code}
          question={question}
          runId={runId}
          solutionUnlocked={solutionUnlocked}
          onRerun={handleRun}
          onActiveLine={setActiveLine}
          onVerdict={(passed, total) => {
            markSolved(question.id)
            recordAttempt({
              qid: question.id,
              title: question.title,
              topic: question.topic,
              difficulty: question.difficulty,
              passed: passed / total >= 0.75,
              timeTaken: elapsed,
            })
          }}
        />
      </div>
    </motion.div>
  )
}

function questionMatches(q, topic, difficulty, day) {
  return (
    (topic === 'All' || q.topic === topic) &&
    (difficulty === 'All' || q.difficulty === difficulty) &&
    (day === 'All' || day === 'Daily' || q.day === day)
  )
}