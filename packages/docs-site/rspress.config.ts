import { join } from "node:path";
import { defineConfig } from "@rspress/core";

export default defineConfig({
  root: join(__dirname, "docs"),
  base: "/crax/",
  title: "Crax",
  description: "Lightweight React framework for dashboards, web apps, and internal tools. Built on Vite.",
  icon: "/rspress-icon.png",
  logo: "/crax/crax-logo.png",
  logoText: "Crax",
  themeConfig: {
    socialLinks: [
      {
        icon: "github",
        mode: "link",
        content: "https://github.com/Hussseinkizz/crax",
      },
    ],
    search: true,
  },
  markdown: {
    showLineNumbers: true,
    shiki: {
      theme: "material-theme-ocean",
    },
  },
});
