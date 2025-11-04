import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
    try {
        const body = await req.json();
        const { level, screen_time, frequency, scroll_speed } = body;

        if (level === undefined) {
            return NextResponse.json(
                { error: "Missing required fields: level, screen_time, frequency, scroll_speed" },
                { status: 400 }
            );
        }

        // ✅ Inline RAG Prompt
        const basePrompt = `
You are a digital wellness assistant that analyzes a user's social media habits 
and provides personalized behavioral feedback.

User Data:
- Risk Level: ${level}
- Daily Screen Time: ${screen_time} mins
- Session Frequency: ${frequency} sessions/day
- Average Scroll Speed: ${scroll_speed} px/s

Task:
Generate a short, friendly, and evidence-informed message (1 sentence) that helps 
the user maintain healthy digital habits.

Adjust tone based on risk level:
- Level 0 → encouraging balance
- Level 1 → suggest mild moderation
- Level 2 → recommend conscious reduction and reflection

Avoid negative or harsh wording. Focus on actionable, human advice.

Output Format:
<your message>
    `;

        // ✅ Send to Groq
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a kind, empathetic assistant that helps users manage social media use healthily.",
                },
                {
                    role: "user",
                    content: basePrompt,
                },
            ],
        });

        const reply = completion.choices[0]?.message?.content || "";

        return NextResponse.json({ reply });
    } catch (error) {
        console.error("Chat API Error:", error);

        if (error.status === 429 || error.message?.includes("429")) {
            return NextResponse.json(
                { error: "Rate limit reached. Please try again later." },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { error: "Something went wrong while generating guidance." },
            { status: 500 }
        );
    }
}
