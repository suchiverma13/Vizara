import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import CodeEditor from './CodeEditor.jsx'
import CodeVisualizer from './CodeVisualizer.jsx'
import {
  topics,
  difficulties,
  days,
  questions,
  pickQuestion,
  dailyQuestion,
} from '../data/questions.js'

const SOLVED_KEY = 'vizara-solved'

const diffColor = (d) =>
  d === 'Easy' ? '#34d399' : d === 'Medium' ? '#fbbf24' : '#f87171'

const loadSolved = () => {
  try {
    return JSON.parse(localStorage.getItem(SOLVED_KEY) || '[]')
  } catch {
    return []
  }
}

export default function CodingScreen({ onBack }) {
  const [topic, setTopic] = useState('All')
  const [difficulty, setDifficulty] = useState('All')
  const [day, setDay] = useState('Daily')
  const [index, setIndex] = useState(() => {
    const daily = dailyQuestion()
    return questions.findIndex((q) => q.id === daily.id)
  })
  const [code, setCode] = useState(questions[index].starter)
  const [runId, setRunId] = useState(0)
  const [activeLine, setActiveLine] = useState(-1)
  const [solved, setSolved] = useState(loadSolved)

  const question = questions[index]
  const isSolved = solved.includes(question.id)
  const progress = Math.round((solved.length / questions.length) * 100)

  const loadAt = (i) => {
    const q = questions[(i + questions.length) % questions.length]
    setIndex(questions.findIndex((x) => x.id === q.id))
    setCode(q.starter)
    setRunId(0)
    setActiveLine(-1)
  }

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
          <div className="filter-group">
            <button className={`filter-btn ${day === 'Daily' ? 'active' : ''}`} onClick={() => applyFilter('day', 'Daily')}>
              Daily
            </button>
            <button className={`filter-btn ${day === 'All' ? 'active' : ''}`} onClick={() => applyFilter('day', 'All')}>
              All
            </button>
            {days.map((d) => (
              <button key={d} className={`filter-btn ${day === d ? 'active' : ''}`} onClick={() => applyFilter('day', d)}>
                {d}
              </button>
            ))}
          </div>
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
          className="ctrl-btn"
          onClick={() => {
            const q = pickQuestion({ topic, difficulty, day })
            loadAt(questions.findIndex((x) => x.id === q.id))
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.93 }}
        >
          Random
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
        <motion.button
          className="btn btn-primary run-btn"
          onClick={() => setRunId((r) => r + 1)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Run solution
        </motion.button>
      </div>

      <div className="code-grid">
        <div className="code-editor-col">
          <div className="code-label">solution.js</div>
          <div className="editor-frame">
            <CodeEditor
              value={code}
              onChange={setCode}
              onRun={() => setRunId((r) => r + 1)}
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
          onRerun={() => setRunId((r) => r + 1)}
          onActiveLine={setActiveLine}
          onVerdict={() => markSolved(question.id)}
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