import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITripExpense {
  _id?: string;
  category: "Fuel" | "Toll" | "Driver Advance" | "Loading" | "Unloading" | "Repair" | "RTO" | "Other";
  amount?: number;
  description?: string;
  date?: string;
}

export interface ITrip extends Document {
  tripId: string;
  vehicleNo?: string;
  truckId?: string;
  driverId?: string;
  driverName?: string;
  origin?: string;
  destination?: string;
  consignment?: string;
  material?: string;
  freightRate?: number;
  quantity?: number;
  totalFare?: number;
  advance?: number;
  pendingBalance?: number;
  paymentStatus?: "Pending" | "Partial" | "Complete";
  tripStatus?: "Planned" | "In Transit" | "Delivered" | "Completed";
  startDate?: string;
  endDate?: string;
  expenses?: ITripExpense[];
  totalExpenses?: number;
  netProfit?: number;
  documents?: {
    lrCopy?: string;
    invoice?: string;
    pod?: string;
    paymentReceipt?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const TripExpenseSchema = new Schema<ITripExpense>({
  category: {
    type: String,
    required: true,
    enum: ["Fuel", "Toll", "Driver Advance", "Loading", "Unloading", "Repair", "RTO", "Other"],
  },
  amount: { type: Number, default: 0 },
  description: { type: String, default: "" },
  date: { type: String, default: "" },
});

const TripSchema = new Schema<ITrip>(
  {
    tripId: { type: String, required: true, unique: true },
    vehicleNo: { type: String, default: "" },
    truckId: { type: String, default: "" },
    driverId: { type: String, default: "" },
    driverName: { type: String, default: "" },
    origin: { type: String, default: "" },
    destination: { type: String, default: "" },
    consignment: { type: String, default: "" },
    material: { type: String, default: "" },
    freightRate: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
    totalFare: { type: Number, default: 0 },
    advance: { type: Number, default: 0 },
    pendingBalance: { type: Number, default: 0 },
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
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
    expenses: { type: [TripExpenseSchema], default: [] },
    totalExpenses: { type: Number, default: 0 },
    netProfit: { type: Number, default: 0 },
    documents: {
      lrCopy: { type: String, default: "" },
      invoice: { type: String, default: "" },
      pod: { type: String, default: "" },
      paymentReceipt: { type: String, default: "" },
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
