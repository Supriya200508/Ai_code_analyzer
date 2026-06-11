/**
 * CodeEditor
 * ──────────
 * Left panel: language dropdown, code textarea, line/char counter, analyze button.
 * Purely presentational — all state lives in useCodeAnalysis via App.
 */

import { LANGUAGES }    from "../constants/languages";
import LoadingDots from "./LoadingDots";

const PLACEHOLDER = `# Paste your code here…

def divide(a, b):
    try:
        return a / b
    except:
        pass

def fetch_user(id):
    query = "SELECT * FROM users WHERE id = " + id
    return db.execute(query)`;

export default function CodeEditor({
  code,
  language,
  loading,
  onCodeChange,
  onLanguageChange,
  onAnalyze,
}) {
  const lineCount = code ? code.split("\n").length : 0;
  const charCount = code.length;
  const canAnalyze = !loading && code.trim().length > 0;

  return (
    <div className="flex flex-col border-r border-white/[0.06] overflow-hidden">

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 px-5 py-2.5 border-b border-white/[0.05] bg-white/[0.01] shrink-0">

        <span className="font-mono text-[10px] text-slate-600 mr-1">lang:</span>

        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="bg-white/[0.05] border border-white/[0.10] rounded text-slate-400
                     text-xs px-2 py-1 font-mono cursor-pointer
                     focus:outline-none focus:border-blue-500/50"
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>

        {/* right side — stats + clear */}
        <div className="ml-auto flex items-center gap-3">
          {code.trim() && (
            <span className="font-mono text-[10px] text-slate-700">
              {lineCount}L · {charCount}ch
            </span>
          )}
          <button
            onClick={() => { onCodeChange(""); }}
            className="font-mono text-[10px] text-slate-700 hover:text-slate-500
                       transition-colors bg-transparent border-none cursor-pointer px-1"
          >
            clear
          </button>
        </div>
      </div>

      {/* ── Textarea ── */}
      <textarea
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        placeholder={PLACEHOLDER}
        spellCheck={false}
        className="flex-1 bg-transparent border-none resize-none
                   text-slate-400 text-[13px] leading-7
                   font-mono px-6 py-5 overflow-auto
                   focus:outline-none placeholder:text-slate-800
                   caret-blue-500"
      />

      {/* ── Analyze button ── */}
      <div className="px-5 py-4 border-t border-white/[0.05] bg-white/[0.01] shrink-0">
        <button
          onClick={() => onAnalyze()}
          disabled={!canAnalyze}
          style={{
            background: canAnalyze
              ? "rgba(59,130,246,0.15)"
              : "rgba(255,255,255,0.03)",
            borderColor: canAnalyze
              ? "rgba(59,130,246,0.40)"
              : "rgba(255,255,255,0.07)",
            color: canAnalyze ? "#93c5fd" : "#1e293b",
            cursor: canAnalyze ? "pointer" : "not-allowed",
            transition: "all 0.2s",
          }}
          className="w-full py-2.5 border rounded-md text-sm font-medium
                     flex items-center justify-center gap-2.5 tracking-wide"
        >
          {loading ? (
            <>
              <LoadingDots />
              <span>Analyzing…</span>
            </>
          ) : (
            <>
              <span className="text-base leading-none">⟳</span>
              <span>Analyze Code</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}