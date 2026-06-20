import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILedger extends Document {
  date: string;
  type: "Income" | "Expense";
  category: string;
  description: string;
  amount: number;
  vehicleNo?: string;
  tripId?: string;
  consignment?: string;
  paymentMode: "UPI" | "Bank Transfer" | "Cash" | "Cheque";
  reference?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LedgerSchema = new Schema<ILedger>(
  {
    date: { type: String, required: true },
    type: { type: String, required: true, enum: ["Income", "Expense"] },
    category: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    vehicleNo: { type: String },
    tripId: { type: String },
    consignment: { type: String },
    paymentMode: {
      type: String,
      required: true,
      enum: ["UPI", "Bank Transfer", "Cash", "Cheque"],
    },
    reference: { type: String },
  },
  { timestamps: true }
);

const Ledger: Model<ILedger> = mongoose.models.Ledger || mongoose.model<ILedger>("Ledger", LedgerSchema);

export default Ledger;
