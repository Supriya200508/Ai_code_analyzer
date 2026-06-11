/**
 * SeverityBadge
 * Renders a small colored pill: HIGH / MED / LOW
 */
import { SEVERITY, DEFAULT_SEVERITY } from "../constants/severity";

export default function SeverityBadge({ severity }) {
  const meta = SEVERITY[severity] ?? DEFAULT_SEVERITY;

  return (
    <span
      style={{
        fontSize:        10,
        fontWeight:      700,
        letterSpacing:   "0.08em",
        fontFamily:      "'IBM Plex Mono', monospace",
        color:           meta.color,
        background:      meta.bg,
        border:          `1px solid ${meta.border}`,
        borderRadius:    3,
        padding:         "2px 6px",
        whiteSpace:      "nowrap",
      }}
    >
      {meta.label}
    </span>
  );
}