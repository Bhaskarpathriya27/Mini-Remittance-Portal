import { Router } from "express";
import { auth, isAdmin } from "../middleware/auth.js";
import Transaction from "../models/Transaction.js";
import PDFDocument from "pdfkit";
import { Parser, Transform } from "json2csv";
import QRCode from "qrcode";

const router = Router();

function ensureAccess(tx, req) {
  if (!tx) return { ok: false, code: 404, msg: "Transaction not found" };
  // tx.user can be an ObjectId OR a populated doc; normalize to id
  const ownerId =
    tx.user && typeof tx.user === "object" ? tx.user._id : tx.user;
  const isOwner = String(ownerId) === String(req.user.id);
  const isAdminRole = req.user?.role === "admin";
  if (!isOwner && !isAdminRole)
    return { ok: false, code: 403, msg: "Forbidden" };
  return { ok: true };
}

async function loadTx(id) {
  return Transaction.findById(id)
    .populate({
      path: "beneficiary",
      select: "name bankAccountNumber country currency",
    })
    .populate({ path: "user", select: "fullName email accountNumber role" })
    .exec();
}

function money(amount, ccy) {
  return `${Number(amount).toFixed(2)} ${ccy}`;
}

// ---------- Single receipt (PDF)
router.get("/transactions/:id.pdf", auth, async (req, res, next) => {
  try {
    const tx = await loadTx(req.params.id);
    const guard = ensureAccess(tx, req);
    if (!guard.ok) return res.status(guard.code).json({ message: guard.msg });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt_${tx._id}.pdf`
    );

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    doc.pipe(res);

    doc
      .fontSize(22)
      .fillColor("#000")
      .text("PayStreet Remittance Receipt")
      .moveDown(0.3);
    doc
      .fontSize(10)
      .fillColor("#666")
      .text(`Receipt ID: ${tx._id}`)
      .text(`Date: ${new Date(tx.createdAt).toLocaleString()}`)
      .moveDown(0.5);

    const qrDataURL = await QRCode.toDataURL(String(tx._id), { margin: 0 });
    const qrBuf = Buffer.from(
      qrDataURL.replace(/^data:image\/png;base64,/, ""),
      "base64"
    );
    doc.image(qrBuf, doc.page.width - 110, 40, { width: 70 });

    doc.moveDown(0.5);
    doc
      .fontSize(12)
      .fillColor("#000")
      .text("Sender", { continued: true })
      .text(" | Beneficiary");
    doc.fontSize(10).fillColor("#333");
    const leftX = doc.x,
      yTop = doc.y;
    doc.text(
      `${tx.user?.fullName || ""}
${tx.user?.email || ""}
Acc #: ${tx.user?.accountNumber || ""}`,
      leftX,
      yTop,
      { width: 250 }
    );
    doc.text(
      `${tx.beneficiary?.name || ""}
${tx.beneficiary?.bankAccountNumber || ""}
${tx.beneficiary?.country || ""}`,
      leftX + 280,
      yTop,
      { width: 250 }
    );

    doc.moveDown(1.0);
    const rows = [
      ["From", money(tx.sourceAmount, tx.fromCurrency)],
      ["To", money(tx.convertedAmount, tx.toCurrency)],
      ["FX Rate", String(tx.rate)],
      ["Fees", `$${tx.feeFixed} + ${tx.feePercent}%`],
      ["Total Debit", money(tx.totalDebit, tx.fromCurrency)],
      ["USD Equivalent", `${Number(tx.usdEquivalent).toFixed(2)} USD`],
      ["Status", tx.status],
      ["Risk", tx.highRisk ? "HIGH-RISK" : "Normal"],
    ];
    const startY = doc.y + 10,
      col1 = 50,
      col2 = 230;
    doc
      .moveTo(40, startY - 6)
      .lineTo(555, startY - 6)
      .stroke("#000");
    rows.forEach((r, i) => {
      const yy = startY + i * 22;
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#000")
        .text(r[0], col1, yy);
      doc.font("Helvetica").fontSize(10).fillColor("#111").text(r[1], col2, yy);
      doc
        .moveTo(40, yy + 18)
        .lineTo(555, yy + 18)
        .stroke("#eee");
    });

    doc.moveDown(2);
    doc
      .fontSize(9)
      .fillColor("#666")
      .text(
        "This is a system-generated receipt for a mock transaction. For support contact support@paystreet.example"
      );
    if (tx.highRisk) {
      doc
        .fontSize(20)
        .fillColor("#d00")
        .opacity(0.2)
        .rotate(-20, { origin: [300, 500] })
        .text("HIGH-RISK", 180, 480)
        .rotate(20)
        .opacity(1)
        .fillColor("#000");
    }

    doc.end();
  } catch (e) {
    next(e);
  }
});

// ---------- Single receipt (CSV)
router.get("/transactions/:id.csv", auth, async (req, res, next) => {
  try {
    const tx = await loadTx(req.params.id);
    const guard = ensureAccess(tx, req);
    if (!guard.ok) return res.status(guard.code).json({ message: guard.msg });

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt_${tx._id}.csv`
    );

    const fields = [
      { label: "ReceiptID", value: (r) => r._id },
      { label: "Date", value: (r) => r.createdAt },
      { label: "SenderName", value: (r) => r.user?.fullName },
      { label: "SenderEmail", value: (r) => r.user?.email },
      { label: "Beneficiary", value: (r) => r.beneficiary?.name },
      { label: "FromCurrency", value: (r) => r.fromCurrency },
      { label: "SourceAmount", value: (r) => r.sourceAmount },
      { label: "ToCurrency", value: (r) => r.toCurrency },
      { label: "ConvertedAmount", value: (r) => r.convertedAmount },
      { label: "FXRate", value: (r) => r.rate },
      { label: "FeeFixed", value: (r) => r.feeFixed },
      { label: "FeePercent", value: (r) => r.feePercent },
      { label: "TotalDebit", value: (r) => r.totalDebit },
      { label: "USDEquivalent", value: (r) => r.usdEquivalent },
      { label: "Status", value: (r) => r.status },
      { label: "HighRisk", value: (r) => r.highRisk },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(tx.toObject({ virtuals: false }));
    res.send(csv);
  } catch (e) {
    next(e);
  }
});

// ---------- Export all (CSV) — user scoped
router.get("/transactions/export.csv", auth, async (req, res, next) => {
  try {
    const { q, start, end } = req.query;
    const filter = { user: req.user.id };
    if (start || end) {
      filter.createdAt = {};
      if (start) filter.createdAt.$gte = new Date(start);
      if (end) filter.createdAt.$lte = new Date(end);
    }
    const cursor = Transaction.find(filter)
      .populate({ path: "beneficiary", select: "name" })
      .cursor();

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=transactions_export.csv`
    );

    const fields = [
      "_id",
      "createdAt",
      "beneficiary.name",
      "fromCurrency",
      "sourceAmount",
      "toCurrency",
      "convertedAmount",
      "rate",
      "feeFixed",
      "feePercent",
      "totalDebit",
      "usdEquivalent",
      "status",
      "highRisk",
    ];
    const json2csv = new Transform(
      { fields },
      { objectMode: true, highWaterMark: 16 }
    );
    res.write("﻿");
    cursor.on("data", (doc) => {
      if (
        q &&
        !(doc.beneficiary?.name || "")
          .toLowerCase()
          .includes(String(q).toLowerCase())
      )
        return;
      json2csv.write(doc.toObject());
    });
    cursor.on("end", () => json2csv.end());
    cursor.on("error", (err) => next(err));
    json2csv.pipe(res);
  } catch (e) {
    next(e);
  }
});

// ---------- Export all (CSV) — admin (all users)
router.get(
  "/admin/transactions/export.csv",
  auth,
  isAdmin,
  async (req, res, next) => {
    try {
      const { q, start, end } = req.query;
      const filter = {};
      if (start || end) {
        filter.createdAt = {};
        if (start) filter.createdAt.$gte = new Date(start);
        if (end) filter.createdAt.$lte = new Date(end);
      }

      const cursor = Transaction.find(filter)
        .populate({ path: "beneficiary", select: "name" })
        .populate({ path: "user", select: "email" })
        .cursor();

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=all_transactions_export.csv`
      );

      const fields = [
        "_id",
        "createdAt",
        "user.email",
        "beneficiary.name",
        "fromCurrency",
        "sourceAmount",
        "toCurrency",
        "convertedAmount",
        "rate",
        "feeFixed",
        "feePercent",
        "totalDebit",
        "usdEquivalent",
        "status",
        "highRisk",
      ];
      const json2csv = new Transform({ fields }, { objectMode: true });

      res.write("﻿");
      cursor.on("data", (doc) => {
        if (
          q &&
          !(doc.beneficiary?.name || "")
            .toLowerCase()
            .includes(String(q).toLowerCase())
        )
          return;
        json2csv.write(doc.toObject());
      });
      cursor.on("end", () => json2csv.end());
      cursor.on("error", (err) => next(err));

      json2csv.pipe(res);
    } catch (e) {
      next(e);
    }
  }
);
export default router;
