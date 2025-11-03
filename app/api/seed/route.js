import { NextResponse } from "next/server";

import { faker } from "@faker-js/faker";
import User from "@/models/userSchema"; // adjust path if needed
import Post from "@/models/postSchema"; // adjust path if needed
import connectMongoDB from "@/libs/db";
export async function POST() {
    try {
        await connectMongoDB();

        // 🧹 Optional: clear existing seed data (comment this out if you don’t want it)
        //await User.deleteMany({});
        //await Post.deleteMany({});

        const users = [];

        // 👤 Generate 50 fake users
        for (let i = 0; i < 50; i++) {
            const gender = faker.person.sex();
            const fname = faker.person.firstName(gender);
            const lname = faker.person.lastName(gender);
            const email = faker.internet.email({ firstName: fname, lastName: lname });
            const username = faker.internet.username({ firstName: fname, lastName: lname });
            const password = faker.internet.password();
            const avatar = faker.image.avatar();
            const country = faker.location.country();

            users.push({
                fname,
                lname,
                gender,
                email,
                username,
                password,
                avatar,
                country,
                terms: true,
            });
        }

        // 🚀 Insert all users
        const createdUsers = await User.insertMany(users);

        // 📝 Generate 100 random posts
        const posts = [];
        for (let i = 0; i < 100; i++) {
            const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
            posts.push({
                email: randomUser.email,
                userId: randomUser._id,
                content: faker.lorem.paragraph(),
                media: faker.image.urlPicsumPhotos(),
                public_id: faker.string.uuid(),
                visibility: faker.helpers.arrayElement(["public", "friends", "private"]),
            });
        }

        await Post.insertMany(posts);

        return NextResponse.json({
            message: "✅ Database seeded successfully!",
            users: createdUsers.length,
            posts: posts.length,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "❌ Failed to seed data", details: error.message }, { status: 500 });
    }
}
