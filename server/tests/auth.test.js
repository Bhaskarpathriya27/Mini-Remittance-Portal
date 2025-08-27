import { describe, it, expect } from "vitest";
import request from "supertest";
import "./setup.js";
import User from "../models/User.js";

describe("Auth", () => {
  it("signup + login", async () => {
    const app = (await import("./setup.js")).app;
    const email = "rohan@example.com";

    const s = await request(app)
      .post("/api/auth/signup")
      .send({ fullName: "Rohan", email, password: "Pass@123" });
    expect(s.status).toBe(200);
    expect(s.body.token).toBeTruthy();

    const l = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "Pass@123" });
    expect(l.status).toBe(200);
    expect(l.body.user.email).toBe(email);

    const exists = await User.findOne({ email });
    expect(exists).toBeTruthy();
  });
});
