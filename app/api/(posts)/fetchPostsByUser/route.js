import connectMongoDB from "@/libs/db";
import User from "@/models/userSchema";
import { NextResponse } from "next/server";
import Post from "@/models/postSchema";
import mongoose from "mongoose";

export async function POST(req) {
    await connectMongoDB();

    const { userId, email } = await req.json();

    const posts = await Post.aggregate([
        {
            $match: { email: email }, // Match posts by the provided email
        },
        {
            $lookup: {
                from: "users", // The name of the User collection
                localField: "email", // The field in Post schema
                foreignField: "email", // The field in User schema
                as: "user", // The field name to store the resulting User data
            },
        },
        {
            $unwind: "$user", // Flatten the array to an object (if a match is found)
        },
        {
            $lookup: {
                from: "users", // The name of the User collection
                localField: "likes", // Array of user IDs who liked the post
                foreignField: "_id", // Match these user IDs with the `_id` in the User collection
                as: "likers", // Store the resulting liker details
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
                    avatar: 1, // Only include required fields for likers
                },
            },
        },
    ]).sort({ createdAt: -1 });


    const updatedPosts = posts.map((post) => ({
        ...post,
        likedByUser: post.likes.map(String).includes(String(userId)), // Convert both to strings for comparison
    }));

    return NextResponse.json(
        { message: "Fetched All Posts", posts: updatedPosts },
        { status: 200 },
    );
}
