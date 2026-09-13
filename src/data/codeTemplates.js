export const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', ext: 'js', color: '#f7df1e' },
  { id: 'python', label: 'Python', ext: 'py', color: '#3776ab' },
  { id: 'java', label: 'Java', ext: 'java', color: '#ed8b00' },
  { id: 'cpp', label: 'C++', ext: 'cpp', color: '#00599c' },
  { id: 'go', label: 'Go', ext: 'go', color: '#00add8' },
  { id: 'typescript', label: 'TypeScript', ext: 'ts', color: '#3178c6' },
]

export const LANGUAGE_IDS = LANGUAGES.map((l) => l.id)

const LANG_LABEL = Object.fromEntries(LANGUAGES.map((l) => [l.id, l.label]))
export const getLanguageLabel = (id) => LANG_LABEL[id] || id

// parse JS starter to extract function name and params
function parseStarter(jsStarter) {
  const m = jsStarter.match(/function\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)/)
  if (m) return { name: m[1], params: m[2].trim(), isFunction: true }
  const m2 = jsStarter.match(/function\s+([A-Za-z_$][\w$]*)\s*\(/)
  if (m2) return { name: m2[1], params: '', isFunction: true }
  // class-like MinStack
  if (/MinStack/.test(jsStarter)) return { name: 'MinStack', params: '', isClass: true }
  return { name: 'solution', params: '', isFunction: true }
}

// helpers to map JS param names to typed params for Java/C++/Go/TS
function javaTypeFor(param) {
  const p = param.trim()
  if (!p) return ''
  if (/nums|prices|height|heights|temps|coins|strs|heights/.test(p)) return `int[] ${p}`
  if (/grid|board/.test(p)) return `char[][] ${p}`
  if (/edges|prerequisites/.test(p)) return `int[][] ${p}`
  if (/^(target|amount|n|start|k|numCourses)$/.test(p) || /^(target|amount)$/.test(p)) return `int ${p}`
  if (/\b(target|amount)\b/.test(p)) return `int ${p}`
  if (/^n$/.test(p) || p === 'start' || p === 'k') return `int ${p}`
  if (/target/.test(p)) return `int ${p}`
  if (/node|root/.test(p)) return `TreeNode ${p}`
  if (/nums1|nums2/.test(p)) return `int[] ${p}`
  if (/s$|text|word/.test(p) && p.length <= 5) return `String ${p}`
  if (/^t$/.test(p)) return `String ${p}`
  return `int ${p}`
}

function cppTypeFor(param) {
  const p = param.trim()
  if (!p) return ''
  if (/nums|prices|height|heights|temps|coins|strs/.test(p)) return `vector<int>& ${p}`
  if (/nums1|nums2/.test(p)) return `vector<int>& ${p}`
  if (/grid|board/.test(p)) return `vector<vector<char>>& ${p}`
  if (/edges|prerequisites/.test(p)) return `vector<vector<int>>& ${p}`
  if (/target|amount/.test(p)) return `int ${p}`
  if (/^n$/.test(p) || p === 'start' || p === 'k') return `int ${p}`
  if (/node|root/.test(p)) return `TreeNode* ${p}`
  if (/s$|text|word/.test(p) && p.length <= 5) return `string ${p}`
  if (/^t$/.test(p)) return `string ${p}`
  return `auto ${p}`
}

function goTypeFor(param) {
  const p = param.trim()
  if (!p) return ''
  if (/nums|prices|height|heights|temps|coins|strs|nums1|nums2/.test(p)) return `${p} []int`
  if (/grid|board/.test(p)) return `${p} [][]byte`
  if (/edges|prerequisites/.test(p)) return `${p} [][]int`
  if (/target|amount/.test(p)) return `${p} int`
  if (/^n$/.test(p) || p === 'start' || p === 'k') return `${p} int`
  if (/node|root/.test(p)) return `${p} *TreeNode`
  if (/s$|text|word/.test(p) && p.length <= 5) return `${p} string`
  if (/^t$/.test(p)) return `${p} string`
  return `${p} int`
}

function tsTypeFor(param) {
  const p = param.trim()
  if (!p) return ''
  if (/nums|prices|height|heights|temps|coins|strs|nums1|nums2/.test(p)) return `${p}: number[]`
  if (/grid|board/.test(p)) return `${p}: string[][]`
  if (/edges|prerequisites/.test(p)) return `${p}: number[][]`
  if (/target|amount/.test(p)) return `${p}: number`
  if (/^n$/.test(p) || p === 'start' || p === 'k') return `${p}: number`
  if (/node|root/.test(p)) return `${p}: TreeNode | null`
  if (/^s$/.test(p) || /^t$/.test(p)) return `${p}: string`
  if (/text|word/.test(p) || (p.endsWith('s') && p.length <= 5)) return `${p}: string`
  return `${p}: any`
}

function toJavaParams(params) {
  if (!params) return ''
  return params.split(',').map((p) => javaTypeFor(p.trim())).join(', ')
}
function toCppParams(params) {
  if (!params) return ''
  return params.split(',').map((p) => cppTypeFor(p.trim())).join(', ')
}
function toGoParams(params) {
  if (!params) return ''
  return params.split(',').map((p) => goTypeFor(p.trim())).join(', ')
}
function toTsParams(params) {
  if (!params) return ''
  return params.split(',').map((p) => tsTypeFor(p.trim())).join(', ')
}

// explicit starters for edge cases like MinStack
const SPECIAL_STARTERS = {
  q23: {
    javascript: `function MinStack() {
  // write your solution here
}

MinStack.prototype.push = function (val) {
  
}

MinStack.prototype.pop = function () {
  
}

MinStack.prototype.top = function () {
  
}

MinStack.prototype.getMin = function () {
  
}`,
    python: `class MinStack:
    def __init__(self):
        # write your solution here
        pass

    def push(self, val: int) -> None:
        pass

    def pop(self) -> None:
        pass

    def top(self) -> int:
        pass

    def getMin(self) -> int:
        pass`,
    java: `class MinStack {
    public MinStack() {
        // write your solution here
    }
    public void push(int val) {
        
    }
    public void pop() {
        
    }
    public int top() {
        return 0;
    }
    public int getMin() {
        return 0;
    }
}`,
    cpp: `class MinStack {
public:
    MinStack() {
        // write your solution here
    }
    void push(int val) {
        
    }
    void pop() {
        
    }
    int top() {
        return 0;
    }
    int getMin() {
        return 0;
    }
};`,
    go: `type MinStack struct {}

func Constructor() MinStack {
    // write your solution here
    return MinStack{}
}

func (s *MinStack) Push(val int)  {}
func (s *MinStack) Pop()          {}
func (s *MinStack) Top() int      { return 0 }
func (s *MinStack) GetMin() int   { return 0 }`,
    typescript: `class MinStack {
    constructor() {
        // write your solution here
    }
    push(val: number): void {
        
    }
    pop(): void {
        
    }
    top(): number {
        return 0
    }
    getMin(): number {
        return 0
    }
}`,
  },
}

export function getStarter(question, lang) {
  if (SPECIAL_STARTERS[question.id] && SPECIAL_STARTERS[question.id][lang]) {
    return SPECIAL_STARTERS[question.id][lang]
  }
  const { name, params } = parseStarter(question.starter || '')
  switch (lang) {
    case 'python':
      return `def ${name}(${params}):
    # write your solution here
    pass`
    case 'java':
      return `class Solution {
    public Object ${name}(${toJavaParams(params)}) {
        // write your solution here
        return null;
    }
}`
    case 'cpp':
      return `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    auto ${name}(${toCppParams(params)}) {
        // write your solution here
        return 0;
    }
};`
    case 'go':
      return `package main

func ${name}(${toGoParams(params)}) int {
    // write your solution here
    return 0
}`
    case 'typescript':
      return `function ${name}(${toTsParams(params)}): any {
  // write your solution here
}`
    case 'javascript':
    default:
      return question.starter
  }
}

export function getOptimal(question, lang) {
  if (!question.optimal) return ''
  if (lang === 'javascript' || lang === 'typescript') return question.optimal
  // for other langs, wrap JS optimal with header + keep logic comment
  // we show translated header + original JS optimal as reference
  const header = `// Optimal solution — ${getLanguageLabel(lang)} (logic mirrors JS optimal)\n// Original JS optimal shown for reference:\n`
  // provide a minimal translated skeleton for python/java/cpp/go
  const { name, params } = parseStarter(question.starter || '')
  let skeleton = ''
  if (lang === 'python') {
    skeleton = `def ${name}(${params}):\n    # ${question.title} — optimal O(n) approach\n    # see JS implementation below for exact steps\n    pass\n\n`
  } else if (lang === 'java') {
    skeleton = `class Solution {\n    public Object ${name}(${toJavaParams(params)}) {\n        // ${question.title} — optimal approach\n        return null;\n    }\n}\n\n`
  } else if (lang === 'cpp') {
    skeleton = `auto ${name}(${toCppParams(params)}) {\n    // ${question.title} — optimal approach\n    return 0;\n}\n\n`
  } else if (lang === 'go') {
    skeleton = `func ${name}(${toGoParams(params)}) int {\n    // ${question.title} — optimal approach\n    return 0\n}\n\n`
  }
  return skeleton + header + question.optimal
}

export function getFileName(question, lang) {
  const cfg = LANGUAGES.find((l) => l.id === lang) || LANGUAGES[0]
  const base = (question.title || 'solution').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
  return `${base}.${cfg.ext}`
}

export const LANG_KEY = 'vizara-lang'
export function loadLanguage() {
  try {
    const v = localStorage.getItem(LANG_KEY)
    if (v && LANGUAGE_IDS.includes(v)) return v
  } catch {}
  return 'javascript'
}
export function saveLanguage(lang) {
  try {
    localStorage.setItem(LANG_KEY, lang)
  } catch {}
}
