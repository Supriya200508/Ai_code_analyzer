/**
 * FixCard
 * One entry in the Fixes tab — green-tinted card referencing the parent issue.
 */
export default function FixCard({ fix, index }) {
  return (
    <div
      style={{
        padding:    "13px 15px",
        background: "rgba(52,211,153,0.04)",
        border:     "1px solid rgba(52,211,153,0.14)",
        borderRadius: 6,
        animation:  "fadeUp 0.3s ease both",
        animationDelay: `${index * 55}ms`,
      }}
    >
      <p
        style={{
          margin:        "0 0 6px",
          fontSize:      10,
          color:         "#34d399",
          fontFamily:    "monospace",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        fix #{index + 1}
      </p>

      <p
        style={{
          margin:      "0 0 6px",
          fontSize:    11,
          color:       "#475569",
          fontStyle:   "italic",
          lineHeight:  1.45,
        }}
      >
        re: {fix.issue}
      </p>

      <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", lineHeight: 1.65 }}>
        {fix.suggestion}
      </p>
    </div>
  );
}