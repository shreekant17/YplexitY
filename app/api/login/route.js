import connectMongoDB from "@/libs/db";
import User from "@/models/userSchema";
import { NextResponse } from "next/server";
import { generateToken } from "@/libs/jwt";

export const POST = async (req) => {
  try {
    const { email, password } = await req.json();

    await connectMongoDB();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid Credentials" },
        { status: 401 },
      );
    }

    if (user.password === password) {
      const userId = user._id.toString();
      const token = generateToken({ userId, email, name: user.name });

      return NextResponse.json(
        { message: "Login Successful", token, userId },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { message: "Invalid Credentials" },
      { status: 401 },
    );
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json(
      { message: "Something Went Wrong" },
      { status: 500 },
    );
  }
};
