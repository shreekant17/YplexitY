"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Card, Skeleton, useDisclosure } from "@nextui-org/react";
import { useSession } from "next-auth/react";
import CommentBox from "@/components/CommentBox";
import { SessionUser } from "@/types";
import Post from "@/components/Post";

import useScrollSpeed from "@/hooks/useScrollSpeed";


type User = {
  avatar: string;
  email: string;
  fname: string;
  _id: string;
};

type PostType = {
  user: User;
  media: string;
  content: string;
  _id: string;
  createdAt: string;
  likes: string[];
  likedByUser: boolean;
  likers: {
    _id: string;
    fname: string;
    lname: string;
    avatar: string;
  }[];
};

const LIMIT = 6;

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const { data: session } = useSession();
  const [userId, setUserId] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [commentPostId, setCommentPostId] = useState<string>("");
  const observer = useRef<IntersectionObserver | null>(null);

  // Fetch posts with cursor
  const getAllPosts = async (userId: string, cursorValue: string | null = null) => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const response = await fetch("/api/fetchPosts", {
        method: "POST",
        body: JSON.stringify({ userId, limit: LIMIT, lastCreatedAt: cursorValue }),
      });
      if (response.ok) {
        const data = await response.json();
        const newPosts = data.posts || [];

        // Merge & avoid duplicates
        setPosts((prev) => {
          const merged = [...prev, ...newPosts];
          const unique = Array.from(new Map(merged.map((p) => [p._id, p])).values());
          return unique;
        });

        setCursor(data.nextCursor);
        setHasMore(!!data.nextCursor);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Intersection observer to detect last post
  const lastPostElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          getAllPosts(userId, cursor);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, cursor, userId]
  );

  // Initial load
  useEffect(() => {
    if (session?.user) {
      const u = session.user as SessionUser;
      setUserId(u.id);
      setToken(u.jwtToken || "");
      getAllPosts(u.id, null);
    }
  }, [session]);

  // Initialize scroll speed tracking
  useScrollSpeed({
    userId,
    apiPath: "/api/analytics/scroll",
    intervalMs: 3000,   // log every 3s
    cooldownMs: 5000,   // skip if already logged recently
  });


  return (
    <div className="flex flex-col justify-center items-center gap-5 p-0">

      {posts.map((post, index) => {
        if (index === posts.length - 1) {
          return (
            <div ref={lastPostElementRef} key={post._id}>
              <Post post={post} userId={userId} />
            </div>
          );
        } else {
          return <Post key={post._id} post={post} userId={userId} />;
        }
      })}

      {loading && (
        <>
          {[...Array(2)].map((_, i) => (
            <Card
              key={i}
              radius="none"
              className="w-screen lg:w-[500px] space-y-5 p-4"
            >
              <Skeleton className="h-48 rounded-lg bg-default-300" />
            </Card>
          ))}
        </>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="text-gray-500 py-4 text-sm">You’re all caught up 🎉</p>
      )}
    </div>
  );
};

export default Feed;
