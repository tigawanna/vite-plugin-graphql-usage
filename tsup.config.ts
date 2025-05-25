import { defineConfig } from "tsup";

export default defineConfig([
  // Plugin build
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    clean: true,
    external: ["vite"],
  },
  // CLI build
  {
    entry: ["src/cli/cli.ts"],
    format: ["esm"],
    outDir: "dist",
    outExtension: () => ({ js: ".js" }),
    // banner: {
    //   js: "#!/usr/bin/env node",
    // },
    external: ["commander", "graphql", "glob"],
  },
]);
