import connectMongoDB from "@/libs/db";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Message from "@/models/messageSchema";
import { db } from "@/libs/firestore"; // Adjust path as necessary
import { doc, updateDoc, arrayUnion, collection, addDoc, setDoc } from "firebase/firestore";

export async function POST(req) {
  try {

    /*
    const data = await req.formData();
    const sender = data.get("sender");
    const receiver = data.get("receiver");
    const text = data.get("text");
    */

    const { sender, receiver, text } = await req.json();

    if (!sender || !receiver) {
      return NextResponse.json(
        { error: "User IDs are required" },
        { status: 400 },
      );
    }

    // Save message in MongoDB
    await connectMongoDB();
    const message = { sender, receiver, text };
    const sentMessage = await Message.create(message);
    const messageJson = sentMessage.toJSON(); // Convert Mongoose document to plain JSON

    // Save message in Firestore
    const userPairId = sender < receiver ? `${sender}-${receiver}` : `${receiver}-${sender}`; // Create userPairId
    const messagesCollectionRef = collection(db, "messages");

    // Reference to the document for the specific userPairId
    const userPairDocRef = doc(messagesCollectionRef, userPairId);

    // Reference to the "message" subcollection inside userPairId document
    const messageCollectionRef = collection(userPairDocRef, "message");

    // Add a new message as a separate document in the "message" subcollection
    await addDoc(messageCollectionRef, {
      _id: messageJson._id.toString(),
      sender: messageJson.sender.toString(),
      receiver: messageJson.receiver.toString(),
      text: messageJson.text,
      createdAt: new Date(messageJson.createdAt).toISOString(), // Set timestamp for Firestore
    });

    return NextResponse.json({ message: "Message Sent" }, { status: 200 });

  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
