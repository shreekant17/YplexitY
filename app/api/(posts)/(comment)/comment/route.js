import Post from "@/models/postSchema";
import { NextResponse } from "next/server";
import { verifyToken } from "@/libs/jwt";

export const POST = async (req) => {
  try {
    const data = await req.formData();
    const token = data.get("token");
    const postId = data.get("postId");
    const commentText = data.get("commentText");

    // Validate input
    if (!postId || !token || !commentText) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    // Verify the token and get user details
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = user.userId;

    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ message: "Post not found." }, { status: 404 });
    }

    // Add the comment to the post
    post.comments.push({
      user: userId,
      text: commentText,
      createdAt: new Date(),
    });

    // Save the updated post
    await post.save();

    return NextResponse.json(
      { message: "Comment added successfully" },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error in adding comment:", err);
    return NextResponse.json(
      { message: "Failed to add comment" },
      { status: 500 },
    );
  }
};
