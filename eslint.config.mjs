// @ts-check

import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  // other projects + build/generated output - never lint these
  {
    ignores: [
      "frontend/**",
      "nest-backend/**",
      "backend/dist/**",
      "backend/generated/**",
    ],
  },

  // backend source only
  {
    files: ["backend/**/*.ts", "types.d.ts"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    rules: {
      // start soft - surface these but don't block deploys.
      // clean up incrementally, then promote back to "error".
      "@typescript-eslint/no-explicit-any": "warn",
      // unused args prefixed with _ are intentional (e.g. Express next)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
]);
