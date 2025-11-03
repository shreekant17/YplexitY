import connectMongoDB from "@/libs/db";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Message from "@/models/messageSchema";
import User from "@/models/userSchema";

export async function POST(req) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    await connectMongoDB();

    // Convert userId to ObjectId
    const objectId = new mongoose.Types.ObjectId(userId);

    // Aggregation pipeline
    const users = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: objectId }, { receiver: objectId }],
        },
      },
      {
        $sort: { createdAt: -1 }, // Sort messages by creation date (latest first)
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", objectId] },
              "$receiver", // Group by receiver if current user is sender
              "$sender", // Group by sender if current user is receiver
            ],
          },
          latestMessage: { $first: "$$ROOT" }, // Keep the latest message in the group
        },
      },
      {
        $lookup: {
          from: "users", // The name of the users collection
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails", // Convert userDetails array into an object
      },
      {
        $project: {
          _id: 0,
          userId: "$_id", // Chat partner's userId
          fname: "$userDetails.fname",
          lname: "$userDetails.lname",
          avatar: "$userDetails.avatar",
          email: "$userDetails.email",
          latestMessage: {
            text: "$latestMessage.text",
            sender: "$latestMessage.sender",
            receiver: "$latestMessage.receiver",
            createdAt: "$latestMessage.createdAt",
          },
        },
      },
    ]);

    return NextResponse.json(
      { message: "Fetched chatted users and latest chats", users },
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
