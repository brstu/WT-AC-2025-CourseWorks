export const buildPagination = (page?: number | string, pageSize?: number | string) => {
  const take = Math.min(Math.max(Number(pageSize) || 20, 1), 100);
  const pageNumber = Math.max(Number(page) || 1, 1);
  const skip = (pageNumber - 1) * take;
  return { skip, take, page: pageNumber, pageSize: take };
};

