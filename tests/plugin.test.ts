import { describe, test, expect, vi, beforeEach } from 'vitest';
import viteGraphQLUsages from '../src/plugin/vite-graphql-usages.js';
import type { QueryInfo } from '../src/types.js';

// Mock the dependencies
vi.mock('../src/introspect/introspec.js', () => ({
  introspectSchema: vi.fn().mockResolvedValue([
    { name: 'queryA', type: 'Query' },
    { name: 'mutationB', type: 'Mutation' },
    { name: 'queryC', type: 'Query' }
  ])
}));

vi.mock('../src/helpers/fs.js', () => ({
  writePluginReport: vi.fn()
}));

vi.mock('../src/helpers/gql.js', () => ({
  isGraphQLOperation: vi.fn().mockReturnValue(true)
}));

vi.mock('../src/helpers/array-shift.js', () => ({
  sortQueriesByImplementationStatus: vi.fn((queries) => queries)
}));

describe('viteGraphQLUsages Plugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should create a valid Vite plugin', () => {
    const plugin = viteGraphQLUsages({
      schemaSource: { endpoint: 'https://api.example.com/graphql' }
    });

    expect(plugin).toBeDefined();
    expect(plugin.name).toBe('vite-graphql-plugin');
    expect(plugin.apply).toBe('build');
    expect(typeof plugin.transform).toBe('function');
    expect(typeof plugin.buildEnd).toBe('function');
  });

  test('should handle transform with code analysis', async () => {
    const plugin = viteGraphQLUsages({
      schemaSource: { endpoint: "https://api.example.com/graphql" },
    });

    const mockCode = `
      const query = gql\`
        query GetUsers {
          queryA {
            id
            name
          }
        }
      \`;
    `;
    // @ts-expect-error
    const result = await plugin.transform!(mockCode, "test.ts");
    expect(result).toBeNull(); // Plugin should not modify code
  });

  test('should respect include/exclude patterns', async () => {
    const plugin = viteGraphQLUsages({
      schemaSource: { endpoint: "https://api.example.com/graphql" },
      include: ["**/*.ts"],
      exclude: ["**/*.test.ts"],
    });

    // Should process .ts files
    // @ts-expect-error
    const tsResult = await plugin.transform!('const query = "queryA"', "src/app.ts");
    expect(tsResult).toBeNull();

    // Should exclude .test.ts files
    // @ts-expect-error
    const testResult = await plugin.transform!('const query = "queryA"', "src/app.test.ts");
    expect(testResult).toBeNull();
  });

  test('should handle buildEnd hook', () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const plugin = viteGraphQLUsages({
      schemaSource: { endpoint: "https://api.example.com/graphql" },
    });
    // @ts-expect-error
    plugin.buildEnd!.call({} as any);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("📊 GraphQL Operations Report:")
    );

    consoleSpy.mockRestore();
  });

  test('should handle SDL schema source', () => {
    const plugin = viteGraphQLUsages({
      schemaSource: { sdlPath: './schema.graphql' }
    });

    expect(plugin).toBeDefined();
    expect(plugin.name).toBe('vite-graphql-plugin');
  });

  test('should handle custom options', () => {
    const plugin = viteGraphQLUsages({
      schemaSource: { endpoint: 'https://api.example.com/graphql' },
      include: ['src/**/*.ts'],
      exclude: ['**/*.test.ts'],
      saveReport: false,
      printTable: true,
      outputFileName: 'custom-report.md'
    });

    expect(plugin).toBeDefined();
  });
});
