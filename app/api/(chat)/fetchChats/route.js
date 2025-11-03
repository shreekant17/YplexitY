import connectMongoDB from "@/libs/db";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Message from "@/models/messageSchema";
import User from "@/models/userSchema";

export async function POST(req) {
  try {
    const { userId, receiverId } = await req.json();

    if (!userId || !receiverId) {
      return NextResponse.json(
        { error: "User ID and Receiver ID are required" },
        { status: 400 },
      );
    }

    await connectMongoDB();

    // Convert IDs to ObjectId
    const uid = new mongoose.Types.ObjectId(userId);
    const rid = new mongoose.Types.ObjectId(receiverId);

    // Fetch messages between the two users
    const messages = await Message.find({
      $or: [
        { sender: uid, receiver: rid },
        { sender: rid, receiver: uid },
      ],
    })
      .sort({ createdAt: 1 }) // Sort messages by creation date
      .exec();

    /*
    // Populate sender and receiver details if required (optional)
    const populatedMessages = await Message.populate(messages, {
      path: "sender receiver",
      select: "fname lname avatar", // Include only required fields
    });
    */
    return NextResponse.json(
      {
        message: "Fetched chatted users and latest chats",
        messages: messages,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching chatted users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
