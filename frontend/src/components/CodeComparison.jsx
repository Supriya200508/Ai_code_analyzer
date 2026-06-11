/**
 * CodeComparison
 * ──────────────
 * Side-by-side diff viewer.
 * Left  — original code  (red highlights for removed lines)
 * Right — optimized code (green highlights for added lines)
 * Equal lines render in neutral color on both sides.
 *
 * Props:
 *   originalCode  {string}   raw original code (from editor)
 *   optimizedCode {string}   AI-returned optimized code
 *   language      {string}   display label only (e.g. "python")
 */

import { useMemo, useState, useCallback } from "react";
import { diffLines, diffStats } from "../utils/diff";

// ── Design tokens (dark-panel palette matching the rest of the app) ───────────

const C = {
  bg:           "transparent",
  lineBg:       "rgba(255,255,255,0.00)",
  equalText:    "#94a3b8",
  removedBg:    "rgba(248, 113, 113, 0.10)",
  removedText:  "#fca5a5",
  removedBorder:"rgba(248, 113, 113, 0.35)",
  addedBg:      "rgba(52,  211, 153, 0.10)",
  addedText:    "#6ee7b7",
  addedBorder:  "rgba(52,  211, 153, 0.35)",
  lineNumColor: "#334155",
  headerBg:     "rgba(255,255,255,0.03)",
  borderColor:  "rgba(255,255,255,0.07)",
  divider:      "rgba(255,255,255,0.05)",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Map line type → style values for a cell */
function lineStyle(type) {
  switch (type) {
    case "removed":
      return {
        bg:     C.removedBg,
        border: C.removedBorder,
        color:  C.removedText,
        gutter: "#f87171",
        symbol: "−",
      };
    case "added":
      return {
        bg:     C.addedBg,
        border: C.addedBorder,
        color:  C.addedText,
        gutter: "#34d399",
        symbol: "+",
      };
    default:
      return {
        bg:     "transparent",
        border: "transparent",
        color:  C.equalText,
        gutter: C.lineNumColor,
        symbol: " ",
      };
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PanelHeader({ label, tag, tagColor }) {
  return (
    <div
      style={{
        display:        "flex",
        alignItems:     "center",
        gap:            8,
        padding:        "9px 14px",
        background:     C.headerBg,
        borderBottom:   `1px solid ${C.borderColor}`,
        fontFamily:     "'IBM Plex Mono', monospace",
        userSelect:     "none",
      }}
    >
      <span style={{ fontSize: 11, color: "#475569" }}>{label}</span>
      <span
        style={{
          marginLeft:    "auto",
          fontSize:      10,
          fontWeight:    600,
          letterSpacing: "0.06em",
          color:         tagColor,
          background:    `${tagColor}1a`,
          border:        `1px solid ${tagColor}33`,
          borderRadius:  3,
          padding:       "1px 7px",
        }}
      >
        {tag}
      </span>
    </div>
  );
}

/**
 * A single line cell used in both left and right panels.
 * lineNum null  → blank gutter (e.g. added line has no left number)
 * text    null  → blank row (added line placeholder on left side)
 */
function LineCell({ lineNum, text, type, isPlaceholder }) {
  const s = lineStyle(isPlaceholder ? "equal" : type);

  return (
    <div
      style={{
        display:         "flex",
        alignItems:      "stretch",
        background:      isPlaceholder ? "rgba(255,255,255,0.015)" : s.bg,
        borderLeft:      isPlaceholder ? "none" : `2px solid ${s.border}`,
        minHeight:       24,
      }}
    >
      {/* gutter — symbol + line number */}
      <div
        style={{
          display:        "flex",
          alignItems:     "center",
          gap:            6,
          minWidth:       52,
          padding:        "2px 10px 2px 8px",
          borderRight:    `1px solid ${C.divider}`,
          flexShrink:     0,
        }}
      >
        <span style={{ fontSize: 10, color: s.gutter, width: 8, textAlign: "center", fontFamily: "monospace" }}>
          {isPlaceholder ? "" : s.symbol}
        </span>
        <span style={{ fontSize: 10, color: C.lineNumColor, minWidth: 24, textAlign: "right", fontFamily: "monospace" }}>
          {lineNum ?? ""}
        </span>
      </div>

      {/* code */}
      <pre
        style={{
          flex:        1,
          margin:      0,
          padding:     "3px 12px",
          fontSize:    12,
          lineHeight:  1.75,
          color:       isPlaceholder ? "transparent" : s.color,
          fontFamily:  "'IBM Plex Mono', monospace",
          whiteSpace:  "pre",
          overflow:    "hidden",
          background:  "transparent",
        }}
        dangerouslySetInnerHTML={{ __html: isPlaceholder ? "&nbsp;" : escapeHtml(text ?? "") }}
      />
    </div>
  );
}

function StatBadge({ label, value, color }) {
  return (
    <span
      style={{
        fontSize:      11,
        color,
        background:    `${color}18`,
        border:        `1px solid ${color}33`,
        borderRadius:  3,
        padding:       "2px 8px",
        fontFamily:    "monospace",
        fontWeight:    600,
      }}
    >
      {value > 0 ? `${value > 0 ? "+" : ""}${value}` : "0"} {label}
    </span>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function CodeComparison({ originalCode, optimizedCode, language }) {
  const [copied, setCopied] = useState(false);

  const diff  = useMemo(() => diffLines(originalCode ?? "", optimizedCode ?? ""), [originalCode, optimizedCode]);
  const stats = useMemo(() => diffStats(diff), [diff]);

  const copyOptimized = useCallback(() => {
    navigator.clipboard.writeText(optimizedCode ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [optimizedCode]);

  /**
   * Build parallel left / right row arrays.
   * Each entry is { lineNum, text, type } or { placeholder: true }.
   * "removed" lines add a placeholder on the right to keep rows aligned.
   * "added"   lines add a placeholder on the left.
   */
  const { leftRows, rightRows } = useMemo(() => {
    const left  = [];
    const right = [];

    diff.forEach((line) => {
      if (line.type === "equal") {
        left.push ({ lineNum: line.leftLine,  text: line.text, type: "equal" });
        right.push({ lineNum: line.rightLine, text: line.text, type: "equal" });
      } else if (line.type === "removed") {
        left.push ({ lineNum: line.leftLine, text: line.text, type: "removed" });
        right.push({ placeholder: true });
      } else {
        // added
        left.push ({ placeholder: true });
        right.push({ lineNum: line.rightLine, text: line.text, type: "added" });
      }
    });

    return { leftRows: left, rightRows: right };
  }, [diff]);

  const noDiff = stats.changed === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

      {/* ── Toolbar ── */}
      <div
        style={{
          display:      "flex",
          alignItems:   "center",
          gap:          8,
          padding:      "10px 14px",
          background:   C.headerBg,
          borderBottom: `1px solid ${C.borderColor}`,
          flexWrap:     "wrap",
        }}
      >
        <span style={{ fontSize: 11, color: "#475569", fontFamily: "monospace", marginRight: 4 }}>
          {language} diff
        </span>

        {noDiff ? (
          <span style={{ fontSize: 11, color: "#34d399", fontFamily: "monospace" }}>
            ✓ no changes
          </span>
        ) : (
          <>
            <StatBadge label="added"   value={stats.added}   color="#34d399" />
            <StatBadge label="removed" value={-stats.removed} color="#f87171" />
          </>
        )}

        <button
          onClick={copyOptimized}
          style={{
            marginLeft:   "auto",
            background:   copied ? "rgba(52,211,153,0.10)" : "rgba(255,255,255,0.05)",
            border:       `1px solid ${copied ? "rgba(52,211,153,0.30)" : "rgba(255,255,255,0.10)"}`,
            borderRadius: 4,
            color:        copied ? "#34d399" : "#64748b",
            fontSize:     11,
            padding:      "4px 10px",
            cursor:       "pointer",
            fontFamily:   "monospace",
            transition:   "all 0.2s",
          }}
        >
          {copied ? "copied ✓" : "copy optimized"}
        </button>
      </div>

      {/* ── Side-by-side panels ── */}
      <div
        style={{
          display:             "grid",
          gridTemplateColumns: "1fr 1fr",
          border:              `1px solid ${C.borderColor}`,
          borderTop:           "none",
          borderRadius:        "0 0 6px 6px",
          overflow:            "hidden",
        }}
      >
        {/* LEFT — original */}
        <div style={{ borderRight: `1px solid ${C.divider}`, overflow: "hidden" }}>
          <PanelHeader label="original" tag="before" tagColor="#f87171" />
          <div style={{ overflowX: "auto" }}>
            {leftRows.map((row, i) =>
              row.placeholder
                ? <LineCell key={i} isPlaceholder />
                : <LineCell key={i} lineNum={row.lineNum} text={row.text} type={row.type} />
            )}
          </div>
        </div>

        {/* RIGHT — optimized */}
        <div style={{ overflow: "hidden" }}>
          <PanelHeader label="optimized" tag="after" tagColor="#34d399" />
          <div style={{ overflowX: "auto" }}>
            {rightRows.map((row, i) =>
              row.placeholder
                ? <LineCell key={i} isPlaceholder />
                : <LineCell key={i} lineNum={row.lineNum} text={row.text} type={row.type} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}