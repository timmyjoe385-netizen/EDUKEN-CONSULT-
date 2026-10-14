export function validateOpportunityVerification(value) {
  const verified = value?.verified === true ||
    (typeof value?.verified === "string" &&
      ["true", "t", "1", "yes", "on"].includes(value.verified.trim().toLowerCase()));
  if (!verified) {
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

export function isOpportunityVerified(value) {
  const verified = value?.verified === true ||
    (typeof value?.verified === "string" &&
      ["true", "t", "1", "yes", "on"].includes(value.verified.trim().toLowerCase()));
  return verified && validateOpportunityVerification({ ...value, verified: true }).valid;
}
