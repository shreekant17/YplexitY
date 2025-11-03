import Post from "@/models/postSchema";
import { NextResponse } from "next/server";
import { verifyToken } from "@/libs/jwt";
import mongoose from "mongoose";
import { db } from "@/libs/firestore"
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

export const POST = async (req) => {
    try {

        const firebaseConfig = {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        };

        // Initialize Firebase

        return NextResponse.json({ message: "Success", firebaseConfig }, { status: 200 });
    } catch (err) {
        console.error("Error in liking post:", err);
        return NextResponse.json({ message: "Failed" }, { status: 500 });
    }
};
