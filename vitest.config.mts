import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const alias = { "@": fileURLToPath(new URL("./src", import.meta.url)) };

export default defineConfig({
  test: {
    projects: [
      {
        // *.test.ts runs in Node: pure helpers and route handlers
        resolve: { alias },
        test: {
          name: "node",
          environment: "node",
          include: ["src/**/*.test.ts"],
        },
      },
      {
        // *.test.tsx runs in jsdom: React components and anything needing the DOM
        resolve: { alias },
        test: {
          name: "dom",
          environment: "jsdom",
          include: ["src/**/*.test.tsx"],
          setupFiles: ["./src/test/setup-dom.ts"],
        },
      },
    ],
  },
});
