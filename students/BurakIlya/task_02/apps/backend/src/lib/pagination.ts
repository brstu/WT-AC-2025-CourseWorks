export function getPaginationParams(query: Record<string, unknown>) {
  const limitRaw = query.limit;
  const offsetRaw = query.offset;

  const limit = typeof limitRaw === "string" ? Number(limitRaw) : undefined;
  const offset = typeof offsetRaw === "string" ? Number(offsetRaw) : undefined;

  return {
    limit: Number.isFinite(limit) && limit! > 0 ? Math.min(limit!, 100) : 50,
    offset: Number.isFinite(offset) && offset! >= 0 ? offset! : 0
  };
}
