#!/usr/bin/env node
import { writeGraphQLReportToMarkdown } from "@/helpers/fs.js";
import { Command } from "commander";
import { analyzeGraphQLUsage } from "@/cli/analyzer.js";
import { sortQueriesByImplementationStatus } from "@/helpers/array-shift.js";


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
  .option("-s, --sort <order>", "Sort order for operations: completed-first, uncompleted-first, or original", "original")
  .action(async (options) => {
    try {
      if (!options.endpoint && !options.sdl) {
        console.error("❌ Either --endpoint or --sdl must be provided");
        process.exit(1);
      }

      console.log("⚠️  Warning: CLI analysis is more prone to false positives than the Vite plugin");
      console.log("   For more accurate results during development, use the Vite plugin instead\n");

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

      // Sort results based on sort option
      let sortedResults = [...results];
      if (options.sort === 'completed-first') {
        sortedResults = sortQueriesByImplementationStatus(results).reverse();
      } else if (options.sort === 'uncompleted-first') {
        sortedResults = sortQueriesByImplementationStatus(results);
      }
      // else keep original order

      await writeGraphQLReportToMarkdown(sortedResults, options.output);

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
