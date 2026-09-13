import { useRef } from 'react'

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
  // comments: //, #, --
  if (language === 'python') {
    out = out.replace(/(#.*$)/g, (m) => `<span class="tok-cm">${m}</span>`)
  } else if (language === 'cpp' || language === 'java' || language === 'go') {
    out = out.replace(/(\/\/.*$)/g, (m) => `<span class="tok-cm">${m}</span>`)
  } else {
    out = out.replace(/(\/\/.*$|#.*$)/g, (m) => `<span class="tok-cm">${m}</span>`)
  }
  const kwRegex = KW[language] || KW.javascript
  // reset regex lastIndex
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
        />
      </div>
    </div>
  )
}
