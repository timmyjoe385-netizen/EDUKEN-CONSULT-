function isTruthyFlag(value) {
  return value === true ||
    (typeof value === "string" &&
      ["true", "t", "1", "yes", "on"].includes(value.trim().toLowerCase()));
}

export function validateOpportunityVerification(value) {
  if (!isTruthyFlag(value?.verified)) {
    return { valid: true };
  }

  // EDUKEN may verify an opportunity editorially without attaching a source URL.
  // When a URL is supplied, still reject malformed, unsafe, or credentialed URLs.
  const rawSource = String(value?.official_source ?? "").trim();
  if (!rawSource) {
    return { valid: true };
  }

  let source;
  try {
    source = new URL(rawSource);
  } catch {
    return {
      valid: false,
      error: "If provided, the official source must be a valid HTTP(S) URL.",
    };
  }

  if ((source.protocol !== "https:" && source.protocol !== "http:") ||
      !source.hostname || source.username || source.password) {
    return {
      valid: false,
      error: "If provided, the official source must be a valid HTTP(S) URL.",
    };
  }

  return { valid: true };
}

export function isOpportunityVerified(value) {
  // The badge reflects the admin's editorial verification decision, not URL presence.
  return isTruthyFlag(value?.verified);
}
