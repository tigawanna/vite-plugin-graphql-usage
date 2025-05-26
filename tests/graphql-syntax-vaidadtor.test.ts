import { describe, test, expect } from "vitest";
import { isGraphQLOperation } from "../src/helpers/gql.js";

describe("isGraphQLOperation", () => {
  test("should identify valid GraphQL mutations", () => {
    const mutation = `mutation AddEvent($end: DateTime!, $start: DateTime!, $title: String!) {
      addEvent(end: $end, start: $start, title: $title) {
        message
        status
      }
    }`;

    expect(isGraphQLOperation(mutation)).toBe(true);
  });

  test("should identify valid GraphQL queries", () => {
    const query = `query GetUsers {
      users {
        id
        name
        email
      }
    }`;

    expect(isGraphQLOperation(query)).toBe(true);
  });

  test("should identify valid GraphQL subscriptions", () => {
    const subscription = `subscription OnMessageAdded {
      messageAdded {
        id
        content
        user
      }
    }`;

    expect(isGraphQLOperation(subscription)).toBe(true);
  });

  test("should identify valid GraphQL fragments", () => {
    const fragment = `fragment UserInfo on User {
      id
      name
      email
    }`;

    expect(isGraphQLOperation(fragment)).toBe(true);
  });

  test("should identify single line query expression to be valid graphql ", () => {
    expect(isGraphQLOperation("addEvent{}")).toBe(true);
    expect(isGraphQLOperation("addEvent(type:$type){}")).toBe(true);
  });
  test("should reject JavaScript variable declarations", () => {
    expect(isGraphQLOperation("const addEvent = ``")).toBe(false);
  });

  test("should reject JavaScript function declarations", () => {
    expect(isGraphQLOperation('const addEvent = () => { return "blah blah blah" }')).toBe(false);
  });

  test("should reject JavaScript object literals", () => {
    expect(isGraphQLOperation('const addEvent = { return "blah blah blah" }')).toBe(false);
  });

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

  test("should reject invalid GraphQL syntax", () => {
    expect(isGraphQLOperation("query {")).toBe(false);
    expect(isGraphQLOperation("mutation incomplete")).toBe(false);
    expect(isGraphQLOperation("{ hello")).toBe(false);
  });

  test("should handle simple query objects", () => {
    expect(isGraphQLOperation("{ hello }")).toBe(false);
    expect(isGraphQLOperation("{ user { name } }")).toBe(true);
  });
});
