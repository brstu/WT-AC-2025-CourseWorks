export function parsePagination(query: { limit?: string; offset?: string }) {
  const limit = query.limit ? Math.min(Math.max(parseInt(query.limit, 10) || 0, 1), 100) : 50;
  const offset = query.offset ? Math.max(parseInt(query.offset, 10) || 0, 0) : 0;
  return { limit, offset };
}
