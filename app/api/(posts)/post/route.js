import { NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";
import { verifyToken } from "@/libs/jwt";
import Post from "@/models/postSchema";
import connectMongoDB from "@/libs/db";
export const POST = async (req) => {
  const formData = await req.formData();

  const file = formData.get("file");
  if (!file) {
    return NextResponse.json({ error: "No files received." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = file.name.replaceAll(" ", "_");

  try {
    await writeFile(
      path.join(process.cwd(), "public/posts/" + filename),
      buffer,
    );

    const token = formData.get("token");
    if (token) {
      const user = verifyToken(token);

      const email = user.email;
      const content = formData.get("content");
      const type = formData.get("type");
      const media = filename;

      const post = {
        email: email,
        content: content,
        type: type,
        media: media,
      };
      await connectMongoDB();
      await Post.create(post);
    }
    return NextResponse.json({ Message: "Success", status: 201 });
  } catch (error) {
    return NextResponse.json({ Message: "Failed", status: 500 });
  }
};
