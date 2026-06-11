import { useMemo, useRef, useState, useEffect, useCallback } from "react";

function diffLines(oldText, newText) {
  const a = oldText.split("\n");
  const b = newText.split("\n");
  const m = a.length;
  const n = b.length;

  // Build LCS table
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j]
        ? dp[i + 1][j + 1] + 1
        : Math.max(dp[i + 1][j], dp[i][j + 1]);

  // Trace back
  const removes = []; // indices in `a` that are removed
  const adds    = []; // indices in `b` that are added
  const pairs   = []; // { ai, bi } equal pairs

  let i = 0, j = 0;
  while (i < m || j < n) {
    if (i < m && j < n && a[i] === b[j]) {
      pairs.push({ ai: i, bi: j });
      i++; j++;
    } else if (j < n && (i >= m || dp[i][j + 1] >= dp[i + 1][j])) {
      adds.push(j);
      j++;
    } else {
      removes.push(i);
      i++;
    }
  }

  // Build unified row list — pair up removes with adds as "change" rows
  const rows = [];
  let ri = 0, ai = 0;
  let pi = 0; // pointer into pairs

  // We need to interleave in source order. Iterate over both sequences.
  let leftIdx = 0, rightIdx = 0;

  while (leftIdx < m || rightIdx < n) {
    // If next pair matches current position on both sides, emit equal
    if (
      pi < pairs.length &&
      pairs[pi].ai === leftIdx &&
      pairs[pi].bi === rightIdx
    ) {
      rows.push({ type: "equal", left: a[leftIdx], right: b[rightIdx] });
      leftIdx++; rightIdx++; pi++;
    } else {
      // Collect a run of removes and adds before the next equal pair
      const nextPairLeft  = pi < pairs.length ? pairs[pi].ai : m;
      const nextPairRight = pi < pairs.length ? pairs[pi].bi : n;

      const runLeft  = [];
      const runRight = [];

      while (leftIdx  < nextPairLeft)  runLeft.push(a[leftIdx++]);
      while (rightIdx < nextPairRight) runRight.push(b[rightIdx++]);

      // Zip removes + adds into "change" rows; pad shorter side with null
      const len = Math.max(runLeft.length, runRight.length);
      for (let k = 0; k < len; k++) {
        const l = runLeft[k]  ?? null;
        const r = runRight[k] ?? null;
        if (l !== null && r !== null) rows.push({ type: "change", left: l, right: r });
        else if (l !== null)          rows.push({ type: "remove", left: l, right: null });
        else                          rows.push({ type: "add",    left: null, right: r });
      }
    }
  }

  return rows;
}

// ── Inline token diff (character level for changed lines) ─────────────────────

function tokenDiff(a, b) {
  // Simple word-level diff for inline highlighting
  const wa = a.split(/(\s+)/);
  const wb = b.split(/(\s+)/);
  const m = wa.length, n = wb.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--)
      dp[i][j] = wa[i] === wb[j]
        ? dp[i + 1][j + 1] + 1
        : Math.max(dp[i + 1][j], dp[i][j + 1]);

  const leftTokens  = []; // { text, changed }
  const rightTokens = []; // { text, changed }
  let i = 0, j = 0;
  while (i < m || j < n) {
    if (i < m && j < n && wa[i] === wb[j]) {
      leftTokens.push({ text: wa[i], changed: false });
      rightTokens.push({ text: wb[j], changed: false });
      i++; j++;
    } else if (j < n && (i >= m || dp[i][j + 1] >= dp[i + 1][j])) {
      rightTokens.push({ text: wb[j], changed: true });
      j++;
    } else {
      leftTokens.push({ text: wa[i], changed: true });
      i++;
    }
  }
  return { leftTokens, rightTokens };
}

// ── Row renderer ──────────────────────────────────────────────────────────────

const ROW_STYLES = {
  equal:  { bg: "transparent",              marker: " ",  markerColor: "#334155" },
  remove: { bg: "rgba(248,113,113,0.08)",   marker: "−",  markerColor: "#f87171" },
  add:    { bg: "rgba(52,211,153,0.08)",    marker: "+",  markerColor: "#34d399" },
  change: { bg: "rgba(251,191,36,0.07)",    marker: "~",  markerColor: "#fbbf24" },
};

const TOKEN_HIGHLIGHT = {
  remove: "rgba(248,113,113,0.30)",
  add:    "rgba(52,211,153,0.30)",
  change: "rgba(251,191,36,0.28)",
};

function LineContent({ text, type, side, otherText }) {
  if (text === null) {
    // Ghost row — keeps alignment
    return (
      <span style={{ display: "block", opacity: 0, userSelect: "none", fontFamily: "inherit" }}>
        &nbsp;
      </span>
    );
  }

  if (type === "change" && otherText !== null) {
    const { leftTokens, rightTokens } = tokenDiff(
      side === "left" ? text : otherText,
      side === "left" ? otherText : text,
    );
    const tokens = side === "left" ? leftTokens : rightTokens;
    return (
      <span>
        {tokens.map((tok, i) =>
          tok.changed
            ? <mark key={i} style={{
                background:    TOKEN_HIGHLIGHT.change,
                borderRadius:  2,
                padding:       "0 1px",
                color:         "inherit",
              }}>{tok.text}</mark>
            : <span key={i}>{tok.text}</span>
        )}
      </span>
    );
  }

  return <span>{text}</span>;
}

function DiffRow({ row, lineNumLeft, lineNumRight }) {
  const style = ROW_STYLES[row.type];

  const cellStyle = (side) => ({
    display:       "flex",
    alignItems:    "flex-start",
    gap:           8,
    padding:       "1px 14px 1px 8px",
    background:    row.type === "equal" ? "transparent" : style.bg,
    minHeight:     22,
  });

  const lineNumStyle = {
    minWidth:   28,
    textAlign:  "right",
    color:      "#334155",
    userSelect: "none",
    fontSize:   11,
    fontFamily: "monospace",
    paddingTop: 1,
    flexShrink: 0,
  };

  const markerStyle = {
    minWidth:   12,
    color:      style.markerColor,
    fontFamily: "monospace",
    fontSize:   12,
    flexShrink: 0,
    paddingTop: 1,
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
      {/* Left pane */}
      <div style={{ ...cellStyle("left"), borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        <span style={lineNumStyle}>{row.left !== null ? lineNumLeft : ""}</span>
        <span style={markerStyle}>
          {row.type === "remove" || row.type === "change" ? style.marker : " "}
        </span>
        <span style={{ fontSize: 12, lineHeight: "22px", fontFamily: "'IBM Plex Mono', monospace", color: "#94a3b8", wordBreak: "break-all", flex: 1 }}>
          <LineContent text={row.left} type={row.type} side="left" otherText={row.right} />
        </span>
      </div>

      {/* Right pane */}
      <div style={cellStyle("right")}>
        <span style={lineNumStyle}>{row.right !== null ? lineNumRight : ""}</span>
        <span style={markerStyle}>
          {row.type === "add" || row.type === "change" ? (row.type === "add" ? "+" : style.marker) : " "}
        </span>
        <span style={{ fontSize: 12, lineHeight: "22px", fontFamily: "'IBM Plex Mono', monospace", color: "#94a3b8", wordBreak: "break-all", flex: 1 }}>
          <LineContent text={row.right} type={row.type} side="right" otherText={row.left} />
        </span>
      </div>
    </div>
  );
}

// ── Stats bar ─────────────────────────────────────────────────────────────────

function DiffStats({ rows }) {
  const added   = rows.filter(r => r.type === "add"    || r.type === "change").length;
  const removed = rows.filter(r => r.type === "remove" || r.type === "change").length;
  const equal   = rows.filter(r => r.type === "equal").length;

  return (
    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
      {removed > 0 && (
        <span style={{ fontSize: 11, fontFamily: "monospace", color: "#f87171" }}>
          −{removed} removed
        </span>
      )}
      {added > 0 && (
        <span style={{ fontSize: 11, fontFamily: "monospace", color: "#34d399" }}>
          +{added} added
        </span>
      )}
      <span style={{ fontSize: 11, fontFamily: "monospace", color: "#334155" }}>
        {equal} unchanged
      </span>
    </div>
  );
}

// ── Jump navigation ───────────────────────────────────────────────────────────

function useChangeNavigation(rows) {
  const [current, setCurrent] = useState(0);
  const changeIndices = useMemo(
    () => rows.reduce((acc, r, i) => (r.type !== "equal" ? [...acc, i] : acc), []),
    [rows],
  );

  const jumpTo = useCallback((dir) => {
    if (!changeIndices.length) return;
    setCurrent(prev => {
      const next = prev + dir;
      if (next < 0)                      return changeIndices.length - 1;
      if (next >= changeIndices.length)  return 0;
      return next;
    });
  }, [changeIndices]);

  return { changeIndices, current, jumpTo };
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function CodeDiffViewer({ originalCode, optimizedCode, language = "code" }) {
  const rows = useMemo(
    () => diffLines(originalCode || "", optimizedCode || ""),
    [originalCode, optimizedCode],
  );

  // Assign line numbers
  const rowsWithNums = useMemo(() => {
    let leftNum = 1, rightNum = 1;
    return rows.map(row => {
      const nums = { lineNumLeft: null, lineNumRight: null };
      if (row.left  !== null) nums.lineNumLeft  = leftNum++;
      if (row.right !== null) nums.lineNumRight = rightNum++;
      return { ...row, ...nums };
    });
  }, [rows]);

  const { changeIndices, current, jumpTo } = useChangeNavigation(rows);
  const containerRef = useRef(null);

  // Scroll to current change
  useEffect(() => {
    if (!containerRef.current || !changeIndices.length) return;
    const idx = changeIndices[current];
    const rowEl = containerRef.current.children[idx];
    rowEl?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [current, changeIndices]);

  const noChanges = rows.every(r => r.type === "equal");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

      {/* ── Toolbar ── */}
      <div style={{
        display:        "flex",
        alignItems:     "center",
        gap:            12,
        padding:        "10px 16px",
        borderBottom:   "1px solid rgba(255,255,255,0.06)",
        background:     "rgba(255,255,255,0.01)",
        flexShrink:     0,
      }}>
        {/* Pane labels */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", flex: 1, gap: 0 }}>
          <span style={{ fontSize: 10, fontFamily: "monospace", color: "#475569", paddingLeft: 50 }}>
            ORIGINAL · {language}
          </span>
          <span style={{ fontSize: 10, fontFamily: "monospace", color: "#34d399", paddingLeft: 50 }}>
            OPTIMIZED · {language}
          </span>
        </div>

        {/* Stats */}
        <DiffStats rows={rows} />

        {/* Jump nav */}
        {changeIndices.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
            <span style={{ fontSize: 10, fontFamily: "monospace", color: "#334155" }}>
              {current + 1}/{changeIndices.length}
            </span>
            <button onClick={() => jumpTo(-1)} style={navBtnStyle}>↑</button>
            <button onClick={() => jumpTo(+1)} style={navBtnStyle}>↓</button>
          </div>
        )}
      </div>

      {/* ── Legend ── */}
      <div style={{
        display:      "flex",
        gap:          16,
        padding:      "6px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        flexShrink:   0,
      }}>
        {[
          { color: "#f87171", bg: "rgba(248,113,113,0.08)", label: "removed" },
          { color: "#34d399", bg: "rgba(52,211,153,0.08)",  label: "added"   },
          { color: "#fbbf24", bg: "rgba(251,191,36,0.07)",  label: "changed" },
        ].map(({ color, bg, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: bg, border: `1px solid ${color}44`, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: "#334155", fontFamily: "monospace" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Diff rows ── */}
      {noChanges ? (
        <div style={{
          flex:           1,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          flexDirection:  "column",
          gap:            8,
          color:          "#334155",
        }}>
          <span style={{ fontSize: 20 }}>✓</span>
          <span style={{ fontSize: 12, fontFamily: "monospace" }}>no differences — code is already optimal</span>
        </div>
      ) : (
        <div ref={containerRef} style={{ flex: 1, overflowY: "auto" }}>
          {rowsWithNums.map((row, i) => (
            <DiffRow
              key={i}
              row={row}
              lineNumLeft={row.lineNumLeft}
              lineNumRight={row.lineNumRight}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const navBtnStyle = {
  background:   "rgba(255,255,255,0.05)",
  border:       "1px solid rgba(255,255,255,0.10)",
  borderRadius: 3,
  color:        "#64748b",
  fontSize:     11,
  width:        22,
  height:       22,
  cursor:       "pointer",
  display:      "flex",
  alignItems:   "center",
  justifyContent: "center",
  fontFamily:   "monospace",
  padding:      0,
};