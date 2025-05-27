import { describe, test, expect } from 'vitest';
import { sortQueriesByImplementationStatus, groupQueriesByImplementationStatus, sortQueriesWithGrouping } from '../src/helpers/array-shift.js';
import { type QueryInfo } from '../src/types.js';

describe('Array Shift Helper Functions', () => {
  const mockQueries: QueryInfo[] = [
    { name: 'queryA', type: 'Query', found: true, path: 'fileA.ts', line: 1 },
    { name: 'mutationB', type: 'Mutation', found: false, path: 'fileB.ts', line: 1 },
    { name: 'queryC', type: 'Query', found: true, path: 'fileC.ts', line: 1 },
    { name: 'subscriptionD', type: 'Subscription', found: false, path: 'fileD.ts', line: 1 },
    { name: 'queryE', type: 'Query', found: true, path: 'fileE.ts', line: 1 },
  ];

  describe('sortQueriesByImplementationStatus', () => {
    test('should sort with found queries first by default', () => {
      const result = sortQueriesByImplementationStatus([...mockQueries]);
      
      // Found queries should come first
      expect(result[0]?.found).toBe(true);
      expect(result[1]?.found).toBe(true);
      expect(result[2]?.found).toBe(true);
      
      // Then not found queries
      expect(result[3]?.found).toBe(false);
      expect(result[4]?.found).toBe(false);
    });

    test('should maintain relative order within each group', () => {
      const result = sortQueriesByImplementationStatus([...mockQueries]);
      
      // Check that found queries maintain their relative order
      const foundQueries = result.filter((q: QueryInfo) => q.found);
      expect(foundQueries[0]?.name).toBe('queryA');
      expect(foundQueries[1]?.name).toBe('queryC');
      expect(foundQueries[2]?.name).toBe('queryE');
      
      // Check that not found queries maintain their relative order
      const notFoundQueries = result.filter((q: QueryInfo) => !q.found);
      expect(notFoundQueries[0]?.name).toBe('mutationB');
      expect(notFoundQueries[1]?.name).toBe('subscriptionD');
    });
  });

  describe('groupQueriesByImplementationStatus', () => {
    test('should group queries by implementation status', () => {
      const result = groupQueriesByImplementationStatus([...mockQueries]);
      
      // This function returns an array with found queries first, then not found
      expect(result.length).toBe(5);
      
      // Check found queries come first
      expect(result[0]?.found).toBe(true);
      expect(result[1]?.found).toBe(true);
      expect(result[2]?.found).toBe(true);
      
      // Check not found queries come last
      expect(result[3]?.found).toBe(false);
      expect(result[4]?.found).toBe(false);
      
      // Check names are correct
      const foundQueries = result.filter((q: QueryInfo) => q.found);
      const notFoundQueries = result.filter((q: QueryInfo) => !q.found);
      
      expect(foundQueries.map((q: QueryInfo) => q.name)).toEqual(['queryA', 'queryC', 'queryE']);
      expect(notFoundQueries.map((q: QueryInfo) => q.name)).toEqual(['mutationB', 'subscriptionD']);
    });
  });

  describe('sortQueriesWithGrouping', () => {
    test('should sort queries by found status, then type, then name', () => {
      const result = sortQueriesWithGrouping([...mockQueries]);
      
      // First group: found queries sorted by type then name
      expect(result[0]?.found).toBe(true);
      expect(result[0]?.type).toBe('Query');
      expect(result[0]?.name).toBe('queryA');
      
      expect(result[1]?.found).toBe(true);
      expect(result[1]?.type).toBe('Query');
      expect(result[1]?.name).toBe('queryC');
      
      expect(result[2]?.found).toBe(true);
      expect(result[2]?.type).toBe('Query');
      expect(result[2]?.name).toBe('queryE');
      
      // Second group: not found queries sorted by type then name
      expect(result[3]?.found).toBe(false);
      expect(result[3]?.type).toBe('Mutation');
      expect(result[3]?.name).toBe('mutationB');
      
      expect(result[4]?.found).toBe(false);
      expect(result[4]?.type).toBe('Subscription');
      expect(result[4]?.name).toBe('subscriptionD');
    });

    test('should handle empty array', () => {
      const result = sortQueriesWithGrouping([]);
      expect(result).toEqual([]);
    });

    test('should handle array with single item', () => {
      const singleQuery = [mockQueries[0]!];
      const result = sortQueriesWithGrouping(singleQuery);
      expect(result).toEqual(singleQuery);
    });
  });
});
