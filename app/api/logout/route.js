import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("token");
    return NextResponse.json(
      { message: "Logout SuccessFull" },
      { status: 200 },
    );
  } catch (err) {
    // console.log(err);
    return NextResponse.json(
      { message: "Something went wrong", err },
      { status: 500 },
    );
  }
};
