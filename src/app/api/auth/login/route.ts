import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/mongodb";
import User from "@/models/user";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    console.log(`[Auth Login] Attempt for username: "${trimmedUsername}"`);

    // 1. Query using Mongoose regex
    let user = await User.findOne({
      username: { $regex: new RegExp("^\\s*" + trimmedUsername.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") + "\\s*$", "i") }
    });

    // 2. Query using Raw MongoDB Driver directly as fallback to bypass Mongoose casing/trimming schema casts
    if (!user) {
      console.log(`[Auth Login] Mongoose search yielded no user. Falling back to direct MongoDB query...`);
      const rawDb = mongoose.connection.db;
      if (rawDb) {
        const rawUser = await rawDb.collection("users").findOne({
          username: { $regex: new RegExp("^\\s*" + trimmedUsername.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") + "\\s*$", "i") }
        });
        if (rawUser) {
          console.log(`[Auth Login] Direct MongoDB query succeeded!`);
          user = rawUser as any;
        }
      }
    }

    if (!user) {
      console.log(`[Auth Login] User not found anywhere in database.`);
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const dbPassword = user.password || "";
    const isPasswordMatch = dbPassword === password || dbPassword.trim() === trimmedPassword;

    console.log(`[Auth Login] User found: "${user.username}". Password match: ${isPasswordMatch}`);

    if (!isPasswordMatch) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    // Set auth cookie
    const cookieStore = await cookies();
    cookieStore.set("auth_session", JSON.stringify({
      id: user._id,
      username: user.username,
      name: user.name,
      role: user.role
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/"
    });

    return NextResponse.json({ success: true, user: { name: user.name, role: user.role } });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
