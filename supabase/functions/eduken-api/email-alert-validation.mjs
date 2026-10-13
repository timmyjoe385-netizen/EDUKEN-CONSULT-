export const ALLOWED_EMAIL_ALERT_TOPICS = Object.freeze([
  "admissions",
  "scholarships-grants",
  "jobs-internships",
  "remote-opportunities",
  "educational-updates",
  "career-mentorship",
]);

const allowedTopics = new Set(ALLOWED_EMAIL_ALERT_TOPICS);
const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

export function normalizeAlertEmail(value) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (!email || email.length > 254 || /[\r\n]/.test(email) || !emailPattern.test(email)) return null;
  const [localPart, domain] = email.split("@");
  if (localPart.length > 64 || domain.split(".").some(label => !label || label.length > 63 || label.startsWith("-") || label.endsWith("-"))) return null;
  return email;
}

export function validateEmailAlertSubscription(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "A valid subscription object is required." };
  }

  const email = normalizeAlertEmail(body.email);
  if (!email) return { error: "Enter a valid email address." };

  if (!Array.isArray(body.topics) || body.topics.length < 1 || body.topics.length > ALLOWED_EMAIL_ALERT_TOPICS.length) {
    return { error: "Choose at least one valid alert category." };
  }

  if (body.topics.some(topic => typeof topic !== "string" || !allowedTopics.has(topic))) {
    return { error: "One or more alert categories are not supported." };
  }

  if (new Set(body.topics).size !== body.topics.length) {
    return { error: "Duplicate alert categories are not allowed." };
  }

  return { data: { email, topics: [...body.topics] } };
}

export function isAllowedEmailAlertTopic(topic) {
  return typeof topic === "string" && allowedTopics.has(topic);
}

export function isWithinEmailAlertCooldown(updatedAt, nowMs = Date.now(), cooldownMs = 120_000) {
  const timestamp = Date.parse(String(updatedAt ?? ""));
  if (!Number.isFinite(timestamp)) return false;
  // Treat a future timestamp as recent too; clock skew must not bypass the cooldown.
  return nowMs - timestamp < cooldownMs;
}
