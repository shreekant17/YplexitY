"use client";
import { Link } from "@nextui-org/link";
import { Snippet } from "@nextui-org/snippet";
import { Code } from "@nextui-org/code";
import { button as buttonStyles } from "@nextui-org/theme";
import { Image } from "@nextui-org/react";
import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 pt-16">
      <div className="inline-block max-w-xl text-center justify-center">
        <span className={title()}> Welcome&nbsp;</span>
        <span className={title({ color: "violet" })}>Aboard!&nbsp;</span>
        <br />
        <span className={title()}>
          We’re delighted to have you here. Explore, connect, and make the most of what we have to offer.
        </span>
        <div className={subtitle({ class: "mt-4" })}>
          This is your space to grow and thrive.
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          className={buttonStyles({
            color: "primary",
            radius: "full",
            variant: "shadow",
          })}
          href={"/login"}
        >
          Login
        </Link>
        <Link
          className={buttonStyles({ variant: "bordered", radius: "full" })}
          href={"/register"}
        >
          <Image alt={"logo"} src={"yplexity-transparent.png"} width={30} />
          Sign Up
        </Link>
      </div>
    </section>
  );
}
