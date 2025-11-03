import { NextResponse } from "next/server";
import User from "@/models/userSchema";
import connectMongoDB from "@/libs/db";

export async function POST(req, res) {
    try {
        const { username } = await req.json();

        try {
            await connectMongoDB();
            const account = await User.findOne({ username: username }, { password: 0 });
            if (account) {
                return NextResponse.json(
                    { message: "User Found", account },
                    { status: 200 },
                );
            } else {
                return NextResponse.json(
                    { message: "User not Found", account },
                    { status: 401 },
                );
            }
        } catch (err) {
            return NextResponse.json(
                { message: "Something went", err },
                { status: 500 },
            );
        }
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "ERROR", err }, { status: 500 });
    }
}
