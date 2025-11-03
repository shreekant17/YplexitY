import connectMongoDB from "@/libs/db";
import UserScreenTime from "@/models/userScreenTimeSchema";
import ScreenSession from "@/models/screenSessionSchema";
import { NextResponse } from "next/server";

export const POST = async (req, res) => { 
    try {
        await connectMongoDB();

        const { userId, sessionId, secondsDelta, timestamp, final } = await  req.json();

    

        if (!userId || !sessionId || typeof secondsDelta !== "number") {
            return NextResponse.json({ error: "missing params" }, { status: 400 });
        }

        const sec = Math.max(0, Math.floor(secondsDelta));

        // Upsert session doc (create if not exists, update endAt/seconds)
        const now = new Date(timestamp || Date.now());
        const session = await ScreenSession.findOneAndUpdate(
            { userId, sessionId },
            { $setOnInsert: { startAt: now }, $inc: { seconds: sec }, $set: final ? { endAt: now } : {} },
            { upsert: true, new: true }
        );

        // Update aggregate totals and daily bucket
        const day = now.toISOString().slice(0, 10); // YYYY-MM-DD
        const userAgg = await UserScreenTime.findOneAndUpdate(
            { userId },
            {
                $inc: { totalSeconds: sec}, // updatedAt set below
                $set: { updatedAt: new Date() },
                $push: {} // placeholder, we will use aggregation below
            },
            { upsert: true, new: true }
        );

        // Safely update/increment the daily bucket:
        const dailyUpdated = await UserScreenTime.updateOne(
            { userId, "daily.date": day },
            { $inc: { "daily.$.seconds": sec } }
        );
        if (dailyUpdated.matchedCount === 0) {
            // add new daily entry
            await UserScreenTime.updateOne(
                { userId },
                { $push: { daily: { date: day, seconds: sec } } }
            );
        }

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "server error" }, {status: 500});
    }
}