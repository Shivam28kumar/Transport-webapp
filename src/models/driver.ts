import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDriver extends Document {
  name: string;
  phone: string;
  dl: string;
  dlExpiry: string;
  aadhaar: string;
  pan: string;
  bankName: string;
  accountNo: string;
  ifsc: string;
  status: "Available" | "On Trip" | "On Leave";
  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema = new Schema<IDriver>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    dl: { type: String, required: true, trim: true },
    dlExpiry: { type: String, required: true },
    aadhaar: { type: String, required: true, trim: true },
    pan: { type: String, required: true, uppercase: true, trim: true },
    bankName: { type: String, required: true, trim: true },
    accountNo: { type: String, required: true, trim: true },
    ifsc: { type: String, required: true, uppercase: true, trim: true },
    status: { type: String, required: true, enum: ["Available", "On Trip", "On Leave"], default: "Available" },
  },
  { timestamps: true }
);

const Driver: Model<IDriver> = mongoose.models.Driver || mongoose.model<IDriver>("Driver", DriverSchema);

export default Driver;
