import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import Truck from "@/models/truck";

// GET all trucks
export async function GET() {
  try {
    await dbConnect();
    const trucks = await Truck.find().sort({ createdAt: -1 });
    return NextResponse.json(trucks);
  } catch (error) {
    console.error("GET /api/trucks error:", error);
    return NextResponse.json({ error: "Failed to fetch trucks" }, { status: 500 });
  }
}

// POST create a new truck
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const truck = await Truck.create(body);
    return NextResponse.json(truck, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/trucks error:", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: "Vehicle number already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create truck" }, { status: 500 });
  }
}
