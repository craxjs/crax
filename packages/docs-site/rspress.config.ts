import { join } from "node:path";
import { defineConfig } from "@rspress/core";
import { pluginLlms } from "@rspress/plugin-llms";

export default defineConfig({
  root: join(__dirname, "docs"),
  base: "/crax/",
  title: "Crax",
  description: "Lightweight React framework for dashboards, web apps, and internal tools. Built on Vite.",
  icon: "/rspress-icon.png",
  logo: "/crax/crax-logo.png",
  logoText: "Crax",
  lastUpdated: true,
  themeConfig: {
    socialLinks: [
      {
        icon: "github",
        mode: "link",
        content: "https://github.com/craxjs/crax",
      },
    ],
    search: true,
    llmsUI: true,
  },
  plugins: [pluginLlms()],
  markdown: {
    showLineNumbers: true,
    shiki: {
      theme: "material-theme-ocean",
    },
  },
});
