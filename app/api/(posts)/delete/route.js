import Post from "@/models/postSchema";
import { NextResponse } from "next/server";
import { verifyToken } from "@/libs/jwt";
import cloudinary from "cloudinary";

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const POST = async (req) => {
    try {
        const { postId, token } = await req.json();

        if (!postId || !token) {
            return NextResponse.json({ message: "Invalid input" }, { status: 400 });
        }

        // Verify token and extract user details
        const user = await verifyToken(token);
        const email = user.email;

        if (!email) {
            return NextResponse.json({ message: "Invalid user token." }, { status: 401 });
        }

        // Fetch the post to get the public_id for Cloudinary
        const post = await Post.findOne({ _id: postId, email });

        if (!post) {
            return NextResponse.json({ message: "Post not found or unauthorized." }, { status: 404 });
        }

        const publicId = post.public_id;

        // Attempt to delete the media from Cloudinary
        if (publicId) {
            try {
                await cloudinary.v2.uploader.destroy(publicId);
            } catch (cloudErr) {
                console.error("Error deleting media from Cloudinary:", cloudErr);
                return NextResponse.json(
                    { message: "Failed to delete associated media from Cloudinary." },
                    { status: 500 }
                );
            }
        }

        // Delete the post from MongoDB
        const result = await Post.deleteOne({ _id: postId, email });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: "Post not found or unauthorized." }, { status: 404 });
        }

        return NextResponse.json({ message: "Post and associated media deleted successfully." }, { status: 200 });
    } catch (err) {
        console.error("Error in deleting post:", err);
        return NextResponse.json({ message: "Failed to delete post." }, { status: 500 });
    }
};
