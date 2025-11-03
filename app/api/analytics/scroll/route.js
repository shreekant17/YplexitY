import connectMongoDB from "@/libs/db";
import ScrollMetric from "@/models/scrollMetricSchema";
import { NextResponse } from "next/server";

export const POST = async (req) => {
    try {
        await connectMongoDB();
        const { userId, speed, timestamp } = await req.json();

        if (!userId || speed == null) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const metric = new ScrollMetric({
            userId,
            speed,
            timestamp: new Date(timestamp),
        });
        await metric.save();

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Scroll log failed:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
};
