import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Dashboard() {
  const name = localStorage.getItem("fullName") || "User";
  const titleRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 1, ease: "bounce.out" }
    );
  }, []);

  return (
    <div className="mt-16 text-center space-y-3">
      <h1
        ref={titleRef}
        className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent"
      >
        Welcome, {name}
      </h1>
      <p className="text-slate-600 text-lg">
        🚀 Start by adding beneficiaries, making a transfer, or viewing history.
      </p>
    </div>
  );
}
