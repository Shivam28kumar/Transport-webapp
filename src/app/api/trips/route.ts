import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import Trip from "@/models/trip";

// GET all trips
export async function GET() {
  try {
    await dbConnect();
    const trips = await Trip.find().sort({ createdAt: -1 });
    return NextResponse.json(trips);
  } catch (error) {
    console.error("GET /api/trips error:", error);
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
  }
}

// POST create a new trip
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    // Auto-calculate fields
    const totalFare = body.freightRate * body.quantity;
    const advance = body.advance || 0;
    const pendingBalance = totalFare - advance;

    // Auto-set payment status
    let paymentStatus: "Pending" | "Partial" | "Complete" = "Pending";
    if (advance === 0) paymentStatus = "Pending";
    else if (advance >= totalFare) paymentStatus = "Complete";
    else paymentStatus = "Partial";

    // Calculate expenses
    const expenses = body.expenses || [];
    const totalExpenses = expenses.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);
    const netProfit = totalFare - totalExpenses;

    // Generate trip ID
    const year = new Date().getFullYear();
    const count = await Trip.countDocuments();
    const tripId = `TRP-${year}-${String(count + 1).padStart(3, "0")}`;

    const trip = await Trip.create({
      ...body,
      tripId,
      totalFare,
      pendingBalance,
      paymentStatus,
      totalExpenses,
      netProfit,
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    console.error("POST /api/trips error:", error);
    return NextResponse.json({ error: "Failed to create trip" }, { status: 500 });
  }
}
