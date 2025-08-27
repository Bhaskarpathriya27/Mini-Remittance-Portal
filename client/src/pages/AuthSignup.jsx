import { useState, useRef, useEffect } from "react";
import { api } from "../api/axios";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

export default function AuthSignup() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [err, setErr] = useState("");
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
    try {
      const { data } = await api.post("/auth/signup", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("fullName", data.user.fullName);
      navigate("/dashboard");
    } catch (e) {
      setErr(e?.response?.data?.message || "Error");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gradient-to-br from-slate-50 to-slate-100">
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
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <input
            className="w-full border p-3 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="w-full border p-3 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button className="w-full py-3 rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold text-lg hover:opacity-90 transition">
            Sign up
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-slate-600">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-indigo-600 cursor-pointer hover:underline"
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );
}
