import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import Ledger from "@/models/ledger";
import Trip from "@/models/trip";

// GET all ledger entries
export async function GET() {
  try {
    await dbConnect();
    const entries = await Ledger.find().sort({ date: -1, createdAt: -1 });
    return NextResponse.json(entries);
  } catch (error) {
    console.error("GET /api/ledger error:", error);
    return NextResponse.json({ error: "Failed to fetch ledger" }, { status: 500 });
  }
}

// POST create ledger entry (with auto-trip-linking for expenses)
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    // Support multi-line expense entry
    const entries = Array.isArray(body) ? body : [body];
    const createdEntries = [];

    for (const entry of entries) {
      // Set date if not provided
      if (!entry.date) {
        entry.date = new Date().toISOString().split("T")[0];
      }

      const ledgerEntry = await Ledger.create(entry);
      createdEntries.push(ledgerEntry);

      // === AUTO-LINK RULE ===
      // If expense has a vehicleNo, find the active trip and link it
      if (entry.type === "Expense" && entry.vehicleNo) {
        const activeTrip = await Trip.findOne({
          vehicleNo: { $regex: new RegExp(entry.vehicleNo.replace(/\s+/g, "\\s*"), "i") },
          tripStatus: { $in: ["Planned", "In Transit"] },
        }).sort({ createdAt: -1 });

        if (activeTrip) {
          // Link expense to trip
          ledgerEntry.tripId = activeTrip.tripId;
          await ledgerEntry.save();

          // Add expense to trip's expense log
          activeTrip.expenses.push({
            category: entry.category,
            amount: entry.amount,
            description: entry.description,
            date: entry.date,
          });

          // Recalculate trip financials
          activeTrip.totalExpenses = activeTrip.expenses.reduce(
            (sum: number, e: { amount: number }) => sum + e.amount,
            0
          );
          activeTrip.netProfit = activeTrip.totalFare - activeTrip.totalExpenses;

          await activeTrip.save();
        }
      }

      // If income with tripId, update trip's advance and payment status
      if (entry.type === "Income" && entry.tripId) {
        const trip = await Trip.findOne({ tripId: entry.tripId });
        if (trip) {
          trip.advance += entry.amount;
          trip.pendingBalance = trip.totalFare - trip.advance;

          if (trip.advance === 0) trip.paymentStatus = "Pending";
          else if (trip.advance >= trip.totalFare) trip.paymentStatus = "Complete";
          else trip.paymentStatus = "Partial";

          await trip.save();
        }
      }
    }

    return NextResponse.json(
      createdEntries.length === 1 ? createdEntries[0] : createdEntries,
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/ledger error:", error);
    return NextResponse.json({ error: "Failed to create ledger entry" }, { status: 500 });
  }
}
