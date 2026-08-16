import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { rankFor } from '../data/levels.js'

const confettiColors = ['#34d399', '#22d3ee', '#f472b6', '#fbbf24', '#a78bfa']

function buildSteps(code) {
  const lines = code.split('\n')
  const vars = {}
  const steps = []
  let loops = 0
  let maxDepth = 0
  let fnCount = 0
  let hasReturn = false
  let fnName = null

  const arrayOf = (v) => {
    const a = Object.values(v).find((x) => Array.isArray(x))
    return a || null
  }

  lines.forEach((raw, i) => {
    const line = raw.trim()
    if (!line || line.startsWith('//') || line.startsWith('#')) return
    if (/^[{}]\s*$/.test(line)) return

    const fn = line.match(/function\s+([A-Za-z_$][\w$]*)/)
    if (fn) {
      fnName = fn[1]
      fnCount++
      steps.push({ line: i, vars: { ...vars }, log: `def ${fn[1]}` })
      return
    }

    const assign = line.match(/(?:const|let|var)?\s*([A-Za-z_$][\w$]*)\s*=\s*(.+)$/)
    if (assign) {
      const name = assign[1]
      const rhs = assign[2].trim()
      const num = parseFloat(rhs)
      if (!isNaN(num) && /^[-+]?\d/.test(rhs)) {
        vars[name] = num
      } else {
        const arr = rhs.match(/\[([\d,\s.\-]+)\]/)
        if (arr) {
          vars[name] = arr[1].split(',').map((x) => parseFloat(x.trim()))
        } else if (!/function|=>/.test(rhs)) {
          vars[name] = rhs.replace(/[;,]$/, '')
        }
      }
      steps.push({ line: i, vars: { ...vars }, log: `${name} = ${JSON.stringify(vars[name])}`, array: arrayOf(vars) })
      return
    }

    if (/^return\b/.test(line)) {
      hasReturn = true
      steps.push({ line: i, vars: { ...vars }, log: `return ${line.replace(/^return\s*/, '')}` })
      return
    }

    if (/(console\.log|print)\s*\(/.test(line)) {
      steps.push({ line: i, vars: { ...vars }, log: `> ${line.replace(/^(console\.log|print)\s*\(/, '').replace(/\)\s*$/, '')}` })
      return
    }

    if (/\b(for|while)\b/.test(line)) {
      const indent = raw.length - raw.trimStart().length
      const depth = Math.round(indent / 2) + 1
      maxDepth = Math.max(maxDepth, depth)
      loops++
      steps.push({ line: i, vars: { ...vars }, log: `loop enter (nesting ${depth})` })
      return
    }

    if (/\b(if|else)\b/.test(line)) {
      steps.push({ line: i, vars: { ...vars }, log: line.replace(/[{};]$/, '') })
      return
    }
  })

  let recursion = false
  if (fnName) {
    const declIdx = lines.findIndex((l) => l.includes(`function ${fnName}`))
    recursion = lines.some((l, i) => i > declIdx && l.includes(`${fnName}(`))
  }

  const complexity = recursion
    ? 'O(2ⁿ)'
    : maxDepth === 0
      ? 'O(1)'
      : maxDepth === 1
        ? 'O(n)'
        : maxDepth === 2
          ? 'O(n²)'
          : 'O(n³)'

  return { steps, meta: { loops, maxDepth, fnCount, hasReturn, recursion, complexity } }
}

function Bars({ data }) {
  const max = Math.max(...data.map((v) => Math.abs(v)), 1)
  return (
    <div className="viz-bars">
      {data.map((v, i) => {
        const isMax = Math.abs(v) === max
        const h = Math.max(6, (Math.abs(v) / max) * 100)
        return (
          <motion.div key={i} className="viz-bar-col">
            <motion.span
              className="viz-bar-val"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              {v}
            </motion.span>
            <motion.div
              className={`viz-bar ${v < 0 ? 'neg' : ''} ${isMax ? 'max' : ''}`}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ type: 'spring', stiffness: 140, damping: 16, delay: 0.05 * i }}
            />
          </motion.div>
        )
      })}
    </div>
  )
}

export default function CodeVisualizer({ code, question, runId, onRerun, onActiveLine, onVerdict }) {
  const { steps, meta } = useMemo(() => buildSteps(code), [code])
  const [phase, setPhase] = useState('idle')
  const [stepIdx, setStepIdx] = useState(0)
  const consoleRef = useRef(null)

  const total = question.tests.length
  const seed = code.length + meta.loops * 13 + Object.keys({}).length
  const passRatio = meta.hasReturn
    ? Math.min(0.95, 0.55 + ((seed % 30) / 100) + (meta.loops > 0 ? 0.2 : 0))
    : 0.2
  const passed = meta.hasReturn ? Math.max(1, Math.round(total * passRatio)) : 0
  const win = passed / total >= 0.75
  const rank = rankFor(passed / total)

  useEffect(() => {
    setPhase('idle')
    setStepIdx(0)
    if (runId > 0) {
      const t = setTimeout(() => setPhase('running'), 400)
      return () => clearTimeout(t)
    }
  }, [runId])

  useEffect(() => {
    if (phase !== 'running') return
    if (stepIdx >= steps.length) {
      const t = setTimeout(() => setPhase('verdict'), 600)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setStepIdx((i) => i + 1), 380)
    return () => clearTimeout(t)
  }, [phase, stepIdx, steps.length])

  useEffect(() => {
    const line = phase === 'running' && stepIdx < steps.length ? steps[stepIdx].line : -1
    onActiveLine?.(line)
  }, [phase, stepIdx, steps, onActiveLine])

  useEffect(() => {
    if (phase === 'verdict') onVerdict?.()
  }, [phase, onVerdict])

  useEffect(() => {
    consoleRef.current?.scrollTo({ top: consoleRef.current.scrollHeight, behavior: 'smooth' })
  }, [stepIdx])

  const currentStep = steps[Math.min(stepIdx, steps.length - 1)]
  const activeLine = phase === 'running' && currentStep ? currentStep.line : -1
  const vars = (phase === 'running' && currentStep ? currentStep.vars : {}) || {}
  const array = currentStep?.array || question.sampleData

  return (
    <div className="viz-panel">
      <div className="viz-tabs">
        <span className="viz-tab live">Execution</span>
        <span className="viz-step">
          {phase === 'idle' ? 'ready' : phase === 'running' ? `step ${stepIdx}/${steps.length}` : 'complete'}
        </span>
      </div>

      <div className="viz-array">
        <div className="viz-section-title">Data view</div>
        <Bars data={array} />
      </div>

      <div className="viz-vars">
        <div className="viz-section-title">Live variables</div>
        <div className="viz-chip-row">
          <AnimatePresence mode="popLayout">
            {Object.entries(vars).map(([k, v]) => (
              <motion.span
                key={`${k}`}
                className={`viz-chip ${Array.isArray(v) ? 'arr' : typeof v === 'number' ? 'num' : 'str'}`}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              >
                <span className="chip-k">{k}</span>
                <span className="chip-v">{Array.isArray(v) ? `[${v.join(', ')}]` : String(v)}</span>
              </motion.span>
            ))}
          </AnimatePresence>
          {Object.keys(vars).length === 0 && <span className="viz-empty">— no variables yet —</span>}
        </div>
      </div>

      <div ref={consoleRef} className="viz-console">
        <div className="viz-section-title">Console output</div>
        {phase === 'idle' && <p className="muted">Press Run (Ctrl+Enter) to execute your code…</p>}
        {phase === 'running' && (
          <>
            <p className="judge">[judge] executing solution…</p>
            {steps.slice(0, stepIdx).map((s, i) => (
              <motion.p key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="viz-log">
                {s.log}
              </motion.p>
            ))}
            <span className="blink-cursor" />
          </>
        )}
        {phase === 'verdict' && (
          <>
            {steps.map((s, i) => (
              <p key={i} className="viz-log">
                {s.log}
              </p>
            ))}
            <p className="ok">✓ {passed}/{total} tests passed</p>
            {!meta.hasReturn && <p className="fail-txt">✕ no return statement detected</p>}
          </>
        )}
      </div>

      {phase === 'verdict' && (
        <motion.div
          className="viz-verdict"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          {win &&
            Array.from({ length: 24 }).map((_, i) => (
              <motion.span
                key={i}
                className="viz-confetti"
                style={{
                  left: `${(i * 41) % 100}%`,
                  width: 5 + (i % 3) * 2,
                  height: 8 + (i % 4) * 3,
                  background: confettiColors[i % confettiColors.length],
                }}
                initial={{ y: -10, rotate: 0, opacity: 1 }}
                animate={{ y: '140px', rotate: 540, opacity: 0 }}
                transition={{ duration: 1.6 + (i % 4) * 0.25, delay: (i % 8) * 0.08, ease: 'easeIn' }}
              />
            ))}
          <div className="viz-verdict-row">
            <span className={`viz-verdict-title ${win ? 'win' : 'lose'}`}>
              {win ? 'SOLUTION ACCEPTED' : 'TESTS FAILED'}
            </span>
            <span className="viz-rank" style={{ color: rank.color, borderColor: rank.color, boxShadow: `0 0 26px ${rank.color}55` }}>
              {rank.letter}
            </span>
          </div>
          <div className="viz-badges">
            <span className="complexity" style={{ borderColor: `${rank.color}66`, color: rank.color }}>
              {meta.complexity}
            </span>
            <span className="meta-badge">{meta.loops} loop{meta.loops === 1 ? '' : 's'}</span>
            <span className="meta-badge">{meta.fnCount} function{meta.fnCount === 1 ? '' : 's'}</span>
            {meta.recursion && <span className="meta-badge rec">recursion!</span>}
          </div>
          <motion.button className="btn btn-small" onClick={onRerun} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
            ↻ Run again
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}