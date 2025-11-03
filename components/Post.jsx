"use client"

import React from 'react'

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

import { getRelativeTime } from "@/components/getRelativeTime";
import { ThreeDots } from "@/components/ThreeDots";
import CommentBox from './CommentBox';


const Post = ({ post, userId, token, setPosts }) => {

  // Function to handle liking a post



  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleLike = async (postId) => {
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

  const handleDelete = async (postId) => {
    try {
      const response = await fetch("api/delete", {
        method: "POST",
        body: JSON.stringify({ postId, token })
      });
      if (response.ok) {
        console.log("Post deleted");
        getAllPosts(userId);
      } else {
        console.log("Something went wrong");
      }
    } catch (err) {
      console.log(err);
    }
  }


  return (
    <>
      <CommentBox isOpen={isOpen} onClose={onClose} postId={post._id} />
      <Card radius="none" key={post._id} className="w-screen lg:w-[500px] space-y-5 ">
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
        <CardBody className="overflow-visible flex items-center justify-center overflow-hidden dark:bg-black bg-white h-[400px] p-0">
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
              //setCommentPostId(post._id); // First action
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
                name={liker.fname}
              />
            ))}
          </AvatarGroup>
        ) : (
          <></>
        )}

        <p className="text-xs  max-w-md p-4 truncate line-clamp-1 mb-6">{post.content}</p>
      </Card>
    </>
  )
}

export default Post