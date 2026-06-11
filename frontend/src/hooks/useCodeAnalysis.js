/**
 * useCodeAnalysis.js
 * ──────────────────
 * All state and side-effects for the analysis flow.
 *
 * Features added over the basic version:
 *   • AbortController — cancels the in-flight request when the component
 *     unmounts or when the user triggers a second analysis before the first
 *     finishes.
 *   • Retry helper — re-runs the last analysis (useful from error UI).
 *   • elapsed — counts up while loading so the UI can show "3s…"
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { analyzeCode, ApiError } from "../api/analyzeCode";

// To switch to axios, change the line above to:
// import { analyzeCodeAxios as analyzeCode, ApiError } from "../api/analyzeCode";

export function useCodeAnalysis() {
  const [code,     setCode]     = useState("");
  const [language, setLanguage] = useState("python");
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);   // string | null
  const [errorKind,setErrorKind]= useState(null);   // ApiError.kind | null
  const [elapsed,  setElapsed]  = useState(0);      // seconds since request start

  const abortRef    = useRef(null);   // current AbortController
  const timerRef    = useRef(null);   // elapsed-seconds interval
  const lastReqRef  = useRef(null);   // { code, language } of last request

  // Clean up on unmount
  useEffect(() => () => {
    abortRef.current?.abort();
    clearInterval(timerRef.current);
  }, []);

  const analyze = useCallback(async (overrideCode, overrideLang) => {
    const targetCode = overrideCode ?? code;
    const targetLang = overrideLang ?? language;

    if (!targetCode.trim()) return;

    // Cancel any previous in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    // Snapshot for retry
    lastReqRef.current = { code: targetCode, language: targetLang };

    setLoading(true);
    setError(null);
    setErrorKind(null);
    setResult(null);
    setElapsed(0);

    // Start elapsed timer
    const start = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    try {
      const data = await analyzeCode(
        targetCode,
        targetLang,
        abortRef.current.signal,
      );
      setResult(data);
    } catch (err) {
      // Ignore cancellation from our own AbortController on re-trigger
      if (err instanceof ApiError && err.kind === "abort") return;

      setError(err instanceof ApiError ? err.message : String(err));
      setErrorKind(err instanceof ApiError ? err.kind : "server");
    } finally {
      setLoading(false);
      clearInterval(timerRef.current);
    }
  }, [code, language]);

  /** Re-run the exact same request that last errored */
  const retry = useCallback(() => {
    if (!lastReqRef.current) return;
    const { code: c, language: l } = lastReqRef.current;
    analyze(c, l);
  }, [analyze]);

  /** Cancel the current in-flight request */
  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
    clearInterval(timerRef.current);
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    clearInterval(timerRef.current);
    setCode("");
    setResult(null);
    setError(null);
    setErrorKind(null);
    setElapsed(0);
  }, []);

  return {
    // state
    code,     setCode,
    language, setLanguage,
    result,   loading,
    error,    errorKind,
    elapsed,
    // actions
    analyze, retry, cancel, reset,
  };
}