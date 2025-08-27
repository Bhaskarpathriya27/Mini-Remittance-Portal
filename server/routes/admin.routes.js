import { Router } from "express";
import { auth, isAdmin } from "../middleware/auth.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

const router = Router();
router.use(auth, isAdmin);

router.get("/users", async (req, res, next) => {
  try {
    const users = await User.find()
      .select("fullName email role accountNumber createdAt")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (e) {
    next(e);
  }
});

router.get("/transactions", async (req, res, next) => {
  try {
    const list = await Transaction.find()
      .populate({ path: "beneficiary", select: "name" })
      .populate({ path: "user", select: "email" })
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

export default router;
