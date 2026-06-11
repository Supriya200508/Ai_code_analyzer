import { useState, useEffect } from "react";
import IssueCard        from "./IssueCard";
import FixCard          from "./FixCard";
import StatPill         from "./StatPill";
import Connectionstatus from "./Connectionstatus";
import CodeDiffViewer   from "./CodeDiffViewer";
import { SEVERITY }     from "../constants/severity";

const TABS = [
  { id: "issues",    label: "Issues"    },
  { id: "fixes",     label: "Fixes"     },
  { id: "optimized", label: "Optimized" },
  { id: "diff",      label: "Diff"      },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-800">
      <div style={{ border: "1px solid rgba(255,255,255,0.05)" }}
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl">
        ◈
      </div>
      <p className="font-mono text-[11px] tracking-widest">
        paste code · select language · analyze
      </p>
    </div>
  );
}

function Skeleton({ elapsed }) {
  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <div style={{ display: "flex", gap: 4 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 5, height: 5, borderRadius: "50%", background: "#3b82f6",
              animation: `pulse-dot 1s ease ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
        <span className="font-mono text-[11px] text-slate-600">
          Analyzing{elapsed > 0 ? ` · ${elapsed}s` : "…"}
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        {[78, 55, 88, 48, 65, 72].map((w, i) => (
          <div key={i} className="h-3 rounded animate-shimmer"
            style={{ width: `${w}%`, animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    </div>
  );
}

function TabBar({ activeTab, onTabChange, result }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {TABS.map(tab => {
        const count =
          tab.id === "issues" ? result.issues?.length :
          tab.id === "fixes"  ? result.fixes?.length  : null;
        const active = activeTab === tab.id;
        return (
          <button key={tab.id} onClick={() => onTabChange(tab.id)}
            style={{
              background:  active ? "rgba(59,130,246,0.15)" : "transparent",
              borderColor: active ? "rgba(59,130,246,0.30)" : "transparent",
              color:       active ? "#93c5fd" : "#475569",
              transition:  "all 0.15s",
            }}
            className="flex items-center gap-1.5 px-3 py-1 border rounded font-mono text-[11px] cursor-pointer"
          >
            {tab.label}
            {count != null && (
              <span style={{
                background: active ? "rgba(59,130,246,0.30)" : "rgba(255,255,255,0.06)",
                color: active ? "#93c5fd" : "#334155",
              }} className="text-[9px] px-1.5 py-px rounded-full">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function SummaryBar({ issues }) {
  const hi = issues.filter(i => i.severity === "high" || i.severity === "critical").length;
  const me = issues.filter(i => i.severity === "medium").length;
  const lo = issues.filter(i => i.severity === "low").length;
  if (!issues.length)
    return <StatPill label="no issues found" value="✓" color={SEVERITY.low.color} />;
  return <>
    {hi > 0 && <StatPill label="critical" value={hi} color={SEVERITY.high.color} />}
    {me > 0 && <StatPill label="warnings" value={me} color={SEVERITY.medium.color} />}
    {lo > 0 && <StatPill label="info"     value={lo} color={SEVERITY.low.color}   />}
  </>;
}

function IssuesTab({ result }) {
  return (
    <div className="flex flex-col gap-2">
      {result.issues.length === 0
        ? <p className="py-8 text-center font-mono text-[12px] text-emerald-400">✓ no issues detected</p>
        : result.issues.map((iss, i) => <IssueCard key={i} issue={iss} index={i} />)
      }
      {result.explanation && (
        <div className="mt-2 p-4 rounded-md"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600 mb-1.5">summary</p>
          <p className="text-[12px] text-slate-500 leading-relaxed">{result.explanation}</p>
        </div>
      )}
    </div>
  );
}

function FixesTab({ result }) {
  return (
    <div className="flex flex-col gap-2">
      {result.suggestions.length === 0
        ? <p className="py-8 text-center font-mono text-[12px] text-emerald-400">✓ nothing to fix</p>
        : result.suggestions.map((fix, i) => <FixCard key={i} fix={fix} index={i} />)
      }
    </div>
  );
}

function OptimizedTab({ result, language }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(result.optimized_code || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <span className="font-mono text-[10px] text-slate-600">{language} · optimized</span>
        <button onClick={copy} style={{
          background:  copied ? "rgba(52,211,153,0.10)" : "rgba(255,255,255,0.05)",
          borderColor: copied ? "rgba(52,211,153,0.30)" : "rgba(255,255,255,0.10)",
          color:       copied ? "#34d399" : "#64748b", transition: "all 0.2s",
        }} className="font-mono text-[10px] px-2.5 py-1 border rounded cursor-pointer">
          {copied ? "copied ✓" : "copy"}
        </button>
      </div>
      <pre style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 6,
      }} className="p-4 overflow-auto text-[12px] leading-7 text-slate-400 font-mono whitespace-pre-wrap break-words">
        {result.optimized_code || "// no changes suggested"}
      </pre>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function ResultsPanel({
  originalCode,
  result, loading, error, errorKind, elapsed, language, onRetry,
}) {
   const [activeTab, setActiveTab] = useState("issues");
   console.log("Full Result:", result);

  useEffect(() => { if (result) setActiveTab("issues"); }, [result]);

  // Diff tab needs full height — no inner scroll padding
  const isDiff = activeTab === "diff" && result;

  return (
    <div className="flex flex-col overflow-hidden">

      {/* Header */}
      {result && (
        <div className="px-5 py-3 border-b border-white/[0.05] bg-white/[0.01] shrink-0">
          <div className="flex gap-2 flex-wrap mb-3">
            <SummaryBar issues={result.issues} />
          </div>
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} result={result} />
        </div>
      )}

      {/* Content */}
      <div className={`flex-1 overflow-hidden ${isDiff ? "" : "overflow-y-auto p-4"}`}
        style={isDiff ? {} : undefined}>

        {!result && !loading && !error && <EmptyState />}
        {loading && <Skeleton elapsed={elapsed} />}

        {error && !loading && (
          <div className="flex flex-col gap-3 p-4">
            <div className="p-4 rounded-md"
              style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.22)" }}>
              <p className="font-mono text-[10px] uppercase tracking-widest text-red-400 mb-1">error</p>
              <p className="text-[13px] text-slate-400">{error}</p>
            </div>
            <Connectionstatus errorKind={errorKind} onRetry={onRetry} />
          </div>
        )}

        {result && !loading && (
          <>
            {activeTab === "issues"    && <div className="p-4"><IssuesTab    result={result} /></div>}
            {activeTab === "fixes"     && <div className="p-4"><FixesTab     result={result} /></div>}
            {activeTab === "optimized" && <div className="p-4"><OptimizedTab result={result} language={language ?? "code"} /></div>}
            {activeTab === "diff"      && (
              <CodeDiffViewer
                originalCode={originalCode}
                optimizedCode={result.optimized_code}
                language={language ?? "code"}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}