# GraphQL Usage Analyzer

A powerful tool for analyzing GraphQL operation usage in your codebase. Track which queries, mutations, and subscriptions from your GraphQL schema are actually implemented in your application.

## Features

- 🔍 **Schema Introspection** - Works with both GraphQL endpoints and SDL files
- 📊 **Usage Analysis** - Finds where operations are used in your codebase
- 📝 **Detailed Reports** - Generates markdown reports with checkboxes and tables
- 🔧 **Vite Plugin** - Integrates seamlessly with your Vite build process
- 🖥️ **CLI Tool** - Standalone command-line interface for any project
- ⚡ **Non-intrusive** - Analyzes code without modifying it
- 🎯 **Configurable** - Flexible include/exclude patterns

## Installation

```bash
npm install vite-plugin-graphql-usage --save-dev
# or
pnpm install vite-plugin-graphql-usage --save-dev
# or
yarn add vite-plugin-graphql-usage --dev
```

## Usage

### Vite Plugin

Add the plugin to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import viteGraphQLUsages from 'vite-plugin-graphql-usage';

export default defineConfig({
  plugins: [
    react(),
    viteGraphQLUsages({
      schemaSource: {
        endpoint: 'https://rickandmortyapi.com/graphql'
        // or
        // sdlPath: './schema.graphql'
      },
      include: ['**/*.ts', '**/*.tsx'],
      exclude: ['node_modules/**', '**/*.test.*'],
      outputFileName: 'graphql-usage-report.md',
      saveReport: true,        // Save markdown report (default: true)
      printTable: true         // Print detailed table in console (optional)
    })
  ],
});
```

### CLI Tool

Run the analyzer from the command line:

```bash
# Using GraphQL endpoint
npx graphql-usage-analyzer analyze --endpoint https://rickandmortyapi.com/graphql

# Using SDL file
npx graphql-usage-analyzer analyze --sdl ./schema.graphql

# With custom options
npx graphql-usage-analyzer analyze \
  --endpoint https://api.example.com/graphql \
  --include "src/**/*.ts,src/**/*.tsx" \
  --exclude "**/*.test.*,**/*.spec.*" \
  --output ./reports/graphql-usage.md
```

## Configuration Options

### Schema Source

Choose one of the following:

#### GraphQL Endpoint
```typescript
{
  schemaSource: {
    endpoint: 'https://api.example.com/graphql'
  }
}
```

#### SDL File
```typescript
{
  schemaSource: {
    sdlPath: './schema.graphql'
  }
}
```

### File Patterns

Control which files to analyze:

```typescript
{
  include: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
  exclude: ['node_modules/**', '**/*.test.*', '**/*.spec.*']
}
```

### Output Options

```typescript
{
  outputFileName: 'my-graphql-report.md',
  queryDirectory: './src/graphql/**/*.ts',
  saveReport: true,          // Whether to save markdown report (default: true)
  printTable: false,         // Whether to print detailed table in console (default: undefined)
  sortOrder: 'original'      // Sort order: 'completed-first', 'uncompleted-first', or 'original' (default: 'original')
}
```

#### Output Control Options

- **`saveReport`**: Controls whether a markdown report file is generated. Set to `false` to disable file generation and only show console output.
- **`printTable`**: Controls whether the detailed table is printed to the console. When `true`, shows a comprehensive table with all operations, their status, file paths, and line numbers.

### Complete Configuration Example

```typescript
viteGraphQLUsages({
  schemaSource: {
    endpoint: 'https://api.example.com/graphql'
  },
  include: ['src/**/*.ts', 'src/**/*.tsx'],
  exclude: ['**/*.test.*', '**/*.spec.*'],
  outputFileName: 'custom-report.md',
  saveReport: true,     // Generate markdown file
  printTable: true,     // Show detailed console table
  sortOrder: 'completed-first'  // Sort completed operations first
})
```

## Output Examples

### Console Output

```
📊 GraphQL Operations Report:
🌐 Endpoint: https://rickandmortyapi.com/graphql

┌─────────┬─────────────────┬──────────┬─────────────────────┬──────┬─────────────┐
│ (index) │      name       │   type   │        path         │ line │   status    │
├─────────┼─────────────────┼──────────┼─────────────────────┼──────┼─────────────┤
│    0    │ 'getCharacters' │ 'Query'  │ 'src/App.tsx'      │  15  │ '✅ Found'  │
│    1    │ 'getLocations'  │ 'Query'  │ 'Not found'        │  -1  │ '❌ Not found' │
│    2    │ 'createUser'    │ 'Mutation'│ 'src/UserForm.tsx' │  23  │ '✅ Found'  │
└─────────┴─────────────────┴──────────┴─────────────────────┴──────┴─────────────┘

✅ Found: 2
❌ Not found: 1
📊 Total operations: 3
```

### Markdown Report

The tool generates a comprehensive markdown report:

```markdown
# GraphQL Operations Report

Generated on: 2025-01-25T10:30:00.000Z

## Summary

- ✅ **Implemented**: 2
- ❌ **Not Implemented**: 1
- 📊 **Total Operations**: 3

## Queries

- [x] **getCharacters** ✅ - `src/App.tsx:15`
- [ ] **getLocations** ❌

## Mutations

- [x] **createUser** ✅ - `src/UserForm.tsx:23`

## Detailed Table

| Operation | Type | Status | Location | Line |
|-----------|------|--------|----------|------|
| getCharacters | Query | ✅ Found | src/App.tsx | 15 |
| getLocations | Query | ❌ Not Found | Not found | - |
| createUser | Mutation | ✅ Found | src/UserForm.tsx | 23 |

---

*Report generated by vite-graphql-usages plugin*
```

## API Reference

### Types

```typescript
export type SchemaSource = SchemaSdlSource | SchemaEndpointSource;

type SchemaSdlSource = { 
  sdlPath: string; 
  endpoint?: never 
};

type SchemaEndpointSource = { 
  sdlPath?: never; 
  endpoint: string 
};

export interface GraphQLUsageOptions {
  schemaSource: SchemaSource;
  include?: string | RegExp | Array<string | RegExp>;
  exclude?: string | RegExp | Array<string | RegExp>;
  queryDirectory?: string;
  outputFileName?: string;
  saveReport?: boolean;      // Whether to save markdown report (default: true)
  printTable?: boolean;      // Whether to print detailed table in console
}

export type QueryInfo = {
  name: string;
  type: string;
  path: string;
  line: number;
  found: boolean;
};
```

### Functions

#### `viteGraphQLUsages(options: GraphQLUsageOptions): Plugin`

Creates a Vite plugin for GraphQL usage analysis.

#### `analyzeGraphQLUsage(options: AnalyzeOptions): Promise<QueryInfo[]>`

Standalone function for analyzing GraphQL usage (used by CLI).

#### `writeGraphQLReportToMarkdown(queries: QueryInfo[], outputPath: string, options?: ReportOptions): Promise<void>`

Generates a markdown report from analysis results.

#### `sortQueriesByImplementationStatus(queries: QueryInfo[]): QueryInfo[]`

Sorts queries with implemented ones first, unimplemented ones last.

## How It Works

1. **Schema Introspection**: The tool connects to your GraphQL endpoint or reads your SDL file to discover all available operations (queries, mutations, subscriptions).

2. **Code Analysis**: It scans your source code files looking for references to these operation names using simple string matching.

3. **Status Tracking**: Each operation is marked as "found" or "not found" along with its location (file path and line number).

4. **Report Generation**: Results are displayed in the console and optionally written to a markdown file with checkboxes and detailed tables.

## File Structure

```
src/pkg/
├── vite-graphql-usages.ts    # Main Vite plugin
├── analyzer.ts               # Standalone analysis logic
├── cli.ts                    # Command-line interface
├── introspec.ts              # Schema introspection utilities
├── introspect-api.ts         # GraphQL endpoint introspection
├── introspect-sdl.ts         # SDL file introspection
└── helpers/
    ├── fs.ts                 # File system utilities
    └── array-shift.ts        # Array sorting utilities
```

## Examples

### Basic Vite Setup

```typescript
// vite.config.ts
import viteGraphQLUsages from 'vite-plugin-graphql-usage';

export default defineConfig({
  plugins: [
    viteGraphQLUsages({
      schemaSource: {
        endpoint: 'https://rickandmortyapi.com/graphql'
      }
    })
  ]
});
```

### Apollo Client Project

```typescript
// For projects using Apollo Client
viteGraphQLUsages({
  schemaSource: {
    endpoint: 'https://api.spacex.land/graphql/'
  },
  include: ['src/**/*.ts', 'src/**/*.tsx'],
  exclude: ['src/**/*.test.*', 'src/**/*.stories.*'],
  outputFileName: 'spacex-operations.md'
})
```

### Local Schema File

```typescript
// Using a local schema.graphql file
viteGraphQLUsages({
  schemaSource: {
    sdlPath: './graphql/schema.graphql'
  },
  queryDirectory: './src/graphql/operations',
  outputFileName: 'local-schema-usage.md'
})
```

## CLI Commands

### Available Commands

```bash
# Basic analysis using GraphQL endpoint
npx graphql-usage-analyzer analyze --endpoint https://rickandmortyapi.com/graphql

# Using SDL file
npx graphql-usage-analyzer analyze --sdl ./schema.graphql

# With custom patterns
npx graphql-usage-analyzer analyze --endpoint <url> --include "**/*.ts,**/*.tsx" --exclude "**/test/**"

# Custom output location
npx graphql-usage-analyzer analyze --sdl schema.graphql --output reports/usage.md

# Analyze different directory
npx graphql-usage-analyzer analyze --endpoint <url> --directory /path/to/project
```

### CLI Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--endpoint` | `-e` | GraphQL endpoint URL | - |
| `--sdl` | `-s` | Path to SDL file | - |
| `--include` | `-i` | File patterns to include | `**/*.ts,**/*.tsx` |
| `--exclude` | `-x` | File patterns to exclude | `node_modules/**` |
| `--output` | `-o` | Output file path | `./graphql-usage-report.md` |
| `--directory` | `-d` | Project directory | `process.cwd()` |
| `--sort` | `-s` | Sort order: 'completed-first', 'uncompleted-first', or 'original' | `original` |

## Best Practices

1. **Use Specific Patterns**: Configure include/exclude patterns to focus on your actual source code files.

2. **Regular Analysis**: Run the tool regularly to track implementation progress and identify unused operations.

3. **Team Reports**: Share the generated markdown reports with your team to coordinate GraphQL implementation efforts.

4. **Schema Evolution**: Use the tool when updating your GraphQL schema to see which new operations need implementation.

5. **Cleanup**: Identify unused operations that can be removed from your schema to keep it lean.

## Troubleshooting

### Common Issues

**"No operations found"**
- Check that your GraphQL endpoint is accessible
- Verify your SDL file path is correct
- Ensure your schema has query/mutation definitions

**"Files not being analyzed"**
- Check your include/exclude patterns
- Verify file paths are correct
- Make sure TypeScript files are not excluded

**"Operations not detected"**
- The tool uses simple string matching - ensure operation names appear exactly as defined in your schema
- Check for typos in operation names
- Consider case sensitivity

### Debug Mode

Add console logs to see what's happening:

```typescript
viteGraphQLUsages({
  // ... config
  debug: true // If you add this option to the plugin
})
```

## Contributing

This tool is part of a larger GraphQL development workflow. Feel free to extend it with additional features like:

- GraphQL fragment analysis
- Operation complexity analysis
- Performance metrics
- Integration with other GraphQL tools

## License

MIT License - see LICENSE file for details.
