export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "YplexitY",
  description: "Make beautiful connections regardless of your experience.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },

    {
      label: "About",
      href: "/about",
    },
  ],
  navMenuItems: [


    {
      label: "Help & Feedback",
      href: "/help-feedback",
    },
  ],
  links: {
    github: "https://github.com/nextui-org/nextui",
    twitter: "https://twitter.com/getnextui",
    docs: "https://nextui.org",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
