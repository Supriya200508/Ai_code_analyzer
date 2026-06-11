/**
 * diff.js
 * ───────
 * Pure JS line-level diff (no external deps).
 *
 * Uses the classic Myers shortest-edit-script algorithm via an LCS table.
 * Returns an array of DiffLine objects ready to render in the comparison view.
 *
 * Types:
 *   "equal"   — line exists in both sides (shown on both)
 *   "removed" — line only in original  (shown red on left)
 *   "added"   — line only in optimized (shown green on right)
 */

/**
 * @typedef {Object} DiffLine
 * @property {"equal"|"removed"|"added"} type
 * @property {string}      text       — raw line text
 * @property {number|null} leftLine   — 1-based line number on left,  null if added
 * @property {number|null} rightLine  — 1-based line number on right, null if removed
 */

/**
 * Build an LCS length table for two arrays.
 * @param {string[]} a
 * @param {string[]} b
 * @returns {number[][]}
 */
function lcsTable(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp;
}

/**
 * Walk the LCS table back-to-front and collect diff operations.
 * @param {number[][]} dp
 * @param {string[]}   a
 * @param {string[]}   b
 * @returns {Array<{type: string, text: string}>}
 */
function backtrack(dp, a, b) {
  const result = [];
  let i = a.length;
  let j = b.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      result.push({ type: "equal", text: a[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.push({ type: "added", text: b[j - 1] });
      j--;
    } else {
      result.push({ type: "removed", text: a[i - 1] });
      i--;
    }
  }
  return result.reverse();
}

/**
 * Diff two source-code strings line by line.
 *
 * @param {string} original   — left side (original code)
 * @param {string} optimized  — right side (optimized code)
 * @returns {DiffLine[]}
 */
export function diffLines(original, optimized) {
  const aLines = original.split("\n");
  const bLines = optimized.split("\n");

  const dp  = lcsTable(aLines, bLines);
  const ops = backtrack(dp, aLines, bLines);

  let leftNum  = 1;
  let rightNum = 1;

  return ops.map((op) => {
    switch (op.type) {
      case "equal":
        return { type: "equal", text: op.text, leftLine: leftNum++, rightLine: rightNum++ };
      case "removed":
        return { type: "removed", text: op.text, leftLine: leftNum++, rightLine: null };
      case "added":
        return { type: "added", text: op.text, leftLine: null, rightLine: rightNum++ };
      default:
        return op;
    }
  });
}

/**
 * Count changes in a diff result.
 * @param {DiffLine[]} diff
 * @returns {{ added: number, removed: number, changed: number }}
 */
export function diffStats(diff) {
  const added   = diff.filter(d => d.type === "added").length;
  const removed = diff.filter(d => d.type === "removed").length;
  return { added, removed, changed: added + removed };
}