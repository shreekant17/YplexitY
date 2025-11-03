"use client";

import { useAuth } from "@/store/auth";
import { disableNav } from "@/libs/disableNav"
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
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
} from "@nextui-org/navbar";
import { Button } from "@nextui-org/button";
import { Kbd } from "@nextui-org/kbd";
import { Link } from "@nextui-org/link";
import { Input } from "@nextui-org/input";
import { button, link as linkStyles } from "@nextui-org/theme";
import NextLink from "next/link";
import clsx from "clsx";
import { useDisclosure } from "@nextui-org/react";
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
import { Image } from "@nextui-org/react";
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


export const Navbar = () => {
  const { logout } = useAuth();
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

  useEffect(() => {
    if (session) {
      const { fname, avatar, id } = session?.user as SessionUser;
      setFname(fname || "");
      setAvatar(avatar || undefined);
    //  track(id);
      // console.log(avatar)
    }
  }, [session]);

  const router = useRouter();



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
              <Button isIconOnly variant="faded" radius="full" onPress={onOpen}>
                <PlusIcon />
              </Button>
              <ThemeSwitch />
            </NavbarItem>
           
            <NavbarItem className="hidden md:flex">
              {status === "authenticated" ? (
                <NavbarContent as="div" justify="end" className="hidden lg:flex">
                  <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                      <Button
                        className="text-sm font-normal text-default-600 bg-default-100"
                        startContent={
                          <Image
                            radius="full"
                            className="object-cover w-8 h-8 opacity-100"
                            src={avatar}
                          />
                        }
                        variant="flat"
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
                  as={Link}
                  className="text-sm font-normal text-default-600 bg-default-100"
                  href={"/login"}
                  startContent={<UserIcon />}
                  variant="flat"
                >
                  Sign In
                </Button>
              )}
            </NavbarItem>
          </NavbarContent>

          <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
            <ThemeSwitch />
            {status === "authenticated" && (
              <Button isIconOnly onPress={onOpen}>
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
                  size="lg"
                  href="/account"
                  color={"foreground"}
                  onPress={() => setIsMenuOpen(false)}
                >
                  Account
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Link
                  size="lg"
                  href="/feed"
                  color={"foreground"}
                  onPress={() => setIsMenuOpen(false)}
                >
                  Feed
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Link
                  size="lg"
                  href="/chat"
                  color={"foreground"}
                  onPress={() => setIsMenuOpen(false)}
                >
                  Chat
                </Link>
              </NavbarMenuItem>
              {siteConfig.navMenuItems.map((item, index) => (
                <NavbarMenuItem key={`${item}-${index}`}>
                  <Link color={"foreground"} href="#" size="lg">
                    {item.label}
                  </Link>
                </NavbarMenuItem>
              ))}
              <NavbarMenuItem>
                <Link
                  color="danger"
                  size="lg"
                  href="#"
                  onPress={() => {
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
