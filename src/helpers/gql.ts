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
    trimmedLine.includes("=>") ||
    trimmedLine.includes("return ")
  ) {
    return false;
  }

  // Check for simple field selections like "addEvent{}" or "addEvent(args){}"
  const simpleFieldPattern = /^[a-zA-Z_][a-zA-Z0-9_]*(\([^)]*\))?\s*\{.*\}$/;
  if (simpleFieldPattern.test(trimmedLine)) {
    return true;
  }

  // Check for common GraphQL patterns
  const hasGraphQLIndicators =
    trimmedLine.includes("query ") ||
    trimmedLine.includes("mutation ") ||
    trimmedLine.includes("subscription ") ||
    trimmedLine.includes("fragment ") ||
    (trimmedLine.startsWith("{") && trimmedLine.includes(" {") && trimmedLine.includes("}"));

  // Quick check for common patterns before attempting to parse
  if (!hasGraphQLIndicators) {
    return false;
  }

  // Try to parse as GraphQL to confirm (for complete operations)
  try {
    const parsed = parse(trimmedLine);
    // Check if the document has any operation definitions or fragments
    return parsed.definitions.some(
      (def) => def.kind === Kind.OPERATION_DEFINITION || def.kind === Kind.FRAGMENT_DEFINITION
    );
  } catch (error) {
    // If parsing fails, it's likely not valid GraphQL
    return false;
  }
}

// ...existing code...
