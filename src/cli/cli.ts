#!/usr/bin/env node
import { writeGraphQLReportToMarkdown } from "@/helpers/fs.js";
import { Command } from "commander";
import { analyzeGraphQLUsage } from "@/cli/analyzer.js";


const program = new Command();

program
  .name("graphql-usage-analyzer")
  .description("Analyze GraphQL operation usage in your codebase")
  .version("1.0.0");

program
  .command("analyze")
  .description("Analyze GraphQL operations usage")
  .option("-e, --endpoint <url>", "GraphQL endpoint URL")
  .option("-s, --sdl <path>", "Path to GraphQL SDL file")
  .option(
    "-i, --include <patterns>",
    "File patterns to include (comma-separated)",
    "**/*.ts,**/*.tsx"
  )
  .option(
    "-x, --exclude <patterns>",
    "File patterns to exclude (comma-separated)",
    "node_modules/**"
  )
  .option("-o, --output <path>", "Output markdown file path", "./graphql-usage-report.md")
  .option("-d, --directory <path>", "Project directory to analyze", process.cwd())
  .action(async (options) => {
    try {
      if (!options.endpoint && !options.sdl) {
        console.error("❌ Either --endpoint or --sdl must be provided");
        process.exit(1);
      }

      const schemaSource = options.endpoint
        ? { endpoint: options.endpoint }
        : { sdlPath: options.sdl };

      const includePatterns = options.include.split(",");
      const excludePatterns = options.exclude.split(",");

      console.log("🔍 Analyzing GraphQL usage...");

      const results = await analyzeGraphQLUsage({
        schemaSource,
        include: includePatterns,
        exclude: excludePatterns,
        projectDirectory: options.directory,
      });

      await writeGraphQLReportToMarkdown(results, options.output);

      const foundCount = results.filter((q) => q.found).length;
      const totalCount = results.length;

      console.log(`\n✅ Found: ${foundCount}`);
      console.log(`❌ Not found: ${totalCount - foundCount}`);
      console.log(`📊 Total operations: ${totalCount}`);
      console.log(`📝 Report written to: ${options.output}`);
    } catch (error) {
      console.error("❌ Error:", error);
      process.exit(1);
    }
  });

program.parse();
