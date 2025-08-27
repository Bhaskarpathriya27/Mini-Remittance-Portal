import mongoose from "mongoose";

const beneficiarySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    bankAccountNumber: { type: String, required: true },
    country: { type: String, required: true },
    currency: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Beneficiary", beneficiarySchema);
