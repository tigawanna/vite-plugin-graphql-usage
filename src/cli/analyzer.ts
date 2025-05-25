import { glob } from "glob";
import { readFile } from "fs/promises";
import { createFilter } from "@rollup/pluginutils";
import { introspectSchema } from "@/introspect/introspec.js";
import type { SchemaSource, QueryInfo } from "@/types.js";

export interface AnalyzeOptions {
  schemaSource: SchemaSource;
  include: string[];
  exclude: string[];
  projectDirectory: string;
}

export async function analyzeGraphQLUsage(options: AnalyzeOptions): Promise<QueryInfo[]> {
  const { schemaSource, include, exclude, projectDirectory } = options;

  // Introspect schema to get all operations
  console.log("📡 Introspecting GraphQL schema...");
  const introspected = await introspectSchema(schemaSource);

  if (!introspected || introspected.length === 0) {
    throw new Error("No GraphQL operations found in schema");
  }

  // Initialize all queries as not found
  const allQueries: QueryInfo[] = introspected.map((query) => ({
    ...query,
    found: false,
  }));

  console.log(`📋 Found ${allQueries.length} operations in schema`);

  // Find files to analyze
  const filter = createFilter(include, exclude);
  const files = await glob(include, {
    cwd: projectDirectory,
    ignore: exclude,
    absolute: true,
  });

  console.log(`📁 Analyzing ${files.length} files...`);

  // Analyze each file
  for (const filePath of files) {
    if (!filter(filePath)) continue;

    try {
      const content = await readFile(filePath, "utf-8");
      const lines = content.split("\n");

      // Check each query in this file
      for (const query of allQueries) {
        if (query.found) continue; // Skip already found queries

        let lineIndex = 0;
        for (const line of lines) {
          lineIndex++;

          if (line.includes(query.name)) {
            query.found = true;
            query.path = filePath;
            query.line = lineIndex;
            console.log(`✅ Found ${query.type}: ${query.name} in ${filePath}:${lineIndex}`);
            break;
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️  Could not read file: ${filePath}`);
    }
  }

  return allQueries;
}
