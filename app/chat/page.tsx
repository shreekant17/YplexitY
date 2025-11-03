"use client";
import ChatList from "@/components/ChatList";
import ChatWindow from "@/components/ChatWindow";
import { SessionUser } from "@/types";
import { Divider } from "@nextui-org/react";
import { useSession } from "next-auth/react";
import { ChatType } from "@/types";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Chat: React.FC = () => {
  const router = useRouter();
  const [userId, setUserId] = useState<string>("");
  const { data: session, status } = useSession();
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);

  useEffect(() => {
    if (status === "loading") {
      // Wait for session to load before checking the login status
      return;
    }
    if (!session) {
      router.push("/login");
    }

    const storedUserId = (session?.user as SessionUser)?.id || "";

    setUserId(storedUserId);
  }, [session]);

  return (
    <div className="flex w-full h-full">
      <div
        className={`list w-full lg:block lg:w-1/4 h-full ${selectedChat ? "hidden" : ""}`}
      >
        <ChatList userId={userId} setSelectedChat={setSelectedChat} />
      </div>
      <Divider orientation="vertical" className="mx-1 hidden lg:block" />
      <div
        className={`window w-full lg:w-9/12 h-full ${selectedChat ? "" : "hidden"} lg:block`}
      >
        <ChatWindow
          userId={userId}
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
        />
      </div>
    </div>
  );
};

export default Chat;
