import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  NavbarBrand,
  User,
  Image,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Dropdown,

} from "@nextui-org/react";
import { Divider } from "@nextui-org/divider";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ChatType } from "@/types";
import { SearchIcon } from "@/components/icons";
import NextLink from "next/link";
import Link from "next/link";
import { ThreeDots } from "./ThreeDots";
type ChatListProps = {
  userId: string;
  setSelectedChat: (chat: ChatType | null) => void; // New prop to pass selected chat to parent
};


import { useAuth } from "@/store/auth";
import { ThemeSwitch } from "@/components/theme-switch";

const ChatList = ({ userId, setSelectedChat }: ChatListProps) => {
  const [chatList, setChatList] = useState<ChatType[]>([]);
  const [searchResults, setSearchResults] = useState<ChatType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { logout } = useAuth();
  const fetchChatList = async () => {
    try {
      const response = await fetch("/api/fetchChatList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const result = await response.json();
        setChatList(result.users);
      } else {
        const error = await response.json();
        //console.error(error);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast.error("Something went wrong.");
    }
  };

  const searchUsers = async (query: string) => {
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (response.ok) {
        const result = await response.json();
        setSearchResults(result.users);
      } else {
        const error = await response.json();
        //console.error(error);
      }
    } catch (error) {
      // console.error("Error searching users:", error);
      toast.error("Something went wrong.");
    }
  };

  useEffect(() => {
    if (userId) {
      fetchChatList();
    }
  }, [userId]);

  useEffect(() => {
    if (searchQuery) {
      const delayDebounceFn = setTimeout(() => {
        searchUsers(searchQuery);
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleChatClick = (chat: ChatType) => {
    setSelectedChat(chat);
  };

  return (

    <Card className="w-full h-[100svh] p-0 rounded-none">
      <CardHeader className="flex flex-col w-full">
        <div className="flex justify-between w-full">

          <Link
            className="flex justify-start items-center gap-1"
            href="/"

          >
            <Image
              radius={"full"}
              alt={"logo"}
              src={"yplexity-transparent.png"}
              width={30}
            />
            <p className="font-bold text-inherit">YplexitY</p>
          </Link>
          <div className="flex">

            <ThemeSwitch />
            <Dropdown>
              <DropdownTrigger>
                <Button
                  className="border-none"
                  radius="full"
                  isIconOnly
                  variant="bordered"
                >
                  <ThreeDots />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Static Actions">
                <DropdownItem key="account" href="/account">Account</DropdownItem>
                <DropdownItem key="edit"
                  className="text-danger"
                  color="danger"
                  onPress={logout}
                >
                  Logout
                </DropdownItem>

              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        <Input
          aria-label="Search"
          classNames={{
            inputWrapper: "bg-default-100",
            input: "text-sm",
          }}
          labelPlacement="outside"
          placeholder="Search..."
          startContent={
            <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
          }
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </CardHeader>
      <Divider />

      <CardBody className="h-full p-0">
        {searchResults.length > 0 && (
          <div className=" bg-none shadow-lg w-full rounded-md">
            {searchResults.map((user) => (
              <Button
                key={user.userId}
                className="user w-full border-none h-max cursor-pointer p-4 flex justify-between align-top"
                onPress={() => handleChatClick(user)}
                onKeyDown={(e) => e.key === "Enter" && handleChatClick(user)}
                radius="none"
                color="default"
                variant="ghost"

              >
                <User
                  avatarProps={{ src: user.avatar }}
                  name={user.fname}
                  description={user.latestMessage?.text || "No recent messages"}
                />
              </Button>
            ))}
          </div>
        )}
        {chatList.length > 0 ? (
          <>
            {chatList.map((chat, index) => (
              <div key={chat.userId}>
                <Button
                  className="user w-full border-none h-max cursor-pointer p-4 flex justify-between align-top"
                  radius="none"
                  onPress={() => handleChatClick(chat)}
                  color="default"
                  variant="ghost"
                >
                  <User
                    avatarProps={{ src: chat.avatar }}
                    description={
                      chat.latestMessage.text.length > 50
                        ? chat.latestMessage.text.substring(0, 50) + "..."
                        : chat.latestMessage.text
                    }
                    name={chat.fname}
                  />
                  <small className="align-text-bottom text-pretty text-end text-foreground-400 text-xs">
                    {new Date(chat.latestMessage.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true, // AM/PM format
                    })}
                  </small>
                </Button>

              </div>
            ))}
          </>
        ) : (
          <p>No chats</p>
        )}
      </CardBody>
    </Card>
  );
};

export default ChatList;
