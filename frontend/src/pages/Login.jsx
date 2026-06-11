import { useState } from "react";
import { loginUser } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await loginUser(email, password);
      console.log("Login Success:",res.data);
      localStorage.setItem("access_token", res.data.access_token);
      console.log("Stored Token:", localStorage.getItem("access_token"));
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-blue-950 font-sans items-center justify-center relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-violet-100/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-violet-100/20 rounded-full blur-[150px] pointer-events-none" />

      <div className="z-10 w-full max-w-md animate-fade-up px-4">
        {/* Header/Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-700 flex items-center justify-center font-mono text-lg font-bold text-white select-none shadow-[0_0_20px_rgba(29,78,216,0.5)] mb-4">
            {"{/}"}
          </div>
          <h2 className="text-2xl font-semibold text-slate-100 tracking-wide">
            Welcome Back
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Sign in to AI Code Analyzer
          </p>
        </div>

        {/* Card */}
        <div className="bg-panel/50 backdrop-blur-xl border border-white/[0.08] p-8 rounded-2xl shadow-2xl">
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-surface border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">
                PASSWORD
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-surface border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-xs text-red-400 text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span className="text-sm">Signing in...</span>
                </>
              ) : (
                <span className="text-sm">Sign In</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/register")}
              className="text-sm text-slate-400 hover:text-blue-400 transition-colors bg-transparent border-none cursor-pointer"
            >
              Don't have an account? <span className="font-medium text-blue-400">Register</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}