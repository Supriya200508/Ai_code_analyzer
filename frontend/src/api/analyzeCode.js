/**
 * analyzeCode.js
 * ──────────────
 * HTTP layer for POST /api/v1/analyze-code.
 *
 * Two implementations:
 *   analyzeCode       — native fetch (zero dependencies, default)
 *   analyzeCodeAxios  — axios (interceptors, auto auth header)
 *
 * Both throw ApiError so the UI always gets a ready-to-display message.
 */

const API_URL    = `${import.meta.env.VITE_API_URL1}/analysis/`;;
const TIMEOUT_MS = 60_000;

// ── Typed error ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {number|null} status   HTTP status if available
   * @param {"network"|"timeout"|"abort"|"server"|"parse"} kind
   */
  constructor(message, status = null, kind = "server") {
    super(message);
    this.name   = "ApiError";
    this.status = status;
    this.kind   = kind;
  }
}

// ── HTTP status → friendly message ───────────────────────────────────────────

function classifyHttpError(status, serverMessage) {
  if (serverMessage) return serverMessage;
  if (status === 401) return "Authentication required. Please log in.";
  if (status === 403) return "You do not have permission to perform this action.";
  if (status === 404) return "Endpoint not found — check the API URL.";
  if (status === 422) return "Invalid request — check your code and language fields.";
  if (status === 429) return "Too many requests. Please wait a moment and try again.";
  if (status >= 500)  return `Server error (${status}). Try again shortly.`;
  return `Unexpected HTTP error (${status}).`;
}

// ── Implementation 1: native fetch ───────────────────────────────────────────

/**
 * Analyze code using the native Fetch API.
 *
 * @param {string}      code
 * @param {string}      language   e.g. "python"
 * @param {AbortSignal} [signal]   Pass controller.signal to cancel
 * @returns {Promise<AnalyzeCodeResponse>}
 * @throws  {ApiError}
 */
export async function analyzeCode(code, language, signal) {
  const controller = new AbortController();
  const timeoutId  = !signal
    ? setTimeout(() => controller.abort(), TIMEOUT_MS)
    : null;
  const mergedSignal = signal ?? controller.signal;

  try {
    const token = localStorage.getItem("access_token");

const response = await fetch(API_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  },
  body: JSON.stringify({
    code,
    language,
    focus: "all"
  }),
  signal: mergedSignal,
});

    if (!response.ok) {
      let serverMessage = null;
      try {
        const body = await response.json();
        serverMessage = body.message || body.detail || null;
      } catch { /* body may not be JSON */ }

      throw new ApiError(
        classifyHttpError(response.status, serverMessage),
        response.status,
        "server",
      );
    }

    try {
      return await response.json();
    } catch {
      throw new ApiError(
        "Server returned an unparseable response.",
        response.status,
        "parse",
      );
    }

  } catch (err) {
    if (err instanceof ApiError) throw err;

    if (err.name === "AbortError") {
      if (signal?.aborted) {
        throw new ApiError("Request was cancelled.", null, "abort");
      }
      throw new ApiError(
        `Request timed out after ${TIMEOUT_MS / 1000}s. The server may be overloaded.`,
        null,
        "timeout",
      );
    }

    throw new ApiError(
      "Cannot reach the server. Make sure the backend is running on port 8000.",
      null,
      "network",
    );
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

// ── Implementation 2: axios ───────────────────────────────────────────────────

/**
 * Same interface as analyzeCode() but uses axios.
 * To use: npm install axios, then in useCodeAnalysis.js swap the import.
 *
 * @param {string}      code
 * @param {string}      language
 * @param {AbortSignal} [signal]
 * @returns {Promise<AnalyzeCodeResponse>}
 * @throws  {ApiError}
 */
export async function analyzeCodeAxios(code, language, signal) {
  let axios;
  try {
    axios = (await import("axios")).default;
  } catch {
    throw new ApiError(
      "axios is not installed. Run: npm install axios",
      null,
      "network",
    );
  }

  const client = axios.create({
    baseURL: "/",
    timeout: TIMEOUT_MS,
    headers: { "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("access_token")}` ,
     },
  });

  // Attach JWT token if present in localStorage
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Normalize every axios error into ApiError
  client.interceptors.response.use(
    (res) => res,
    (err) => {
      if (axios.isCancel(err)) {
        throw new ApiError("Request was cancelled.", null, "abort");
      }
      if (err.code === "ECONNABORTED" || err.code === "ERR_NETWORK") {
        throw new ApiError(
          `Request timed out after ${TIMEOUT_MS / 1000}s.`,
          null,
          "timeout",
        );
      }
      if (err.response) {
        const msg =
          err.response.data?.message ||
          err.response.data?.detail  ||
          null;
        throw new ApiError(
          classifyHttpError(err.response.status, msg),
          err.response.status,
          "server",
        );
      }
      throw new ApiError(
        "Cannot reach the server. Make sure the backend is running on port 8000.",
        null,
        "network",
      );
    },
  );

  try {
    const { data } = await client.post(API_URL, { code, language }, { signal });
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message ?? "Unknown error", null, "server");
  }
}