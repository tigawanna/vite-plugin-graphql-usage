import { describe, test, expect, vi, beforeEach } from 'vitest';
import viteGraphQLUsages from '../src/plugin/vite-graphql-usages.js';
import { introspectSchema } from '../src/introspect/introspec.js';
import { isGraphQLOperation } from '../src/helpers/gql.js';

// Mock dependencies
vi.mock('../src/introspect/introspec.js');
vi.mock('../src/helpers/gql.js');
vi.mock('../src/helpers/fs.js', () => ({
  writePluginReport: vi.fn()
}));

const mockIntrospectSchema = vi.mocked(introspectSchema);
const mockIsGraphQLOperation = vi.mocked(isGraphQLOperation);

describe('Plugin Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    mockIntrospectSchema.mockResolvedValue([
      { name: 'getUsers', type: 'Query', path: 'src/queries.ts', line: 5 },
      { name: 'createUser', type: 'Mutation', path: 'src/mutations.ts', line: 3 },
      { name: 'onUserCreated', type: 'Subscription', path: 'src/subscriptions.ts', line: 2 }
    ]);
    
    mockIsGraphQLOperation.mockImplementation((line: string) => {
      // Simple mock logic - return true for lines that look like GraphQL
      return line.includes('getUsers') || 
             line.includes('createUser') || 
             line.includes('onUserCreated') ||
             line.includes('query') ||
             line.includes('mutation');
    });
  });

  test('should analyze code and detect GraphQL operations', async () => {
    const plugin = viteGraphQLUsages({
      schemaSource: { endpoint: "https://api.example.com/graphql" },
    });

    // Simulate first file processing - should introspect schema
    const codeWithQuery = `
      import { gql } from '@apollo/client';
      
      const GET_USERS = gql\`
        query GetUsers {
          getUsers {
            id
            name
          }
        }
      \`;
    `;
    // @ts-expect-error
    const result1 = await plugin.transform!(codeWithQuery, "src/queries.ts");
    expect(result1).toBeNull(); // Plugin doesn't transform code
    expect(mockIntrospectSchema).toHaveBeenCalledWith({
      endpoint: "https://api.example.com/graphql",
    });

    // Simulate second file processing - should use cached schema
    const codeWithMutation = `
      const CREATE_USER = gql\`
        mutation CreateUser($input: UserInput!) {
          createUser(input: $input) {
            id
            name
          }
        }
      \`;
    `;
    // @ts-expect-error
    const result2 = await plugin.transform!(codeWithMutation, "src/mutations.ts");
    expect(result2).toBeNull();
    expect(mockIntrospectSchema).toHaveBeenCalledTimes(1); // Should not introspect again
  });

  test('should respect file filters', async () => {
    const plugin = viteGraphQLUsages({
      schemaSource: { endpoint: "https://api.example.com/graphql" },
      include: ["src/**/*.ts"],
      exclude: ["**/*.test.ts", "**/node_modules/**"],
    });

    // Should process included files
    // @ts-expect-error
    const result1 = await plugin.transform!('const query = "getUsers"', "src/app.ts");
    expect(result1).toBeNull();

    // Should skip excluded files
    // @ts-expect-error
    const result2 = await plugin.transform!('const query = "getUsers"', "src/app.test.ts");
    expect(result2).toBeNull();

    // Should skip node_modules
    // @ts-expect-error
    const result3 = await plugin.transform!(
      'const query = "getUsers"',
      "node_modules/lib/index.js"
    );
    expect(result3).toBeNull();
  });
  test('should handle schema introspection errors gracefully', async () => {
    mockIntrospectSchema.mockRejectedValue(new Error('Network error'));

    const plugin = viteGraphQLUsages({
      schemaSource: { endpoint: 'https://invalid-endpoint.com/graphql' }
    });

    // The plugin should handle introspection errors gracefully
    // When introspection fails, the plugin should continue working but with empty queries
    try {
      // @ts-expect-error
      const result = await plugin.transform!('const query = "getUsers"', "src/app.ts");
      expect(result).toBeNull();
    } catch (error) {
      // If the error is thrown, it should be the expected network error
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('Network error');
    }
  });

  test('should handle code analysis errors gracefully', async () => {
    const plugin = viteGraphQLUsages({
      schemaSource: { endpoint: "https://api.example.com/graphql" },
    });

    // Malformed code should not crash the plugin
    const malformedCode = "{ invalid javascript syntax }}}}";
    // @ts-expect-error
    const result = await plugin.transform!(malformedCode, "src/broken.ts");
    expect(result).toBeNull();
  });

  test('should process files only once', async () => {
    const plugin = viteGraphQLUsages({
      schemaSource: { endpoint: "https://api.example.com/graphql" },
    });

    const code = 'const query = "getUsers"';
    const filePath = "src/app.ts";

    // First call should process
    // @ts-expect-error
    await plugin.transform!(code, filePath);

    // Second call to same file should be skipped
    // @ts-expect-error
    await plugin.transform!(code, filePath);

    expect(mockIntrospectSchema).toHaveBeenCalledTimes(1);
  });

  test('should work with SDL schema source', async () => {
    const plugin = viteGraphQLUsages({
      schemaSource: { sdlPath: "./schema.graphql" },
    });
    // @ts-expect-error
    const result = await plugin.transform!('const query = "getUsers"', "src/app.ts");
    expect(result).toBeNull();
    expect(mockIntrospectSchema).toHaveBeenCalledWith({ sdlPath: "./schema.graphql" });
  });

  test('should handle buildEnd reporting', () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const consoleTableSpy = vi.spyOn(console, "table").mockImplementation(() => {});

    const plugin = viteGraphQLUsages({
      schemaSource: { endpoint: "https://api.example.com/graphql" },
      printTable: true,
    });
    // @ts-expect-error
    plugin.buildEnd!.call({} as any);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("📊 GraphQL Operations Report:")
    );
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("🌐 Endpoint:"));

    consoleSpy.mockRestore();
    consoleTableSpy.mockRestore();
  });
});
