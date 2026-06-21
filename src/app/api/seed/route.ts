import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Truck from "@/models/truck";
import Driver from "@/models/driver";
import Trip from "@/models/trip";
import Ledger from "@/models/ledger";
import User from "@/models/user";
import {
  trucks as mockTrucks,
  drivers as mockDrivers,
  trips as mockTrips,
  ledgerEntries as mockLedger,
} from "@/lib/mock-data";

// POST seed the database with mock data
export async function POST() {
  try {
    await dbConnect();

    // Clear existing data
    await Promise.all([
      Truck.deleteMany({}),
      Driver.deleteMany({}),
      Trip.deleteMany({}),
      Ledger.deleteMany({}),
      User.deleteMany({}),
    ]);

    // Seed default admin user
    await User.create({
      username: "admin",
      password: "password123",
      name: "Veltrix Admin",
      role: "Admin"
    });

    // Seed trucks
    const truckDocs = mockTrucks.map((t) => ({
      vehicleNo: t.vehicleNo,
      type: t.type,
      capacity: t.capacity,
      status: t.status,
      driver: t.driver,
      documents: t.documents,
      gpsLink: t.gpsLink,
    }));
    await Truck.insertMany(truckDocs);

    // Seed drivers
    const driverDocs = mockDrivers.map((d) => ({
      name: d.name,
      phone: d.phone,
      dl: d.dl,
      dlExpiry: d.dlExpiry,
      aadhaar: d.aadhaar,
      pan: d.pan,
      bankName: d.bankName,
      accountNo: d.accountNo,
      ifsc: d.ifsc,
      status: d.status,
    }));
    await Driver.insertMany(driverDocs);

    // Seed trips
    const tripDocs = mockTrips.map((t) => ({
      tripId: t.id,
      vehicleNo: t.vehicleNo,
      truckId: t.truckId,
      driverId: t.driverId,
      driverName: t.driverName,
      origin: t.origin,
      destination: t.destination,
      consignment: t.consignment,
      material: t.material,
      freightRate: t.freightRate,
      quantity: t.quantity,
      totalFare: t.totalFare,
      advance: t.advance,
      pendingBalance: t.pendingBalance,
      paymentStatus: t.paymentStatus,
      tripStatus: t.tripStatus,
      startDate: t.startDate,
      endDate: t.endDate,
      expenses: t.expenses.map((e) => ({
        category: e.category,
        amount: e.amount,
        description: e.description,
        date: e.date,
      })),
      totalExpenses: t.totalExpenses,
      netProfit: t.netProfit,
      documents: t.documents,
    }));
    await Trip.insertMany(tripDocs);

    // Seed ledger
    const ledgerDocs = mockLedger.map((l) => ({
      date: l.date,
      type: l.type,
      category: l.category,
      description: l.description,
      amount: l.amount,
      vehicleNo: l.vehicleNo,
      tripId: l.tripId,
      consignment: l.consignment,
      paymentMode: l.paymentMode,
      reference: l.reference,
    }));
    await Ledger.insertMany(ledgerDocs);

    return NextResponse.json({
      message: "Database seeded successfully!",
      counts: {
        trucks: truckDocs.length,
        drivers: driverDocs.length,
        trips: tripDocs.length,
        ledger: ledgerDocs.length,
      },
    });
  } catch (error) {
    console.error("POST /api/seed error:", error);
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 });
  }
}
