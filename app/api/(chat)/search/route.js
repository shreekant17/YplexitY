import connectMongoDB from "@/libs/db";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Message from "@/models/messageSchema";
import User from "@/models/userSchema";

export async function POST(req) {
  try {
    const { query } = await req.json();

    await connectMongoDB();

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Invalid search query." });
    }

    // Perform a case-insensitive search on fname or lname
    const users = await User.find({
      $or: [
        { fname: { $regex: query, $options: "i" } },
        { lname: { $regex: query, $options: "i" } },
      ],
    })
      .select("fname lname avatar email country") // Select fields to return
      .limit(10); // Limit results for performance

    const formattedUsers = users.map((user) => ({
      userId: user._id,
      fname: user.fname,
      lname: user.lname,
      avatar: user.avatar,
      email: user.email,
      country: user.country,
    }));

    return NextResponse.json(
      {
        message: "Fetched users",
        users: formattedUsers,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
