import { NextResponse } from "next/server";
import User from "@/models/userSchema";
import { verifyToken } from "@/libs/jwt";
import connectMongoDB from "@/libs/db";
import { cookies } from "next/headers";

export async function GET(req, res) {
  try {
    const cookieStore = await cookies();
    var token = cookieStore.get("token");

    if (token) {
      const jwtToken = token.value;
      try {
        const user = verifyToken(jwtToken);
        await connectMongoDB();
        const account = await User.findOne(
          { email: user.email },
          { password: 0 },
        );

        if (account) {
          return NextResponse.json(
            { message: "Token verified", user },
            { status: 200 },
          );
        }
      } catch (err) {
        return NextResponse.json(
          { message: "Invalid Token", err },
          { status: 500 },
        );
      }

      return NextResponse.json({ message: "ERROR" }, { status: 500 });
    } else {
      return NextResponse.json({ message: "ERROR" }, { status: 401 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "ERROR", err }, { status: 500 });
  }
}
