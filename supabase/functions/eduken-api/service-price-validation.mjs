export function normalizeServicePrice(value) {
  if (value === undefined) return { valid: true, provided: false, value: undefined };
  if (value === null || (typeof value === "string" && value.trim() === "")) {
    return { valid: true, provided: true, value: null };
  }

  if (typeof value !== "number" && typeof value !== "string") {
    return { valid: false, provided: true, value: null };
  }

  if (typeof value === "string" && !/^\d+$/.test(value.trim())) {
    return { valid: false, provided: true, value: null };
  }

  const price = typeof value === "string" ? Number(value.trim()) : value;
  if (!Number.isSafeInteger(price) || price < 0) {
    return { valid: false, provided: true, value: null };
  }

  return { valid: true, provided: true, value: price };
}
