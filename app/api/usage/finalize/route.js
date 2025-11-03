// pages/api/usage/finalize.js
import dbConnect from "@/lib/db";
import ScreenSession from "@/models/ScreenSession";
import { NextResponse } from "next/server";


export const POST = async (req, res) => { 
    try {
        await dbConnect();
        const { userId, sessionId, endAt } = req.body;
        if (!userId || !sessionId) return res.status(400).end();
        await ScreenSession.findOneAndUpdate({ userId, sessionId }, { $set: { endAt: endAt ? new Date(endAt) : new Date() } });
        return NextResponse.json({ ok: true }, {status: 200});
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "server error" }, {status:500});
    }
}
