import { useRef, useEffect, useCallback } from 'react'

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const KW = {
  javascript: /\b(const|let|var|function|return|if|else|for|while|import|from|new|true|false|null|of|in|break|continue|class|extends|async|await|try|catch|throw)\b/g,
  typescript: /\b(const|let|var|function|return|if|else|for|while|import|from|new|true|false|null|of|in|break|continue|class|extends|async|await|try|catch|throw|interface|type|implements|public|private|protected|string|number|boolean|any|void)\b/g,
  python: /\b(def|return|if|elif|else|for|while|in|import|from|class|pass|True|False|None|and|or|not|break|continue|with|as|try|except|lambda|self)\b/g,
  java: /\b(public|private|protected|class|return|if|else|for|while|import|new|true|false|null|static|void|int|String|extends|implements|package|break|continue|this)\b/g,
  cpp: /\b(public|private|protected|class|return|if|else|for|while|include|using|namespace|std|vector|int|string|auto|true|false|NULL|break|continue|template|typename)\b/g,
  go: /\b(func|return|if|else|for|range|import|package|var|const|type|struct|true|false|nil|break|continue|go|defer|map|chan)\b/g,
}

export function highlightLine(line, language = 'javascript') {
  if (line === '') return ''
  const strings = []
  const comments = []
  let out = escapeHtml(line)
  // 1. strings -> placeholder private use U+E000 + idx (single char, not matched by later regex)
  out = out.replace(/("[^"\n]*"|'[^'\n]*'|`[^`\n]*`)/g, (m) => {
    const ph = String.fromCharCode(0xe000 + strings.length)
    strings.push(m)
    return ph
  })
  // 2. comments -> placeholder U+E100 + idx
  if (language === 'python') {
    out = out.replace(/(#.*$)/g, (m) => {
      const ph = String.fromCharCode(0xe100 + comments.length)
      comments.push(m)
      return ph
    })
  } else if (language === 'cpp' || language === 'java' || language === 'go') {
    out = out.replace(/(\/\/.*$)/g, (m) => {
      const ph = String.fromCharCode(0xe100 + comments.length)
      comments.push(m)
      return ph
    })
  } else {
    out = out.replace(/(\/\/.*$|#.*$)/g, (m) => {
      const ph = String.fromCharCode(0xe100 + comments.length)
      comments.push(m)
      return ph
    })
  }
  const kwRegex = KW[language] || KW.javascript
  kwRegex.lastIndex = 0
  out = out.replace(kwRegex, (m) => `<span class="tok-kw">${m}</span>`)
  out = out.replace(/\b(\d+(?:\.\d+)?)\b/g, (m) => `<span class="tok-num">${m}</span>`)
  out = out.replace(
    /\b([A-Za-z_$][\w$]*)(?=\s*\()/g,
    (m) => `<span class="tok-fn">${m}</span>`
  )
  // restore strings and comments (private use chars)
  out = out.replace(/[\ue000-\ue0ff]/g, (ch) => {
    const idx = ch.charCodeAt(0) - 0xe000
    if (idx >= 0 && idx < strings.length) return `<span class="tok-st">${strings[idx]}</span>`
    return ch
  })
  out = out.replace(/[\ue100-\ue1ff]/g, (ch) => {
    const idx = ch.charCodeAt(0) - 0xe100
    if (idx >= 0 && idx < comments.length) return `<span class="tok-cm">${comments[idx]}</span>`
    return ch
  })
  return out
}

export default function CodeEditor({ value, onChange, onRun, activeLine, language = 'javascript' }) {
  const preRef = useRef(null)
  const taRef = useRef(null)
  const gutterRef = useRef(null)
  const lines = value.split('\n')

  const syncScroll = useCallback(() => {
    const ta = taRef.current
    const pre = preRef.current
    const gutter = gutterRef.current
    if (!ta || !pre) return
    // sync highlight and gutter with textarea scroll — both axes
    pre.scrollTop = ta.scrollTop
    pre.scrollLeft = ta.scrollLeft
    if (gutter) gutter.scrollTop = ta.scrollTop
  }, [])

  // keep scroll in sync after value changes (e.g., reset, tab)
  useEffect(() => {
    syncScroll()
  }, [value, syncScroll])

  // ensure textarea and highlight have identical metrics on mount + on language/font load
  useEffect(() => {
    const ta = taRef.current
    const pre = preRef.current
    if (!ta || !pre) return
    const syncMetrics = () => {
      const cs = getComputedStyle(ta)
      // copy all metrics that affect glyph placement so caret aligns with highlight
      pre.style.fontFamily = cs.fontFamily
      pre.style.fontSize = cs.fontSize
      pre.style.lineHeight = cs.lineHeight
      pre.style.letterSpacing = cs.letterSpacing
      pre.style.wordSpacing = cs.wordSpacing
      pre.style.fontWeight = cs.fontWeight
      pre.style.tabSize = cs.tabSize
      pre.style.padding = cs.padding
    }
    syncMetrics()
    // also after fonts load (JetBrains Mono may load late)
    if (document.fonts?.ready) {
      document.fonts.ready.then(syncMetrics)
    }
    const ro = new ResizeObserver(syncMetrics)
    ro.observe(ta)
    return () => ro.disconnect()
  }, [])

  const handleKey = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = taRef.current
      if (!ta) return
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const insert = '  '
      // For selected text, indent each line
      if (start !== end) {
        const before = ta.value.slice(0, start)
        const selected = ta.value.slice(start, end)
        const after = ta.value.slice(end)
        const linesSel = selected.split('\n')
        const indented = linesSel.map((l) => insert + l).join('\n')
        const next = before + indented + after
        onChange(next)
        requestAnimationFrame(() => {
          if (!taRef.current) return
          taRef.current.selectionStart = start + insert.length
          taRef.current.selectionEnd = end + insert.length * linesSel.length
          taRef.current.focus()
          syncScroll()
        })
      } else {
        const before = ta.value.slice(0, start)
        const after = ta.value.slice(start)
        const next = before + insert + after
        onChange(next)
        requestAnimationFrame(() => {
          if (!taRef.current) return
          const pos = start + insert.length
          taRef.current.selectionStart = taRef.current.selectionEnd = pos
          taRef.current.focus()
          syncScroll()
        })
      }
    }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      onRun?.()
    }
  }

  const focusEditor = () => {
    taRef.current?.focus()
  }

  // also handle click on gutter to focus and set cursor
  const handleGutterClick = (idx) => {
    const ta = taRef.current
    if (!ta) return
    const linesUpTo = value.split('\n').slice(0, idx).join('\n').length + (idx > 0 ? 1 : 0)
    ta.focus()
    ta.setSelectionRange(linesUpTo, linesUpTo)
    // ensure caret is visible and highlight follows
    requestAnimationFrame(() => {
      syncScroll()
      // scroll caret into view if line is outside viewport
      const lineHeight = parseFloat(getComputedStyle(ta).lineHeight) || 21
      const targetTop = idx * lineHeight
      if (ta.scrollTop > targetTop || ta.scrollTop + ta.clientHeight < targetTop + lineHeight) {
        ta.scrollTop = Math.max(0, targetTop - ta.clientHeight / 2)
        syncScroll()
      }
    })
  }

  return (
    <div className="editor-wrap" onClick={focusEditor}>
      <div ref={gutterRef} className="editor-gutter" aria-hidden="true" onClick={focusEditor}>
        {lines.map((_, i) => (
          <div
            key={i}
            className={`gutter-line ${i === activeLine ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              handleGutterClick(i)
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>
      <div className="editor-body" onClick={focusEditor}>
        <pre ref={preRef} className="editor-highlight" aria-hidden="true">
          {lines.map((l, i) => (
            <div
              key={i}
              className={`hl-line ${i === activeLine ? 'active' : ''}`}
              dangerouslySetInnerHTML={{ __html: highlightLine(l, language) || '<span style="opacity:0">·</span>' }}
            />
          ))}
        </pre>
        <textarea
          ref={taRef}
          className="editor-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          onKeyDown={handleKey}
          onKeyUp={syncScroll}
          onSelect={syncScroll}
          onClick={syncScroll}
          onInput={syncScroll}
          onFocus={syncScroll}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          wrap="off"
          autoFocus
          aria-label="Code editor"
          placeholder="// start typing your solution..."
        />
      </div>
    </div>
  )
}
