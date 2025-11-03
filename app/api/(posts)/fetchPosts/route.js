import connectMongoDB from "@/libs/db";
import { NextResponse } from "next/server";
import Post from "@/models/postSchema";
import User from "@/models/userSchema";

export async function POST(req) {
  await connectMongoDB();

  const { userId, limit = 6, lastCreatedAt } = await req.json();

  // If a cursor exists, fetch posts *older* than that date
  const matchStage = lastCreatedAt
    ? { createdAt: { $lt: new Date(lastCreatedAt) } }
    : {};

  const posts = await Post.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "email",
        foreignField: "email",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $lookup: {
        from: "users",
        localField: "likes",
        foreignField: "_id",
        as: "likers",
      },
    },
    {
      $project: {
        _id: 1,
        email: 1,
        content: 1,
        media: 1,
        likes: 1,
        shares: 1,
        visibility: 1,
        isEdited: 1,
        comments: 1,
        createdAt: 1,
        "user._id": 1,
        "user.fname": 1,
        "user.lname": 1,
        "user.avatar": 1,
        likers: {
          _id: 1,
          fname: 1,
          lname: 1,
          avatar: 1,
        },
      },
    },
    { $sort: { createdAt: -1 } },
    { $limit: Number(limit) },
  ]);

  const nextCursor = posts.length > 0 ? posts[posts.length - 1].createdAt : null;

  const updatedPosts = posts.map((post) => ({
    ...post,
    likedByUser: post.likes.map(String).includes(String(userId)),
  }));

  return NextResponse.json(
    { message: "Fetched posts", posts: updatedPosts, nextCursor },
    { status: 200 }
  );
}
