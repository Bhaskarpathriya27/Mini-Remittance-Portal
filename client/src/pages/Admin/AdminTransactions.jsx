import { useEffect, useRef, useState } from "react";
import { api } from "../../api/axios";
import { download } from "../../api/download";
import gsap from "gsap";

export default function AdminTransactions() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [range, setRange] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(true);
  const [downId, setDownId] = useState(null); // show downloading state per-row
  const listRef = useRef(null);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get("/admin/transactions");
    // simple client-side filter demo (server filters also exist on /receipts export)
    const filtered = data
      .filter((t) =>
        q
          ? (t.beneficiary?.name || "").toLowerCase().includes(q.toLowerCase())
          : true
      )
      .filter((t) => {
        const ts = new Date(t.createdAt).getTime();
        const okStart = range.start
          ? ts >= new Date(range.start).getTime()
          : true;
        const okEnd = range.end
          ? ts <= new Date(range.end).getTime() + 86_400_000 - 1
          : true;
        return okStart && okEnd;
      });
    setItems(filtered);
    setLoading(false);
    setTimeout(() => {
      gsap.fromTo(
        listRef.current?.querySelectorAll(".txcard"),
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", stagger: 0.04 }
      );
    }, 50);
  };

  useEffect(() => {
    load();
  }, []);
  const apply = () => load();

  // ----- downloads -----
  const dlTxPdf = async (t) => {
    try {
      setDownId(t._id);
      await download(
        `/receipts/transactions/${t._id}.pdf`,
        `receipt_${t._id}.pdf`
      );
    } finally {
      setDownId(null);
    }
  };

  const dlTxCsv = async (t) => {
    try {
      setDownId(t._id);
      await download(
        `/receipts/transactions/${t._id}.csv`,
        `receipt_${t._id}.csv`
      );
    } finally {
      setDownId(null);
    }
  };

  // include filters in admin bulk export
  const dlAllCsv = async () => {
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    if (range.start) params.append("start", range.start);
    if (range.end) params.append("end", range.end);
    await download(
      `/receipts/admin/transactions/export.csv?${params.toString()}`,
      `all_transactions_export.csv`
    );
  };

  return (
    <div className="mt-8">
      {/* Sticky filter + bulk actions */}
      <div className="sticky top-[68px] z-10 -mx-2 px-2 py-3 bg-white/80 backdrop-blur border-b">
        <div className="flex flex-wrap items-end gap-3 justify-between">
          <div>
            <h2 className="text-2xl font-extrabold">Transactions</h2>
            <p className="text-slate-500 text-sm">Monitor, export & audit</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              className="border-2 border-black rounded-md px-3 py-2"
              placeholder="Search beneficiary…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <input
              type="date"
              className="border-2 border-black rounded-md px-3 py-2"
              value={range.start}
              onChange={(e) => setRange({ ...range, start: e.target.value })}
            />
            <input
              type="date"
              className="border-2 border-black rounded-md px-3 py-2"
              value={range.end}
              onChange={(e) => setRange({ ...range, end: e.target.value })}
            />

            <button
              onClick={apply}
              className="px-4 py-2 rounded-md border-2 border-black bg-yellow-300 hover:translate-y-[1px] active:translate-y-[2px] transition"
            >
              Apply
            </button>

            {/* Bulk export CSV (admin) */}
            <button
              onClick={dlAllCsv}
              className="group px-4 py-2 rounded-md border-2 border-black bg-white hover:bg-black hover:text-white transition flex items-center gap-2"
              title="Export all as CSV (respects filters)"
            >
              {/* CSV icon */}
              <svg
                className="w-4 h-4 group-hover:scale-110 transition"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
                <text x="7" y="17" fontSize="6" fontFamily="monospace">
                  CSV
                </text>
              </svg>
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* list */}
      <div
        ref={listRef}
        className="mt-4 grid md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {loading ? (
          <div className="col-span-full text-center text-slate-500 py-8">
            Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="col-span-full text-center text-slate-500 py-8">
            No transactions match the filter.
          </div>
        ) : (
          items.map((t) => (
            <div
              key={t._id}
              className="txcard border-2 border-black rounded-2xl bg-white p-5 shadow-[8px_8px_0_0_#000]"
            >
              {/* header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-bold">
                    {t.beneficiary?.name || "—"}
                  </div>
                  <div className="text-slate-500 text-sm">
                    {t.fromCurrency} → {t.toCurrency} @ {t.rate}
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(t.createdAt).toLocaleString()}
                </div>
              </div>

              {/* amounts */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="border-2 border-black rounded-xl p-3 bg-slate-50">
                  <div className="text-xs text-slate-500">Source</div>
                  <div className="font-semibold">
                    {t.sourceAmount} {t.fromCurrency}
                  </div>
                </div>
                <div className="border-2 border-black rounded-xl p-3 bg-slate-50">
                  <div className="text-xs text-slate-500">Converted</div>
                  <div className="font-semibold">
                    {Number(t.convertedAmount).toFixed(2)} {t.toCurrency}
                  </div>
                </div>
              </div>

              {/* fees */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="border-2 border-black rounded-xl p-3">
                  <div className="text-xs text-slate-500">Fees</div>
                  <div className="font-medium">
                    ${t.feeFixed} + {t.feePercent}% = $
                    {(
                      t.feeFixed +
                      (t.feePercent / 100) * t.sourceAmount
                    ).toFixed(2)}
                  </div>
                </div>
                <div className="border-2 border-black rounded-xl p-3">
                  <div className="text-xs text-slate-500">Total Debit</div>
                  <div className="font-medium">
                    {t.totalDebit} {t.fromCurrency}
                  </div>
                </div>
              </div>

              {/* footer badges + actions */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-3 py-1 border-2 border-black rounded-full ${
                      t.status === "COMPLETED"
                        ? "bg-green-300"
                        : t.status === "FAILED"
                        ? "bg-red-300"
                        : "bg-yellow-300"
                    }`}
                  >
                    {t.status}
                  </span>
                  {t.highRisk && (
                    <span className="text-xs px-3 py-1 border-2 border-black rounded-full bg-red-400 text-black">
                      🚨 High-Risk
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* PDF button */}
                  <button
                    onClick={() => dlTxPdf(t)}
                    disabled={downId === t._id}
                    className={`group relative overflow-hidden text-xs px-3 py-1 rounded-md border-2 border-black bg-white hover:bg-black hover:text-white transition flex items-center gap-1 ${
                      downId === t._id ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                    title="Download PDF receipt"
                    aria-label="Download PDF"
                  >
                    <svg
                      className="w-4 h-4 group-hover:scale-110 transition"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
                      <text x="7" y="17" fontSize="6" fontFamily="monospace">
                        PDF
                      </text>
                    </svg>
                    {downId === t._id ? "Preparing…" : "PDF"}
                  </button>

                  {/* CSV button */}
                  <button
                    onClick={() => dlTxCsv(t)}
                    disabled={downId === t._id}
                    className={`group relative overflow-hidden text-xs px-3 py-1 rounded-md border-2 border-black bg-white hover:bg-black hover:text-white transition flex items-center gap-1 ${
                      downId === t._id ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                    title="Download CSV receipt"
                    aria-label="Download CSV"
                  >
                    <svg
                      className="w-4 h-4 group-hover:scale-110 transition"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
                      <text x="7" y="17" fontSize="6" fontFamily="monospace">
                        CSV
                      </text>
                    </svg>
                    {downId === t._id ? "Preparing…" : "CSV"}
                  </button>
                </div>
              </div>

              {/* user */}
              <div className="mt-2 text-xs text-slate-500 flex justify-end">
                User:{" "}
                <span className="font-mono ml-1">{t.user?.email || "—"}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
