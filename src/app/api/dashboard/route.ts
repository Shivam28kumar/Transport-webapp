import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import Truck from "@/models/truck";
import Trip from "@/models/trip";
import Ledger from "@/models/ledger";

// GET dashboard statistics
export async function GET() {
  try {
    await dbConnect();

    const [trucks, trips, ledgerEntries] = await Promise.all([
      Truck.find(),
      Trip.find(),
      Ledger.find(),
    ]);

    const totalRevenue = ledgerEntries
      .filter((e) => e.type === "Income")
      .reduce((sum, e) => sum + e.amount, 0);

    const totalExpensesAmount = ledgerEntries
      .filter((e) => e.type === "Expense")
      .reduce((sum, e) => sum + e.amount, 0);

    const netProfit = totalRevenue - totalExpensesAmount;

    const activeTrucks = trucks.filter(
      (t) => t.status === "Active" || t.status === "In Transit"
    ).length;

    const ongoingTrips = trips.filter(
      (t) => t.tripStatus === "In Transit" || t.tripStatus === "Planned"
    ).length;

    const outstandingCollection = trips.reduce(
      (sum, t) => sum + t.pendingBalance,
      0
    );

    // Monthly performance (aggregate from ledger)
    const monthlyPerformance = [
      { month: "Jan", income: 0, expenses: 0 },
      { month: "Feb", income: 0, expenses: 0 },
      { month: "Mar", income: 0, expenses: 0 },
      { month: "Apr", income: 0, expenses: 0 },
      { month: "May", income: 0, expenses: 0 },
      { month: "Jun", income: 0, expenses: 0 },
      { month: "Jul", income: 0, expenses: 0 },
      { month: "Aug", income: 0, expenses: 0 },
      { month: "Sep", income: 0, expenses: 0 },
      { month: "Oct", income: 0, expenses: 0 },
      { month: "Nov", income: 0, expenses: 0 },
      { month: "Dec", income: 0, expenses: 0 },
    ];

    ledgerEntries.forEach((entry) => {
      const monthIdx = new Date(entry.date).getMonth();
      if (monthIdx >= 0 && monthIdx < 12) {
        if (entry.type === "Income") {
          monthlyPerformance[monthIdx].income += entry.amount;
        } else {
          monthlyPerformance[monthIdx].expenses += entry.amount;
        }
      }
    });

    // Filter to only months with data, or last 6 months
    const currentMonth = new Date().getMonth();
    const last6 = monthlyPerformance.slice(
      Math.max(0, currentMonth - 5),
      currentMonth + 1
    );

    // Trip status counts
    const tripStatusCounts = {
      completed: trips.filter((t) => t.tripStatus === "Completed").length,
      inTransit: trips.filter((t) => t.tripStatus === "In Transit").length,
      planned: trips.filter((t) => t.tripStatus === "Planned").length,
      delivered: trips.filter((t) => t.tripStatus === "Delivered").length,
    };

    // Recent trips
    const recentTrips = trips
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 5);

    return NextResponse.json({
      totalRevenue,
      totalExpenses: totalExpensesAmount,
      netProfit,
      activeTrucks,
      totalTrucks: trucks.length,
      ongoingTrips,
      outstandingCollection,
      monthlyPerformance: last6.length > 0 ? last6 : monthlyPerformance.slice(0, 6),
      tripStatusCounts,
      recentTrips,
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}
