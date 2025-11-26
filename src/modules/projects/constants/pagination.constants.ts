/**
 * Pagination constants for projects endpoint
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MIN_PAGE: 1,
  MIN_LIMIT: 1,
  MAX_LIMIT: 100,
  MIN_OFFSET: 0,
} as const;

/**
 * Allowed sort fields for projects
 */
export const SORT_FIELDS = [
  'createdAt',
  'updatedAt',
  'name',
  'projectNumber',
  'status',
] as const;

/**
 * Allowed sort orders
 */
export const SORT_ORDERS = ['ASC', 'DESC'] as const;

export type SortField = (typeof SORT_FIELDS)[number];
export type SortOrder = (typeof SORT_ORDERS)[number];
