import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { verifyToken } from "@/libs/jwt";
import Post from "@/models/postSchema";
import connectMongoDB from "@/libs/db";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const POST = async (req) => {
  const data = await req.formData();
  const image = await data.get("file");
  const fileBuffer = await image.arrayBuffer();

  var mime = image.type;
  var encoding = "base64";
  var base64Data = Buffer.from(fileBuffer).toString("base64");
  var fileUri = "data:" + mime + ";" + encoding + "," + base64Data;

  try {
    const token = data.get("token");

    if (token) {
      const uploadToCloudinary = () => {
        return new Promise((resolve, reject) => {
          var result = cloudinary.uploader
            .upload(fileUri, {
              folder: "posts",
              invalidate: true,
            })
            .then((result) => {
              //console.log(result);
              resolve(result);
            })
            .catch((error) => {
              // console.log(error);
              reject(error);
            });
        });
      };

      const result = await uploadToCloudinary();

      //console.log(result);

      const imageUrl = result.secure_url;
      const public_id = result.public_id;

      const user = verifyToken(token);
      const email = user.email;
      const userId = user.userId;
      const content = data.get("content");
      const type = data.get("type");
      const media = imageUrl;

      const post = {
        userId: userId,
        email: email,
        content: content,
        type: type,
        media: media,
        public_id: public_id,
      };



      await connectMongoDB();
      await Post.create(post);

      return NextResponse.json(
        { success: true, imageUrl: imageUrl },
        { status: 200 },
      );
    }
    return NextResponse.json({ err: "Unauthorized Error" }, { status: 500 });
  } catch (error) {
    console.log("server err", error);
    return NextResponse.json({ err: "Internal Server Error" }, { status: 500 });
  }
};
