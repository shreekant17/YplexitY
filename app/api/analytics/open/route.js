// app/api/analytics/open/route.js
import { NextResponse } from "next/server";
import connectMongoDB from "@/libs/db"; // your DB connector
import AppOpenEvent from "@/models/appOpenEventSchema";
import DailyOpenCount from "@/models/dailyOpenCountSchema";

export async function POST(req) {
    try {
        await connectMongoDB();

        const body = await req.json();
        // server should authenticate the user instead of trusting client-sent userId
        const userId = body.userId; // implement to get logged-in user
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const sessionId = body.sessionId || (Math.random() + Date.now()).toString();
        const platform = body.platform || "web";
        const userAgent = req.headers.get("user-agent") || "";
        const ip = req.headers.get("x-forwarded-for") || req.headers.get("host");

        // 1) Store raw event
        await AppOpenEvent.create({
            userId: userId,
            sessionId,
            platform,
            userAgent,
            ip,
        });

        // 2) Increment daily aggregated counter (atomic upsert)
        const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        await DailyOpenCount.findOneAndUpdate(
            { userId: userId, date },
            { $inc: { opens: 1 } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("open event error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
