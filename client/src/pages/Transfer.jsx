import { useEffect, useState, useRef } from "react";
import { api } from "../api/axios";
import gsap from "gsap";

export default function Transfer() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [state, setState] = useState({
    beneficiaryId: "",
    amount: 0, // <-- always a Number
    fromCurrency: "USD",
  });
  const [amountInput, setAmountInput] = useState(""); // <-- formatted UI value
  const [quote, setQuote] = useState(null);
  const [err, setErr] = useState("");
  const quoteRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/beneficiaries");
      setBeneficiaries(data);
    })();
  }, []);

  const formatWithCommas = (digits) =>
    digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const handleAmountChange = (e) => {
    // Keep only digits
    const rawDigits = e.target.value.replace(/\D/g, "");
    // Format for display
    const formatted = formatWithCommas(rawDigits);
    setAmountInput(formatted);

    // Update numeric amount in state (empty => 0)
    const numeric = rawDigits === "" ? 0 : Number(rawDigits);
    setState((prev) => ({ ...prev, amount: numeric }));
  };

  const getQuote = async () => {
    try {
      const { data } = await api.post("/transactions/quote", state); // amount is Number ✅
      setQuote(data);
      setErr("");
      // animate quote box
      setTimeout(() => {
        gsap.fromTo(
          quoteRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
        );
      }, 50);
    } catch (e) {
      setErr(e?.response?.data?.message || "Error");
    }
  };

  const confirm = async () => {
    try {
      const { data } = await api.post("/transactions", state); // amount is Number ✅
      setQuote(null);
      alert("✅ Transfer completed: " + data._id);
    } catch (e) {
      alert(e?.response?.data?.message || "Error");
    }
  };

  return (
    <div className="max-w-xl mt-10 mx-auto space-y-5">
      <h1 className="text-3xl font-bold text-slate-800">💸 Make a Transfer</h1>
      {err && <p className="text-red-600">{err}</p>}

      <select
        className="w-full border p-3 rounded-md"
        value={state.beneficiaryId}
        onChange={(e) =>
          setState((p) => ({ ...p, beneficiaryId: e.target.value }))
        }
      >
        <option value="">Select beneficiary</option>
        {beneficiaries.map((b) => (
          <option key={b._id} value={b._id}>
            {b.name} ({b.currency})
          </option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-3">
        <input
          className="border p-3 rounded-md"
          placeholder="From currency"
          value={state.fromCurrency}
          onChange={(e) =>
            setState((p) => ({
              ...p,
              fromCurrency: e.target.value.toUpperCase().slice(0, 3),
            }))
          }
        />

        <input
          className="border p-3 rounded-md"
          type="text"
          inputMode="numeric"
          placeholder="Amount"
          value={amountInput}
          onChange={handleAmountChange}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={getQuote}
          className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-5 py-2 rounded-md hover:opacity-90"
        >
          Get Quote
        </button>
        {quote && (
          <button
            onClick={confirm}
            className="bg-green-600 text-white px-5 py-2 rounded-md hover:opacity-90"
          >
            Confirm
          </button>
        )}
      </div>

      {quote && (
        <div
          ref={quoteRef}
          className="border rounded-xl p-5 bg-slate-50 shadow-md space-y-2"
        >
          <div id="to-currency">
            <span className="text-slate-500">To Currency:</span>{" "}
            <b>{quote.toCurrency}</b>
          </div>
          <div id="fx-rate">
            <span className="text-slate-500">FX Rate:</span> <b>{quote.rate}</b>
          </div>
          <div id="converted">
            <span className="text-slate-500">Converted:</span>{" "}
            <b>{quote.convertedAmount.toFixed(2)}</b>
          </div>
          <div id="fees">
            <span className="text-slate-500">Fee:</span> fixed $
            {quote.fees.fixed} + {quote.fees.percent}% ={" "}
            <b>${quote.fees.total.toFixed(2)}</b>
          </div>
          <div id="total-debit">
            <span className="text-slate-500">Total debit:</span>{" "}
            <b>
              {quote.totalDebit.toFixed(2)} {state.fromCurrency}
            </b>
          </div>
        </div>
      )}
    </div>
  );
}
