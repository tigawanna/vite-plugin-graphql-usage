export type QueryInfo = {
  name: string;
  type: string;
  path: string;
  line: number;
  found: boolean;
};

/**
 * Sorts an array of QueryInfo objects, moving found queries to the top
 * and keeping unimplemented queries at the bottom
 * @param queries - Array of QueryInfo objects to sort
 * @returns New sorted array with found queries first, unimplemented last
 */
export function sortQueriesByImplementationStatus(queries: QueryInfo[]): QueryInfo[] {
  return [...queries].sort((a, b) => {
    // If both have same found status, maintain original order
    if (a.found === b.found) {
      return 0;
    }
    // Move found queries to top (found = true comes before found = false)
    return b.found ? 1 : -1;
  });
}

/**
 * Alternative implementation that groups explicitly
 * @param queries - Array of QueryInfo objects to sort
 * @returns New sorted array with found queries first, unimplemented last
 */
export function groupQueriesByImplementationStatus(queries: QueryInfo[]): QueryInfo[] {
  const foundQueries = queries.filter((query) => query.found);
  const unimplementedQueries = queries.filter((query) => !query.found);

  return [...foundQueries, ...unimplementedQueries];
}

/**
 * Sort with additional ordering within groups (by type, then by name)
 * @param queries - Array of QueryInfo objects to sort
 * @returns New sorted array with found queries first, then sorted by type and name
 */
export function sortQueriesWithGrouping(queries: QueryInfo[]): QueryInfo[] {
  return [...queries].sort((a, b) => {
    // First, sort by found status (found first)
    if (a.found !== b.found) {
      return b.found ? 1 : -1;
    }

    // Then sort by type
    if (a.type !== b.type) {
      return a.type.localeCompare(b.type);
    }

    // Finally sort by name
    return a.name.localeCompare(b.name);
  });
}
