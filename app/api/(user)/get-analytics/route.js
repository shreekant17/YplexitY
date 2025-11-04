import connectMongoDB from "@/libs/db";
import ScrollMetric from "@/models/scrollMetricSchema";
import DailyOpenCount from "@/models/dailyOpenCountSchema";
import UserScreenTime from "@/models/userScreenTimeSchema";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(req) {
    try {
        await connectMongoDB();
        const { userId } = await req.json();

        if (!userId)
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });

        const today = new Date();
        const last7Days = new Date();
        last7Days.setDate(today.getDate() - 7);

        /** -----------------------------------------
         *  1️⃣ Scroll Speed (Adaptive normalization)
         * ----------------------------------------- */
        const scrollData = await ScrollMetric.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    timestamp: { $gte: last7Days },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                    avgSpeed: { $avg: "$speed" },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Find max scroll speed in last 7 days for adaptive normalization
        const maxScroll = await ScrollMetric.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    timestamp: { $gte: last7Days },
                },
            },
            { $group: { _id: null, maxSpeed: { $max: "$speed" } } },
        ]);

        const maxSpeed = maxScroll[0]?.maxSpeed || 1000; // fallback to 1000 px/sec baseline

        const avgScrollSpeed =
            scrollData.length > 0
                ? (scrollData.reduce((sum, d) => sum + d.avgSpeed, 0) / scrollData.length / maxSpeed) * 10
                : 0;

        /** -----------------------------------------
         *  2️⃣ App Open Frequency (7 days)
         * ----------------------------------------- */
        const openCounts = await DailyOpenCount.find({
            userId,
            date: { $gte: last7Days.toISOString().split("T")[0] },
        }).lean();

        const avgAppOpens =
            openCounts.length > 0
                ? openCounts.reduce((sum, d) => sum + d.opens, 0) / openCounts.length
                : 0;

        /** -----------------------------------------
         *  3️⃣ Screen Time (convert to minutes)
         * ----------------------------------------- */
        const screenTime = await UserScreenTime.findOne({ userId }).lean();

        let recentScreenTime = [];
        if (screenTime?.daily?.length) {
            recentScreenTime = screenTime.daily.filter((d) => {
                const dDate = new Date(d.date);
                return dDate >= last7Days;
            });
        }

        const avgScreenTime =
            recentScreenTime.length > 0
                ? recentScreenTime.reduce((sum, d) => sum + d.seconds, 0) / recentScreenTime.length / 60
                : 0;

        /** -----------------------------------------
         *  ✅ Return metrics in dataset units
         * ----------------------------------------- */
        return NextResponse.json({
            userId,
            period: "last_7_days",
            metrics: {
                scrollSpeed: Number(avgScrollSpeed.toFixed(2)), // normalized 0–10
                appOpens: Number(avgAppOpens.toFixed(2)),       // opens/day
                screenTime: Number(avgScreenTime.toFixed(2)),   // minutes/day
            },
            rawData: {
                scrollData,
                openCounts,
                recentScreenTime,
                maxSpeed,
            },
        }, { status: 200 });
    } catch (error) {
        console.error("Error fetching user metrics:", error);
        return NextResponse.json(
            { error: "Server error", details: error.message },
            { status: 500 }
        );
    }
}
