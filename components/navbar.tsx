"use client";

import { useAuth } from "@/store/auth";
import { disableNav } from "@/libs/disableNav"
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd";
import Link from "next/link";
import { Input } from "@heroui/input";
import { button, link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";
import { useDisclosure } from "@heroui/react";
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switcher";
import {
  TwitterIcon,
  GithubIcon,
  DiscordIcon,
  HeartFilledIcon,
  SearchIcon,
  Logo,
} from "@/components/icons";
import UploadPost from "./UploadPost";
import { PlusIcon } from "./PlusIcon";
import { Image } from "@heroui/react";
import { UserIcon } from "./UserIcon";
import { ExitIcon } from "./ExitIcon";
import { LoginIcon } from "./LoginIcon";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { Router } from "next/router";
import { SessionUser } from "@/types";
import { UserSession } from "@/types";
import React from "react";
import { usePathname } from "next/navigation"
import useScreenTime from "@/hooks/useScreenTime";
import useAppOpenTracker from "@/hooks/useAppOpenTracker";
import { TiInfo } from "react-icons/ti";
import axios from "axios";
import { addToast } from "@heroui/react";


export const Navbar = () => {
  const { logout, guidanceMessage, setGuidanceMessage, addictionLevel, setAddictionLevel } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [fname, setFname] = useState<string>("");
  const [avatar, setAvatar] = useState<string>();
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const path = usePathname()

  const track = async (id: any) => {
    useScreenTime(id);
  }

  // Extract userId once the session is ready


  // ✅ Call useScreenTime directly as a hook (not inside a function)
  const uid = (session?.user as SessionUser)?.id;
  useScreenTime(uid);
  useAppOpenTracker({ userId: uid, platform: "web" });
  let messagePrinted = false;
  useEffect(() => {
    if (session) {
      const { fname, avatar, id } = session?.user as SessionUser;
      setFname(fname || "");
      setAvatar(avatar || undefined);

      //  track(id);
      // console.log(avatar)
    }
  }, [session]);

  useEffect(() => {
    if (uid && !messagePrinted) {
      getUserAddictionScore();
      messagePrinted = true;
    }
  }, [uid]);

  const router = useRouter();


  const getUserAddictionScore = async () => {
    try {

      console.log("Fetching addiction score...");

      const id = (session?.user as SessionUser)?.id;
      if (!id) {
        console.log("User ID not available.");
        return;
      }
      // Step 1: Fetch usage metrics
      const res = await axios.post(`/api/get-analytics`, { userId: id });
      const { metrics } = res.data;
      if (res.status !== 200) return;

      // Step 2: Get ML prediction
      const res2 = await axios.post(`${process.env.NEXT_PUBLIC_ANALYTICS_API}/predict`, {
        screen_time: metrics.screenTime,
        frequency: metrics.appOpens,
        scrolling_speed: metrics.scrollSpeed,
      });

      const resAddictionLevel = res2.data.prediction;
      setAddictionLevel(resAddictionLevel);

      // Step 3: Get personalized message from Groq RAG API
      const res3 = await axios.post(`/api/llm/llama`, {
        level: resAddictionLevel,
        screen_time: metrics.screenTime,
        frequency: metrics.appOpens,
        scroll_speed: metrics.scrollSpeed,
      });
      console.log(res.data.metrics)
      // console.log(res.data)
      // console.log("Addiction level:", addictionLevel);
      console.log("AI guidance:", res3.data.reply);
      setGuidanceMessage(res3.data.reply);
    } catch (e) {
      console.log(e);
    }
  };



  return (

    <>
      {!disableNav.includes(path) && (
        <NextUINavbar
          maxWidth="xl"
          position="sticky"
          isMenuOpen={isMenuOpen}
          onMenuOpenChange={setIsMenuOpen}
        >

          <UploadPost isOpen={isOpen} onClose={onClose} />



          <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
            <NavbarBrand as="li" className="gap-3 max-w-fit">
              <NextLink
                className="flex justify-start items-center gap-1"
                href="/"
                onClick={() => setIsMenuOpen(false)}
              >
                <Image
                  radius={"full"}
                  alt={"logo"}
                  src={"yplexity-transparent.png"}
                  width={30}
                />
                <p className="font-bold text-inherit">YplexitY</p>
              </NextLink>
            </NavbarBrand>

          </NavbarContent>

          <NavbarContent
            className="hidden sm:flex basis-1/5 sm:basis-full"
            justify="end"
          >
            <NavbarItem className="hidden sm:flex gap-2">
              <Button isIconOnly variant="flat" radius="full" onPress={onOpen}>
                <PlusIcon />
              </Button>
              <ThemeSwitch />
              <Button onPress={() => {
                addToast({
                  title: "Welcome to the Feed!",
                  description: guidanceMessage,
                  color: addictionLevel == 0 ? "success" : addictionLevel == 1 ? "warning" : "danger",
                  timeout: 2000,
                })
              }
              } isIconOnly variant="flat" radius="full">
                <TiInfo size={24} />
              </Button>
            </NavbarItem>

            <NavbarItem className="hidden md:flex">
              {status === "authenticated" ? (
                <NavbarContent as="div" justify="end" className="hidden lg:flex">
                  <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                      <Button
                        variant="flat"
                        radius="full"
                        className="text-sm font-normal text-default-600 bg-default-100"
                        startContent={
                          <Image
                            radius="full"
                            className="object-cover w-8 h-8 opacity-100"
                            src={avatar}
                          />
                        }

                      >
                        {fname}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Profile Actions" variant="flat">
                      <DropdownItem key="profile" className="h-14 gap-2">
                        <p className="font-semibold">Signed in as</p>
                        <p className="font-semibold">{session?.user?.email}</p>
                      </DropdownItem>
                      <DropdownItem key="settings" as={Link} href={"/account"}>
                        My Account
                      </DropdownItem>
                      <DropdownItem key="chat" as={Link} href={"/chat"}>
                        Chat
                      </DropdownItem>

                      <DropdownItem key="feed" as={Link} href={"/feed"}>
                        Feed
                      </DropdownItem>

                      <DropdownItem key="help_and_feedback">
                        Help & Feedback
                      </DropdownItem>
                      <DropdownItem key="logout" color="danger" onPress={logout}>
                        Log Out
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </NavbarContent>
              ) : (
                <Button
                  variant="flat"
                  radius="full"
                  as={Link}
                  className="text-sm font-normal text-default-600 bg-default-100"
                  href={"/login"}
                  startContent={<UserIcon />}

                >
                  Sign In
                </Button>
              )}
            </NavbarItem>
          </NavbarContent>

          <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
            <ThemeSwitch />
            {status === "authenticated" && (
              <Button
                variant="faded"
                radius="full"
                isIconOnly onPress={onOpen}>
                <PlusIcon />
              </Button>
            )}

            {status === "authenticated" ? (
              <Button
                isIconOnly
                radius="full"
                color="danger"
                className="text-sm font-normal text-default-600 bg-default-100"
                onPress={() => setIsMenuOpen(!isMenuOpen)}
                startContent={
                  <Image
                    radius="full"
                    className="object-cover opacity-100"
                    src={avatar}
                  />
                }
                variant="flat"
              ></Button>
            ) : (
              <Button
                variant="flat"
                radius="full"
                isIconOnly
                onPress={() => {
                  router.push("/login");
                }}
              >
                <UserIcon />
              </Button>
            )}
          </NavbarContent>

          <NavbarMenu>

            <div className="mx-4 mt-2 flex flex-col gap-2">
              <NavbarMenuItem>
                <Link

                  href="/account"
                  color={"foreground"}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Account
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Link

                  href="/feed"
                  color={"foreground"}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Feed
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Link

                  href="/chat"
                  color={"foreground"}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Chat
                </Link>
              </NavbarMenuItem>
              {siteConfig.navMenuItems.map((item, index) => (
                <NavbarMenuItem key={`${item}-${index}`}>
                  <Link color={"foreground"} href="#" >
                    {item.label}
                  </Link>
                </NavbarMenuItem>
              ))}
              <NavbarMenuItem>
                <Link
                  color="danger"

                  href="#"
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                >
                  Logout
                </Link>
              </NavbarMenuItem>
            </div>
          </NavbarMenu>
        </NextUINavbar>
      )}

    </>

  );

};
