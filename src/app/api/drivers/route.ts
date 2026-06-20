import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import Driver from "@/models/driver";

// GET all drivers
export async function GET() {
  try {
    await dbConnect();
    const drivers = await Driver.find().sort({ createdAt: -1 });
    return NextResponse.json(drivers);
  } catch (error) {
    console.error("GET /api/drivers error:", error);
    return NextResponse.json({ error: "Failed to fetch drivers" }, { status: 500 });
  }
}

// POST create a new driver
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const driver = await Driver.create(body);
    return NextResponse.json(driver, { status: 201 });
  } catch (error) {
    console.error("POST /api/drivers error:", error);
    return NextResponse.json({ error: "Failed to create driver" }, { status: 500 });
  }
}
