import Post from "@/models/postSchema";
import { NextResponse } from "next/server";
import { verifyToken } from "@/libs/jwt";
import mongoose from "mongoose";

export const POST = async (req) => {
  try {
    const { postId, token } = await req.json();

    if (!postId || !token) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ message: "Post not found." }, { status: 404 });
    }

    const user = await verifyToken(token);
    const userId = user.userId;

    // Check if the user has already liked the post
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex === -1) {
      // Add like if not already liked
      post.likes.push(userId);
    } else {
      // Remove like if already liked
      post.likes.splice(likeIndex, 1);
    }

    // Save the updated post
    await post.save();

    const objectId = new mongoose.Types.ObjectId(postId);

    // Aggregation pipeline to fetch likes with user details
    const likes = await Post.aggregate([
      {
        $match: { _id: objectId, likes: { $exists: true, $ne: [] } }, // Match postId and ensure likes exist
      },
      {
        $unwind: "$likes", // Unwind the likes array
      },
      {
        $lookup: {
          from: "users", // Ensure this matches your User collection name
          localField: "likes", // Reference field in the Post document
          foreignField: "_id", // Field in the User collection
          as: "userdata", // Output array for matched user data
        },
      },
      {
        $unwind: "$userdata", // Flatten the userdata array
      },
      {
        $project: {
          _id: 0, // Exclude the post ID
          "userdata._id": 1,
          "userdata.fname": 1, // Include user's first name
          "userdata.lname": 1, // Include user's last name
          "userdata.avatar": 1, // Include user's avatar
        },
      },
    ]);

    if (!likes || likes.length === 0) {
      return NextResponse.json(
        { message: "No likes found for this post", likers: [] },
        { status: 200 },
      );
    }

    // Map to flatten the user data into a single array of likers
    const likers = likes.map((like) => ({
      _id: like.userdata._id,
      fname: like.userdata.fname,
      lname: like.userdata.lname,
      avatar: like.userdata.avatar,
    }));

    return NextResponse.json({ message: "Success", likers }, { status: 200 });
  } catch (err) {
    console.error("Error in liking post:", err);
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
};
