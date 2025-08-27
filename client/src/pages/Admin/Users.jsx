import { useEffect, useRef, useState } from "react";
import { api } from "../../api/axios";
import gsap from "gsap";

export default function Users() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await api.get("/admin/users");
      setList(data);
      setLoading(false);
      setTimeout(() => {
        gsap.fromTo(
          tableRef.current?.querySelectorAll(".row"),
          { opacity: 0, x: -12 },
          { opacity: 1, x: 0, duration: 0.4, ease: "power2.out", stagger: 0.03 }
        );
      }, 50);
    })();
  }, []);

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-extrabold">Users</h2>
          <p className="text-slate-500">All accounts & access levels.</p>
        </div>
      </div>

      <div className="border-2 border-black rounded-xl overflow-hidden shadow-[8px_8px_0_0_#000] bg-white">
        <div className="grid grid-cols-4 gap-2 px-4 py-3 border-b-2 border-black bg-black text-white font-semibold">
          <div>Name</div>
          <div>Email</div>
          <div>Account #</div>
          <div className="text-right">Role</div>
        </div>

        <div ref={tableRef}>
          {loading ? (
            <div className="p-6 text-center text-slate-500">Loading…</div>
          ) : list.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No users.</div>
          ) : (
            list.map((u, i) => (
              <div
                key={u._id}
                className={`row grid grid-cols-4 gap-2 px-4 py-3 ${
                  i % 2 ? "bg-slate-50" : "bg-white"
                }`}
              >
                <div className="font-medium">{u.fullName}</div>
                <div className="truncate">{u.email}</div>
                <div className="font-mono text-xs truncate">
                  {u.accountNumber}
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block text-xs px-3 py-1 border-2 rounded-full ${
                      u.role === "admin"
                        ? "border-black bg-yellow-300"
                        : "border-black bg-white"
                    }`}
                  >
                    {u.role}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
