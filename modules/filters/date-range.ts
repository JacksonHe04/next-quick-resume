export type DateRangeFilters = {
  from?: string;
  to?: string;
};

export function isWithinDateRange(
  value: string | null,
  filters: DateRangeFilters,
) {
  if (!filters.from && !filters.to) return true;
  if (!value) return false;

  const timestamp = new Date(value).getTime();
  const from = filters.from
    ? new Date(`${filters.from}T00:00:00.000`).getTime()
    : Number.NEGATIVE_INFINITY;
  const to = filters.to
    ? new Date(`${filters.to}T23:59:59.999`).getTime()
    : Number.POSITIVE_INFINITY;

  return timestamp >= from && timestamp <= to;
}
