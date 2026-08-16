import { useRef } from 'react'

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function highlightLine(line) {
  const strings = []
  let out = escapeHtml(line)
  out = out.replace(/("[^"\n]*"|'[^'\n]*'|`[^`\n]*`)/g, (m) => {
    strings.push(m)
    return `\u0000${strings.length - 1}\u0000`
  })
  out = out.replace(/(\/\/.*$|#.*$)/g, (m) => `<span class="tok-cm">${m}</span>`)
  out = out.replace(
    /\b(const|let|var|function|return|if|else|for|while|import|from|def|print|new|true|false|null|of|in|break|continue|Math)\b/g,
    (m) => `<span class="tok-kw">${m}</span>`
  )
  out = out.replace(/\b(\d+(?:\.\d+)?)\b/g, (m) => `<span class="tok-num">${m}</span>`)
  out = out.replace(
    /\b([A-Za-z_$][\w$]*)(?=\s*\()/g,
    (m) => `<span class="tok-fn">${m}</span>`
  )
  out = out.replace(/\u0000(\d+)\u0000/g, (_, i) => `<span class="tok-st">${strings[i]}</span>`)
  return out
}

export default function CodeEditor({ value, onChange, onRun, activeLine }) {
  const preRef = useRef()
  const taRef = useRef()
  const lines = value.split('\n')

  const syncScroll = () => {
    preRef.current.scrollTop = taRef.current.scrollTop
    preRef.current.scrollLeft = taRef.current.scrollLeft
  }

  const handleKey = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = taRef.current
      ta.setRangeText('  ', ta.selectionStart, ta.selectionEnd, 'end')
      onChange(ta.value)
    }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      onRun()
    }
  }

  return (
    <div className="editor-wrap">
      <div className="editor-gutter">
        {lines.map((_, i) => (
          <div key={i} className={`gutter-line ${i === activeLine ? 'active' : ''}`}>
            {i + 1}
          </div>
        ))}
      </div>
      <div className="editor-body">
        <pre ref={preRef} className="editor-highlight" aria-hidden="true">
          {lines.map((l, i) => (
            <div
              key={i}
              className={`hl-line ${i === activeLine ? 'active' : ''}`}
              dangerouslySetInnerHTML={{ __html: highlightLine(l) || ' ' }}
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
        />
      </div>
    </div>
  )
}