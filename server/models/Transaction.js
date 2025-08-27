import mongoose from "mongoose";

const txSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    beneficiary: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Beneficiary",
      required: true,
    },

    fromCurrency: { type: String, required: true },
    toCurrency: { type: String, required: true },
    sourceAmount: { type: Number, required: true },
    rate: { type: Number, required: true },
    convertedAmount: { type: Number, required: true },

    feeFixed: { type: Number, default: 0 },
    feePercent: { type: Number, default: 0 },
    totalDebit: { type: Number, required: true },

    usdEquivalent: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "COMPLETED",
    },
    highRisk: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", txSchema);
