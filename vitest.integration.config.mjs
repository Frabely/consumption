import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "tests/integration/**/*.{test,spec}.ts",
      "tests/integration/**/*.{test,spec}.tsx",
    ],
    exclude: ["**/node_modules/**", "**/dist/**", "e2e/**"],
    setupFiles: ["tests/helpers/vitest/setup.integration.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
