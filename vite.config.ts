import { defineConfig } from "vite";

const commitSha = process.env.GITHUB_SHA?.slice(0, 7) ?? "local";
const buildTime = new Date().toISOString().slice(0, 16).replace("T", " ");

export default defineConfig({
  base: "/blue-light-world-web/",
  define: {
    __BUILD_VERSION__: JSON.stringify(`v0.1 · ${commitSha} · ${buildTime} UTC`)
  }
});
