import { Router } from "express";
import Beneficiary from "../models/Beneficiary.js";
import Transaction from "../models/Transaction.js";
import { auth } from "../middleware/auth.js";
import { convertAmount, getPairRate } from "../services/fx.service.js";
import { calcFees } from "../utils/fees.js";

const router = Router();
router.use(auth);

// Preview conversion + fees (no DB write)
router.post("/quote", async (req, res, next) => {
  try {
    const { beneficiaryId, amount, fromCurrency } = req.body;
    const b = await Beneficiary.findOne({
      _id: beneficiaryId,
      user: req.user.id,
    });
    if (!b) return res.status(404).json({ message: "Beneficiary not found" });

    const toCurrency = b.currency;
    const { result: converted, rate } = await convertAmount(
      fromCurrency,
      toCurrency,
      amount
    );
    const fees = calcFees(amount);
    const totalDebit = amount + fees.total;
    res.json({
      toCurrency,
      rate,
      convertedAmount: converted,
      fees,
      totalDebit,
    });
  } catch (e) {
    next(e);
  }
});

// Confirm (mock execution) + persist
router.post("/", async (req, res, next) => {
  try {
    const { beneficiaryId, amount, fromCurrency } = req.body;
    const b = await Beneficiary.findOne({
      _id: beneficiaryId,
      user: req.user.id,
    });
    if (!b) return res.status(404).json({ message: "Beneficiary not found" });

    const toCurrency = b.currency;
    const { result: converted, rate } = await convertAmount(
      fromCurrency,
      toCurrency,
      amount
    );
    const fees = calcFees(amount);
    const totalDebit = amount + fees.total;

    // USD equivalent to flag high risk
    const { rate: toUsdRate } = await getPairRate(fromCurrency, "USD");
    const usdEquivalent = amount * toUsdRate;

    const highRisk = usdEquivalent > 10000;

    const tx = await Transaction.create({
      user: req.user.id,
      beneficiary: b._id,
      fromCurrency,
      toCurrency,
      sourceAmount: amount,
      rate,
      convertedAmount: converted,
      feeFixed: fees.fixed,
      feePercent: fees.percent,
      totalDebit,
      usdEquivalent,
      status: "COMPLETED",
      highRisk,
    });

    res.status(201).json(tx);
  } catch (e) {
    next(e);
  }
});

// List with basic filters
router.get("/", async (req, res, next) => {
  try {
    const { q, start, end } = req.query; // q: beneficiary name contains
    const filter = { user: req.user.id };

    if (start || end) {
      filter.createdAt = {};
      if (start) filter.createdAt.$gte = new Date(start);
      if (end) filter.createdAt.$lte = new Date(end);
    }

    let query = Transaction.find(filter)
      .populate({ path: "beneficiary", select: "name" })
      .sort({ createdAt: -1 });
    const data = await query.exec();

    const items = q
      ? data.filter((t) =>
          t.beneficiary?.name.toLowerCase().includes(String(q).toLowerCase())
        )
      : data;

    res.json(items);
  } catch (e) {
    next(e);
  }
});

export default router;
