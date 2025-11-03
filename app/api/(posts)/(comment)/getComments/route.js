import connectMongoDB from "@/libs/db";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Post from "@/models/postSchema";

export async function POST(req) {
  try {
    const { postId } = await req.json();

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 },
      );
    }

    await connectMongoDB();

    // Convert postId to ObjectId
    const objectId = new mongoose.Types.ObjectId(postId);

    // Aggregation pipeline to fetch comments with user details
    const comments = await Post.aggregate([
      {
        $match: { _id: objectId, comments: { $exists: true, $ne: [] } }, // Match postId and ensure comments exist
      },
      {
        $unwind: "$comments", // Unwind the comments array
      },
      {
        $lookup: {
          from: "users", // Ensure this matches your User collection name
          localField: "comments.user", // Reference field in comments
          foreignField: "_id", // Field in the User collection
          as: "userDetails", // Output array for matched user data
        },
      },
      {
        $unwind: "$userDetails", // Flatten the user details array
      },
      {
        $project: {
          _id: 0, // Exclude post ID
          "comments._id": 1,
          "comments.text": 1, // Include the comment text
          "comments.createdAt": 1, // Include the comment creation time
          "userDetails.fname": 1, // Include user's first name
          "userDetails.lname": 1, // Include user's last name
          "userDetails.avatar": 1, // Include user's avatar
        },
      },
      {
        $sort: { "comments.createdAt": -1 }, // Sort by comment creation date
      },
    ]);

    return NextResponse.json(
      { message: "Fetched all comments", comments },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
