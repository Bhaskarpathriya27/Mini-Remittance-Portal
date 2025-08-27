import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import "./setup.js";
import User from "../models/User.js";
import Beneficiary from "../models/Beneficiary.js";
import * as fx from "../services/fx.service.js";
import { sign } from "./setup.js";

vi.spyOn(fx, "convertAmount").mockResolvedValue({ rate: 82, result: 8200 });
vi.spyOn(fx, "getPairRate").mockResolvedValue({ rate: 1 });

async function bootUser() {
  const u = await User.create({
    fullName: "Test U",
    email: "u@test.com",
    passwordHash: "hash",
  });
  const token = sign({ id: u._id, role: "user" });
  const b = await Beneficiary.create({
    user: u._id,
    name: "Amit",
    bankAccountNumber: "12345",
    country: "India",
    currency: "INR",
  });
  return { token, u, b };
}

describe("Transactions", () => {
  it("quote + create tx", async () => {
    const { app } = await import("./setup.js");
    const { token, b } = await bootUser();

    const q = await request(app)
      .post("/api/transactions/quote")
      .set("Authorization", `Bearer ${token}`)
      .send({ beneficiaryId: b._id, amount: 100, fromCurrency: "USD" });
    expect(q.status).toBe(200);
    expect(q.body.convertedAmount).toBe(8200);

    const c = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({ beneficiaryId: b._id, amount: 100, fromCurrency: "USD" });
    expect(c.status).toBe(201);
    expect(c.body.totalDebit).toBeGreaterThan(100);
  });
});
