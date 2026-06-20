import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Trip from "@/models/trip";

// GET single trip
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const trip = await Trip.findById(id);
    if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    return NextResponse.json(trip);
  } catch (error) {
    console.error("GET /api/trips/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch trip" }, { status: 500 });
  }
}

// PUT update trip (recalculates all financial fields)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const trip = await Trip.findById(id);
    if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

    // Merge updates
    Object.assign(trip, body);

    // Recalculate financial fields
    trip.totalFare = trip.freightRate * trip.quantity;
    trip.pendingBalance = trip.totalFare - trip.advance;
    trip.totalExpenses = trip.expenses.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);
    trip.netProfit = trip.totalFare - trip.totalExpenses;

    // Auto-set payment status
    if (trip.advance === 0) trip.paymentStatus = "Pending";
    else if (trip.advance >= trip.totalFare) trip.paymentStatus = "Complete";
    else trip.paymentStatus = "Partial";

    await trip.save();
    return NextResponse.json(trip);
  } catch (error) {
    console.error("PUT /api/trips/[id] error:", error);
    return NextResponse.json({ error: "Failed to update trip" }, { status: 500 });
  }
}

// DELETE trip
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const trip = await Trip.findByIdAndDelete(id);
    if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    return NextResponse.json({ message: "Trip deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/trips/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete trip" }, { status: 500 });
  }
}
