export const levels = [
  {
    id: '01',
    title: 'Arrays 101',
    desc: 'Two-sum, sliding windows and the classics that build your muscle memory.',
    diff: 'Easy',
    color: '#34d399',
    xp: 250,
    bestTime: 96,
    tests: [
      { name: 'sample_two_sum', time: 12, passed: true },
      { name: 'duplicates_scan', time: 18, passed: true },
      { name: 'window_max', time: 24, passed: true },
      { name: 'rotated_search', time: 33, passed: true },
      { name: 'large_array_1e6', time: 41, passed: true },
      { name: 'edge_negatives', time: 9, passed: true },
    ],
  },
  {
    id: '02',
    title: 'String Theory',
    desc: 'Palindromes, anagrams and pattern matching under the clock.',
    diff: 'Easy',
    color: '#34d399',
    xp: 300,
    bestTime: 110,
    tests: [
      { name: 'palindrome_check', time: 11, passed: true },
      { name: 'anagram_pair', time: 14, passed: true },
      { name: 'pattern_match', time: 22, passed: true },
      { name: 'unicode_sentence', time: 31, passed: true },
      { name: 'repeated_substring', time: 19, passed: true },
      { name: 'empty_input', time: 6, passed: true },
    ],
  },
  {
    id: '03',
    title: 'Hash & Hustle',
    desc: 'Maps, sets and cache tricks — speed is everything in this gauntlet.',
    diff: 'Medium',
    color: '#fbbf24',
    xp: 500,
    bestTime: 150,
    tests: [
      { name: 'pair_sum_index', time: 16, passed: true },
      { name: 'freq_counter', time: 21, passed: true },
      { name: 'cache_hit_chain', time: 27, passed: true },
      { name: 'sliding_window_sum', time: 34, passed: true },
      { name: 'unicode_anagram', time: 40, passed: false },
      { name: 'duplicate_detect', time: 13, passed: true },
      { name: 'stress_1m_ops', time: 52, passed: true },
    ],
  },
  {
    id: '04',
    title: 'Graph Runner',
    desc: 'BFS, Dijkstra and a maze that fights back. Bring a stack.',
    diff: 'Medium',
    color: '#fbbf24',
    xp: 750,
    bestTime: 170,
    tests: [
      { name: 'bfs_shortest', time: 28, passed: true },
      { name: 'dijkstra_path', time: 45, passed: true },
      { name: 'cycle_detect', time: 37, passed: true },
      { name: 'maze_escape', time: 49, passed: true },
      { name: 'weighted_edges', time: 56, passed: true },
    ],
  },
  {
    id: '05',
    title: 'DP Dungeon',
    desc: 'Memoization or die. Recursive riddles with exponential stakes.',
    diff: 'Hard',
    color: '#f87171',
    xp: 1200,
    bestTime: 300,
    tests: [
      { name: 'fib_memo', time: 14, passed: true },
      { name: 'coin_change', time: 26, passed: true },
      { name: 'knapsack', time: 33, passed: true },
      { name: 'lcs_long', time: 58, passed: false },
      { name: 'partition_subset', time: 71, passed: false },
      { name: 'edit_distance', time: 49, passed: false },
      { name: 'palindromic_split', time: 64, passed: false },
      { name: 'mega_case_2m', time: 120, passed: false },
    ],
  },
  {
    id: '06',
    title: 'Nightmare Mode',
    desc: 'Weekly boss challenges. Only the top 1% earn the Legend badge.',
    diff: 'Nightmare',
    color: '#a78bfa',
    xp: 2500,
    bestTime: 420,
    tests: [
      { name: 'base_case', time: 9, passed: true },
      { name: 'dynamic_state', time: 44, passed: false },
      { name: 'bitmask_trick', time: 61, passed: false },
      { name: 'constraint_hard', time: 77, passed: false },
      { name: 'hidden_case_a', time: 88, passed: false },
      { name: 'hidden_case_b', time: 96, passed: false },
      { name: 'stress_4m', time: 140, passed: false },
      { name: 'final_boss', time: 158, passed: false },
    ],
  },
]

export const snippet = [
  'for (i, j) in pairs(nums):',
  '    if nums[i] + nums[j] == target:',
  '        return [i, j]',
]

export const rankFor = (ratio) => {
  if (ratio >= 0.95) return { letter: 'S', color: '#fbbf24' }
  if (ratio >= 0.85) return { letter: 'A', color: '#a78bfa' }
  if (ratio >= 0.7) return { letter: 'B', color: '#34d399' }
  if (ratio >= 0.55) return { letter: 'C', color: '#22d3ee' }
  return { letter: 'D', color: '#f87171' }
}