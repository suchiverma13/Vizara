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
  const strings = []
  let out = escapeHtml(line)
  out = out.replace(/("[^"\n]*"|'[^'\n]*'|`[^`\n]*`)/g, (m) => {
    strings.push(m)
    return `\u0000${strings.length - 1}\u0000`
  })
  if (language === 'python') {
    out = out.replace(/(#.*$)/g, (m) => `<span class="tok-cm">${m}</span>`)
  } else if (language === 'cpp' || language === 'java' || language === 'go') {
    out = out.replace(/(\/\/.*$)/g, (m) => `<span class="tok-cm">${m}</span>`)
  } else {
    out = out.replace(/(\/\/.*$|#.*$)/g, (m) => `<span class="tok-cm">${m}</span>`)
  }
  const kwRegex = KW[language] || KW.javascript
  kwRegex.lastIndex = 0
  out = out.replace(kwRegex, (m) => `<span class="tok-kw">${m}</span>`)
  out = out.replace(/\b(\d+(?:\.\d+)?)\b/g, (m) => `<span class="tok-num">${m}</span>`)
  out = out.replace(
    /\b([A-Za-z_$][\w$]*)(?=\s*\()/g,
    (m) => `<span class="tok-fn">${m}</span>`
  )
  out = out.replace(/\u0000(\d+)\u0000/g, (_, i) => `<span class="tok-st">${strings[i]}</span>`)
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
    pre.scrollTop = ta.scrollTop
    pre.scrollLeft = ta.scrollLeft
    if (gutter) gutter.scrollTop = ta.scrollTop
  }, [])

  useEffect(() => {
    // keep highlight in sync after value changes (e.g., programmatic)
    syncScroll()
  }, [value, syncScroll])

  const handleKey = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = taRef.current
      if (!ta) return
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const before = ta.value.slice(0, start)
      const after = ta.value.slice(end)
      const insert = '  '
      const next = before + insert + after
      // update value via onChange
      onChange(next)
      // restore cursor after React updates
      requestAnimationFrame(() => {
        if (!taRef.current) return
        taRef.current.selectionStart = taRef.current.selectionEnd = start + insert.length
        taRef.current.focus()
        syncScroll()
      })
    }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      onRun?.()
    }
  }

  const focusEditor = () => taRef.current?.focus()

  return (
    <div className="editor-wrap" onClick={focusEditor}>
      <div ref={gutterRef} className="editor-gutter" aria-hidden="true">
        {lines.map((_, i) => (
          <div key={i} className={`gutter-line ${i === activeLine ? 'active' : ''}`}>
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
              dangerouslySetInnerHTML={{ __html: highlightLine(l, language) || ' ' }}
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
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          wrap="off"
          autoFocus
          aria-label="Code editor"
          placeholder="// start typing..."
        />
      </div>
    </div>
  )
}
