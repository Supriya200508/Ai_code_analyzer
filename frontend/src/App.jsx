import CodeEditor   from "./components/CodeEditor";
import ResultsPanel from "./components/ResultsPanel";
import { useCodeAnalysis } from "./hooks/useCodeAnalysis";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Dashboard loaded");
  console.log(
    "Token:",
    localStorage.getItem("access_token")
  );
}, []);

  const {
    code, setCode,
    language, setLanguage,
    result, loading, error, errorKind, elapsed,
    analyze, retry, cancel,
  } = useCodeAnalysis();

  return (
    <div className="flex flex-col h-full bg-blue-90 font-sans">

      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-3 border-b border-white/[0.06] shrink-0">
        <div className="w-7 h-7 rounded-md bg-blue-700 flex items-center justify-center font-mono text-[12px] font-bold text-white select-none">
          {"{/}"}
        </div>
        <span className="text-sm font-medium text-slate-200 tracking-wide">
          AI Code Analyzer
        </span>
        {/* cancel button while loading */}
        {loading && (
          <button onClick={cancel}
            className="ml-2 font-mono text-[10px] text-slate-600 hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none">
            cancel
          </button>
        )}
        <span className="ml-auto font-mono text-[10px] text-slate-700">
        
        </span>
        <button 
          onClick={() => {
            localStorage.removeItem("access_token");
            navigate("/");
          }}
          className="ml-4 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.05] hover:bg-red-500/80 rounded transition-all cursor-pointer border border-white/[0.05]"
        >
          Logout
        </button>
      </header>

      {/* Split pane */}
      <div className="grid grid-cols-2 flex-1 overflow-hidden">
        <CodeEditor
          code={code}
          language={language}
          loading={loading}
          onCodeChange={setCode}
          onLanguageChange={setLanguage}
          onAnalyze={analyze}
        />
        <ResultsPanel
          result={result}
          loading={loading}
          error={error}
          errorKind={errorKind}
          elapsed={elapsed}
          language={language}
          onRetry={retry}
        />
      </div>
    </div>
  );
}