import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vitest tipovi
import type { InlineConfig } from "vitest";
import type { UserConfig } from "vite";

type ViteConfig = UserConfig & { test: InlineConfig };

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
  },
} satisfies ViteConfig);
