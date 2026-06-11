/**
 * StatPill
 * ────────
 * Dot + label + count summary pill used in the ResultsPanel header.
 *
 * Props:
 *   label  {string}  — descriptive text, e.g. "critical"
 *   value  {number|string} — the count or symbol to display
 *   color  {string}  — hex color for the dot and value, e.g. "#f87171"
 */

export default function StatPill({ label, value, color }) {
  return (
    <div
      style={{
        display:      "flex",
        alignItems:   "center",
        gap:          7,
        padding:      "5px 11px",
        background:   "rgba(255,255,255,0.04)",
        border:       "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
      }}
    >
      {/* colored dot */}
      <span
        style={{
          width:        5,
          height:       5,
          borderRadius: "50%",
          background:   color,
          flexShrink:   0,
        }}
      />

      {/* label */}
      <span style={{ fontSize: 11, color: "#64748b" }}>
        {label}
      </span>

      {/* value */}
      <span
        style={{
          fontSize:   12,
          fontWeight: 600,
          color,
          fontFamily: "monospace",
        }}
      >
        {value}
      </span>
    </div>
  );
}