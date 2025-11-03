// pages/api/usage/finalize.js
import connectMongoDB from "@/libs/db"; import ScreenSession from "@/models/screenSessionSchema";
import { NextResponse } from "next/server";


export const POST = async (req, res) => {
    try {
        await connectMongoDB();
        const { userId, sessionId, endAt } = await req.json();
        if (!userId || !sessionId) return NextResponse.json({ error: "server error" }, { status: 400 });
        await ScreenSession.findOneAndUpdate({ userId, sessionId }, { $set: { endAt: endAt ? new Date(endAt) : new Date() } });
        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "server error" }, { status: 500 });
    }
}
