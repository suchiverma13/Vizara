// Real test harness for JavaScript/TypeScript — runs user code against curated cases
// For Python/Java/C++/Go we keep heuristic (no browser runtime)

function deepEqual(a, b) {
  if (a === b) return true
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((v, i) => deepEqual(v, b[i]))
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const ka = Object.keys(a).sort()
    const kb = Object.keys(b).sort()
    if (ka.length !== kb.length) return false
    return ka.every((k) => deepEqual(a[k], b[k]))
  }
  return false
}

function sortedGroupsEqual(a, b) {
  const norm = (arr) => arr.map((g) => [...g].sort()).sort()
  try {
    return deepEqual(norm(a), norm(b))
  } catch { return false }
}

function buildTree(arr) {
  if (!arr || arr.length === 0 || arr[0] == null) return null
  const root = { val: arr[0], left: null, right: null }
  const q = [root]
  let i = 1
  while (q.length && i < arr.length) {
    const node = q.shift()
    if (arr[i] != null) { node.left = { val: arr[i], left: null, right: null }; q.push(node.left) }
    i++
    if (i < arr.length && arr[i] != null) { node.right = { val: arr[i], left: null, right: null }; q.push(node.right) }
    i++
  }
  return root
}

export const harnessById = {
  q1: {
    func: 'twoSum',
    cases: [
      { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { args: [[3, 2, 4], 6], expected: [1, 2] },
      { args: [[3, 3], 6], expected: [0, 1] },
      { args: [[0, 4, 3, 0], 0], expected: [0, 3] },
    ],
  },
  q2: {
    func: 'reverseString',
    cases: [
      { args: ['hello'], expected: 'olleh' },
      { args: [''], expected: '' },
      { args: ['a'], expected: 'a' },
      { args: ['A man'], expected: 'nam A' },
    ],
  },
  q3: {
    func: 'firstUnique',
    cases: [
      { args: ['loveleetcode'], expected: 2 },
      { args: ['leetcode'], expected: 0 },
      { args: ['aabb'], expected: -1 },
      { args: [''], expected: -1 },
    ],
  },
  q4: {
    func: 'maxSubarray',
    cases: [
      { args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
      { args: [[1]], expected: 1 },
      { args: [[5, 4, -1, 7, 8]], expected: 23 },
      { args: [[-1, -2]], expected: -1 },
    ],
  },
  q5: {
    func: 'isAnagram',
    cases: [
      { args: ['anagram', 'nagaram'], expected: true },
      { args: ['rat', 'car'], expected: false },
      { args: ['', ''], expected: true },
      { args: ['a', 'ab'], expected: false },
    ],
  },
  q6: {
    func: 'groupAnagrams',
    cases: [
      { args: [['eat', 'tea', 'tan', 'ate', 'nat', 'bat']], expected: 3, check: (got) => Array.isArray(got) && got.length === 3 },
      { args: [[]], expected: 0, check: (got) => Array.isArray(got) && got.length === 0 },
      { args: [['a']], expected: 1, check: (got) => Array.isArray(got) && got.length === 1 },
      { args: [['', '']], expected: 1, check: (got) => Array.isArray(got) && got.length === 1 },
    ],
  },
  q7: {
    func: 'coinChange',
    cases: [
      { args: [[1, 2, 5], 11], expected: 3 },
      { args: [[2], 3], expected: -1 },
      { args: [[1], 0], expected: 0 },
      { args: [[1, 3, 4], 6], expected: 2 },
    ],
  },
  q8: {
    func: 'lcs',
    cases: [
      { args: ['abcde', 'ace'], expected: 3 },
      { args: ['', 'abc'], expected: 0 },
      { args: ['abc', 'abc'], expected: 3 },
      { args: ['abc', 'def'], expected: 0 },
    ],
  },
  q9: {
    func: 'numIslands',
    cases: [
      { args: [[['1','1','0','0','0'],['1','1','0','0','0'],['0','0','1','0','0'],['0','0','0','1','1']]], expected: 3 },
      { args: [[['0','0'],['0','0']]], expected: 0 },
      { args: [[['1']]], expected: 1 },
      { args: [[['1','1','1']]], expected: 1 },
    ],
  },
  q10: {
    func: 'shortestPath',
    cases: [
      { args: [3, [[0,1,1],[1,2,1]], 0], expected: [0,1,2] },
      { args: [2, [[0,1,5]], 0], expected: [0,5] },
      { args: [2, [], 0], expected: [0, Infinity] },
      { args: [1, [], 0], expected: [0] },
    ],
  },
  q11: {
    func: 'maxProfit',
    cases: [
      { args: [[7,1,5,3,6,4]], expected: 5 },
      { args: [[7,6,4,3,1]], expected: 0 },
      { args: [[1]], expected: 0 },
      { args: [[1,2]], expected: 1 },
    ],
  },
  q12: {
    func: 'isPalindrome',
    cases: [
      { args: ['A man, a plan, a canal: Panama'], expected: true },
      { args: ['race a car'], expected: false },
      { args: [''], expected: true },
      { args: ['a'], expected: true },
    ],
  },
  q13: {
    func: 'containsDuplicate',
    cases: [
      { args: [[1,2,3,1]], expected: true },
      { args: [[1,2,3,4]], expected: false },
      { args: [[]], expected: false },
      { args: [[1,1]], expected: true },
    ],
  },
  q14: {
    func: 'climbStairs',
    cases: [
      { args: [2], expected: 2 },
      { args: [3], expected: 3 },
      { args: [1], expected: 1 },
      { args: [5], expected: 8 },
    ],
  },
  q15: {
    func: 'maxArea',
    cases: [
      { args: [[1,8,6,2,5,4,8,3,7]], expected: 49 },
      { args: [[1,1]], expected: 1 },
      { args: [[4,3,2,1,4]], expected: 16 },
      { args: [[1,2,1]], expected: 2 },
    ],
  },
  q16: {
    func: 'longestPalindrome',
    cases: [
      { args: ['babad'], expected: 3, check: (got) => typeof got === 'string' && (got === 'bab' || got === 'aba') && got.length === 3 },
      { args: ['cbbd'], expected: 2, check: (got) => got === 'bb' },
      { args: ['a'], expected: 1, check: (got) => got === 'a' },
      { args: ['ac'], expected: 1, check: (got) => got.length === 1 },
    ],
  },
  q17: {
    func: 'rob',
    cases: [
      { args: [[1,2,3,1]], expected: 4 },
      { args: [[2,7,9,3,1]], expected: 12 },
      { args: [[]], expected: 0 },
      { args: [[5]], expected: 5 },
    ],
  },
  q18: {
    func: 'findMedianSortedArrays',
    cases: [
      { args: [[1,3],[2]], expected: 2 },
      { args: [[1,2],[3,4]], expected: 2.5 },
      { args: [[0,0],[0,0]], expected: 0 },
      { args: [[1],[2]], expected: 1.5 },
    ],
  },
  q19: {
    func: 'minDistance',
    cases: [
      { args: ['horse','ros'], expected: 3 },
      { args: ['',''], expected: 0 },
      { args: ['intention','execution'], expected: 5 },
      { args: ['a','b'], expected: 1 },
    ],
  },
  q20: {
    func: 'cloneGraph',
    cases: [
      { args: [null], expected: null },
      // clone deep copy check — if not null, must be new object with same val
      { args: [{ val: 1, neighbors: [] }], expected: 1, check: (got) => got && got.val === 1 && got !== null },
      { args: [{ val: 1, neighbors: [{ val: 2, neighbors: [] }] }], expected: 1, check: (got) => got && got.val === 1 },
      { args: [null], expected: null },
    ],
  },
  q21: {
    func: 'canFinish',
    cases: [
      { args: [2, [[1,0]]], expected: true },
      { args: [2, [[1,0],[0,1]]], expected: false },
      { args: [1, []], expected: true },
      { args: [3, [[0,1],[1,2]]], expected: true },
    ],
  },
  q22: {
    func: 'isValid',
    cases: [
      { args: ['()'], expected: true },
      { args: ['()[]{}'], expected: true },
      { args: ['(]'], expected: false },
      { args: ['([)]'], expected: false },
    ],
  },
  q23: {
    func: 'MinStack',
    cases: [
      { args: ['seq1'], expected: true, check: (got) => true }, // handled specially
    ],
    isClass: true,
  },
  q24: {
    func: 'dailyTemperatures',
    cases: [
      { args: [[73,74,75,71,69,72,76,73]], expected: [1,1,4,2,1,1,0,0] },
      { args: [[30,40,50,60]], expected: [1,1,1,0] },
      { args: [[60,50,40]], expected: [0,0,0] },
      { args: [[30]], expected: [0] },
    ],
  },
  q25: {
    func: 'largestRectangle',
    cases: [
      { args: [[2,1,5,6,2,3]], expected: 10 },
      { args: [[2]], expected: 2 },
      { args: [[2,4]], expected: 4 },
      { args: [[1,1,1]], expected: 3 },
    ],
  },
  q26: {
    func: 'maxDepth',
    cases: [
      { args: [buildTree([3,9,20,null,null,15,7])], expected: 3 },
      { args: [null], expected: 0 },
      { args: [buildTree([1])], expected: 1 },
      { args: [buildTree([1,2])], expected: 2 },
    ],
  },
  q27: {
    func: 'invertTree',
    cases: [
      { args: [buildTree([4,2,7,1,3,6,9])], expected: true, check: (got) => got && got.left && got.left.val === 7 },
      { args: [null], expected: null },
      { args: [buildTree([1])], expected: true, check: (got) => got && got.val === 1 },
      { args: [buildTree([2,1,3])], expected: true, check: (got) => got && got.left.val === 3 },
    ],
  },
  q28: {
    func: 'isValidBST',
    cases: [
      { args: [buildTree([2,1,3])], expected: true },
      { args: [buildTree([5,1,4,null,null,3,6])], expected: false },
      { args: [null], expected: true },
      { args: [buildTree([1])], expected: true },
    ],
  },
  q29: {
    func: 'binarySearch',
    cases: [
      { args: [[-1,0,3,5,9,12], 9], expected: 4 },
      { args: [[-1,0,3,5,9,12], 2], expected: -1 },
      { args: [[5], 5], expected: 0 },
      { args: [[], 1], expected: -1 },
    ],
  },
  q30: {
    func: 'searchInsert',
    cases: [
      { args: [[1,3,5,6], 5], expected: 2 },
      { args: [[1,3,5,6], 2], expected: 1 },
      { args: [[1,3,5,6], 7], expected: 4 },
      { args: [[1,3,5,6], 0], expected: 0 },
    ],
  },
  q31: {
    func: 'findPeak',
    cases: [
      { args: [[1,2,3,1]], expected: 2 },
      { args: [[1,2,1,3,5,6,4]], expected: 5, check: (got) => [1,5].includes(got) },
      { args: [[1]], expected: 0 },
      { args: [[1,2]], expected: 1 },
    ],
  },
  q32: {
    func: 'searchRotated',
    cases: [
      { args: [[4,5,6,7,0,1,2], 0], expected: 4 },
      { args: [[4,5,6,7,0,1,2], 3], expected: -1 },
      { args: [[1],0], expected: -1 },
      { args: [[1],1], expected: 0 },
    ],
  },
  q33: {
    func: 'generateParenthesis',
    cases: [
      { args: [3], expected: 5, check: (got) => Array.isArray(got) && got.length === 5 },
      { args: [1], expected: 1, check: (got) => Array.isArray(got) && got.length === 1 },
      { args: [2], expected: 2, check: (got) => Array.isArray(got) && got.length === 2 },
      { args: [4], expected: 14, check: (got) => Array.isArray(got) && got.length === 14 },
    ],
  },
  q34: {
    func: 'subsets',
    cases: [
      { args: [[1,2,3]], expected: 8, check: (got) => Array.isArray(got) && got.length === 8 },
      { args: [[]], expected: 1, check: (got) => Array.isArray(got) && got.length === 1 },
      { args: [[0]], expected: 2, check: (got) => Array.isArray(got) && got.length === 2 },
      { args: [[1,2]], expected: 4, check: (got) => Array.isArray(got) && got.length === 4 },
    ],
  },
  q35: {
    func: 'exist',
    cases: [
      { args: [[['A','B','C','E'],['S','F','C','S'],['A','D','E','E']], 'ABCCED'], expected: true },
      { args: [[['A','B','C','E'],['S','F','C','S'],['A','D','E','E']], 'SEE'], expected: true },
      { args: [[['A','B','C','E'],['S','F','C','S'],['A','D','E','E']], 'ABCB'], expected: false },
      { args: [[['a']], 'a'], expected: true },
    ],
  },
}

export function runHarness(code, question) {
  const h = harnessById[question.id]
  if (!h) return null
  // special class MinStack
  if (question.id === 'q23') {
    try {
      const fn = new Function(`${code}; return typeof MinStack !== 'undefined' ? MinStack : null`)()
      if (!fn) return { passed: 0, total: 4, error: 'MinStack class not found', results: [] }
      // simple sequence test
      let pass = 0
      const results = []
      try {
        const s = new fn()
        s.push(5); s.push(2); s.push(7)
        if (s.getMin() === 2) pass++
        results.push({ ok: s.getMin() === 2 })
        s.pop()
        if (s.getMin() === 2) pass++  // actually after pop 7, min still 2
        results.push({ ok: s.getMin() === 2 })
        if (s.top() === 2) pass++
        results.push({ ok: s.top() === 2 })
        s.pop(); s.pop()
        // after popping all, push 10
        s.push(10)
        if (s.getMin() === 10) pass++
        results.push({ ok: s.getMin() === 10 })
      } catch (e) {
        return { passed: pass, total: 4, error: e.message, results }
      }
      return { passed: pass, total: 4, error: null, results }
    } catch (e) {
      return { passed: 0, total: 4, error: e.message, results: [] }
    }
  }

  let userFn
  try {
    // try to get function by expected name
    userFn = new Function(`${code}; return typeof ${h.func} !== 'undefined' ? ${h.func} : null`)()
    if (!userFn) {
      // fallback: find any function defined in code
      const names = [...code.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map((m) => m[1])
      const arrow = [...code.matchAll(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*\(/g)].map((m) => m[1])
      const cand = [...names, ...arrow].find((n) => n)
      if (cand) userFn = new Function(`${code}; return typeof ${cand} !== 'undefined' ? ${cand} : null`)()
    }
    if (!userFn) return { passed: 0, total: h.cases.length, error: `Function ${h.func} not found`, results: [] }
  } catch (e) {
    return { passed: 0, total: h.cases.length, error: e.message, results: [] }
  }

  let passed = 0
  const results = []
  for (const c of h.cases) {
    try {
      const args = c.args
      // For q6 groupAnagrams, user expects strs array, but we stored as [[...]] — unwrap one level if needed
      // Cases already shaped as [args] for harness; we pass ...args directly
      // For numIslands, shortestPath etc., pass correctly.
      // Need to handle that groupAnagrams case currently has args: [[[ ... ]]] — first element is array of strings; we want to call with that array.
      // Our harness for q6 defines args as [[['eat',...]]] meaning first arg is array; but case.args is [ [['eat',...]] ] so spreading gives one arg which is array — correct.
      // For trees, args already contain built tree object.
      const got = userFn(...args)
      let ok = false
      if (c.check) ok = c.check(got)
      else ok = deepEqual(got, c.expected)
      if (ok) passed++
      results.push({ ok, got, expected: c.expected })
    } catch (e) {
      results.push({ ok: false, error: e.message })
    }
  }
  return { passed, total: h.cases.length, error: null, results }
}
