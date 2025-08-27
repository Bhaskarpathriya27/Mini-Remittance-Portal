import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import "./setup.js";
import User from "../models/User.js";
import Beneficiary from "../models/Beneficiary.js";
import Transaction from "../models/Transaction.js";
import { sign } from "./setup.js";

async function seedTx() {
  const u = await User.create({
    fullName: "U",
    email: "u@x.com",
    passwordHash: "x",
  });
  const b = await Beneficiary.create({
    user: u._id,
    name: "Amit",
    bankAccountNumber: "1",
    country: "India",
    currency: "INR",
  });
  const tx = await Transaction.create({
    user: u._id,
    beneficiary: b._id,
    fromCurrency: "USD",
    toCurrency: "INR",
    sourceAmount: 100,
    rate: 82,
    convertedAmount: 8200,
    feeFixed: 2,
    feePercent: 0.5,
    totalDebit: 102.5,
    usdEquivalent: 100,
    status: "COMPLETED",
    highRisk: false,
  });
  return { tx, token: sign({ id: u._id, role: "user" }) };
}

describe("Receipts", () => {
  it("pdf + csv authorized", async () => {
    const { app } = await import("./setup.js");
    const { tx, token } = await seedTx();

    const p = await request(app)
      .get(`/api/receipts/transactions/${tx._id}.pdf`)
      .set("Authorization", `Bearer ${token}`);
    expect(p.status).toBe(200);
    expect(p.headers["content-type"]).toContain("application/pdf");

    const c = await request(app)
      .get(`/api/receipts/transactions/${tx._id}.csv`)
      .set("Authorization", `Bearer ${token}`);
    expect(c.status).toBe(200);
    expect(c.headers["content-type"]).toContain("text/csv");
  });
});
