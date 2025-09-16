import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // Frontend JS (browser environment)
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: globals.browser, // DOM globals like window, document, etc.
    },
  },

  // All JS files (set source type to CommonJS)
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
    },
  },

  // Backend server file (Node.js globals)
  {
    files: ["server.cjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        ...globals.node, // Includes __dirname, require, module, etc.
      },
    },
  },
]);
