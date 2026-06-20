import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITruckDocument {
  type: "RC" | "Insurance" | "Fitness" | "Permit" | "PUC";
  number: string;
  expiryDate: string;
  status: "Valid" | "Expired" | "Expiring Soon";
  fileUrl?: string;
}

export interface ITruck extends Document {
  vehicleNo: string;
  type: "Trailer" | "Tanker" | "Tipper" | "Container";
  capacity: string;
  status: "Active" | "In Transit" | "Maintenance" | "Idle";
  driver?: string;
  documents: ITruckDocument[];
  gpsLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TruckDocumentSchema = new Schema<ITruckDocument>({
  type: { type: String, required: true, enum: ["RC", "Insurance", "Fitness", "Permit", "PUC"] },
  number: { type: String, required: true },
  expiryDate: { type: String, required: true },
  status: { type: String, required: true, enum: ["Valid", "Expired", "Expiring Soon"], default: "Valid" },
  fileUrl: { type: String },
});

const TruckSchema = new Schema<ITruck>(
  {
    vehicleNo: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, required: true, enum: ["Trailer", "Tanker", "Tipper", "Container"] },
    capacity: { type: String, required: true },
    status: { type: String, required: true, enum: ["Active", "In Transit", "Maintenance", "Idle"], default: "Active" },
    driver: { type: String },
    documents: { type: [TruckDocumentSchema], default: [] },
    gpsLink: { type: String },
  },
  { timestamps: true }
);

const Truck: Model<ITruck> = mongoose.models.Truck || mongoose.model<ITruck>("Truck", TruckSchema);

export default Truck;
