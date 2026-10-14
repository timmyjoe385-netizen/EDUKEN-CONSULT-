export function validateOpportunityVerification(value) {
  if (value?.verified !== true) {
    return { valid: true };
  }

  let source;
  try {
    source = new URL(String(value?.official_source ?? "").trim());
  } catch {
    return {
      valid: false,
      error: "A verified opportunity must include a valid official source URL.",
    };
  }

  if ((source.protocol !== "https:" && source.protocol !== "http:") ||
      !source.hostname || source.username || source.password) {
    return {
      valid: false,
      error: "A verified opportunity must include a valid official source URL.",
    };
  }

  return { valid: true };
}
