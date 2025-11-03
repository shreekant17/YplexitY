import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@nextui-org/link";
import clsx from "clsx";
import SessionWrapper from "@/components/SessionWrapper";
import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";

import { AuthProvider } from "@/store/auth";
import Head from "next/head";

export const metadata: Metadata = {

  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/yplexity-transparent.png",
  },
};

export const viewport: Viewport = {

  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  interactiveWidget: "resizes-content",

};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "lg:min-h-screen min-h-[100svh] bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <AuthProvider>
            <div className="relative flex flex-col lg:h-screen h-[100svh]">
              <SessionWrapper>
                <Navbar />
                <main className="container max-w-none   flex-grow">
                  {children}
                </main>
              </SessionWrapper>
            </div>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
