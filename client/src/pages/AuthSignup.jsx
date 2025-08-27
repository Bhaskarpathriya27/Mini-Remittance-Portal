import { useState, useRef, useEffect } from "react";
import { api } from "../api/axios";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

export default function AuthSignup() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const cardRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }
    );
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return; // prevent double submit
    setErr("");

    // (Optional) quick client-side guard
    if (!form.fullName || !form.email || !form.password) {
      setErr("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/auth/signup", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("fullName", data.user.fullName);
      navigate("/dashboard");
    } catch (e) {
      setErr(e?.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex justify-center items-center min-h-[80vh] bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Optional full-screen overlay while loading */}
      {loading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] grid place-items-center z-10">
          <div className="flex items-center gap-3 text-slate-700">
            <svg
              className="h-6 w-6 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"
              />
            </svg>
            <span className="font-medium">Creating your account…</span>
          </div>
        </div>
      )}

      <div
        ref={cardRef}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border"
      >
        <h1 className="text-3xl font-extrabold text-center bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-6">
          Create Your Account 🚀
        </h1>
        {err && <p className="text-red-600 mb-3 text-center">{err}</p>}

        <form onSubmit={submit} className="space-y-4">
          <input
            className="w-full border p-3 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            placeholder="Full name"
            value={form.fullName}
            disabled={loading}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <input
            className="w-full border p-3 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            placeholder="Email"
            type="email"
            value={form.email}
            disabled={loading}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="w-full border p-3 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            placeholder="Password"
            type="password"
            value={form.password}
            disabled={loading}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            className="w-full py-3 rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold text-lg hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className="h-5 w-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"
                  />
                </svg>
                Signing up…
              </>
            ) : (
              "Sign up"
            )}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-slate-600">
          Already have an account?{" "}
          <span
            onClick={() => !loading && navigate("/login")}
            className="text-indigo-600 cursor-pointer hover:underline"
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );
}
