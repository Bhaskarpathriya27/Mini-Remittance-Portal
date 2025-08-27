import { useEffect, useState, useRef } from "react";
import { api } from "../api/axios";
import gsap from "gsap";

export default function Beneficiaries() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    name: "",
    bankAccountNumber: "",
    country: "",
    currency: "",
  });
  const containerRef = useRef(null);

  const load = async () => {
    const { data } = await api.get("/beneficiaries");
    setList(data);
    // GSAP animation on load
    gsap.fromTo(
      containerRef.current.querySelectorAll(".beneficiary-card"),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, ease: "power2.out" }
    );
  };
  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post("/beneficiaries", form);
    setForm({ name: "", bankAccountNumber: "", country: "", currency: "" });
    load();
  };

  const remove = async (id) => {
    await api.delete(`/beneficiaries/${id}`);
    load();
  };

  return (
    <div className="mt-10 grid md:grid-cols-2 gap-8" ref={containerRef}>
      {/* Add form */}
      <form
        onSubmit={create}
        className="space-y-4 bg-white rounded-2xl shadow-lg p-6 border hover:shadow-xl transition"
      >
        <h2 className="text-xl font-bold text-slate-800">➕ Add Beneficiary</h2>
        <input
          className="w-full border p-3 rounded-md"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="w-full border p-3 rounded-md"
          placeholder="Bank Account Number"
          value={form.bankAccountNumber}
          onChange={(e) =>
            setForm({ ...form, bankAccountNumber: e.target.value })
          }
        />
        <input
          className="w-full border p-3 rounded-md"
          placeholder="Country"
          value={form.country}
          onChange={(e) => setForm({ ...form, country: e.target.value })}
        />
        <input
          className="w-full border p-3 rounded-md"
          placeholder="Currency (e.g. INR, USD)"
          value={form.currency}
          onChange={(e) => setForm({ ...form, currency: e.target.value })}
        />
        <button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-2 rounded-md hover:opacity-90 transition">
          Save
        </button>
      </form>

      {/* List */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-slate-800">
          📋 Your Beneficiaries
        </h2>
        <ul className="space-y-3">
          {list.map((b) => (
            <li
              key={b._id}
              className="beneficiary-card border rounded-xl p-4 shadow hover:shadow-md transition flex justify-between items-center"
            >
              <div>
                <div className="font-semibold text-lg text-slate-800">
                  {b.name}{" "}
                  <span className="text-indigo-600">({b.currency})</span>
                </div>
                <div className="text-sm text-slate-600">
                  {b.bankAccountNumber} • {b.country}
                </div>
              </div>
              <button
                onClick={() => remove(b._id)}
                className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded-md hover:bg-red-200"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
