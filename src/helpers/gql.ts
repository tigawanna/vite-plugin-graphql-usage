import { parse, Kind } from "graphql";

/**
 * Determines whether a string is likely to be a GraphQL query or operation
 *
 * @param line The string to analyze
 * @returns Boolean indicating if the string appears to be a GraphQL operation
 */
export function isGraphQLOperation(line: string): boolean {
  if (!line || typeof line !== "string") {
    return false;
  }

  // Trim and remove potential variable declarations
  const trimmedLine = line.trim();

  // Early rejection of obvious JavaScript patterns
  if (
    trimmedLine.startsWith("const ") ||
    trimmedLine.startsWith("let ") ||
    trimmedLine.startsWith("var ") ||
    trimmedLine.includes("function") ||
    trimmedLine.includes("[") ||
    trimmedLine.includes("]") ||
    trimmedLine.includes("({") ||
    trimmedLine.includes("=>") ||
    trimmedLine.includes("return ") ||
    trimmedLine.includes("=") || // Reject assignments
    trimmedLine.includes("{:") // Reject JavaScript object syntax like { hello: }
  ) {
    return false;
  }

  // Check for GraphQL selection sets like { user { name } } or { user(id: 1) { name } }
  // Allows colons only inside parentheses (arguments), not between field and selection set
  const selectionSetPattern = /^\{\s*[a-zA-Z_][a-zA-Z0-9_]*(\([^)]*:[^)]*\))?\s*\{[^:]*\}\s*\}$/;
  if (selectionSetPattern.test(trimmedLine)) {
    return true;
  }

  // Check for simple selection sets like "{ hello }" or "{ user }"
  const simpleSelectionPattern = /^\{\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\}$/;
  if (simpleSelectionPattern.test(trimmedLine)) {
    return true;
  }

  // Check for simple field selections like "addEvent{}" or "addEvent(args){}"
  const simpleFieldPattern = /^[a-zA-Z_][a-zA-Z0-9_]*(\([^)]*\))?\s*\{.*\}$/;
  if (simpleFieldPattern.test(trimmedLine)) {
    return true;
  }

  // Check for incomplete field selections like "customerStats {" (opening brace without closing)
  const incompleteFieldPattern = /^[a-zA-Z_][a-zA-Z0-9_]*(\([^)]*\))?\s*\{\s*$/;
  if (incompleteFieldPattern.test(trimmedLine)) {
    return true;
  }

  // Check for GraphQL operation keywords
//   if (
//     trimmedLine.includes("query ") ||
//     trimmedLine.includes("mutation ") ||
//     trimmedLine.includes("subscription ") ||
//     trimmedLine.includes("fragment ")
//   ) {
//     return true;
//   }

  return false;
}
