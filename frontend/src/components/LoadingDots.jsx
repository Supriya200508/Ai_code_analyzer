/**
 * LoadingDots
 * ───────────
 * Three pulsing dots shown while the API request is in-flight.
 * Uses the pulse-dot keyframe defined in index.css.
 */

export default function LoadingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width:        5,
            height:       5,
            borderRadius: "50%",
            background:   "#3b82f6",
            animation:    `pulse-dot 1s ease ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}