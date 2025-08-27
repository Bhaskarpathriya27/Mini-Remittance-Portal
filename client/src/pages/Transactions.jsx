import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { download } from "../api/download";

export default function Transactions() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [range, setRange] = useState({ start: "", end: "" });

  const load = async () => {
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    if (range.start) params.append("start", range.start);
    if (range.end) params.append("end", range.end);
    const { data } = await api.get(`/transactions?${params.toString()}`);
    setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="mt-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <input
          className="border p-2 rounded-md flex-1 min-w-[200px]"
          placeholder="🔍 Search beneficiary"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <input
          className="border p-2 rounded-md"
          type="date"
          value={range.start}
          onChange={(e) => setRange({ ...range, start: e.target.value })}
        />
        <input
          className="border p-2 rounded-md"
          type="date"
          value={range.end}
          onChange={(e) => setRange({ ...range, end: e.target.value })}
        />
        <button
          onClick={load}
          className="px-4 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium hover:opacity-90"
        >
          Apply
        </button>
      </div>

      {/* Transactions list */}
      <div className="grid gap-4">
        {items.length === 0 && (
          <div className="text-center text-slate-500 py-6 border rounded-md">
            No transactions found
          </div>
        )}

        {items.map((t) => (
          <div
            key={t._id}
            className="border rounded-xl p-5 shadow-sm bg-white hover:shadow-md transition"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-lg font-semibold">{t.beneficiary?.name}</h3>
                <p className="text-sm text-slate-500">
                  {t.fromCurrency} → {t.toCurrency}
                </p>
              </div>
              <span className="text-xs text-slate-500">
                {new Date(t.createdAt).toLocaleString()}
              </span>
            </div>

            {/* Amounts */}
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-500">Source Amount</p>
                <p className="font-medium">
                  {t.sourceAmount} {t.fromCurrency}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-500">Converted Amount</p>
                <p className="font-medium">
                  {t.convertedAmount.toFixed(2)} {t.toCurrency}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-500">FX Rate</p>
                <p className="font-medium">{t.rate}</p>
              </div>
            </div>

            {/* Fees + Total */}
            <div className="grid md:grid-cols-2 gap-3 mt-4 text-sm">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-500">Fees</p>
                <p>
                  ${t.feeFixed} + {t.feePercent}% ={" "}
                  <span className="font-medium">
                    {t.feeFixed + (t.feePercent / 100) * t.sourceAmount}
                  </span>
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-500">Total Debit</p>
                <p className="font-medium">
                  {t.totalDebit} {t.fromCurrency}
                </p>
              </div>
            </div>

            {/* Status & Flags */}
            <div className="mt-4 flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  t.status === "COMPLETED"
                    ? "bg-green-100 text-green-700"
                    : t.status === "FAILED"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {t.status}
              </span>
              {t.highRisk && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                  🚨 High-Risk
                </span>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() =>
                  download(
                    `/receipts/transactions/${t._id}.pdf`,
                    `receipt_${t._id}.pdf`
                  )
                }
                className="text-xs px-3 py-1 rounded-md border bg-white hover:bg-amber-100 cursor-pointer"
              >
                PDF
              </button>
              <button
                onClick={() =>
                  download(
                    `/receipts/transactions/${t._id}.csv`,
                    `receipt_${t._id}.csv`
                  )
                }
                className="text-xs px-3 py-1 rounded-md border bg-white hover:bg-amber-100 cursor-pointer"
              >
                CSV
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
