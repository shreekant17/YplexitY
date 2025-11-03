import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Form,
  Input,
  Link,
  ScrollShadow,
  Textarea,
  User,
} from "@nextui-org/react";
import { SendIcon } from "@/components/SendIcon";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { ChatType } from "@/types";
import { LeftArrowIcon } from "@/components/LeftArrowIcon";
import { doc, collection, orderBy, onSnapshot, query, getDocs, limit, CollectionReference, DocumentReference, getFirestore, } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { useAuth } from "@/store/auth";



//import { db } from "@/libs/firestore";

//import { db } from "@/app/firebaseConfig"

type ChatWindowProps = {
  selectedChat: ChatType | null; // Accept selectedChat as prop
  setSelectedChat: (chat: ChatType | null) => void; // New prop to pass selected chat to parent
  userId: string | null; // Accept selectedChat as prop
};

type Chat = {
  _id: string;
  sender: string;
  receiver: string;
  text: string;
  status: string;
  attachments: string[];
  deleted: boolean;
  createdAt: string;
  __v: number;
};

async function fetchDataFirestore(
  userPairId: string, uid: string, rid: string, fetchChats: (uid: string, rid: string, isRealtime: boolean) => Promise<void>, setChats: React.Dispatch<React.SetStateAction<Chat[]>>, db: any) {
  // Reference to the "messages" subcollection
  const messagesRef = collection(db, "messages", userPairId, "message");

  // Query with ordering by timestamp in ascending order
  const messagesQuery = query(messagesRef, orderBy("createdAt", "asc"));

  // Flag to skip the initial load
  let isInitialLoad = true;

  // Listen for real-time updates
  const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
    if (isInitialLoad) {
      // Skip processing on the first load
      isInitialLoad = false;
      return;
    }

    //console.log("Snapshot received:", querySnapshot);

    querySnapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const newMessage = { ...change.doc.data() };

        // Process only newly added messages
        //console.log("New message added:", newMessage);
        setChats((prevChats) => [...prevChats, { ...newMessage } as Chat]);

        //fetchChats(uid, rid, true);


        // Optionally call fetchChats if needed
        // await fetchChats(uid, rid);
      }
    });
  });


}
const ChatWindow = ({
  selectedChat,
  userId,
  setSelectedChat,
}: ChatWindowProps) => {
  const [message, setMessage] = useState<string>("");
  const [uid, setUid] = useState<string>("");
  const [rid, setRid] = useState<string>("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [userPairId, setUserPairId] = useState("");
  const [isKeyBoardOpened, setIsKeyBoardOpened] = useState(false);
  const [groundHeight, setGroundHeight] = useState("[100vh]");

  /*
    useEffect(() => {
      if (isKeyBoardOpened) {
        setGroundHeight("[" + (window.outerHeight) + "px]");
        console.log(window.outerHeight);
      } else {
        setGroundHeight("[100vh]")
        console.log(window.outerHeight);
      }
    }, [isKeyBoardOpened])
    */

  //const [db, setDb] = useState<any>();

  const { db } = useAuth();

  const chatEndRef = useRef<HTMLDivElement | null>(null); // Ref for the end of the chat

  const inputRef = useRef<HTMLTextAreaElement>(null);


  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({});
  };

  const fetchChats = async (uid: string, rid: string, isRealtime: boolean) => {
    try {
      const response = await fetch("api/fetchChats", {
        method: "POST",
        body: JSON.stringify({ userId: uid, receiverId: rid }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const result = await response.json();

        //  console.log(result);

        // Add only new messages
        if (result.messages && result.messages.length > 0) {

          setChats(result.messages);


        } else {
          setChats([]);
        }
      } else {
        // Handle errors if the response isn't OK
        const result = await response.json();
        console.error("Error fetching chats:", result);
        setChats([]);
      }
    } catch (err) {
      console.error("Error in fetchChats:", err);
    }
  };


  useEffect(() => {
    const uid = userId || "";
    if (uid && selectedChat) {
      setUid(uid);
      setRid(selectedChat.userId);


    }
  }, [userId, selectedChat]);


  useEffect(() => {
    if (selectedChat && db) {
      const userPairId = uid < rid ? `${uid}-${rid}` : `${rid}-${uid}`;
      fetchChats(uid, rid, false);  // Assuming this fetches the initial messages

      fetchDataFirestore(userPairId, uid, rid, fetchChats, setChats, db);

    }
  }, [uid, rid, db]);


  useEffect(() => {
    // Scroll to bottom whenever chats change
    scrollToBottom();
  }, [chats, selectedChat]);










  if (!selectedChat) {
    return (
      <Card className="w-full h-full mx-auto flex-col justify-center align-center">
        <h1 className="text-center"> Select a chat to start messaging</h1>
      </Card>
    );
  }

  const sendMessage = async () => {
    //e.preventDefault();
    //const formData = new FormData(e.currentTarget);

    /*
    formData.append("sender", uid);
    formData.append("receiver", rid);
    */

    //inputRef?.current?.focus();



    try {
      const response = await fetch("api/sendMessage", {
        method: "POST",
        body: JSON.stringify({ sender: uid, receiver: rid, text: message }),
      });
      if (response.ok) {
        const result = await response.json();
        // console.log(result);
        setMessage("");
      }
    } catch (err) {
      console.log(err);
    }
  };



  return (
    <Card className="w-full lg:h-[100vh] h-[100svh] rounded-none"   >

      <CardHeader className="flex align-center">
        <Button
          isIconOnly
          onPress={() => {
            setSelectedChat(null);
          }}
          className="border-none"
          radius="full"
          variant="ghost"
        >
          <LeftArrowIcon />
        </Button>
        <User
          avatarProps={{ src: selectedChat.avatar }}
          description="online"
          name={`${selectedChat.fname} ${selectedChat.lname}`}
        />
      </CardHeader>
      <Divider />
      <ScrollShadow hideScrollBar className={`h-${"full"}`}>
        <CardBody className="h-full flex-col gap-3 lg:p-8">
          {chats.length > 0 ? (
            chats.map((chat, index) => {
              // Extract current and previous dates
              const currentDate = new Date(chat.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });

              const previousDate =
                index > 0
                  ? new Date(chats[index - 1].createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                  : null;

              // Check if it's a new date
              const isNewDate = currentDate !== previousDate;

              return (
                <React.Fragment key={chat._id}>
                  {/* Date Header */}
                  {isNewDate && (
                    <div className="text-center text-sm text-gray-500 my-4">
                      {currentDate}
                    </div>
                  )}

                  {/* Chat Message */}
                  {chat.sender === uid ? (
                    <div className="send flex justify-end received">
                      <span className="lg:min-w-20 max-w-80 lg:max-w-2xl w-fit p-2 bg-default-100 flex flex-col text-md rounded-2xl rounded-tr-none">
                        {chat.text || ""}
                        <small className="align-text-bottom text-pretty text-end text-foreground-400 text-xs">
                          {new Date(chat.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true, // AM/PM format
                          })}
                        </small>
                      </span>
                    </div>
                  ) : (
                    <div className="received">
                      <span className="lg:min-w-20 max-w-80 lg:max-w-2xl w-fit p-2 bg-default-100 flex flex-col text-md rounded-2xl rounded-tl-none">
                        {chat.text || ""}
                        <small className="align-text-bottom text-pretty text-end text-foreground-400 text-xs">
                          {new Date(chat.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true, // AM/PM format
                          })}
                        </small>
                      </span>
                    </div>
                  )}
                </React.Fragment>
              );
            })
          ) : (
            <p className="text-center text-gray-500">No messages yet.</p>
          )}
          <div ref={chatEndRef} />
        </CardBody>

      </ScrollShadow>
      <CardFooter>
        <Form
          className="p-4 h-min w-full space-y-4"

          onSubmit={(e) => {
            e.preventDefault(); // Prevent default form submission behavior
            sendMessage(); // Your send message logic
          }}
        >

          <div className="flex items-end w-full">
            <Textarea
              isRequired
              rows={1} // Ensures it starts with 1 row
              minRows={1} // Prevents it from shrinking below 1 row
              className="flex-grow"

              placeholder="Write a message..."
              name="text"
              value={message}
              onFocus={() => {

                setIsKeyBoardOpened(true)
              }}
              onBlur={() => {
                inputRef.current?.focus()
                setIsKeyBoardOpened(false)
              }}
              onChange={(e: any) => setMessage(e.target.value)}
              ref={inputRef}  // Ensure the input remains focused

            />
            <Button

              isIconOnly
              radius="full"
              color="danger"
              className="ml-2"
              onPress={() => {
                sendMessage();
                setTimeout(() => {
                  // inputRef.current?.focus(); // Keep focus on the input field
                }, 100); // Adjust delay if needed

              }}
            >
              <SendIcon />
            </Button>
          </div>
        </Form>
      </CardFooter>

    </Card >
  );
};

export default ChatWindow;
