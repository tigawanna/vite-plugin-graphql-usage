import { describe, test, expect } from "vitest";
import { isGraphQLOperation } from "../src/helpers/gql.js";

describe("isGraphQLOperation", () => {
  describe("Valid GraphQL patterns", () => {
    test("should identify simple field selections", () => {
      expect(isGraphQLOperation("addEvent{}")).toBe(true);
      expect(isGraphQLOperation("addEvent(type:$type){}")).toBe(true);
      expect(isGraphQLOperation("customersByMonth {")).toBe(true);
    });

    test("should identify selection sets", () => {
      expect(isGraphQLOperation("{ hello }")).toBe(true);
      expect(isGraphQLOperation("{ user { name } }")).toBe(true);
    });

  });

  describe("JavaScript patterns to reject", () => {
    test("should reject variable declarations", () => {
      expect(isGraphQLOperation("const addEvent = ``")).toBe(false);
      expect(isGraphQLOperation("const obj = { key: value }")).toBe(false);
    });

    test("should reject function declarations", () => {
      expect(isGraphQLOperation('const addEvent = () => { return "blah blah blah" }')).toBe(false);
    });

    test("should reject object literals", () => {
      expect(isGraphQLOperation('const addEvent = { return "blah blah blah" }')).toBe(false);
    });

    test("should reject JavaScript object syntax with colons", () => {
      expect(isGraphQLOperation("{ hello:{")).toBe(false);
      expect(isGraphQLOperation('{ hello: "world" }')).toBe(false);
      expect(isGraphQLOperation("query :{")).toBe(false);
    });
  });

  describe("Input validation", () => {
    test("should reject empty strings", () => {
      expect(isGraphQLOperation("")).toBe(false);
    });

    test("should reject null and undefined", () => {
      expect(isGraphQLOperation(null as any)).toBe(false);
      expect(isGraphQLOperation(undefined as any)).toBe(false);
    });

    test("should reject non-string types", () => {
      expect(isGraphQLOperation(123 as any)).toBe(false);
      expect(isGraphQLOperation({} as any)).toBe(false);
      expect(isGraphQLOperation([] as any)).toBe(false);
    });
  });

  describe("Real-world GraphQL scenarios", () => {

    test("should identify single line field selections", () => {
      expect(isGraphQLOperation("addEvent{}")).toBe(true);
      expect(isGraphQLOperation("addEvent(type:$type){}")).toBe(true);
      expect(isGraphQLOperation("customersByMonth {")).toBe(true);
    });




  test("should reject object literals with return statements", () => {
      expect(isGraphQLOperation('const addEvent = { return "blah blah blah" }')).toBe(false);
    });
  });

  describe("Edge cases and boundary conditions", () => {
    test("should handle whitespace variations", () => {
      expect(isGraphQLOperation("  addEvent{}  ")).toBe(true);
      expect(isGraphQLOperation("\t\tquery {\t\t")).toBe(true);
      expect(isGraphQLOperation("   { hello }   ")).toBe(true);
    });

    test("should handle nested braces correctly", () => {
      expect(isGraphQLOperation("{ user { profile { name } } }")).toBe(true);
      expect(isGraphQLOperation("{ user: { profile: { name } } }")).toBe(false);
    });

    test("should reject malformed JavaScript objects", () => {
      expect(isGraphQLOperation("{ hello:{")).toBe(false);
      expect(isGraphQLOperation('{ hello: "world" }')).toBe(false);
      expect(isGraphQLOperation("query :{")).toBe(false);
    });

    test("should handle GraphQL with arguments", () => {
      expect(isGraphQLOperation("user(id: 1) { name }")).toBe(true);
      expect(isGraphQLOperation("getUser(id: $userId, active: true) {")).toBe(true);
    });
  });
});
