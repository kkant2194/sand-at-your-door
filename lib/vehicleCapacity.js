// Unknown legacy capacities stay null; never infer volume from wheel count.
export function parseEstimatedCapacity(value) {
  if (value == null || value === "") return null;
  if (typeof value !== "number" && typeof value !== "string") return null;
  const capacity = Number(value);
  return Number.isFinite(capacity) && capacity > 0 ? capacity : null;
}
