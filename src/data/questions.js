export const topics = ['Arrays', 'Strings', 'Hashing', 'Dynamic', 'Graphs']
export const difficulties = ['Easy', 'Medium', 'Hard']
export const days = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

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

export const dailyQuestion = () => {
  const now = new Date()
  const seed =
    now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  return questions[seed % questions.length]
}

export const questionOfDay = (q) => {
  const now = new Date()
  const seed =
    now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  return q.id === questions[seed % questions.length].id
}