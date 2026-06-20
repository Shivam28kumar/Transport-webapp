import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Driver from "@/models/driver";

// GET single driver
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const driver = await Driver.findById(id);
    if (!driver) return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    return NextResponse.json(driver);
  } catch (error) {
    console.error("GET /api/drivers/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch driver" }, { status: 500 });
  }
}

// PUT update driver
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const driver = await Driver.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!driver) return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    return NextResponse.json(driver);
  } catch (error) {
    console.error("PUT /api/drivers/[id] error:", error);
    return NextResponse.json({ error: "Failed to update driver" }, { status: 500 });
  }
}

// DELETE driver
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const driver = await Driver.findByIdAndDelete(id);
    if (!driver) return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    return NextResponse.json({ message: "Driver deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/drivers/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete driver" }, { status: 500 });
  }
}
