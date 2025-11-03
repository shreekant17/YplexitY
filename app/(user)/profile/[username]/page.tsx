"use client";
import React, { useEffect, useState } from "react";
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Divider,
    Link,
    Image,
    User,
    Skeleton,
    useDisclosure,
    Dropdown,
    DropdownTrigger,
    DropdownItem,
    DropdownMenu,
    Avatar,
    AvatarGroup,
} from "@nextui-org/react";
import { HeartIcon } from "@/components/HeartIcon";
import { ShareIcon } from "@/components/ShareIcon";
import { CommentsIcon } from "@/components/CommentsIcon";
import { useSession } from "next-auth/react";
import CommentBox from "@/components/CommentBox";
import { SessionUser } from "@/types";
import { getRelativeTime } from "@/components/getRelativeTime";
import { ThreeDots } from "@/components/ThreeDots";
import { useRouter } from 'next/navigation';


// Define the types for User and Post
type User = {
    avatar: string;
    email: string;
    fname: string;
    lname: string;
    _id: string;
    username: string;
};

type Post = {
    user: User;
    userId: string;
    media: string;
    content: string;
    _id: string;
    createdAt: string;
    likes: string[];
    likedByUser: boolean; // New property
    likers: [
        {
            _id: string;
            fname: string;
            lname: string;
            avatar: string;
        },
    ];
};

interface ProfileProps {
    params: Promise<{ username: string }>;
}

const Profile: React.FC<ProfileProps> = ({ params }) => {
    const [posts, setPosts] = useState<Post[]>([]); // State for posts
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { data: session, status } = useSession();
    const [commentPostId, setCommentPostId] = useState<string>("");
    const [userId, setUserId] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [token, setToken] = useState<string>("");
    const [profileUser, setProfileUser] = useState<User>();

    const resolvedParams = React.use(params); // Unwrap the Promise
    const username = resolvedParams.username;

    // Function to fetch posts
    const getAllPosts = async (userId: string, email: string): Promise<void> => {
        try {
            const response = await fetch("/api/fetchPostsByUser", {
                method: "POST",
                body: JSON.stringify({ userId, email }),
            });
            if (response.ok) {
                const data = await response.json();
                setPosts(data.posts || []);
                //console.log(posts)
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    };


    const getProfileUser = async () => {
        const response = await fetch("/api/getUserByUsername", {
            method: "POST",
            body: JSON.stringify({ username }),
        });

        if (response.ok) {
            const result = await response.json();
            setProfileUser(result.account);
            console.log(profileUser);
        }
    }

    // Function to handle liking a post

    const handleLike = async (postId: string): Promise<void> => {
        try {
            const response = await fetch("/api/like", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ postId, token }),
            });
            if (response.ok) {
                // Toggle like state locally
                const { likers } = await response.json();
                setPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post._id === postId
                            ? {
                                ...post,
                                likedByUser: !post.likedByUser, // Toggle the like state
                                likes: post.likedByUser
                                    ? post.likes.filter((id) => id !== userId) // Remove user ID
                                    : [...post.likes, userId], // Add user ID
                                likers: likers, // Update likers array with API response
                            }
                            : post,
                    ),
                );
                console.log("LikeButtonPressed");
            }
        } catch (error) {
            console.error("Error liking the post:", error);
        }
    };

    const handleDelete = async (postId: string) => {
        try {
            const response = await fetch("/api/delete", {
                method: "POST",
                body: JSON.stringify({ postId, token })
            });
            if (response.ok) {
                console.log("Post deleted");
                getAllPosts(userId, email);
            } else {
                console.log("Something went wrong");
            }
        } catch (err) {
            console.log(err);
        }
    }

    // Fetch posts when the component mounts
    useEffect(() => {

        if (username) {

            const storedUserId = (session?.user as SessionUser)?.id || "";
            const storedEmail = (session?.user as SessionUser)?.email || "";
            setToken((session?.user as SessionUser)?.jwtToken || "");
            setUserId(storedUserId);

            getProfileUser();
        }

    }, [session, username]);


    useEffect(() => {

        if (profileUser) {

            const storedUserId = (session?.user as SessionUser)?.id || "";
            const storedEmail = (session?.user as SessionUser)?.email || "";
            setToken((session?.user as SessionUser)?.jwtToken || "");
            setUserId(storedUserId);
            setEmail(storedEmail);
            getAllPosts(storedUserId, profileUser.email);


        }

    }, [profileUser]);

    return (

        <div className="flex flex-col justify-center items-center gap-5 p-0 ">
            <CommentBox isOpen={isOpen} onClose={onClose} postId={commentPostId} />

            <div className="profile flex items-center gap-x-4 m-4">
                <div className="avatar flex-col justify-center align-middle">

                    <Image
                        radius="full"
                        className="object-cover lg:w-32 lg:h-32 w-16 h-16 opacity-100"
                        src={profileUser?.avatar || undefined} // Use imagePreview or profileUser?.avatar
                    />
                    <p className="text-small text-center">
                        {profileUser?.fname + " " + profileUser?.lname}
                    </p>
                    <p className="text-xs text-default-500">{profileUser?.email}</p>

                </div>
                <div className="posts">
                    0 posts
                </div>
                <div className="followers">
                    0 followers
                </div>
                <div className="following">
                    0 following
                </div>

            </div>
            {posts.length > 0 ? (
                posts.map((post) => (
                    <Card radius="none" key={post._id} className="w-auto">
                        <CardHeader className="flex gap-3 justify-between">
                            <User
                                avatarProps={{ src: post.user.avatar }}
                                description={getRelativeTime(post.createdAt)}
                                name={post.user.fname}
                            />
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
                                    <DropdownItem key="shre">Share Post</DropdownItem>
                                    {userId === post.user._id ? (
                                        <>
                                            <DropdownItem key="edit">Edit Post</DropdownItem>
                                            <DropdownItem
                                                key="delete"
                                                className="text-danger"
                                                color="danger"
                                                onPress={() => {
                                                    handleDelete(post._id);
                                                }}
                                            >
                                                Delete Post
                                            </DropdownItem>
                                        </>
                                    ) : null}
                                </DropdownMenu>

                            </Dropdown>
                        </CardHeader>
                        <Divider />
                        <CardBody className="overflow-visible p-0">
                            <Image
                                radius="none"
                                alt="Post image"
                                className="object-cover lg:w-[500px] w-screen max-h-[500px]"
                                src={post.media}
                            />
                        </CardBody>
                        <Divider />
                        <CardFooter className="flex gap-3">
                            <Button
                                className="border-none"
                                radius="full"
                                variant="ghost"
                                isIconOnly
                                aria-label="Like"
                                onPress={() => {
                                    handleLike(post._id);
                                }}
                            >
                                <HeartIcon
                                    filled={post.likedByUser}
                                    fill={post.likedByUser ? "red" : "currentColor"}
                                />
                            </Button>
                            <Button
                                className="border-none"
                                radius="full"
                                variant="ghost"
                                onPress={() => {
                                    setCommentPostId(post._id); // First action
                                    onOpen(); // Second action
                                }}
                                isIconOnly
                                aria-label="Comments"
                            >
                                <CommentsIcon filled={false} />
                            </Button>
                            <Button
                                className="border-none"
                                radius="full"
                                variant="ghost"
                                isIconOnly
                                aria-label="Share"
                            >
                                <ShareIcon />
                            </Button>
                        </CardFooter>

                        {post.likes.length > 0 ? (
                            <AvatarGroup
                                className="mx-4"
                                isBordered
                                max={3}
                                renderCount={(count) => (
                                    <p className="text-small text-foreground font-medium ms-2">
                                        {post.likes.length === 1
                                            ? `liked by ${post.likers[0].fname}`
                                            : post.likes.length === 2
                                                ? `liked by ${post.likers[post.likes.length - 1].fname} and ${count - 1} other`
                                                : `liked by ${post.likers[post.likes.length - 1].fname} and ${count - 1} others`}
                                    </p>
                                )}
                                total={post.likes.length}
                            >
                                {post.likers.map((liker, index) => (
                                    <Avatar
                                        key={index}
                                        size="sm"
                                        style={{ width: "20px", height: "20px" }}
                                        src={liker.avatar || ""}
                                        alt={liker.fname}
                                    />
                                ))}
                            </AvatarGroup>
                        ) : (
                            <></>
                        )}

                        <p className="text-xs p-4">{post.content}</p>
                    </Card>
                ))
            ) : (
                <>
                    <Card radius="none" className="w-screen lg:w-[500px] space-y-5 p-4">
                        <div className="w-80  flex items-center gap-3">
                            <div>
                                <Skeleton className="flex rounded-full w-12 h-12" />
                            </div>
                            <div className="w-full flex flex-col gap-2">
                                <Skeleton className="h-3 w-3/5 rounded-lg" />
                                <Skeleton className="h-3 w-4/5 rounded-lg" />
                            </div>
                        </div>
                        <Skeleton className="rounded-lg">
                            <div className="h-48 rounded-lg bg-default-300" />
                        </Skeleton>
                        <div className="space-y-3 ">
                            <Skeleton className="w-3/5 rounded-lg">
                                <div className="h-3 w-3/5 rounded-lg bg-default-200" />
                            </Skeleton>
                            <Skeleton className="w-4/5 rounded-lg">
                                <div className="h-3 w-4/5 rounded-lg bg-default-200" />
                            </Skeleton>
                            <Skeleton className="w-2/5 rounded-lg">
                                <div className="h-3 w-2/5 rounded-lg bg-default-300" />
                            </Skeleton>
                        </div>
                    </Card>
                    <Card radius="none" className="w-screen lg:w-[500px] space-y-5 p-4">
                        <div className="w-80  flex items-center gap-3">
                            <div>
                                <Skeleton className="flex rounded-full w-12 h-12" />
                            </div>
                            <div className="w-full flex flex-col gap-2">
                                <Skeleton className="h-3 w-3/5 rounded-lg" />
                                <Skeleton className="h-3 w-4/5 rounded-lg" />
                            </div>
                        </div>
                        <Skeleton className="rounded-lg">
                            <div className="h-48 rounded-lg bg-default-300" />
                        </Skeleton>
                        <div className="space-y-3 ">
                            <Skeleton className="w-3/5 rounded-lg">
                                <div className="h-3 w-3/5 rounded-lg bg-default-200" />
                            </Skeleton>
                            <Skeleton className="w-4/5 rounded-lg">
                                <div className="h-3 w-4/5 rounded-lg bg-default-200" />
                            </Skeleton>
                            <Skeleton className="w-2/5 rounded-lg">
                                <div className="h-3 w-2/5 rounded-lg bg-default-300" />
                            </Skeleton>
                        </div>
                    </Card>
                    <Card radius="none" className="w-screen lg:w-[500px] space-y-5 p-4">
                        <div className="w-80  flex items-center gap-3">
                            <div>
                                <Skeleton className="flex rounded-full w-12 h-12" />
                            </div>
                            <div className="w-full flex flex-col gap-2">
                                <Skeleton className="h-3 w-3/5 rounded-lg" />
                                <Skeleton className="h-3 w-4/5 rounded-lg" />
                            </div>
                        </div>
                        <Skeleton className="rounded-lg">
                            <div className="h-48 rounded-lg bg-default-300" />
                        </Skeleton>
                        <div className="space-y-3 ">
                            <Skeleton className="w-3/5 rounded-lg">
                                <div className="h-3 w-3/5 rounded-lg bg-default-200" />
                            </Skeleton>
                            <Skeleton className="w-4/5 rounded-lg">
                                <div className="h-3 w-4/5 rounded-lg bg-default-200" />
                            </Skeleton>
                            <Skeleton className="w-2/5 rounded-lg">
                                <div className="h-3 w-2/5 rounded-lg bg-default-300" />
                            </Skeleton>
                        </div>
                    </Card>
                </>
            )}
        </div>

    );
};

export default Profile;
