export const topics = ['Arrays', 'Strings', 'Hashing', 'Dynamic', 'Graphs', 'Stacks', 'Trees', 'Binary Search', 'Backtracking']
export const difficulties = ['Easy', 'Medium', 'Hard']

export const topicBriefs = {
  Arrays: {
    about:
      'Arrays store elements in contiguous memory with O(1) random access. Most array problems ask you to reorder, scan, or aggregate data efficiently — usually with a single pass.',
    patterns: ['Two Pointers', 'Sliding Window', 'Prefix Sum', 'Running Max (Kadane)'],
    tips: [
      'Watch for off-by-one errors at the boundaries.',
      'Sorting often unlocks a simpler two-pointer pass.',
      'Can you avoid a nested loop with a running aggregate?',
    ],
  },
  Strings: {
    about:
      'Strings are character arrays with extra operations like comparison and concatenation. Most string problems reduce to array techniques plus careful handling of case and whitespace.',
    patterns: ['Two Pointers', 'Palindrome & Reversal', 'Anagram / Frequency Counting', 'Substring Search'],
    tips: [
      'Strings are immutable — build output with arrays in tight loops.',
      'Normalize case and strip noise before comparing.',
      'Use character frequency maps for anagram checks.',
    ],
  },
  Hashing: {
    about:
      'Hash maps and sets give near-constant-time lookups. You trade a little memory to convert O(n²) nested loops into clean single passes.',
    patterns: ['Frequency Counting', 'Complement Lookup (Two Sum)', 'Grouping by Key', 'Deduplication'],
    tips: [
      'Check membership in a set before storing.',
      'Hash keys must be stable — sort strings first when order matters.',
      'Space is cheap; the loop you remove is not.',
    ],
  },
  Dynamic: {
    about:
      'Dynamic programming breaks a problem into overlapping subproblems, solves each once, and reuses the result — turning exponential recursion into polynomial time.',
    patterns: ['Memoization (top-down)', 'Tabulation (bottom-up)', 'State = (index, budget, …)', '1D / 2D DP tables'],
    tips: [
      'Define the state clearly before writing any code.',
      'Start from the base case and build upward.',
      'If a greedy rule always holds, DP is overkill.',
    ],
  },
  Graphs: {
    about:
      'Graphs model connections between entities. Traversals (BFS/DFS), cycle detection, and shortest paths cover most interview questions.',
    patterns: ['BFS for shortest hops', 'DFS / recursion for connectivity', 'Topological sort (Kahn)', 'Bellman-Ford / Dijkstra'],
    tips: [
      'Mark nodes visited to avoid infinite loops.',
      'BFS uses a queue, DFS uses a stack or recursion.',
      'Build the adjacency list once and reuse it.',
    ],
  },
  Stacks: {
    about:
      'A stack is a LIFO structure — last in, first out. It models nesting, matching, history, and monotonic trends in a single pass.',
    patterns: ['Parentheses / Symbol Matching', 'Monotonic Stack (next greater)', 'Expression Evaluation', 'Undo / History'],
    tips: [
      'Store indices, not just values, when you need positions.',
      'Monotonic stacks answer next-greater queries in one pass.',
      'Push on entry, pop when a match closes the context.',
    ],
  },
  Trees: {
    about:
      'Trees are acyclic hierarchical graphs. Binary tree problems lean heavily on recursion and on choosing the right traversal order.',
    patterns: ['DFS: pre / in / post-order', 'BFS: level-order', 'BST properties & validation', 'Recursive divide & conquer'],
    tips: [
      'Make the null node your base case.',
      'Depth-first recursion is usually the cleanest option.',
      'For BSTs remember: left < root < right.',
    ],
  },
  'Binary Search': {
    about:
      'Binary search halves the search space every step, turning linear scans into O(log n) searches on sorted — or otherwise monotonic — data.',
    patterns: ['Classic sorted search', 'Find first / last boundary', 'Search in rotated arrays', 'Peak finding'],
    tips: [
      'mid = left + (right - left) / 2 avoids overflow.',
      'Decide whether you need the first or last occurrence.',
      'Ask what property is monotonic — the answer is often sortedness.',
    ],
  },
  Backtracking: {
    about:
      'Backtracking explores every candidate path and prunes dead ends early — brute force with a brain, ideal for combinations, permutations, and constraint puzzles.',
    patterns: ['Generate subsets / combinations', 'Permutations', 'Grid path exploration', 'Constraint puzzles'],
    tips: [
      'Choose → explore → un-choose.',
      'Sort or use a visited set to skip duplicates.',
      'Prune early — pruning is the whole game.',
    ],
  },
}

const daySeed = () => {
  const now = new Date()
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
}

export const questions = [
  {
    id: 'q1',
    title: 'Two Sum',
    topic: 'Arrays',
    difficulty: 'Easy',
    day: 1,
    description:
      'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.',
    example: 'nums = [2, 7, 11, 15], target = 9  →  [0, 1]',
    sampleData: [2, 7, 11, 15, 3, 6],
    tests: ['basic_pair', 'negative_numbers', 'duplicates', 'zero_target', 'large_nums', 'edge_two_items'],
    starter: `function twoSum(nums, target) {
  // write your solution here
}`,
    optimal: `function twoSum(nums, target) {
  const seen = {}
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i]
    if (diff in seen) {
      return [seen[diff], i]
    }
    seen[nums[i]] = i
  }
  return [-1, -1]
}`,
  },
  {
    id: 'q2',
    title: 'Reverse String',
    topic: 'Strings',
    difficulty: 'Easy',
    day: 2,
    description: 'Write a function that reverses a string in place and returns it.',
    example: '"hello"  →  "olleh"',
    sampleData: [5, 5, 6, 6, 6, 4],
    tests: ['palindrome', 'single_char', 'unicode', 'numbers_as_text', 'whitespace', 'long_sentence'],
    starter: `function reverseString(s) {
  // write your solution here
}`,
    optimal: `function reverseString(s) {
  const arr = s.split('')
  let left = 0
  let right = arr.length - 1
  while (left < right) {
    const tmp = arr[left]
    arr[left] = arr[right]
    arr[right] = tmp
    left++
    right--
  }
  return arr.join('')
}`,
  },
  {
    id: 'q3',
    title: 'First Unique Character',
    topic: 'Hashing',
    difficulty: 'Easy',
    day: 3,
    description:
      'Given a string s, find the index of the first non-repeating character. Return -1 if none exists.',
    example: '"loveleetcode"  →  2',
    sampleData: [3, 1, 1, 2, 2, 4],
    tests: ['first_unique', 'all_repeat', 'empty', 'uppercase_mix', 'long_tail', 'single_char'],
    starter: `function firstUnique(s) {
  // write your solution here
}`,
    optimal: `function firstUnique(s) {
  const count = {}
  for (let i = 0; i < s.length; i++) {
    count[s[i]] = (count[s[i]] || 0) + 1
  }
  for (let i = 0; i < s.length; i++) {
    if (count[s[i]] === 1) {
      return i
    }
  }
  return -1
}`,
  },
  {
    id: 'q4',
    title: 'Max Subarray Sum',
    topic: 'Arrays',
    difficulty: 'Medium',
    day: 4,
    description:
      'Given an integer array nums, find the contiguous subarray with the largest sum and return that sum.',
    example: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]  →  6',
    sampleData: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
    tests: ['all_negative', 'mixed', 'single_peak', 'zeros', 'large_spread', 'two_items'],
    starter: `function maxSubarray(nums) {
  // write your solution here
}`,
    optimal: `function maxSubarray(nums) {
  let best = nums[0]
  let cur = 0
  for (let i = 0; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i])
    best = Math.max(best, cur)
  }
  return best
}`,
  },
  {
    id: 'q5',
    title: 'Valid Anagram',
    topic: 'Hashing',
    difficulty: 'Easy',
    day: 5,
    description: 'Given two strings s and t, return true if t is an anagram of s.',
    example: '"anagram", "nagaram"  →  true',
    sampleData: [2, 3, 3, 2, 3, 3],
    tests: ['anagram_true', 'different_length', 'same_letters', 'uppercase', 'unicode', 'empty_both'],
    starter: `function isAnagram(s, t) {
  // write your solution here
}`,
    optimal: `function isAnagram(s, t) {
  if (s.length !== t.length) {
    return false
  }
  const map = {}
  for (let i = 0; i < s.length; i++) {
    map[s[i]] = (map[s[i]] || 0) + 1
  }
  for (let i = 0; i < t.length; i++) {
    if (!map[t[i]]) {
      return false
    }
    map[t[i]]--
  }
  return true
}`,
  },
  {
    id: 'q6',
    title: 'Group Anagrams',
    topic: 'Hashing',
    difficulty: 'Medium',
    day: 6,
    description:
      'Given an array of strings strs, group the anagrams together. Return the groups.',
    example: '["eat", "tea", "tan", "ate", "nat", "bat"]  →  3 groups',
    sampleData: [4, 3, 3, 3, 2, 3],
    tests: ['group_three', 'single_group', 'all_unique', 'empty_input', 'uppercase', 'mixed_lengths'],
    starter: `function groupAnagrams(strs) {
  // write your solution here
}`,
    optimal: `function groupAnagrams(strs) {
  const groups = {}
  for (let i = 0; i < strs.length; i++) {
    const key = strs[i].split('').sort().join('')
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(strs[i])
  }
  return Object.values(groups)
}`,
  },
  {
    id: 'q7',
    title: 'Coin Change',
    topic: 'Dynamic',
    difficulty: 'Medium',
    day: 7,
    description:
      'Given coin denominations and an amount, return the fewest coins needed. Return -1 if impossible.',
    example: 'coins = [1, 2, 5], amount = 11  →  3 (5+5+1)',
    sampleData: [1, 2, 5, 11],
    tests: ['exact_match', 'impossible', 'single_coin', 'large_amount', 'many_denoms', 'zero_amount'],
    starter: `function coinChange(coins, amount) {
  // write your solution here
}`,
    optimal: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity)
  dp[0] = 0
  for (let i = 1; i <= amount; i++) {
    for (let j = 0; j < coins.length; j++) {
      if (coins[j] <= i) {
        dp[i] = Math.min(dp[i], dp[i - coins[j]] + 1)
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount]
}`,
  },
  {
    id: 'q8',
    title: 'Longest Common Subsequence',
    topic: 'Dynamic',
    difficulty: 'Hard',
    day: 8,
    description:
      'Given two strings text1 and text2, return the length of their longest common subsequence.',
    example: '"abcde", "ace"  →  3',
    sampleData: [5, 3, 4, 4, 3, 2],
    tests: ['full_match', 'none', 'single_char', 'interleaved', 'large_both', 'reversed'],
    starter: `function lcs(text1, text2) {
  // write your solution here
}`,
    optimal: `function lcs(text1, text2) {
  const n = text1.length
  const m = text2.length
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }
  return dp[n][m]
}`,
  },
  {
    id: 'q9',
    title: 'Number of Islands',
    topic: 'Graphs',
    difficulty: 'Medium',
    day: 9,
    description:
      'Given a 2D grid of "1" (land) and "0" (water), count the number of islands.',
    example: '4x5 grid with 2 islands',
    sampleData: [4, 5, 2, 1, 1],
    tests: ['two_islands', 'one_big', 'zero_islands', 'single_cell', 'spiral_shape', 'all_land'],
    starter: `function numIslands(grid) {
  // write your solution here
}`,
    optimal: `function numIslands(grid) {
  let count = 0
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] === '1') {
        count++
        sink(grid, i, j)
      }
    }
  }
  return count
}

function sink(grid, i, j) {
  grid[i][j] = '0'
  if (i > 0 && grid[i - 1][j] === '1') sink(grid, i - 1, j)
  if (i < grid.length - 1 && grid[i + 1][j] === '1') sink(grid, i + 1, j)
  if (j > 0 && grid[i][j - 1] === '1') sink(grid, i, j - 1)
  if (j < grid[i].length - 1 && grid[i][j + 1] === '1') sink(grid, i, j + 1)
}`,
  },
  {
    id: 'q10',
    title: 'Shortest Path',
    topic: 'Graphs',
    difficulty: 'Hard',
    day: 10,
    description:
      'Given a weighted graph and a start node, return the shortest distance to every node.',
    example: '5 nodes, 6 edges  →  distances array',
    sampleData: [5, 6, 3, 2, 1],
    tests: ['direct_edge', 'multi_hop', 'negative_weight', 'disconnected', 'large_graph', 'self_loop'],
    starter: `function shortestPath(n, edges, start) {
  // write your solution here
}`,
    optimal: `function shortestPath(n, edges, start) {
  const dist = new Array(n).fill(Infinity)
  dist[start] = 0
  for (let i = 0; i < n - 1; i++) {
    let changed = false
    for (let j = 0; j < edges.length; j++) {
      const [u, v, w] = edges[j]
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w
        changed = true
      }
    }
    if (!changed) {
      break
    }
  }
  return dist
}`,
  },
  {
    id: 'q11',
    title: 'Best Time to Buy and Sell Stock',
    topic: 'Arrays',
    difficulty: 'Easy',
    day: 11,
    description:
      'Given an array prices where prices[i] is the price on day i, return the maximum profit you can achieve from one buy and one sell. Return 0 if no profit is possible.',
    example: '[7, 1, 5, 3, 6, 4]  →  5 (buy at 1, sell at 6)',
    sampleData: [7, 1, 5, 3, 6, 4],
    tests: ['rising_market', 'falling_market', 'flat_prices', 'single_day', 'spike_middle', 'long_series'],
    starter: `function maxProfit(prices) {
  // write your solution here
}`,
    optimal: `function maxProfit(prices) {
  let min = prices[0]
  let best = 0
  for (let i = 1; i < prices.length; i++) {
    min = Math.min(min, prices[i])
    best = Math.max(best, prices[i] - min)
  }
  return best
}`,
  },
  {
    id: 'q12',
    title: 'Valid Palindrome',
    topic: 'Strings',
    difficulty: 'Easy',
    day: 12,
    description:
      'Given a string s, return true if it is a palindrome, ignoring non-alphanumeric characters and case.',
    example: '"A man, a plan, a canal: Panama"  →  true',
    sampleData: [8, 5, 5, 5, 8, 1],
    tests: ['classic_phrase', 'only_punct', 'mixed_case', 'numbers_only', 'single_char', 'long_sentence'],
    starter: `function isPalindrome(s) {
  // write your solution here
}`,
    optimal: `function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '')
  let left = 0
  let right = clean.length - 1
  while (left < right) {
    if (clean[left] !== clean[right]) {
      return false
    }
    left++
    right--
  }
  return true
}`,
  },
  {
    id: 'q13',
    title: 'Contains Duplicate',
    topic: 'Hashing',
    difficulty: 'Easy',
    day: 13,
    description:
      'Given an integer array nums, return true if any value appears at least twice in the array, otherwise return false.',
    example: '[1, 2, 3, 1]  →  true',
    sampleData: [1, 2, 3, 1, 5, 9],
    tests: ['early_dup', 'no_dup', 'all_same', 'empty_input', 'negatives', 'large_series'],
    starter: `function containsDuplicate(nums) {
  // write your solution here
}`,
    optimal: `function containsDuplicate(nums) {
  const seen = new Set()
  for (let i = 0; i < nums.length; i++) {
    if (seen.has(nums[i])) {
      return true
    }
    seen.add(nums[i])
  }
  return false
}`,
  },
  {
    id: 'q14',
    title: 'Climbing Stairs',
    topic: 'Dynamic',
    difficulty: 'Easy',
    day: 14,
    description:
      'You are climbing a staircase with n steps. Each time you can climb 1 or 2 steps. Return the number of distinct ways to reach the top.',
    example: 'n = 3  →  3 (1+1+1, 1+2, 2+1)',
    sampleData: [3, 5, 8, 13, 21, 34],
    tests: ['one_step', 'two_steps', 'three_steps', 'ten_steps', 'twenty_steps', 'big_n'],
    starter: `function climbStairs(n) {
  // write your solution here
}`,
    optimal: `function climbStairs(n) {
  if (n <= 2) {
    return n
  }
  let a = 1
  let b = 2
  for (let i = 3; i <= n; i++) {
    const c = a + b
    a = b
    b = c
  }
  return b
}`,
  },
  {
    id: 'q15',
    title: 'Container With Most Water',
    topic: 'Arrays',
    difficulty: 'Medium',
    day: 15,
    description:
      'Given an integer array height where each value is a vertical line, find the two lines that together form the container that holds the most water.',
    example: '[1, 8, 6, 2, 5, 4, 8, 3, 7]  →  49',
    sampleData: [1, 8, 6, 2, 5, 4, 8, 3, 7],
    tests: ['classic_case', 'tall_edges', 'two_lines', 'descending', 'ascending', 'wide_flat'],
    starter: `function maxArea(height) {
  // write your solution here
}`,
    optimal: `function maxArea(height) {
  let left = 0
  let right = height.length - 1
  let best = 0
  while (left < right) {
    best = Math.max(best, Math.min(height[left], height[right]) * (right - left))
    if (height[left] < height[right]) {
      left++
    } else {
      right--
    }
  }
  return best
}`,
  },
  {
    id: 'q16',
    title: 'Longest Palindromic Substring',
    topic: 'Strings',
    difficulty: 'Medium',
    day: 16,
    description:
      'Given a string s, return the longest palindromic substring in s.',
    example: '"babad"  →  "bab" (or "aba")',
    sampleData: [6, 4, 4, 6, 4, 2],
    tests: ['odd_center', 'even_center', 'whole_string', 'all_same', 'single_char', 'two_char'],
    starter: `function longestPalindrome(s) {
  // write your solution here
}`,
    optimal: `function longestPalindrome(s) {
  let start = 0
  let maxLen = 1
  const expand = (l, r) => {
    while (l >= 0 && r < s.length && s[l] === s[r]) {
      l--
      r++
    }
    return r - l - 1
  }
  for (let i = 0; i < s.length; i++) {
    const len = Math.max(expand(i, i), expand(i, i + 1))
    if (len > maxLen) {
      maxLen = len
      start = i - Math.floor((len - 1) / 2)
    }
  }
  return s.slice(start, start + maxLen)
}`,
  },
  {
    id: 'q17',
    title: 'House Robber',
    topic: 'Dynamic',
    difficulty: 'Medium',
    day: 17,
    description:
      'Given an array nums of money in houses, return the maximum amount you can rob tonight without robbing two adjacent houses.',
    example: '[2, 7, 9, 3, 1]  →  12 (2 + 9 + 1)',
    sampleData: [2, 7, 9, 3, 1, 5],
    tests: ['classic_case', 'all_equal', 'alternating', 'two_houses', 'single_house', 'long_street'],
    starter: `function rob(nums) {
  // write your solution here
}`,
    optimal: `function rob(nums) {
  if (nums.length === 0) {
    return 0
  }
  if (nums.length === 1) {
    return nums[0]
  }
  let prev = 0
  let cur = 0
  for (let i = 0; i < nums.length; i++) {
    const next = Math.max(cur, prev + nums[i])
    prev = cur
    cur = next
  }
  return cur
}`,
  },
  {
    id: 'q18',
    title: 'Median of Two Sorted Arrays',
    topic: 'Arrays',
    difficulty: 'Hard',
    day: 18,
    description:
      'Given two sorted arrays nums1 and nums2, return the median of the two sorted arrays. Aim for O(log(n + m)) time.',
    example: '[1, 3], [2]  →  2.0',
    sampleData: [1, 3, 2, 4, 5, 6],
    tests: ['odd_total', 'even_total', 'one_empty', 'single_each', 'uneven_lengths', 'duplicates'],
    starter: `function findMedianSortedArrays(nums1, nums2) {
  // write your solution here
}`,
    optimal: `function findMedianSortedArrays(nums1, nums2) {
  const merged = []
  let i = 0
  let j = 0
  while (i < nums1.length && j < nums2.length) {
    if (nums1[i] <= nums2[j]) {
      merged.push(nums1[i++])
    } else {
      merged.push(nums2[j++])
    }
  }
  while (i < nums1.length) merged.push(nums1[i++])
  while (j < nums2.length) merged.push(nums2[j++])
  const mid = Math.floor(merged.length / 2)
  if (merged.length % 2 === 1) {
    return merged[mid]
  }
  return (merged[mid - 1] + merged[mid]) / 2
}`,
  },
  {
    id: 'q19',
    title: 'Edit Distance',
    topic: 'Dynamic',
    difficulty: 'Hard',
    day: 19,
    description:
      'Given two strings word1 and word2, return the minimum number of operations (insert, delete, replace) required to convert word1 into word2.',
    example: '"horse", "ros"  →  3',
    sampleData: [5, 3, 4, 4, 3, 2],
    tests: ['classic_case', 'identical', 'one_empty', 'insert_only', 'delete_only', 'replace_many'],
    starter: `function minDistance(word1, word2) {
  // write your solution here
}`,
    optimal: `function minDistance(word1, word2) {
  const n = word1.length
  const m = word2.length
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))
  for (let i = 0; i <= n; i++) dp[i][0] = i
  for (let j = 0; j <= m; j++) dp[0][j] = j
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }
  }
  return dp[n][m]
}`,
  },
  {
    id: 'q20',
    title: 'Clone Graph',
    topic: 'Graphs',
    difficulty: 'Medium',
    day: 20,
    description:
      'Given a reference to a connected undirected graph node, return a deep copy of the graph. Each node has a val and a neighbors array.',
    example: '4 nodes, 4 edges  →  deep copy with all-new nodes',
    sampleData: [4, 4, 2, 3, 1],
    tests: ['single_node', 'two_nodes', 'triangle', 'square', 'self_loop', 'disconnected'],
    starter: `function cloneGraph(node) {
  // write your solution here
}`,
    optimal: `function cloneGraph(node) {
  if (!node) {
    return null
  }
  const map = new Map()
  const dfs = (n) => {
    if (map.has(n)) {
      return map.get(n)
    }
    const copy = { val: n.val, neighbors: [] }
    map.set(n, copy)
    for (const nb of n.neighbors) {
      copy.neighbors.push(dfs(nb))
    }
    return copy
  }
  return dfs(node)
}`,
  },
  {
    id: 'q21',
    title: 'Course Schedule',
    topic: 'Graphs',
    difficulty: 'Medium',
    day: 21,
    description:
      'There are numCourses courses labeled 0 to numCourses - 1. Given prerequisites pairs [a, b] meaning b is required before a, return true if you can finish all courses.',
    example: '2 courses, [[1, 0]]  →  true',
    sampleData: [4, 4, 2, 3, 1],
    tests: ['no_prereq', 'simple_ok', 'simple_cycle', 'long_chain', 'parallel_chains', 'self_cycle'],
    starter: `function canFinish(numCourses, prerequisites) {
  // write your solution here
}`,
    optimal: `function canFinish(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => [])
  const indeg = new Array(numCourses).fill(0)
  for (const [a, b] of prerequisites) {
    graph[b].push(a)
    indeg[a]++
  }
  const queue = []
  for (let i = 0; i < numCourses; i++) {
    if (indeg[i] === 0) {
      queue.push(i)
    }
  }
  let taken = 0
  while (queue.length) {
    const cur = queue.shift()
    taken++
    for (const next of graph[cur]) {
      if (--indeg[next] === 0) {
        queue.push(next)
      }
    }
  }
  return taken === numCourses
}`,
  },
  {
    id: 'q22',
    title: 'Valid Parentheses',
    topic: 'Stacks',
    difficulty: 'Easy',
    day: 22,
    description:
      'Given a string s containing just the characters ( ) { } [ ], determine if the input string is valid: brackets must close in the correct order and every opening bracket must have a matching close.',
    example: '"()[]{}"  →  true · "([)]"  →  false',
    sampleData: [3, 2, 1, 1, 2, 3],
    tests: ['simple_pairs', 'nested', 'wrong_order', 'unclosed', 'lone_close', 'long_mix'],
    starter: `function isValid(s) {
  // write your solution here
}`,
    optimal: `function isValid(s) {
  const stack = []
  const pairs = { ')': '(', ']': '[', '}': '{' }
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch)
    } else if (stack.pop() !== pairs[ch]) {
      return false
    }
  }
  return stack.length === 0
}`,
  },
  {
    id: 'q23',
    title: 'Min Stack',
    topic: 'Stacks',
    difficulty: 'Medium',
    day: 23,
    description:
      'Design a stack that supports push, pop, top, and retrieving the minimum element, all in constant time.',
    example: 'push(5), push(2), push(7), getMin()  →  2',
    sampleData: [5, 2, 7, 3, 1, 9],
    tests: ['push_pop_sequence', 'min_at_top', 'min_after_pop', 'duplicates', 'single_elem', 'long_stress'],
    starter: `function MinStack() {
  // write your solution here
}`,
    optimal: `function MinStack() {
  this.stack = []
  this.mins = []
}

MinStack.prototype.push = function (val) {
  this.stack.push(val)
  const cur = this.mins.length ? this.mins[this.mins.length - 1] : Infinity
  this.mins.push(Math.min(cur, val))
}

MinStack.prototype.pop = function () {
  this.stack.pop()
  this.mins.pop()
}

MinStack.prototype.top = function () {
  return this.stack[this.stack.length - 1]
}

MinStack.prototype.getMin = function () {
  return this.mins[this.mins.length - 1]
}`,
  },
  {
    id: 'q24',
    title: 'Daily Temperatures',
    topic: 'Stacks',
    difficulty: 'Medium',
    day: 24,
    description:
      'Given an array of daily temperatures, return an array such that answer[i] is the number of days you have to wait until a warmer temperature. Use 0 if no warmer day exists.',
    example: '[73, 74, 75, 71, 69, 72, 76, 73]  →  [1, 1, 4, 2, 1, 1, 0, 0]',
    sampleData: [73, 74, 75, 71, 69, 72, 76, 73],
    tests: ['classic_series', 'all_rising', 'all_falling', 'flat', 'single_day', 'long_series'],
    starter: `function dailyTemperatures(temps) {
  // write your solution here
}`,
    optimal: `function dailyTemperatures(temps) {
  const answer = new Array(temps.length).fill(0)
  const stack = []
  for (let i = 0; i < temps.length; i++) {
    while (stack.length && temps[i] > temps[stack[stack.length - 1]]) {
      const prev = stack.pop()
      answer[prev] = i - prev
    }
    stack.push(i)
  }
  return answer
}`,
  },
  {
    id: 'q25',
    title: 'Largest Rectangle in Histogram',
    topic: 'Stacks',
    difficulty: 'Hard',
    day: 25,
    description:
      'Given an array of bar heights, find the area of the largest rectangle that can be formed within the histogram.',
    example: '[2, 1, 5, 6, 2, 3]  →  10',
    sampleData: [2, 1, 5, 6, 2, 3],
    tests: ['classic_case', 'single_bar', 'all_equal', 'descending', 'ascending', 'wide_flat'],
    starter: `function largestRectangle(heights) {
  // write your solution here
}`,
    optimal: `function largestRectangle(heights) {
  let best = 0
  const stack = []
  for (let i = 0; i <= heights.length; i++) {
    const h = i === heights.length ? 0 : heights[i]
    while (stack.length && h < heights[stack[stack.length - 1]]) {
      const top = stack.pop()
      const width = stack.length ? i - stack[stack.length - 1] - 1 : i
      best = Math.max(best, heights[top] * width)
    }
    stack.push(i)
  }
  return best
}`,
  },
  {
    id: 'q26',
    title: 'Maximum Depth of Binary Tree',
    topic: 'Trees',
    difficulty: 'Easy',
    day: 26,
    description:
      'Given the root of a binary tree, return its maximum depth — the number of nodes along the longest path from the root down to the farthest leaf.',
    example: 'root = [3, 9, 20, null, null, 15, 7]  →  3',
    sampleData: [3, 9, 20, 15, 7, 1],
    tests: ['empty_tree', 'single_node', 'left_heavy', 'balanced', 'right_chain', 'big_tree'],
    starter: `function maxDepth(root) {
  // write your solution here
}`,
    optimal: `function maxDepth(root) {
  if (!root) {
    return 0
  }
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right))
}`,
  },
  {
    id: 'q27',
    title: 'Invert Binary Tree',
    topic: 'Trees',
    difficulty: 'Easy',
    day: 27,
    description:
      'Given the root of a binary tree, invert the tree — swap the left and right child of every node — and return its root.',
    example: 'root = [4, 2, 7, 1, 3, 6, 9]  →  mirrored tree',
    sampleData: [4, 2, 7, 1, 3, 6, 9],
    tests: ['empty_tree', 'single_node', 'full_tree', 'left_heavy', 'right_heavy', 'deep_tree'],
    starter: `function invertTree(root) {
  // write your solution here
}`,
    optimal: `function invertTree(root) {
  if (!root) {
    return null
  }
  const tmp = root.left
  root.left = invertTree(root.right)
  root.right = invertTree(tmp)
  return root
}`,
  },
  {
    id: 'q28',
    title: 'Validate Binary Search Tree',
    topic: 'Trees',
    difficulty: 'Medium',
    day: 28,
    description:
      'Given the root of a binary tree, determine if it is a valid BST: every left child is smaller and every right child is larger, recursively.',
    example: 'root = [2, 1, 3]  →  true · [5, 1, 4, null, null, 3, 6]  →  false',
    sampleData: [5, 1, 4, 3, 6, 2],
    tests: ['valid_small', 'invalid_right_subtree', 'valid_large', 'duplicate_values', 'single_node', 'deep_bst'],
    starter: `function isValidBST(root) {
  // write your solution here
}`,
    optimal: `function isValidBST(root) {
  const check = (node, lo, hi) => {
    if (!node) {
      return true
    }
    if (node.val <= lo || node.val >= hi) {
      return false
    }
    return check(node.left, lo, node.val) && check(node.right, node.val, hi)
  }
  return check(root, -Infinity, Infinity)
}`,
  },
  {
    id: 'q29',
    title: 'Binary Search',
    topic: 'Binary Search',
    difficulty: 'Easy',
    day: 29,
    description:
      'Given a sorted array nums and a target value, return the index of the target, or -1 if it is not present. Must run in O(log n).',
    example: 'nums = [-1, 0, 3, 5, 9, 12], target = 9  →  4',
    sampleData: [-1, 0, 3, 5, 9, 12],
    tests: ['found_mid', 'found_left', 'found_right', 'not_found', 'single_elem', 'long_series'],
    starter: `function binarySearch(nums, target) {
  // write your solution here
}`,
    optimal: `function binarySearch(nums, target) {
  let left = 0
  let right = nums.length - 1
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2)
    if (nums[mid] === target) {
      return mid
    }
    if (nums[mid] < target) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }
  return -1
}`,
  },
  {
    id: 'q30',
    title: 'Search Insert Position',
    topic: 'Binary Search',
    difficulty: 'Easy',
    day: 30,
    description:
      'Given a sorted array of distinct integers and a target, return the index where the target would be inserted to keep the array sorted.',
    example: 'nums = [1, 3, 5, 6], target = 5  →  2 · target = 2  →  1',
    sampleData: [1, 3, 5, 6, 8, 10],
    tests: ['target_present', 'insert_middle', 'insert_start', 'insert_end', 'single_elem', 'long_series'],
    starter: `function searchInsert(nums, target) {
  // write your solution here
}`,
    optimal: `function searchInsert(nums, target) {
  let left = 0
  let right = nums.length
  while (left < right) {
    const mid = left + Math.floor((right - left) / 2)
    if (nums[mid] < target) {
      left = mid + 1
    } else {
      right = mid
    }
  }
  return left
}`,
  },
  {
    id: 'q31',
    title: 'Find Peak Element',
    topic: 'Binary Search',
    difficulty: 'Medium',
    day: 31,
    description:
      'A peak element is strictly greater than its neighbors. Given an array nums, return the index of any peak element. The array is not necessarily sorted.',
    example: 'nums = [1, 2, 3, 1]  →  2 (value 3)',
    sampleData: [1, 2, 3, 1, 5, 4],
    tests: ['classic_peak', 'single_elem', 'descending', 'ascending', 'two_peaks', 'long_series'],
    starter: `function findPeak(nums) {
  // write your solution here
}`,
    optimal: `function findPeak(nums) {
  let left = 0
  let right = nums.length - 1
  while (left < right) {
    const mid = left + Math.floor((right - left) / 2)
    if (nums[mid] > nums[mid + 1]) {
      right = mid
    } else {
      left = mid + 1
    }
  }
  return left
}`,
  },
  {
    id: 'q32',
    title: 'Search in Rotated Sorted Array',
    topic: 'Binary Search',
    difficulty: 'Medium',
    day: 32,
    description:
      'Given a rotated sorted array (e.g. [4,5,6,7,0,1,2]) and a target, return its index or -1. Must run in O(log n).',
    example: 'nums = [4, 5, 6, 7, 0, 1, 2], target = 0  →  4',
    sampleData: [4, 5, 6, 7, 0, 1, 2],
    tests: ['found_right_side', 'found_left_side', 'not_found', 'no_rotation', 'single_elem', 'duplicates'],
    starter: `function searchRotated(nums, target) {
  // write your solution here
}`,
    optimal: `function searchRotated(nums, target) {
  let left = 0
  let right = nums.length - 1
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2)
    if (nums[mid] === target) {
      return mid
    }
    if (nums[left] <= nums[mid]) {
      if (target >= nums[left] && target < nums[mid]) {
        right = mid - 1
      } else {
        left = mid + 1
      }
    } else if (target > nums[mid] && target <= nums[right]) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }
  return -1
}`,
  },
  {
    id: 'q33',
    title: 'Generate Parentheses',
    topic: 'Backtracking',
    difficulty: 'Medium',
    day: 33,
    description:
      'Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.',
    example: 'n = 3  →  ["((()))", "(()())", "(())()", "()(())", "()()()"]',
    sampleData: [3, 3, 2, 2, 1, 1],
    tests: ['n_one', 'n_two', 'n_three', 'n_four', 'order_balance', 'count_check'],
    starter: `function generateParenthesis(n) {
  // write your solution here
}`,
    optimal: `function generateParenthesis(n) {
  const result = []
  const build = (open, close, cur) => {
    if (cur.length === n * 2) {
      result.push(cur)
      return
    }
    if (open < n) {
      build(open + 1, close, cur + '(')
    }
    if (close < open) {
      build(open, close + 1, cur + ')')
    }
  }
  build(0, 0, '')
  return result
}`,
  },
  {
    id: 'q34',
    title: 'Subsets',
    topic: 'Backtracking',
    difficulty: 'Medium',
    day: 34,
    description:
      'Given an array of unique integers, return all possible subsets (the power set). The solution set must not contain duplicate subsets.',
    example: 'nums = [1, 2, 3]  →  8 subsets',
    sampleData: [1, 2, 3, 4, 5, 6],
    tests: ['empty_input', 'single_elem', 'two_elems', 'three_elems', 'five_elems', 'count_check'],
    starter: `function subsets(nums) {
  // write your solution here
}`,
    optimal: `function subsets(nums) {
  const result = []
  const build = (start, cur) => {
    result.push([...cur])
    for (let i = start; i < nums.length; i++) {
      cur.push(nums[i])
      build(i + 1, cur)
      cur.pop()
    }
  }
  build(0, [])
  return result
}`,
  },
  {
    id: 'q35',
    title: 'Word Search',
    topic: 'Backtracking',
    difficulty: 'Medium',
    day: 35,
    description:
      'Given an m x n grid of characters and a string word, return true if the word exists in the grid — formed by adjacent (horizontal or vertical) cells without reusing a cell.',
    example: 'grid = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"  →  true',
    sampleData: [4, 4, 6, 3, 3, 2],
    tests: ['word_found', 'word_missing', 'single_cell', 'snake_path', 'stuck_backtrack', 'duplicate_letters'],
    starter: `function exist(board, word) {
  // write your solution here
}`,
    optimal: `function exist(board, word) {
  const rows = board.length
  const cols = board[0].length
  const dfs = (r, c, i) => {
    if (i === word.length) {
      return true
    }
    if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== word[i]) {
      return false
    }
    const tmp = board[r][c]
    board[r][c] = '#'
    const found =
      dfs(r + 1, c, i + 1) ||
      dfs(r - 1, c, i + 1) ||
      dfs(r, c + 1, i + 1) ||
      dfs(r, c - 1, i + 1)
    board[r][c] = tmp
    return found
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (dfs(r, c, 0)) {
        return true
      }
    }
  }
  return false
}`,
  },
]

export const pickQuestion = ({ topic = 'All', difficulty = 'All', day = 'All' } = {}) => {
  const pool = questions.filter(
    (q) =>
      (topic === 'All' || q.topic === topic) &&
      (difficulty === 'All' || q.difficulty === difficulty) &&
      (day === 'All' || day === 'Daily' || q.day === day)
  )
  return pool[Math.floor(Math.random() * pool.length)] || questions[0]
}

export const days = questions.map((q) => q.day).sort((a, b) => a - b)

export const dailyQuestion = () => {
  const seed = daySeed()
  return questions[seed % questions.length]
}

export const questionOfDay = (q) => {
  const seed = daySeed()
  return q.id === questions[seed % questions.length].id
}

export const dailyForLevel = (level) => {
  const seed = daySeed()
  const pool =
    level.topic === 'Nightmare'
      ? questions.filter((q) => q.difficulty === 'Hard')
      : questions.filter((q) => q.topic === level.topic)
  const list = pool.length ? pool : questions
  const q = list[seed % list.length]
  return { ...q, day: Math.floor(seed / list.length) % 28 + 1 }
}