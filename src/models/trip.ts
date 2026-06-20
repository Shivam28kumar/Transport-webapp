import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITripExpense {
  _id?: string;
  category: "Fuel" | "Toll" | "Driver Advance" | "Loading" | "Unloading" | "Repair" | "RTO" | "Other";
  amount: number;
  description: string;
  date: string;
}

export interface ITrip extends Document {
  tripId: string;
  vehicleNo: string;
  truckId: string;
  driverId: string;
  driverName: string;
  origin: string;
  destination: string;
  consignment: string;
  material: string;
  freightRate: number;
  quantity: number;
  totalFare: number;
  advance: number;
  pendingBalance: number;
  paymentStatus: "Pending" | "Partial" | "Complete";
  tripStatus: "Planned" | "In Transit" | "Delivered" | "Completed";
  startDate: string;
  endDate?: string;
  expenses: ITripExpense[];
  totalExpenses: number;
  netProfit: number;
  documents: {
    lrCopy?: string;
    invoice?: string;
    pod?: string;
    paymentReceipt?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TripExpenseSchema = new Schema<ITripExpense>({
  category: {
    type: String,
    required: true,
    enum: ["Fuel", "Toll", "Driver Advance", "Loading", "Unloading", "Repair", "RTO", "Other"],
  },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true },
});

const TripSchema = new Schema<ITrip>(
  {
    tripId: { type: String, required: true, unique: true },
    vehicleNo: { type: String, required: true },
    truckId: { type: String, required: true },
    driverId: { type: String, required: true },
    driverName: { type: String, required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    consignment: { type: String, required: true },
    material: { type: String, required: true },
    freightRate: { type: Number, required: true },
    quantity: { type: Number, required: true },
    totalFare: { type: Number, required: true },
    advance: { type: Number, default: 0 },
    pendingBalance: { type: Number, required: true },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["Pending", "Partial", "Complete"],
      default: "Pending",
    },
    tripStatus: {
      type: String,
      required: true,
      enum: ["Planned", "In Transit", "Delivered", "Completed"],
      default: "Planned",
    },
    startDate: { type: String, required: true },
    endDate: { type: String },
    expenses: { type: [TripExpenseSchema], default: [] },
    totalExpenses: { type: Number, default: 0 },
    netProfit: { type: Number, default: 0 },
    documents: {
      lrCopy: { type: String },
      invoice: { type: String },
      pod: { type: String },
      paymentReceipt: { type: String },
    },
  },
  { timestamps: true }
);

// Auto-generate tripId before saving
TripSchema.pre("validate", async function () {
  if (!this.tripId) {
    const year = new Date().getFullYear();
    const count = await mongoose.models.Trip.countDocuments();
    this.tripId = `TRP-${year}-${String(count + 1).padStart(3, "0")}`;
  }
});

const Trip: Model<ITrip> = mongoose.models.Trip || mongoose.model<ITrip>("Trip", TripSchema);

export default Trip;
