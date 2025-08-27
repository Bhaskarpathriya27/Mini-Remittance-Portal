import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function AdminHome() {
  const wrapRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      wrapRef.current.querySelectorAll(".tile"),
      { y: 20, opacity: 0, rotateX: 8 },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.08,
      }
    );
  }, []);

  return (
    <div className="mt-8" ref={wrapRef}>
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          <span className="bg-black text-white px-3 py-1 rounded-lg">
            Admin
          </span>{" "}
          <span className="text-slate-800">Control Room</span>
        </h1>
        <p className="text-slate-500 mt-1">
          Monitor users, transactions & risk at a glance.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/admin/users"
          className="tile group border-2 border-black rounded-xl bg-white p-5 shadow-[6px_6px_0_0_#000] hover:shadow-[10px_10px_0_0_#000] transition-shadow"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Users</h3>
            <span className="text-xs px-2 py-1 border border-black rounded-full group-hover:bg-black group-hover:text-white transition">
              Manage
            </span>
          </div>
          <p className="text-slate-600 mt-2">
            View all registered accounts & roles.
          </p>
        </Link>

        <Link
          to="/admin/transactions"
          className="tile group border-2 border-black rounded-xl bg-white p-5 shadow-[6px_6px_0_0_#000] hover:shadow-[10px_10px_0_0_#000] transition-shadow"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Transactions</h3>
            <span className="text-xs px-2 py-1 border border-black rounded-full group-hover:bg-black group-hover:text-white transition">
              Monitor
            </span>
          </div>
          <p className="text-slate-600 mt-2">
            Inspect volume, FX rates & high-risk flags.
          </p>
        </Link>

        <div className="tile border-2 border-dashed border-black rounded-xl bg-[repeating-linear-gradient(45deg,#f8fafc,#f8fafc_10px,#e2e8f0_10px,#e2e8f0_20px)] p-5 shadow-[6px_6px_0_0_#000]">
          <h3 className="text-xl font-bold">Insights (soon)</h3>
          <p className="text-slate-600 mt-2">
            Daily briefs & anomalies will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
