/**
 * ConnectionStatus
 * ────────────────
 * Banner that appears when the API is unreachable.
 * Polls /health every 5 s and dismisses itself once the server is back.
 *
 * Props:
 *   errorKind  {string|null}  — ApiError.kind from useCodeAnalysis
 *   onRetry    {Function}     — callback to re-run the analysis
 */

import { useEffect, useState, useCallback } from "react";

const HEALTH_URL     = "/health";
const POLL_INTERVAL  = 5_000;

// Icon per error kind
const KIND_META = {
  network: { icon: "⚡", label: "Backend unreachable",  color: "#f87171", tip: "Make sure the FastAPI server is running on port 8000."  },
  timeout: { icon: "⏱",  label: "Request timed out",    color: "#fbbf24", tip: "The server is taking too long. Try again in a moment."   },
  server:  { icon: "⬡",  label: "Server error",          color: "#f87171", tip: "The backend returned an error. Check the server logs."   },
  parse:   { icon: "⬡",  label: "Bad response",          color: "#fbbf24", tip: "The server returned unexpected data."                    },
  abort:   { icon: "✕",  label: "Request cancelled",     color: "#94a3b8", tip: "The request was cancelled."                              },
};

export default function ConnectionStatus({ errorKind, onRetry }) {
  const [serverUp,    setServerUp]    = useState(null);   // null=unknown true/false
  const [lastChecked, setLastChecked] = useState(null);

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(HEALTH_URL, { cache: "no-store" });
      setServerUp(res.ok);
    } catch {
      setServerUp(false);
    }
    setLastChecked(new Date());
  }, []);

  // Poll while there's a network/timeout error
  useEffect(() => {
    if (errorKind !== "network" && errorKind !== "timeout") return;

    checkHealth();
    const id = setInterval(checkHealth, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [errorKind, checkHealth]);

  // Auto-retry once server comes back up
  useEffect(() => {
    if (serverUp === true && (errorKind === "network" || errorKind === "timeout")) {
      onRetry?.();
    }
  }, [serverUp, errorKind, onRetry]);

  if (!errorKind) return null;

  const meta = KIND_META[errorKind] ?? KIND_META.server;

  return (
    <div
      style={{
        background: "rgba(15,20,30,0.95)",
        border:     `1px solid ${meta.color}33`,
        borderLeft: `3px solid ${meta.color}`,
        borderRadius: "0 6px 6px 0",
        padding:    "12px 16px",
        display:    "flex",
        gap:        12,
        alignItems: "flex-start",
        animation:  "fadeUp 0.25s ease both",
      }}
    >
      {/* icon */}
      <span style={{ fontSize: 16, color: meta.color, marginTop: 1 }}>
        {meta.icon}
      </span>

      {/* text block */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: "0 0 3px", fontSize: 12, fontWeight: 600, color: meta.color }}>
          {meta.label}
        </p>
        <p style={{ margin: "0 0 8px", fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>
          {meta.tip}
        </p>

        {/* health poll status */}
        {(errorKind === "network" || errorKind === "timeout") && (
          <p style={{ margin: "0 0 8px", fontSize: 10, color: "#334155", fontFamily: "monospace" }}>
            {serverUp === null  && "Checking server…"}
            {serverUp === true  && "✓ Server is up — retrying…"}
            {serverUp === false && `✗ Server still unreachable${lastChecked ? ` · last checked ${lastChecked.toLocaleTimeString()}` : ""}`}
          </p>
        )}

        {/* actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onRetry}
            style={{
              background:   "rgba(59,130,246,0.12)",
              border:       "1px solid rgba(59,130,246,0.30)",
              borderRadius: 4,
              color:        "#93c5fd",
              fontSize:     11,
              padding:      "3px 10px",
              cursor:       "pointer",
              fontFamily:   "monospace",
            }}
          >
            retry
          </button>

          {(errorKind === "network" || errorKind === "timeout") && (
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              style={{
                background:   "transparent",
                border:       "1px solid rgba(255,255,255,0.08)",
                borderRadius: 4,
                color:        "#475569",
                fontSize:     11,
                padding:      "3px 10px",
                cursor:       "pointer",
                fontFamily:   "monospace",
                textDecoration: "none",
              }}
            >
              open docs ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}