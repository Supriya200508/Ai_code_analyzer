/**
 * IssueCard
 * One row in the Issues tab — coloured left border, severity badge, type tag.
 */
import SeverityBadge from "./SeverityBadge";
import { SEVERITY, DEFAULT_SEVERITY } from "../constants/severity";

export default function IssueCard({ issue, index }) {
  const meta = SEVERITY[issue.severity] ?? DEFAULT_SEVERITY;

  return (
    <div
      style={{
        display:    "flex",
        gap:        14,
        padding:    "13px 15px",
        background: "rgba(255,255,255,0.025)",
        border:     "1px solid rgba(255,255,255,0.07)",
        borderLeft: `3px solid ${meta.color}`,
        borderRadius: "0 6px 6px 0",
        animation:  "fadeUp 0.3s ease both",
        animationDelay: `${index * 55}ms`,
      }}
    >
      {/* line number */}
      <span
        style={{
          color:      "#334155",
          fontSize:   10,
          fontFamily: "monospace",
          minWidth:   18,
          paddingTop: 2,
          userSelect: "none",
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display:    "flex",
            gap:        6,
            alignItems: "center",
            flexWrap:   "wrap",
            marginBottom: 6,
          }}
        >
          <SeverityBadge severity={issue.severity} />
          {/* <TypeTag type={issue.category} /> */}
        </div>
        <p style={{ margin: 0, fontSize: 12, color: "#cbd5e1", lineHeight: 1.6 }}>
          {issue.message}
        </p>
      </div>
    </div>
  );
}