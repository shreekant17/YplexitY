import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { verifyToken } from "@/libs/jwt";
import connectMongoDB from "@/libs/db";
import User from "@/models/userSchema";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const POST = async (req) => {
  try {
    const data = await req.formData();

    // Validate token
    const token = data.get("token");
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 },
      );
    }

    // Validate required fields
    const requiredFields = ["id", "email", "username", "fname", "lname", "country"];
    for (const field of requiredFields) {
      if (!data.get(field)) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 },
        );
      }
    }

    // Upload image to Cloudinary if file is provided
    let imageUrl = null;
    const image = data.get("file");
    // console.log(image)
    if (image && image instanceof File && image.size > 0) {
      // Convert file to Base64
      const fileBuffer = await image.arrayBuffer();
      const fileUri = `data:${image.type};base64,${Buffer.from(fileBuffer).toString("base64")}`;

      const result = await cloudinary.uploader.upload(fileUri, {
        folder: "avatars",
        invalidate: true,
      });

      imageUrl = result.secure_url;
    }

    // Update user in MongoDB
    const id = data.get("id");
    await connectMongoDB();

    const existingUser = await User.findById(id);
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    // Create a new user instance
    const updatedFields = {
      fname: data.get("fname"),
      lname: data.get("lname"),
      email: data.get("email"),
      username: data.get("username"),
      country: data.get("country"),
    };

    // Update avatar only if imageUrl is provided
    if (imageUrl) {
      updatedFields.avatar = imageUrl;
    }

    console.log(updatedFields)

    // Update the user in the database
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updatedFields },
      {
        new: true, // Return the updated document
        runValidators: true, // Validate updated fields
        upsert: true, // Create the document if it doesn't exist
      }
    );

    console.log(updatedUser)

    return NextResponse.json(
      { success: true, data: { imageUrl } },
      { status: 200 },
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
};
