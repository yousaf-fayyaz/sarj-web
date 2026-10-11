import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Bundled background runtime and WebAssembly decoder.
    "public/backgrounds/sarj/*.script.js",
    "public/backgrounds/sarj/renderer.js",
    "public/backgrounds/sarj/draco/**",
  ]),
]);

export default eslintConfig;
