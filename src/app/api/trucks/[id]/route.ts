import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Truck from "@/models/truck";

// GET single truck
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const truck = await Truck.findById(id);
    if (!truck) return NextResponse.json({ error: "Truck not found" }, { status: 404 });
    return NextResponse.json(truck);
  } catch (error) {
    console.error("GET /api/trucks/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch truck" }, { status: 500 });
  }
}

// PUT update truck
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const truck = await Truck.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!truck) return NextResponse.json({ error: "Truck not found" }, { status: 404 });
    return NextResponse.json(truck);
  } catch (error) {
    console.error("PUT /api/trucks/[id] error:", error);
    return NextResponse.json({ error: "Failed to update truck" }, { status: 500 });
  }
}

// DELETE truck
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const truck = await Truck.findByIdAndDelete(id);
    if (!truck) return NextResponse.json({ error: "Truck not found" }, { status: 404 });
    return NextResponse.json({ message: "Truck deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/trucks/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete truck" }, { status: 500 });
  }
}
