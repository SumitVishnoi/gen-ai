import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import useAuth from "../hook/useAuth.js";
import { Sparkles, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { AuthContext } from "../context/AuthContext.jsx";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const { handleLogin } = useAuth();
  const navigate = useNavigate();
  const {user, loading, setLoading} = useContext(AuthContext)

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in all fields");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    const result = await handleLogin({ email, password });
    setLoading(false);

    if (result.success) {
      navigate("/");
    } else {
      setErrorMsg(result.message || "Invalid credentials");
    }
  };

  useEffect(() => {
    if (user && !loading) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen w-screen bg-[#FBFBFA] flex flex-col justify-center items-center px-4 py-12 select-none">
      {/* Top Branding */}
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-md mb-4">
          <Sparkles className="w-6 h-6 stroke-[2]" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Sign in to access your saved conversations and AI workspace
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#EAEAE7] shadow-[0_8px_30px_-6px_rgba(0,0,0,0.05)] p-8">
        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-700">
                Password
              </label>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-neutral-100 text-center">
          <p className="text-xs text-neutral-500">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-violet-600 hover:text-violet-700 hover:underline"
            >
              Sign up
            </Link>
          </p>
          <div className="mt-3">
            <Link
              to="/"
              className="text-xs text-neutral-400 hover:text-neutral-600"
            >
              ← Continue as Guest to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
