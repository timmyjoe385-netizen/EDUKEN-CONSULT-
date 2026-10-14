export const ALLOWED_EMAIL_ALERT_TOPICS = Object.freeze([
  "admissions",
  "scholarships-grants",
  "jobs-internships",
  "remote-opportunities",
  "educational-updates",
  "career-mentorship",
]);

const allowedTopics = new Set(ALLOWED_EMAIL_ALERT_TOPICS);

export function isEmailAlertOpportunityEligible(opportunity) {
  if (!opportunity || typeof opportunity !== "object") return false;
  const source = String(opportunity.official_source || "").trim();
  if (source) {
    try {
      const parsed = new URL(source);
      if (
        (parsed.protocol !== "https:" && parsed.protocol !== "http:") ||
        !parsed.hostname ||
        parsed.username ||
        parsed.password
      ) return false;
    } catch {
      return false;
    }
  }
  return Boolean(
    opportunity.is_published &&
    opportunity.verified &&
    opportunity.notify_on_publish
  );
}

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

 
// Extract an address only from common gateway-provided headers. The caller hashes
// the result before persistence; this helper never stores or logs the address.
export function getEmailAlertClientIp(headers) {
  const forwarded = headers.get("x-forwarded-for");
  const value = headers.get("cf-connecting-ip") || headers.get("x-real-ip") ||
    (forwarded ? forwarded.split(",").map(item => item.trim()).filter(Boolean).at(-1) : "");
  const ip = typeof value === "string" ? value.trim() : "";
  return ip && ip.length <= 128 ? ip : null;
}

export function emailAlertRateLimitPolicy(action) {
  if (action === "subscribe" || action === "consultation" || action === "service-request") {
    return Object.freeze({ limit: 5, windowSeconds: 900 });
  }
  if (action === "verify" || action === "unsubscribe") return Object.freeze({ limit: 20, windowSeconds: 900 });
  return null;
}


export const MAX_EMAIL_ALERT_DELIVERY_ATTEMPTS = 5;

export function isEmailAlertAttemptExhausted(attemptCount) {
  return Number.isFinite(attemptCount) && attemptCount >= MAX_EMAIL_ALERT_DELIVERY_ATTEMPTS;
}

export function emailAlertRetryDelayMs(attemptCount) {
  const attempt = Number.isFinite(attemptCount) ? Math.max(1, Math.floor(attemptCount)) : 1;
  return Math.min(6 * 60 * 60 * 1000, 60 * 1000 * (2 ** (attempt - 1)));
}
