import { useState } from "react";
import { registerUser } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    full_name: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic frontend validation for password length
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      await registerUser(form);
      navigate("/"); // go to login
    } catch (err) {
      console.error("ERROR:", err.response?.data);
      
      // Attempt to parse 422 error details or fallback
      if (err.response?.status === 422 && err.response?.data?.detail) {
         setError(err.response.data.detail[0]?.msg || "Invalid input data");
      } else {
         setError(err.response?.data?.detail || "Error registering account");
      }
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
            Create an Account
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Join AI Code Analyzer today
          </p>
        </div>

        {/* Card */}
        <div className="bg-panel/50 backdrop-blur-xl border border-white/[0.08] p-8 rounded-2xl shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">
                FULL NAME
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                required
                className="w-full bg-surface border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="w-full bg-surface border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
              <p className="text-[10px] text-slate-500 mt-1 ml-1">Must be at least 8 characters.</p>
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
                  <span className="text-sm">Registering...</span>
                </>
              ) : (
                <span className="text-sm">Create Account</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-slate-400 hover:text-blue-400 transition-colors bg-transparent border-none cursor-pointer"
            >
              Already have an account? <span className="font-medium text-blue-400">Sign In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}