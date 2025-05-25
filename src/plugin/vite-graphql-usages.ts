import { type Plugin } from "vite";
import { createFilter } from "@rollup/pluginutils";
import { introspectSchema } from "@/introspect/introspec.js";
import { writePluginReport, type QueryInfo } from "@/helpers/fs.js";
import type { GraphQLUsageOptions } from "@/types.js";



export default function viteGraphQLUsages(options: GraphQLUsageOptions): Plugin {
  const {
    include = ["**/*.ts", "**/*.tsx"],
    exclude = ["node_modules/**"],
    queryDirectory,
    outputFileName,
    saveReport = true,
    printTable
  } = options;

  // Global array that contains all queries from schema (starts with found: false)
  const allQueries: QueryInfo[] = [];
  const processedFiles = new Set<string>();

  const plugin: Plugin = {
    name: "vite-graphql-plugin",

    // Use transform hook but return null to avoid modifying code
    async transform(code, id) {
      // Only introspect schema once on first transform
      if (allQueries.length === 0) {
        const introspected = await introspectSchema(options.schemaSource);
        if (introspected) {
          // Initialize all queries as not found
          allQueries.push(
            ...introspected.map((query) => ({
              ...query,
              found: false,
            }))
          );
        }
      }

      const filter = createFilter(include, exclude);
      if (!filter(id) || processedFiles.has(id)) {
        return null; // Don't transform, just analyze
      }

      processedFiles.add(id);

      try {
        // Use the code parameter instead of reading file again
        const lines = code.split("\n");

        // Loop through each query/mutation and check if it's used in this file
        for (const query of allQueries) {
          if (query.found) continue; // Skip already found queries

          let lineIndex = 0;
          for (const line of lines) {
            lineIndex++;

            // Look for the query name in the line
            if (line.includes(query.name)) {
              // Mark as found and update location
              query.found = true;
              query.path = id;
              query.line = lineIndex;
              break; // Stop looking for this query in this file
            }
          }
        }
      } catch (error) {
        // Analysis error, skip
      }

      return null; // IMPORTANT: Return null to not transform the code
    },

    buildEnd() {
      console.log("\n📊 GraphQL Operations Report:");

      if (options.schemaSource.endpoint) {
        console.log(`🌐 Endpoint: ${options.schemaSource.endpoint}`);
      }
      if (options.schemaSource.sdlPath) {
        console.log(`📄 SDL Path: ${options.schemaSource.sdlPath}`);
      }
      if (queryDirectory) {
        console.log(`📁 Query Directory: ${queryDirectory}`);
      }

      // Display all queries with their status
      const displayQueries = allQueries.map((query) => ({
        name: query.name,
        type: query.type,
        path: query.found 
          ? (query.path.length > 20 
          ? '...' + query.path.slice(-20) 
          : query.path)
          : "Not found",
        line: query.found ? query.line : -1,
        status: query.found ? "✅ Found" : "❌ Not found",
      }));
      if (printTable) {
        console.log("\nDetailed Report:");
        console.table(displayQueries);
      }

      if (saveReport) {
        writePluginReport(allQueries, outputFileName || "graphql-usage-report.md");
      }
      

      const foundCount = allQueries.filter((q) => q.found).length;
      const totalCount = allQueries.length;

      console.log(`\n✅ Found: ${foundCount}`);
      console.log(`❌ Not found: ${totalCount - foundCount}`);
      console.log(`📊 Total operations: ${totalCount}`);
    },
  };

  return plugin;
}
