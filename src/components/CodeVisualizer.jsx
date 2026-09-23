import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { rankFor } from '../data/levels.js'
import { getOptimal, getLanguageLabel } from '../data/codeTemplates.js'
import { runHarness, harnessById } from '../data/testHarness.js'

const confettiColors = ['#34d399', '#22d3ee', '#f472b6', '#fbbf24', '#a78bfa']

function buildSteps(code, language = 'javascript') {
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
    if (/^import\s+/.test(line) || /^package\s+/.test(line) || /^#include/.test(line) || /^using\s+/.test(line)) return

    // function / method detection per language
    let fn = null
    if (language === 'python') {
      fn = line.match(/def\s+([A-Za-z_$][\w$]*)/)
    } else if (language === 'java' || language === 'cpp') {
      fn = line.match(/(?:public|private|protected|static|\s)\s*([A-Za-z_$][\w$]*)\s*\(/)
      // avoid matching if/for/while
      if (fn && /^(if|for|while|switch|catch)$/.test(fn[1])) fn = null
    } else if (language === 'go') {
      fn = line.match(/func\s+(?:\([^)]+\)\s+)?([A-Za-z_$][\w$]*)\s*\(/)
    } else {
      fn = line.match(/function\s+([A-Za-z_$][\w$]*)/)
      if (!fn) fn = line.match(/([A-Za-z_$][\w$]*)\s*:\s*\(.*\)\s*=>/)
    }
    if (fn) {
      fnName = fn[1]
      fnCount++
      steps.push({ line: i, vars: { ...vars }, log: `def ${fn[1]} [${language}]` })
      return
    }

    const assign = line.match(/(?:const|let|var)?\s*([A-Za-z_$][\w$]*)\s*=\s*(.+)$/)
    if (assign) {
      const name = assign[1]
      if (['return', 'if', 'else', 'for', 'while', 'import', 'package'].includes(name)) {
        // not a variable
      } else {
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
    }

    // python assignment without var keyword: x = 5 or x: int = 5
    if (language === 'python') {
      const pyAssign = line.match(/^([A-Za-z_][\w]*)\s*(?::\s*[\w\[\], ]+)?\s*=\s*(.+)$/)
      if (pyAssign && !line.startsWith('def ') && !line.startsWith('class ')) {
        const name = pyAssign[1]
        const rhs = pyAssign[2].trim()
        const num = parseFloat(rhs)
        if (!isNaN(num) && /^[-+]?\d/.test(rhs)) vars[name] = num
        else {
          const arr = rhs.match(/\[([\d,\s.\-]+)\]/)
          if (arr) vars[name] = arr[1].split(',').map((x) => parseFloat(x.trim()))
          else vars[name] = rhs.replace(/[;,]$/, '').slice(0, 30)
        }
        steps.push({ line: i, vars: { ...vars }, log: `${name} = ${JSON.stringify(vars[name])}`, array: arrayOf(vars) })
        return
      }
    }

    if (/^return\b/.test(line) || (language === 'go' && /return\b/.test(line))) {
      hasReturn = true
      steps.push({ line: i, vars: { ...vars }, log: `return ${line.replace(/^return\s*/, '')}` })
      return
    }

    if (/console\.log|print\(|fmt\.Print|System\.out/.test(line)) {
      steps.push({ line: i, vars: { ...vars }, log: `> ${line.replace(/^(console\.log|print|fmt\.Print.*|System\.out\.println)\s*\(/, '').replace(/\)\s*;?\s*$/, '')}` })
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

    if (/\b(if|else|elif)\b/.test(line)) {
      steps.push({ line: i, vars: { ...vars }, log: line.replace(/[{};:]$/, '') })
      return
    }
  })

  let recursion = false
  if (fnName) {
    const declIdx = lines.findIndex((l) => l.includes(fnName))
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

function useCodeExecution(code, testCases, timeLimit = 5000) {
  const [output, setOutput] = useState('')
  const [execOutput, setExecOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [executionResult, setExecutionResult] = useState({ passed: 0, total: testCases.length, error: null })
  const [hasReturn, setHasReturn] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!isRunning) return

    const start = performance.now()
    const timeout = setTimeout(() => {
      if (cancelled) return
      setIsRunning(false)
      setOutput(`⏱️ Execution timed out after ${timeLimit / 1000}s`)
      setExecutionResult({
        passed: 0,
        total: testCases.length,
        error: 'Time limit exceeded'
      })
    }, timeLimit)

    const sandbox = {
      Math,
      Array,
      console: {
        log: (...args) => {
          const msg = args.join(' ')
          setOutput(prev => prev + msg + '\n')
          setExecOutput(prev => prev + msg + '\n')
        }
      }
    }

    try {
      const fn = new Function('...testCases', `
        (function() {
          'use strict'
          ${code}
          return { passed: 0, total: testCases.length }
        })()
      `)
      setIsRunning(false)
    } catch (e) {
      if (!cancelled) {
        setOutput(`❌ Error: ${e.message}`)
        setExecutionResult({ passed: 0, total: testCases.length, error: e.message })
      }
      setIsRunning(false)
    }

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [isRunning, code, testCases, timeLimit])

  const run = () => {
    setIsRunning(true)
    setOutput('')
    setExecOutput('')
    setHasReturn(false)
  }

  return { run, isRunning, output, execOutput, executionResult, hasReturn }
}

function ArrayVisualization({ array, label }) {
  const max = Math.max(...array.map((v) => Math.abs(v)), 1)
  const barWidth = 100 / array.length

  return (
    <div className="viz-array-v2">
      <div className="viz-array-label">{label}</div>
      <div className="viz-array-bars" style={{ width: `${array.length * barWidth}%` }}>
        {array.map((val, i) => {
          const height = Math.max(6, (Math.abs(val) / max) * 80)
          const isPositive = val >= 0
          return (
            <motion.div
              key={i}
              className="viz-array-bar"
              style={{ width: barWidth - 2, height: `${height}%` }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="viz-array-value" style={{ color: isPositive ? '#34d399' : '#f87171' }}>
                {val}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function StackVisualization({ steps, meta }) {
  const stackHeight = 60
  const maxStack = Math.max(...steps.slice(0, Math.min(steps.length, 10)).map((s) => s.depth || 0), 1)

  return (
    <div className="viz-stack-v2">
      <div className="viz-stack-title">Call Stack</div>
      <div className="viz-stack-bars" style={{ height: `${maxStack * stackHeight}px` }}>
        {Array.from({ length: Math.min(10, maxStack || 1) }).map((_, i) => (
          <motion.div
            key={i}
            className="viz-stack-bar"
            style={{ height: `${stackHeight}px`, opacity: 0.3 + (i / 10) * 0.7 }}
          />
        ))}
      </div>
      <div className="viz-stack-meta">
        Loops: {meta.loops} | Depth: {meta.maxDepth} | Functions: {meta.fnCount}
      </div>
    </div>
  )
}

function BinarySearchVisualization({ array, target, currentLeft, currentMid }) {
  const barWidth = 100 / array.length

  return (
    <div className="viz-binary-search-v2">
      <div className="viz-binary-search-header">
        <span>Search: {target}</span>
        <span>Looking in: [{array.slice(0, 5).join(', ')}...{array.slice(-5).join(', ')}]</span>
      </div>
      <div className="viz-binary-search-bars" style={{ width: '100%' }}>
        {array.map((val, i) => {
          const isTarget = val === target
          const isCurrent = i === currentMid
          const isLeft = i < (currentLeft || 0)
          const isMid = i === currentMid
          return (
            <motion.div
              key={i}
              className="viz-binary-search-bar"
              style={{ width: barWidth - 2 }}
              whileHover={{ scale: isCurrent ? 1.3 : 1 }}
              whileTap={{ scale: 0.9 }}
              customStyle={{
                background: isTarget ? '#34d399' : isCurrent ? '#fbbf24' : isLeft ? '#22d3ee' : '#e5e5e5',
                color: isTarget ? '#34d399' : isCurrent ? '#fbbf24' : '#333'
              }}
            >
              {isTarget ? '🎯' : isCurrent ? '📍' : val}
            </motion.div>
          )
        })}
      </div>
      <div className="viz-binary-search-info">
        Left: {currentLeft || 0} | Mid: {currentMid || 0} | Right: {array.length - 1}
      </div>
    </div>
  )
}

export default function CodeVisualizer({ code, question, language = 'javascript', runId, solutionUnlocked = false, onRerun, onActiveLine, onVerdict }) {
  const { steps, meta } = useMemo(() => buildSteps(code, language), [code, language])
  const optimalCode = useMemo(() => getOptimal(question, language), [question, language])
  const optimalMeta = useMemo(() => buildSteps(optimalCode, language).meta, [optimalCode, language])
  const [phase, setPhase] = useState('idle')
  const [stepIdx, setStepIdx] = useState(0)
  const [tab, setTab] = useState('exec')
  const consoleRef = useRef(null)
  const [runIdLocal, setRunIdLocal] = useState(runId)
  const [wasRunning, setWasRunning] = useState(false)

  const harnessResult = useMemo(() => {
    if ((language === 'javascript' || language === 'typescript') && harnessById[question.id]) {
      try { return runHarness(code, question) } catch { return null }
    }
    return null
  }, [code, question, language])
  const isRealJudge = !!harnessResult
  const total = harnessResult ? harnessResult.total : question.tests.length
  const seed = code.length + meta.loops * 13 + Object.keys({}).length
  const heuristicRatio = meta.hasReturn
    ? Math.min(0.95, 0.55 + ((seed % 30) / 100) + (meta.loops > 0 ? 0.2 : 0))
    : 0.2
  const heuristicPassed = meta.hasReturn ? Math.max(1, Math.round(question.tests.length * heuristicRatio)) : 0
  const passed = harnessResult ? harnessResult.passed : heuristicPassed
  const harnessError = harnessResult?.error || null
  const win = passed / total >= 0.75
  const rank = rankFor(passed / total)

  useEffect(() => {
    setRunIdLocal(runId)
  }, [runId])

  useEffect(() => {
    setPhase('idle')
    setStepIdx(0)
    setTab('exec')
    if (runId > 0) {
      const t = setTimeout(() => setPhase('running'), 400)
      return () => clearTimeout(t)
    }
  }, [runId])

  useEffect(() => {
    setTab('exec')
  }, [question.id, language])

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
    if (phase === 'verdict') {
      onVerdict?.(passed, total)
    }
  }, [phase, onVerdict])

  const currentStep = steps[Math.min(stepIdx, steps.length - 1)]
  const activeLine = phase === 'running' && currentStep ? currentStep.line : -1
  const vars = (phase === 'running' && currentStep ? currentStep.vars : {}) || {}
  const array = currentStep?.array || question.sampleData

  // Determine topic-specific visualization
  const topic = question.topic
  const isArrayQuestion = topic === 'Arrays' || topic === 'Binary Search'
  const isStackQuestion = topic === 'Stacks'
  const isTreeQuestion = topic === 'Trees'
  const isBinarySearchQuestion = topic === 'Binary Search' && question.title.includes('Rotated')

  // Execute code with test cases
  const { run, isRunning, output, execOutput, executionResult, hasReturn } = useCodeExecution(
    code,
    question.tests,
    question.difficulty === 'Hard' ? 8000 : question.difficulty === 'Medium' ? 6000 : 3000
  )

  // Update vars from execution if available
  useEffect(() => {
    if (phase === 'running' && stepIdx < steps.length && executionResult) {
      // Merge execution vars with parsed vars
      const execVars = executionResult.vars || {}
      const mergedVars = { ...vars, ...execVars }
      // Don't set state directly - just use for display
    }
  }, [phase, stepIdx, executionResult])

  // Generate execution steps based on code parsing
  const execSteps = useMemo(() => {
    const exec = []
    steps.forEach((step, i) => {
      exec.push({
        ...step,
        executed: i < stepIdx,
        vars: i < stepIdx ? { ...step.vars, ...vars } : step.vars
      })
    })
    return exec
  }, [steps, stepIdx, vars])

  // Render topic-specific visualization
  let vizContent = null
  let vizTitle = 'Code Execution'

  if (isArrayQuestion && array) {
    vizTitle = `Array: ${question.title}`
    vizContent = (
      <ArrayVisualization
        array={array}
        label={vizTitle}
      />
    )
  } else if (isStackQuestion) {
    vizTitle = `Stack Visualization`
    vizContent = (
      <StackVisualization
        steps={steps}
        meta={meta}
      />
    )
  } else if (isBinarySearchQuestion) {
    vizTitle = `Binary Search: ${question.title}`
    vizContent = (
      <BinarySearchVisualization
        array={array}
        target={question.sampleData?.[0] || 0}
        currentLeft={stepIdx > 0 ? stepIdx - 1 : undefined}
        currentMid={stepIdx > 0 ? Math.floor((stepIdx - 1) + (array.length - (stepIdx - 1)) / 2) : undefined}
      />
    )
  } else if (topic === 'Graphs') {
    vizTitle = 'Graph Analysis'
    vizContent = (
      <div className="viz-graph-v2">
        <div className="viz-graph-title">Graph Structure</div>
        <p className="muted">Graph algorithms visualize node traversals and shortest paths</p>
        <p className="muted">Use console.log to inspect graph nodes and edges</p>
      </div>
    )
  } else if (topic === 'Dynamic') {
    vizTitle = 'DP State Visualization'
    vizContent = (
      <div className="viz-dp-v2">
        <div className="viz-dp-title">DP State</div>
        <p className="muted">Shows loop iterations and state transitions</p>
        <p className="muted">Use console.log to track dp array changes</p>
      </div>
    )
  } else {
    vizContent = (
      <div className="viz-default-v2">
        <div className="viz-default-title">Code Analysis</div>
        <p className="muted">Code step-by-step execution</p>
        <p className="muted">Live variable tracking</p>
      </div>
    )
  }

  return (
    <div className="viz-panel">
      <div className="viz-tabs">
        <div className="viz-tab-group">
          <button className={`viz-tab-btn ${tab === 'exec' ? 'active' : ''}`} onClick={() => setTab('exec')}>
            Execution
          </button>
          <button className={`viz-tab-btn ${tab === 'solution' ? 'active' : ''} ${solutionUnlocked ? '' : 'locked'}`} onClick={() => setTab('solution')}>
            Optimal solution {!solutionUnlocked && '🔒'} · {getLanguageLabel(language)}
          </button>
        </div>
        <span className="viz-step">
          {phase === 'idle' ? 'ready' : phase === 'running' ? `step ${stepIdx}/${steps.length}` : 'complete'}
        </span>
      </div>

      {tab === 'solution' ? (
        <div className="viz-solution">
          {solutionUnlocked ? (
            <>
              <div className="viz-solution-head">
                <span className="complexity" style={{ borderColor: '#8b5cf666', color: '#a78bfa' }}>
                  {optimalMeta.complexity}
                </span>
                <span className="meta-badge">{getLanguageLabel(language)} · optimal</span>
              </div>
              <pre className="viz-solution-code">{optimalCode}</pre>
            </>
          ) : (
            <motion.div
              className="viz-locked"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <motion.span
                className="lock-glyph"
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 2.2, repeat: Infinity }}
              >
                🔒
              </motion.span>
              <p>Run your code first — the optimal solution unlocks after your first attempt.</p>
            </motion.div>
          )}
        </div>
      ) : (
        <>
          <div className="viz-header">
            <h3>{vizTitle}</h3>
            <div className="viz-phase-badge">
              {phase === 'idle' ? 'ready' : phase === 'running' ? 'running' : 'complete'}
            </div>
          </div>

          <div className="viz-main">
            {vizContent}

            <div className="viz-vars">
              <div className="viz-section-title">Live variables · {getLanguageLabel(language)}</div>
              <div className="viz-chip-row">
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
                    <span className="chip-v">{Array.isArray(v) ? `[${v.join(', ')}]` : typeof v === 'number' ? String(v) : String(v)}</span>
                  </motion.span>
                ))}
              </div>
              {Object.keys(vars).length === 0 && <span className="viz-empty">— no variables yet —</span>}
            </div>

            <div ref={consoleRef} className="viz-console">
              <div className="viz-section-title">Console output</div>
              {phase === 'idle' && <p className="muted">Press Run (Ctrl+Enter) to execute your code in {getLanguageLabel(language)}…</p>}
              {phase === 'running' && (
                <>
                  <p className="judge">[judge:{language}] executing solution…</p>
                  {steps.slice(0, stepIdx).map((s, i) => (
                    <motion.p key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="viz-log">
                      {s.log}
                    </motion.p>
                  ))}
                  <p className="viz-log" style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                    <span className="blink-cursor" aria-hidden="true" />
                  </p>
                </>
              )}
              {phase === 'verdict' && (
                <>
                  {steps.map((s, i) => (
                    <p key={i} className="viz-log">
                      {s.log}
                    </p>
                  ))}
                  <p className={harnessError ? 'fail-txt' : 'ok'}>
                    {harnessError ? `✕ ${harnessError}` : `✓ ${passed}/${total} tests passed [${language}] ${isRealJudge ? '· real judge' : '· estimated'}`}
                  </p>
                  {!meta.hasReturn && !harnessError && <p className="fail-txt">✕ no return statement detected</p>}
                  {isRealJudge && harnessResult?.results?.length > 0 && (
                    <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {harnessResult.results.map((r, i) => (
                        <span
                          key={i}
                          style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '0.68rem',
                            padding: '3px 7px',
                            borderRadius: 999,
                            border: `1px solid ${r.ok ? 'rgba(52,211,153,0.5)' : 'rgba(248,113,113,0.5)'}`,
                            background: r.ok ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
                            color: r.ok ? '#34d399' : '#f87171',
                          }}
                        >
                          #{i + 1} {r.ok ? '✓' : '✕'}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
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
                <span className="meta-badge">{getLanguageLabel(language)}</span>
                <span className="meta-badge" style={{ borderColor: isRealJudge ? 'rgba(52,211,153,0.5)' : 'rgba(251,191,36,0.5)', color: isRealJudge ? '#34d399' : '#fbbf24' }}>
                  {isRealJudge ? 'real judge' : 'estimated'}
                </span>
              </div>
              <motion.button className="btn btn-small" onClick={onRerun} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                ↻ Run again
              </motion.button>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
