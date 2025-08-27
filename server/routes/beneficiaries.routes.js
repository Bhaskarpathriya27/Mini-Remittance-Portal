import { Router } from "express";
import Beneficiary from "../models/Beneficiary.js";
import { auth } from "../middleware/auth.js";

const router = Router();
router.use(auth);

router.get("/", async (req, res, next) => {
  try {
    const list = await Beneficiary.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, bankAccountNumber, country, currency } = req.body;
    const b = await Beneficiary.create({
      user: req.user.id,
      name,
      bankAccountNumber,
      country,
      currency,
    });
    res.status(201).json(b);
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const upd = await Beneficiary.findOneAndUpdate(
      { _id: id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!upd) return res.status(404).json({ message: "Not found" });
    res.json(upd);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const del = await Beneficiary.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });
    if (!del) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
