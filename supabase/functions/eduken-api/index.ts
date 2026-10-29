import { createClient } from "npm:@supabase/supabase-js@2";
import { parseJsonObjectBody } from "./json-body-validation.mjs";
import { isAllowedServiceRequestStatus, isPublishedService, validateServiceRequestBody } from "./service-request-validation.mjs";
import { validateConsultationBody } from "./consultation-validation.mjs";
import { isOpportunityVerified, validateOpportunityVerification } from "./opportunity-verification-validation.mjs";
import { getNextPaymentStatus, getPaystackAuthorizationUrl, getPaystackCallbackUrl, getPaystackInitializationFailureDisposition, isPaystackTestModeEnabled, isSuccessfulPaystackTransaction, isValidPaystackWebhookSignature, matchesStoredPaystackPayment } from "./payment-validation.mjs";
import { getFlutterwaveCheckoutUrl, getFlutterwaveCallbackUrl, getNextFlutterwavePaymentStatus, isFlutterwaveModeEnabled, isSuccessfulFlutterwaveTransaction, isValidFlutterwaveWebhookSignature, matchesStoredFlutterwavePayment } from "./flutterwave-validation.mjs";
import { parseFlutterwaveVirtualAccount } from "./flutterwave-virtual-account.mjs";
import { emailAlertRateLimitPolicy, emailAlertRetryDelayMs, getEmailAlertClientIp, isEmailAlertAttemptExhausted, isEmailAlertOpportunityEligible, isWithinEmailAlertCooldown, validateEmailAlertSubscription } from "./email-alert-validation.mjs";
import { normalizeServicePrice } from "./service-price-validation.mjs";
import { normalizeContentDeadline } from "./content-deadline-validation.mjs";
import { runContentSaveSideEffects } from "./content-save-side-effects.mjs";
import { parseQuestionImportRows, validateQuestionInput, validateStatusTransition } from "./question-bank-validation.mjs";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

const url = Deno.env.get("SUPABASE_URL")!;
const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")!);
const db = createClient(url, secretKeys.default);
const ADMIN_EMAILS = new Set(["timmyjoe385@gmail.com", "edukenconsult00@gmail.com"]);
const CONTENT_TABLES = new Set(["opportunities", "admissions", "updates", "faqs", "services"]);
const DEFAULT_SYSTEM_SETTINGS = {
  subscriberNotificationsEnabled: true,
  deadlineEmailAlertsEnabled: true,
  defaultNotifyOnPublish: false,
};
type SystemSettings = typeof DEFAULT_SYSTEM_SETTINGS;

async function readSystemSettings(): Promise<SystemSettings> {
  const { data, error } = await db.from("admin_system_settings").select("settings").eq("id", "global").maybeSingle();
  // Until the settings migration is applied, preserve the existing notification behavior.
  if (error) {
    console.error("Could not read admin system settings.", error.message);
    // Preserve legacy behavior only when the migration is genuinely absent. For other
    // read failures, fail closed so a temporary database/permission error cannot
    // accidentally resume subscriber notifications or deadline email dispatch.
    const missingSettingsTable =
      error.code === "42P01" ||
      error.code === "PGRST205" ||
      /admin_system_settings.*(does not exist|schema cache)|relation .* does not exist/i.test(error.message || "");
    if (missingSettingsTable) return { ...DEFAULT_SYSTEM_SETTINGS };
    return {
      subscriberNotificationsEnabled: false,
      deadlineEmailAlertsEnabled: false,
      defaultNotifyOnPublish: false,
    };
  }
  return { ...DEFAULT_SYSTEM_SETTINGS, ...(data?.settings || {}) };
}



const pathOf = (req: Request) => {
  const pathname = new URL(req.url).pathname;
  const parts = pathname.split("/").filter(Boolean);
  const fnIndex = parts.findIndex((p) => p === "eduken-api");
  if (fnIndex >= 0) {
    const rest = parts.slice(fnIndex + 1);
    return rest.length ? "/" + rest.join("/") : "/";
  }
  if (pathname.startsWith("/functions/v1/")) {
    const rest = parts.slice(3);
    return rest.length ? "/" + rest.join("/") : "/";
  }
  return pathname || "/";
};

const tokenOf = (req: Request) => {
  const h = req.headers.get("Authorization") || "";
  return h.startsWith("Bearer ") ? h.slice(7) : "";
};

async function currentUser(req: Request) {
  const token = tokenOf(req);
  if (!token) return null;
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

async function requireUser(req: Request) {
  const user = await currentUser(req);
  if (!user) throw new Response(JSON.stringify({ error: "Authentication required." }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
  return user;
}

async function requireAdmin(req: Request) {
  const user = await requireUser(req);
  if (!user.email || !ADMIN_EMAILS.has(user.email.toLowerCase())) {
    throw new Response(JSON.stringify({ error: "Admin access required." }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
  }
  return user;
}

const slugify = (value: unknown) =>
  String(value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const toOpportunity = (x: any) => ({
  ...x,
  status: x.is_published ? "PUBLISHED" : "DRAFT",
  link: x.application_url ?? "",
  sourceUrl: x.official_source ?? "",
  content: x.content ?? "",
  eligibility: x.eligibility ?? "",
  benefits: x.benefits ?? "",
  howToApply: x.how_to_apply ?? "",
  verified: isOpportunityVerified(x),
  featured: Boolean(x.featured),
  urgent: Boolean(x.urgent),
  notifyOnPublish: Boolean(x.notify_on_publish),
});

const publicOpportunity = (x: any) => {
  const item = toOpportunity(x);
  return Object.fromEntries(
    Object.entries(item).filter(
      ([key]) => key !== "notifyOnPublish" && key !== "notify_on_publish",
    ),
  );
};

const toAdmission = (x: any) => ({
  ...x,
  title: x.title ?? x.school ?? "",
  course: x.programme ?? "",
  type: x.category ?? "",
  status: x.is_published ? "PUBLISHED" : "DRAFT",
  link: x.application_url ?? "",
  sourceUrl: x.official_source ?? "",
  details: x.description ?? "",
});

const toUpdate = (x: any) => ({
  ...x,
  body: x.content ?? "",
  date: x.created_at ?? "",
  sourceUrl: x.source_url ?? "",
});

const toService = (x: any) => ({ ...x });

async function publicContent() {
  const [a, b, c, d, e] = await Promise.all([
    db.from("opportunities").select("id, title, slug, category, description, organization, location, deadline, application_url, official_source, is_published, created_at, updated_at, verified, featured, urgent, content, eligibility, benefits, how_to_apply").eq("is_published", true).order("created_at", { ascending: false }).limit(100),
    db.from("admissions").select("id, title, slug, school, programme, category, description, deadline, application_url, official_source, is_published, created_at, updated_at, verified, featured, urgent").eq("is_published", true).order("created_at", { ascending: false }).limit(100),
    db.from("updates").select("id, title, slug, category, content, source, source_url, is_published, created_at, updated_at, verified, featured, urgent").eq("is_published", true).order("created_at", { ascending: false }).limit(100),
    db.from("faqs").select("id, question, answer, category, created_at, updated_at").eq("is_published", true).order("created_at", { ascending: false }).limit(100),
    db.from("services").select("id, name, category, description, requirements, price, is_available, is_catalog_item, is_published, created_at, updated_at").eq("is_published", true).order("created_at", { ascending: false }).limit(100),
  ]);
  const err = [a,b,c,d,e].find(x => x.error)?.error;
  if (err) throw err;
  return {
    // Keep the editorial notification preference private to the admin API.
    opportunities: (a.data ?? []).map(publicOpportunity),
    admissions: (b.data ?? []).map(toAdmission),
    updates: (c.data ?? []).map(toUpdate),
    faqs: d.data ?? [],
    services: (e.data ?? []).map(toService),
  };
}

async function scoped(table: string, userId: string) {
  const { data, error } = await db.from(table).select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(100);
  if (error) throw error;
  return data ?? [];
}

function mapAdminInput(table: string, raw: Record<string, unknown>) {
  const x = { ...raw };
  delete x.id;
  delete x.created_at;
  delete x.updated_at;

  // All content tables store publication as a database boolean. The admin UI
  // uses a readable Draft/Published status string instead.
  const toPublishedBoolean = (value: unknown) => {
    if (typeof value === "boolean") return value;
    const normalized = String(value ?? "").trim().toUpperCase();
    return normalized === "PUBLISHED" || normalized === "TRUE" || normalized === "1";
  };
  if (table !== "opportunities" && x.status !== undefined) {
    // The UI status is authoritative when editing an existing row; the raw
    // is_published value may otherwise still reflect the previous state.
    x.is_published = toPublishedBoolean(x.status);
  }

  if (table === "opportunities") {
    if (x.link !== undefined && x.application_url === undefined) x.application_url = x.link;
    if (x.sourceUrl !== undefined && x.official_source === undefined) x.official_source = x.sourceUrl;
    if (x.notifyOnPublish !== undefined && x.notify_on_publish === undefined) x.notify_on_publish = x.notifyOnPublish;
    if (x.howToApply !== undefined && x.how_to_apply === undefined) x.how_to_apply = x.howToApply;
    if (x.status !== undefined && x.is_published === undefined) x.is_published = toPublishedBoolean(x.status);
    delete x.link; delete x.sourceUrl; delete x.notifyOnPublish; delete x.status; delete x.howToApply;
    if (!x.slug && x.title) x.slug = slugify(x.title) + "-" + Date.now().toString(36);
    if (x.slug) x.slug = slugify(x.slug);
  }
  if (table === "admissions") {
    if (x.course !== undefined && x.programme === undefined) x.programme = x.course;
    if (x.type !== undefined && x.category === undefined) x.category = x.type;
    if (x.details !== undefined && x.description === undefined) x.description = x.details;
    if (x.link !== undefined && x.application_url === undefined) x.application_url = x.link;
    if (x.sourceUrl !== undefined && x.official_source === undefined) x.official_source = x.sourceUrl;
    if (x.notifyOnPublish !== undefined && x.notify_on_publish === undefined) x.notify_on_publish = x.notifyOnPublish;
    if (x.title === undefined && x.school !== undefined) x.title = x.school;
    if (x.slug) x.slug = slugify(x.slug);
    else if (!x.slug && x.title) x.slug = slugify(x.title) + "-" + Date.now().toString(36);
    delete x.course; delete x.type; delete x.details; delete x.link; delete x.sourceUrl; delete x.notifyOnPublish; delete x.status;
  }
  if (table === "updates") {
    if (x.body !== undefined && x.content === undefined) x.content = x.body;
    if (x.sourceUrl !== undefined && x.source_url === undefined) x.source_url = x.sourceUrl;
    if (x.notifyOnPublish !== undefined && x.notify_on_publish === undefined) x.notify_on_publish = x.notifyOnPublish;
    if (x.title && !x.slug) x.slug = slugify(x.title) + "-" + Date.now().toString(36);
    if (x.slug) x.slug = slugify(x.slug);
    delete x.body; delete x.sourceUrl; delete x.notifyOnPublish; delete x.date;
  }
  // status is a UI-only field for every non-opportunity content table.
  delete x.status;
  return x;
}


/**
 * Convert editorial deadline text into the date-only format required by Postgres.
 * Accepts ISO dates and common human-readable dates (including ordinal suffixes
 * and notes such as "(tomorrow)"). Empty optional deadlines are stored as NULL.
 */

async function notifyOpportunitySubscribers(opportunity: Record<string, any>) {
  if (!opportunity.notify_on_publish || !opportunity.is_published) return;
  const systemSettings = await readSystemSettings();
  if (!systemSettings.subscriberNotificationsEnabled) return;
  const category = String(opportunity.category || "").trim().toLowerCase();
  const { data: subscriptions, error } = await db.from("topic_subscriptions").select("user_id,topic");
  if (error) throw error;
  const recipients = new Set<string>();
  for (const subscription of subscriptions ?? []) {
    const topic = String(subscription.topic || "").trim().toLowerCase();
    if (topic === "opportunities" || topic === "all opportunities" || (category && topic === category)) recipients.add(subscription.user_id);
  }
  if (!recipients.size) return;
  const title = String(opportunity.title || "New EDUKEN opportunity").slice(0, 180);
  const body = [category ? "Category: " + category : "", opportunity.deadline ? "Deadline: " + opportunity.deadline : "", opportunity.slug ? "Open EDUKEN CONSULT to view details." : ""].filter(Boolean).join(" · ").slice(0, 500);
  const rows = [...recipients].map(user_id => ({ user_id, title, body, read: false }));
  const { error: insertError } = await db.from("notifications").insert(rows);
  if (insertError) throw insertError;
}

async function notifyEditorialSubscribers(table: "admissions" | "updates", item: Record<string, any>) {
  if (!item.notify_on_publish || !item.is_published) return;
  const category = String(item.category || "").trim().toLowerCase();
  const topicAliases = table === "admissions"
    ? new Set(["admissions", "all admissions", "admission updates"])
    : new Set(["updates", "all updates", "educational updates", "educational-updates"]);
  const { data: subscriptions, error } = await db.from("topic_subscriptions").select("user_id,topic");
  if (error) throw error;
  const recipients = new Set<string>();
  for (const subscription of subscriptions ?? []) {
    const topic = String(subscription.topic || "").trim().toLowerCase();
    if (topicAliases.has(topic) || (category && topic === category)) recipients.add(subscription.user_id);
  }
  if (!recipients.size) return;
  const title = String(item.title || item.school || (table === "admissions" ? "New admission update" : "New EDUKEN update")).slice(0, 180);
  const body = [
    category ? "Category: " + category : "",
    item.deadline ? "Deadline: " + item.deadline : "",
    item.slug ? "Open EDUKEN CONSULT to view details." : "",
  ].filter(Boolean).join(" · ").slice(0, 500);
  const rows = [...recipients].map(user_id => ({ user_id, title, body, read: false }));
  const { error: insertError } = await db.from("notifications").insert(rows);
  if (insertError) throw insertError;
}

async function adminList(table: string) {
  if (!CONTENT_TABLES.has(table)) throw new Error("Unknown content type.");
  const { data, error } = await db.from(table).select("*").order("created_at", { ascending: false }).limit(100);
  if (error) throw error;
  return data ?? [];
}

async function aiAnswer(question: string) {
  const [o, a, u] = await Promise.all([
    db.from("opportunities").select("title,category,description,organization,location,deadline,application_url,official_source,created_at").eq("is_published", true).limit(40),
    db.from("admissions").select("title,school,programme,category,description,deadline,application_url,official_source,created_at").eq("is_published", true).limit(30),
    db.from("updates").select("title,category,content,source,source_url,created_at").eq("is_published", true).limit(30),
  ]);
  const context = JSON.stringify({ opportunities: o.data ?? [], admissions: a.data ?? [], updates: u.data ?? [] });
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) {
    return "I can help explain information already published by EDUKEN CONSULT, but live AI research is being connected. For current facts, please verify the official source shown on the opportunity or update.";
  }
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key },
    body: JSON.stringify({
      model: Deno.env.get("OPENAI_MODEL") || "gpt-5",
      tools: [{ type: "web_search_preview" }],
      input: [
        { role: "system", content: "You are Ask EDUKEN, an educational research and verification assistant. Give concise, useful answers. Prefer official Nigerian institutions, government agencies, universities and original opportunity providers. Never invent admission requirements, deadlines, fees, scholarships, jobs or outcomes. Clearly separate EDUKEN database facts from fresh web findings and include source links when available. Tell users to verify before paying or submitting personal information." },
        { role: "user", content: "Question: " + question + "\n\nCurrent EDUKEN database context:\n" + context }
      ]
    })
  });
  if (!response.ok) throw new Error("AI provider error.");
  const data = await response.json();
  return data.output_text || "I could not find a confident answer. Please verify the official source.";
}


const EMAIL_ALERT_TOPICS = new Set([
  "admissions",
  "scholarships-grants",
  "jobs-internships",
  "remote-opportunities",
  "educational-updates",
  "career-mentorship",
]);

function opportunityAlertTopic(opportunity: Record<string, any>) {
  const category = String(opportunity.category || "").trim().toLowerCase();
  if (/admission|jamb|post.?utme|school application/.test(category)) return "admissions";
  if (/scholarship|grant|fellowship|bursary/.test(category)) return "scholarships-grants";
  if (/job|internship|graduate trainee|employment/.test(category)) return "jobs-internships";
  if (/remote|work.?from.?home|freelance/.test(category)) return "remote-opportunities";
  if (/career|mentorship|professional development/.test(category)) return "career-mentorship";
  if (/education|educational|exam|result|policy|school update/.test(category)) return "educational-updates";
  return null;
}

function safeHttpUrl(value: unknown) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function escapeEmailHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char] || char);
}



function secureRandomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

function emailAlertConfiguration() {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("EMAIL_FROM");
  const site = Deno.env.get("PUBLIC_SITE_URL");
  const tokenSecret = Deno.env.get("EMAIL_ALERTS_TOKEN_SECRET");
  if (!apiKey || !from || !site || !tokenSecret || tokenSecret.length < 32) return null;
  let siteUrl: URL;
  try {
    siteUrl = new URL(site);
  } catch {
    return null;
  }
  // Require a clean HTTPS origin; path/query/hash values could otherwise leak into
  // generated links or create unsafe HTML attribute content.
  if (siteUrl.protocol !== "https:" || siteUrl.username || siteUrl.password ||
      siteUrl.pathname !== "/" || siteUrl.search || siteUrl.hash) return null;
  return { apiKey, from, siteUrl, tokenSecret };
}

async function deriveUnsubscribeToken(subscriptionId: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode("eduken-email-alert-unsubscribe:" + subscriptionId));
  return Array.from(new Uint8Array(signature), byte => byte.toString(16).padStart(2, "0")).join("");
}

async function enqueueOpportunityEmailAlerts(
  opportunity: Record<string, any>,
  options: { queueNew: boolean; rescheduleDeadlines: boolean },
) {
  const systemSettings = await readSystemSettings();
  // Preserve queued deliveries while alerts are paused so they can resume when re-enabled.
  if (!systemSettings.deadlineEmailAlertsEnabled) return;
  const eligible = isEmailAlertOpportunityEligible(opportunity);
  if (!eligible) {
    const { error: cancelError } = await db.from("email_alert_deliveries")
      .update({ status: "cancelled" })
      .eq("opportunity_id", opportunity.id)
      .eq("status", "pending");
    if (cancelError) throw cancelError;
    return;
  }

  const topic = opportunityAlertTopic(opportunity);
  if (!topic || !EMAIL_ALERT_TOPICS.has(topic)) {
    await db.from("email_alert_deliveries")
      .update({ status: "cancelled" })
      .eq("opportunity_id", opportunity.id)
      .eq("status", "pending");
    return;
  }
  const { data: subscriptions, error } = await db.from("email_alert_subscriptions")
    .select("id,topics")
    .eq("is_active", true)
    .not("verified_at", "is", null);
  if (error) throw error;
  const recipients = (subscriptions ?? []).filter((subscription: any) =>
    Array.isArray(subscription.topics) && subscription.topics.includes(topic)
  );
  const now = new Date();
  const rows: Record<string, any>[] = [];
  for (const subscription of recipients) {
    if (options.queueNew) {
      const { error: requeueError } = await db.from("email_alert_deliveries")
        .update({ status: "pending", scheduled_for: now.toISOString(), attempt_count: 0, last_error: null })
        .eq("subscription_id", subscription.id)
        .eq("opportunity_id", opportunity.id)
        .eq("event_type", "new_opportunity")
        .eq("status", "cancelled");
      if (requeueError) throw requeueError;
      rows.push({
        subscription_id: subscription.id,
        opportunity_id: opportunity.id,
        event_type: "new_opportunity",
        scheduled_for: now.toISOString(),
        status: "pending",
      });
    }
  }

  if (options.rescheduleDeadlines) {
    const { error: cancelDeadlineError } = await db.from("email_alert_deliveries")
      .update({ status: "cancelled" })
      .eq("opportunity_id", opportunity.id)
      .in("event_type", ["deadline_7d", "deadline_3d", "deadline_1d"])
      .eq("status", "pending");
    if (cancelDeadlineError) throw cancelDeadlineError;

    const deadlineMs = opportunity.deadline ? new Date(String(opportunity.deadline)).getTime() : NaN;
    if (Number.isFinite(deadlineMs) && deadlineMs > now.getTime()) {
      for (const subscription of recipients) {
        for (const days of [7, 3, 1]) {
          const scheduledMs = deadlineMs - days * 24 * 60 * 60 * 1000;
          // Never send a "7 days left" reminder after that seven-day point has passed.
          if (scheduledMs < now.getTime() || scheduledMs >= deadlineMs) continue;
          const eventType = "deadline_" + days + "d";
          const { error: requeueDeadlineError } = await db.from("email_alert_deliveries")
            .update({ status: "pending", scheduled_for: new Date(scheduledMs).toISOString(), attempt_count: 0, last_error: null })
            .eq("subscription_id", subscription.id)
            .eq("opportunity_id", opportunity.id)
            .eq("event_type", eventType)
            .eq("status", "cancelled");
          if (requeueDeadlineError) throw requeueDeadlineError;
          rows.push({
            subscription_id: subscription.id,
            opportunity_id: opportunity.id,
            event_type: eventType,
            scheduled_for: new Date(scheduledMs).toISOString(),
            status: "pending",
          });
        }
      }
    }
  }

  if (rows.length) {
    const { error: insertError } = await db.from("email_alert_deliveries")
      .upsert(rows, { onConflict: "subscription_id,opportunity_id,event_type", ignoreDuplicates: true });
    if (insertError) throw insertError;
  }
}

async function updateEmailAlertDelivery(deliveryId: string, values: Record<string, unknown>) {
  const { error } = await db.from("email_alert_deliveries").update(values).eq("id", deliveryId);
  if (error) throw error;
}

async function sendEmailAlertMessage(
  config: { apiKey: string; from: string },
  to: string,
  subject: string,
  textBody: string,
  htmlBody: string,
  idempotencyKey?: string,
) {
  const headers: Record<string, string> = {
    "Authorization": "Bearer " + config.apiKey,
    "Content-Type": "application/json",
  };
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers,
    body: JSON.stringify({ from: config.from, to: [to], subject, text: textBody, html: htmlBody }),
  });
  if (!response.ok) {
    // Record only the HTTP status and a constrained provider error code; never store
    // provider messages, email addresses, or other potentially sensitive response data.
    let providerCode = "";
    let providerReason = "";
    try {
      const payload = await response.clone().json();
      const candidate = payload?.name ?? payload?.code;
      if (typeof candidate === "string" && /^[A-Za-z0-9_.-]{1,48}$/.test(candidate)) {
        providerCode = "; provider_code=" + candidate;
      }
      // Keep only allow-listed diagnostic categories; never persist raw provider text,
      // which can contain recipient addresses or other sensitive details.
      const message = typeof payload?.message === "string" ? payload.message.toLowerCase() : "";
      if (message.includes("only send testing emails to your own email address")) {
        providerReason = "; provider_reason=testing_recipient_restriction";
      } else if (message.includes("domain") && message.includes("not verified")) {
        providerReason = "; provider_reason=sender_domain_unverified";
      } else if (message.includes("api key") && (message.includes("invalid") || message.includes("missing"))) {
        providerReason = "; provider_reason=api_key_invalid_or_missing";
      }
    } catch {
      // Some provider failures return non-JSON bodies; the HTTP status is still useful.
    }
    throw new Error("Transactional email provider rejected the message (HTTP " + response.status + providerCode + providerReason + ").");
  }
  const result = await response.json();
  return typeof result.id === "string" ? result.id : null;
}

async function paymentNotificationIdempotencyKey(
  reference: string,
  kind: "deposit" | "service_payment" | "refund",
  role: string,
  recipient: string,
) {
  // Hash the full identity so each recipient has an independent, bounded-length key.
  const identity = [reference, kind, role, recipient.trim().toLowerCase()].join("\\0");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(identity));
  const suffix = Array.from(new Uint8Array(digest)).slice(0, 16)
    .map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return "eduken-payment-" + suffix;
}

async function deliverPendingPaymentNotifications(
  reference: string,
  kind?: "deposit" | "service_payment" | "refund",
) {
  if (!reference) return;
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("EMAIL_FROM");
  if (!apiKey || !from) {
    console.error("Payment notification delivery is pending because email configuration is unavailable.");
    return;
  }
  let pendingQuery = db
    .from("payment_notification_deliveries")
    .select("id, recipient_email, notification_kind, idempotency_key, subject, text_body, attempt_count")
    .eq("payment_reference", reference)
    .eq("status", "pending")
    .lt("attempt_count", 9); // Three attempts per invocation, capped at nine total; exhausted rows remain pending for manual recovery.
  if (kind) pendingQuery = pendingQuery.eq("notification_kind", kind);
  const { data: pending, error: lookupError } = await pendingQuery
    .order("created_at", { ascending: true })
    .limit(10);
  if (lookupError) {
    // Do not fall back to untracked sends: that could create duplicates on a later retry.
    console.error("Could not load durable payment notification queue.", lookupError.message);
    return;
  }
  for (const item of pending ?? []) {
    const html = "<p>" + String(item.text_body || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>") + "</p>";
    let delivered = false;
    let permanentFailure = false;
    let lastError = "Notification delivery did not complete.";
    const attemptsAlreadyUsed = Math.max(0, Number(item.attempt_count || 0));
    const attemptsRemaining = Math.max(0, 9 - attemptsAlreadyUsed);
    const attemptsThisInvocation = Math.min(3, attemptsRemaining);
    for (let attempt = 1; attempt <= attemptsThisInvocation; attempt++) {
      // Compare-and-swap the attempt counter before contacting the provider.
      // Concurrent workers that read the same count cannot both claim this attempt.
      const { data: claimedAttempt, error: attemptUpdateError } = await db.from("payment_notification_deliveries")
        .update({ attempt_count: attemptsAlreadyUsed + attempt, last_error: null, updated_at: new Date().toISOString() })
        .eq("id", item.id).eq("status", "pending")
        .eq("attempt_count", attemptsAlreadyUsed + attempt - 1)
        .lt("attempt_count", 9)
        .select("id").maybeSingle();
      if (attemptUpdateError) {
        lastError = "Could not persist delivery attempt.";
        console.error("Could not update payment notification attempt.", attemptUpdateError.message);
        break;
      }
      if (!claimedAttempt) {
        // Another worker advanced this row first. Do not send from a stale read.
        delivered = true;
        break;
      }
      try {
        const messageId = await sendEmailAlertMessage(
          { apiKey, from },
          item.recipient_email,
          item.subject,
          item.text_body,
          html,
          item.idempotency_key,
        );
        if (!messageId) throw new Error("Transactional email provider returned no message ID.");
        const { error: deliveredUpdateError } = await db.from("payment_notification_deliveries")
          .update({ status: "delivered", provider_message_id: messageId, delivered_at: new Date().toISOString(), updated_at: new Date().toISOString(), last_error: null })
          .eq("id", item.id).eq("status", "pending");
        if (deliveredUpdateError) {
          // Provider idempotency key is retained so a later retry can safely reconcile this result.
          console.error("Provider accepted a payment notification but delivery state update failed.", deliveredUpdateError.message);
        }
        delivered = true;
        break;
      } catch (error) {
        lastError = error instanceof Error ? error.message : "Unknown email error.";
        const statusMatch = lastError.match(/\(HTTP (\d{3})/);
        const providerStatus = statusMatch ? Number(statusMatch[1]) : 0;
        // A permanent 4xx (for example an unverified sender/recipient restriction)
        // cannot be fixed by retrying. Keep 429 retryable; require configuration repair
        // and an explicit requeue for other 4xx failures.
        if (providerStatus >= 400 && providerStatus < 500 && providerStatus !== 429) {
          permanentFailure = true;
          break;
        }
        if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 500));
      }
    }
    if (!delivered) {
      const { error: failureUpdateError } = await db.from("payment_notification_deliveries")
        .update({ status: permanentFailure ? "failed" : "pending", last_error: lastError.slice(0, 240), updated_at: new Date().toISOString() })
        .eq("id", item.id).eq("status", "pending");
      if (failureUpdateError) console.error("Could not persist payment notification failure.", failureUpdateError.message);
      console.error("Payment notification remains queued after bounded retries.");
    }
  }
}

async function sendPaymentNotifications(
  userId: string | null,
  reference: string,
  amount: number,
  kind: "deposit" | "service_payment" | "refund",
  customerEmailOverride?: string | null,
) {
  if (!reference || !Number.isFinite(amount) || amount <= 0) {
    console.error("Payment notification could not be queued because payment data is unavailable.");
    return;
  }
  let customerEmail = typeof customerEmailOverride === "string" ? customerEmailOverride.trim() : "";
  if (userId) {
    try {
      const { data: authUser, error: userError } = await db.auth.admin.getUserById(userId);
      if (!userError && authUser?.user?.email) customerEmail = authUser.user.email;
    } catch {
      console.error("Payment notification could not resolve the customer account email.");
    }
  }
  const isDeposit = kind === "deposit";
  const isRefund = kind === "refund";
  const amountText = "₦" + amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const customerSubject = isDeposit ? "EDUKEN wallet deposit confirmed" : isRefund ? "EDUKEN wallet refund credited" : "EDUKEN service payment confirmed";
  const adminSubject = isDeposit ? "EDUKEN wallet deposit received" : isRefund ? "EDUKEN wallet refund processed" : "EDUKEN service payment received";
  const customerText = isDeposit
    ? "Your EDUKEN wallet deposit of " + amountText + " has been verified and credited. Reference: " + reference + ". Sign in to view your updated balance and transaction history."
    : isRefund
      ? "A wallet refund of " + amountText + " has been credited to your EDUKEN wallet. Reference: " + reference + ". Sign in to view your transaction history."
      : "Your EDUKEN service payment of " + amountText + " has been confirmed. Reference: " + reference + ". Keep this reference for follow-up.";
  const adminText = (isDeposit ? "A customer wallet deposit was verified." : isRefund ? "A wallet refund was credited to a customer." : "A customer service payment was confirmed.")
    + "\nAmount: " + amountText + "\nReference: " + reference + "\nCustomer account: " + (userId || "guest checkout");
  const messages = [
    ...(customerEmail ? [{ role: "customer", to: customerEmail, subject: customerSubject, text: customerText }] : []),
    ...Array.from(ADMIN_EMAILS).map(to => ({ role: "admin", to, subject: adminSubject, text: adminText })),
  ];
  for (const message of messages) {
    const idempotencyKey = await paymentNotificationIdempotencyKey(reference, kind, message.role, message.to);
    const { error: queueError } = await db.from("payment_notification_deliveries").upsert({
      payment_reference: reference,
      notification_kind: kind,
      recipient_role: message.role,
      recipient_email: message.to,
      idempotency_key: idempotencyKey,
      subject: message.subject,
      text_body: message.text,
      status: "pending",
      attempt_count: 0,
    }, { onConflict: "idempotency_key", ignoreDuplicates: true });
    if (queueError) {
      console.error("Payment notification was not sent because durable queue persistence failed.", queueError.message);
      return;
    }
  }
  await deliverPendingPaymentNotifications(reference, kind);
}

async function sendServicePaymentNotifications(payment: {
  user_id?: string | null;
  service_request_id?: string | null;
  payment_reference?: string | null;
  amount: number | string;
}) {
  let userId = payment.user_id || null;
  let customerEmail: string | null = null;
  if (payment.service_request_id) {
    try {
      const { data: request, error } = await db.from("service_requests")
        .select("user_id,email").eq("id", payment.service_request_id).maybeSingle();
      if (!error && request) {
        userId = userId || request.user_id || null;
        customerEmail = request.email || null;
      }
    } catch {
      console.error("Service payment receipt could not load the service request contact.");
    }
  }
  await sendPaymentNotifications(
    userId,
    String(payment.payment_reference || ""),
    Number(payment.amount),
    "service_payment",
    customerEmail,
  );
}

async function consumeEmailAlertRateLimit(req: Request, action: "subscribe" | "verify" | "unsubscribe" | "consultation" | "service-request" | "guest-payment-initialize" | "guest-payment-verify" | "guest-payment-recovery" | "wallet-deposit-initialize" | "wallet-deposit-verify" | "wallet-transfer-initialize") {
  const ip = getEmailAlertClientIp(req.headers);
  if (!ip) return null;
  const policy = emailAlertRateLimitPolicy(action);
  if (!policy) return null;
  // Persist only a one-way hash of the action and client IP.
  const keyHash = await sha256Hex("eduken-email-alert-rate-limit:" + action + ":" + ip);
  const { data, error } = await db.rpc("consume_email_alert_rate_limit", {
    p_key_hash: keyHash,
    p_limit: policy.limit,
    p_window_seconds: policy.windowSeconds,
  });
  if (error) throw new Error("Email alert rate limiting is unavailable.");
  return data === true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const path = pathOf(req);
  try {
    if (req.method === "GET" && path === "/health") return json({ ok: true, service: "EDUKEN CONSULT API", version: 4 });

    if (path === "/api/internal/payment-notifications/process" && req.method === "POST") {
      const cronSecret = Deno.env.get("PAYMENT_NOTIFICATIONS_CRON_SECRET");
      if (!cronSecret || cronSecret.length < 32) {
        return json({ error: "Payment notification processing is not configured." }, 503);
      }
      if (req.headers.get("Authorization") !== "Bearer " + cronSecret) {
        return json({ error: "Unauthorized." }, 401);
      }
      if (!Deno.env.get("RESEND_API_KEY") || !Deno.env.get("EMAIL_FROM")) {
        return json({ error: "Transactional email delivery is not configured." }, 503);
      }
      const { data: pendingRows, error: pendingError } = await db
        .from("payment_notification_deliveries")
        .select("payment_reference,notification_kind")
        .eq("status", "pending")
        .lt("attempt_count", 9) // Do not let exhausted rows starve retryable notifications.
        .order("created_at", { ascending: true })
        .limit(25);
      if (pendingError) throw pendingError;
      const batch = new Map<string, { reference: string; kind: "deposit" | "service_payment" | "refund" }>();
      for (const row of pendingRows ?? []) {
        if (!row.payment_reference || !["deposit", "service_payment", "refund"].includes(row.notification_kind)) continue;
        const reference = String(row.payment_reference);
        const kind = row.notification_kind as "deposit" | "service_payment" | "refund";
        const key = reference + "\\0" + kind;
        if (!batch.has(key) && batch.size < 3) batch.set(key, { reference, kind });
      }
      let attemptedGroups = 0;
      for (const { reference, kind } of batch.values()) {
        await deliverPendingPaymentNotifications(reference, kind);
        attemptedGroups++;
      }
      const { count: remaining, error: remainingError } = await db
        .from("payment_notification_deliveries")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");
      if (remainingError) throw remainingError;
      return json({ ok: true, groups_attempted: attemptedGroups, pending_remaining: remaining ?? 0 });
    }

    if (path === "/api/flutterwave/payments/webhook" && req.method === "POST") {
      const secret = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
      const webhookHash = Deno.env.get("FLUTTERWAVE_WEBHOOK_HASH");
      if (!isFlutterwaveModeEnabled(Deno.env.get("FLUTTERWAVE_MODE"), secret) || !webhookHash) {
        return json({ error: "Flutterwave webhook is not configured for the selected mode.", code: "FLUTTERWAVE_MODE_OR_KEY_MISMATCH" }, 503);
      }
      const providedHash = req.headers.get("verif-hash") || "";
      if (!isValidFlutterwaveWebhookSignature(providedHash, webhookHash)) {
        return json({ error: "Invalid payment provider signature." }, 401);
      }
      let event: any;
      try { event = await req.json(); } catch { return json({ error: "Invalid webhook payload." }, 400); }
      const eventName = String(event?.event || "").trim().toLowerCase();
      if (!["charge.completed", "charge.success"].includes(eventName)) return json({ ok: true, ignored: true });
      const transactionId = event?.data?.id;
      if (!(typeof transactionId === "string" || (typeof transactionId === "number" && Number.isFinite(transactionId)))) {
        return json({ error: "Invalid Flutterwave transaction identifier." }, 400);
      }
      let verificationResponse: Response;
      try {
        verificationResponse = await fetch("https://api.flutterwave.com/v3/transactions/" + encodeURIComponent(String(transactionId)) + "/verify", {
          headers: { "Authorization": "Bearer " + secret, "Content-Type": "application/json" },
        });
      } catch {
        return json({ error: "Flutterwave transaction verification is temporarily unavailable." }, 502);
      }
      let verification: any;
      try { verification = await verificationResponse.json(); } catch { return json({ error: "Flutterwave returned an unreadable verification response." }, 502); }
      if (!verificationResponse.ok || verification?.status !== "success" || !verification?.data) {
        return json({ error: "Unable to verify the Flutterwave transaction." }, 502);
      }
      const transaction = verification.data;
      const reference = typeof transaction?.tx_ref === "string" ? transaction.tx_ref : "";
      if (!/^EDK-PAY-[A-Z0-9]{18}$/.test(reference) || !isSuccessfulFlutterwaveTransaction(transaction)) {
        return json({ error: "Invalid successful Flutterwave payment event." }, 400);
      }
      const { data: existingPayment, error: lookupError } = await db.from("payments")
        .select("id,amount,currency,status,service_request_id,payment_reference,payment_type,payment_provider,user_id")
        .eq("payment_reference", reference).eq("payment_provider", "flutterwave").maybeSingle();
      if (lookupError) throw lookupError;
      if (!existingPayment) return json({ ok: true, ignored: true });
      if (!matchesStoredFlutterwavePayment(transaction, {
        amount: existingPayment.amount, currency: existingPayment.currency, reference,
      })) {
        return json({ error: "Provider payment details do not match the stored payment." }, 409);
      }
      if (existingPayment.payment_type === "wallet_deposit") {
        const { data: walletSettlement, error: walletSettlementError } = await db.rpc("settle_customer_wallet_deposit", {
          p_payment_id: existingPayment.id,
          p_reference: reference,
        });
        if (walletSettlementError) throw walletSettlementError;
        await sendPaymentNotifications(existingPayment.user_id, reference, Number(existingPayment.amount), "deposit");
        return json({ ok: true, paid: true, wallet: walletSettlement });
      }
      if (existingPayment.status === "Paid") {
        if (existingPayment.service_request_id) {
          const { error: requestUpdateError } = await db.from("service_requests").update({ status: "Paid" })
            .eq("id", existingPayment.service_request_id);
          if (requestUpdateError) throw requestUpdateError;
          await sendServicePaymentNotifications(existingPayment);
        }
        return json({ ok: true, paid: true, reused: true });
      }
      const { data: payment, error: updateError } = await db.from("payments").update({
        status: "Paid", paid_at: new Date().toISOString(),
      }).eq("id", existingPayment.id).eq("payment_provider", "flutterwave")
        .in("status", ["Pending", "Failed"]).select("id,status,service_request_id").maybeSingle();
      if (updateError) throw updateError;
      if (!payment) {
        const { data: currentPayment, error: currentError } = await db.from("payments")
          .select("status,service_request_id").eq("id", existingPayment.id).maybeSingle();
        if (currentError) throw currentError;
        if (currentPayment?.status !== "Paid") return json({ error: "Payment status changed concurrently." }, 409);
      }
      if (existingPayment.service_request_id) {
        const { error: requestUpdateError } = await db.from("service_requests").update({ status: "Paid" })
          .eq("id", existingPayment.service_request_id);
        if (requestUpdateError) throw requestUpdateError;
        await sendServicePaymentNotifications(existingPayment);
      }
      return json({ ok: true, paid: true, reused: !payment });
    }

    if (path === "/api/payments/webhook" && req.method === "POST") {
      const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
      if (!isPaystackTestModeEnabled(Deno.env.get("PAYSTACK_MODE"), secret)) return json({ error: "Paystack is disabled unless PAYSTACK_MODE=test and a sk_test_ key is configured.", code: "PAYSTACK_TEST_MODE_REQUIRED" }, 503);
      const signature = req.headers.get("x-paystack-signature") || "";
      const rawBody = await req.text();
      if (!await isValidPaystackWebhookSignature(rawBody, signature, secret)) {
        return json({ error: "Invalid payment provider signature." }, 401);
      }
      let event: any;
      try { event = JSON.parse(rawBody); } catch { return json({ error: "Invalid webhook payload." }, 400); }
      if (event?.event !== "charge.success") return json({ ok: true, ignored: true });
      const transaction = event?.data;
      const reference = typeof transaction?.reference === "string" ? transaction.reference : "";
      if (!/^EDK-PAY-[A-Z0-9]{18}$/.test(reference) || !isSuccessfulPaystackTransaction(transaction)) {
        return json({ error: "Invalid successful payment event." }, 400);
      }
      const { data: existingPayment, error: lookupError } = await db.from("payments")
        .select("id,amount,currency,status,service_request_id,payment_reference,payment_type,user_id")
        .eq("payment_reference", reference).eq("payment_provider", "paystack").maybeSingle();
      if (lookupError) throw lookupError;
      if (!existingPayment) return json({ ok: true, ignored: true });
      if (!matchesStoredPaystackPayment(transaction, {
        amount: existingPayment.amount, currency: existingPayment.currency, reference,
      })) {
        return json({ error: "Provider payment details do not match the stored payment." }, 409);
      }
      if (existingPayment.payment_type === "wallet_deposit") {
        const { data: walletSettlement, error: walletSettlementError } = await db.rpc("settle_customer_wallet_deposit", {
          p_payment_id: existingPayment.id,
          p_reference: reference,
        });
        if (walletSettlementError) throw walletSettlementError;
        // Re-enqueue missing rows safely: existing delivered rows are preserved by idempotent upsert.
        await sendPaymentNotifications(existingPayment.user_id, reference, Number(existingPayment.amount), "deposit");
        return json({ ok: true, paid: true, wallet: walletSettlement });
      }
      if (existingPayment.status === "Paid") {
        // Rebuild any missing outbox rows safely; delivered idempotency keys are not reset.
        await sendServicePaymentNotifications(existingPayment);
        // A duplicate provider event may repair request state without duplicating delivered receipts.
        if (existingPayment.service_request_id) {
          const { error: requestUpdateError } = await db.from("service_requests").update({ status: "Paid" })
            .eq("id", existingPayment.service_request_id);
          if (requestUpdateError) throw requestUpdateError;
        }
        return json({ ok: true, paid: true, reused: true });
      }
      const { data: payment, error: updateError } = await db.from("payments").update({
        status: "Paid", paid_at: new Date().toISOString(),
      }).eq("id", existingPayment.id).in("status", ["Pending", "Failed"]).select("id,status,service_request_id").maybeSingle();
      if (updateError) throw updateError;
      if (!payment) {
        const { data: currentPayment, error: currentError } = await db.from("payments")
          .select("status,service_request_id").eq("id", existingPayment.id).maybeSingle();
        if (currentError) throw currentError;
        if (currentPayment?.status !== "Paid") return json({ error: "Payment status changed concurrently." }, 409);
      }
      if (existingPayment.service_request_id) {
        const { error: requestUpdateError } = await db.from("service_requests").update({ status: "Paid" })
          .eq("id", existingPayment.service_request_id);
        if (requestUpdateError) throw requestUpdateError;
        // Queueing is idempotent, so retries can recover missing receipts without duplicating delivered notices.
        await sendServicePaymentNotifications(existingPayment);
      }
      return json({ ok: true, paid: true, reused: !payment });
    }

    if (req.method === "GET" && (path === "/public-content" || path === "/api/public-content")) return json(await publicContent());

    if (req.method === "POST" && (path === "/consultations" || path === "/api/consultations")) {
      let rateAllowed: boolean | null;
      try { rateAllowed = await consumeEmailAlertRateLimit(req, "consultation"); } catch { return json({ error: "Consultations are temporarily unavailable." }, 503); }
      if (rateAllowed === null) return json({ error: "Consultations are temporarily unavailable." }, 503);
      if (!rateAllowed) return json({ error: "Too many consultation requests. Please try again in 15 minutes." }, 429);
      let body: unknown;
      try { body = await req.json(); } catch { return json({ error: "A valid JSON request body is required." }, 400); }
      const validation = validateConsultationBody(body);
      if (validation.error || !validation.data) return json({ error: validation.error || "Invalid consultation request." }, 400);
      const b = validation.data;
      const { data, error } = await db.from("consultations").insert({
        name: b.name, whatsapp: b.whatsapp, email: b.email || null, state: b.state || null,
        education_level: b.educationLevel || null, interest: b.interest || null,
        school_course: b.schoolCourse || null, message: b.message, status: "New"
      }).select("id").single();
      if (error) throw error;
      return json({ id: data.id, message: "Consultation request received." }, 201);
    }

    if (path === "/api/me" && req.method === "GET") {
      const user = await requireUser(req);
      const { data: profile } = await db.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return json({ user: { userId: user.id, email: user.email }, profile });
    }

    if (path === "/api/me" && req.method === "PUT") {
      const user = await requireUser(req); const b = await req.json();
      const { data, error } = await db.from("profiles").upsert({
        id: user.id, display_name: String(b.displayName || "").slice(0,80), email: user.email || null
      }).select().single();
      if (error) throw error;
      return json({ profile: data });
    }

    const savedMatch = path.match(/^\/api\/user\/saved(?:\/([^/]+))?$/);
    if (savedMatch) {
      const user = await requireUser(req);
      if (req.method === "GET") return json({ items: await scoped("saved_opportunities", user.id) });
      if (req.method === "POST") {
        const b = await req.json();
        const { data: existing } = await db.from("saved_opportunities").select("id").eq("user_id", user.id).eq("opportunity_id", b.opportunityId).maybeSingle();
        if (existing) return json({ ok: true });
        const { data, error } = await db.from("saved_opportunities").insert({ user_id: user.id, opportunity_id: b.opportunityId, title: String(b.title || ""), slug: b.slug || null }).select().single();
        if (error) throw error;
        return json({ id: data.id }, 201);
      }
      if (req.method === "DELETE" && savedMatch[1]) {
        const { error } = await db.from("saved_opportunities").delete().eq("user_id", user.id).eq("opportunity_id", savedMatch[1]);
        if (error) throw error;
        return json({ ok: true });
      }
    }

    const trackerMatch = path.match(/^\/api\/user\/tracker(?:\/([^/]+))?$/);
    if (trackerMatch) {
      const user = await requireUser(req);
      if (req.method === "GET") return json({ items: await scoped("application_tracker", user.id) });
      if (req.method === "POST") {
        const b = await req.json();
        const { data: existing } = await db.from("application_tracker").select("id").eq("user_id", user.id).eq("opportunity_id", b.opportunityId).maybeSingle();
        if (existing) return json({ ok: true });
        const { data, error } = await db.from("application_tracker").insert({
          user_id: user.id, opportunity_id: b.opportunityId || null, title: String(b.title || ""), slug: b.slug || null,
          status: b.status || "Planning to Apply", deadline: b.deadline || null, notes: b.notes || ""
        }).select().single();
        if (error) throw error;
        return json({ id: data.id }, 201);
      }
      if (req.method === "PUT" && trackerMatch[1]) {
        const b = await req.json();
        const { data, error } = await db.from("application_tracker").update({ status: b.status, notes: b.notes || "" }).eq("id", trackerMatch[1]).eq("user_id", user.id).select().maybeSingle();
        if (error) throw error;
        if (!data) return json({ error: "Tracker item not found." }, 404);
        return json({ ok: true });
      }
    }

    if (path === "/api/user/notifications" && req.method === "GET") {
      const user = await requireUser(req);
      return json({ items: await scoped("notifications", user.id) });
    }

    if (path === "/api/user/notifications/read" && req.method === "POST") {
      const user = await requireUser(req); const b = await req.json();
      let q = db.from("notifications").update({ read: true }).eq("user_id", user.id);
      if (!b.all && b.id) q = q.eq("id", b.id);
      const { error } = await q;
      if (error) throw error;
      return json({ ok: true });
    }

    if (path === "/api/user/topics" && req.method === "GET") {
      const user = await requireUser(req);
      const { data, error } = await db.from("topic_subscriptions").select("topic").eq("user_id", user.id);
      if (error) throw error;
      return json({ topics: (data ?? []).map(x => x.topic) });
    }

    const topicMatch = path.match(/^\/api\/user\/topics\/(subscribe|unsubscribe)$/);
    if (topicMatch && req.method === "POST") {
      const user = await requireUser(req); const b = await req.json();
      const topic = String(b.topic || "").trim().slice(0, 80);
      if (!topic) return json({ error: "Topic is required." }, 400);
      if (topicMatch[1] === "subscribe") {
        const { error } = await db.from("topic_subscriptions").upsert({ user_id: user.id, topic }, { onConflict: "user_id,topic" });
        if (error) throw error;
      } else {
        const { error } = await db.from("topic_subscriptions").delete().eq("user_id", user.id).eq("topic", topic);
        if (error) throw error;
      }
      return json({ ok: true });
    }

    if (path === "/api/user/reminders/check" && req.method === "POST") {
      const user = await requireUser(req);
      const { data: saved } = await db.from("saved_opportunities").select("opportunity_id").eq("user_id", user.id);
      const ids = (saved ?? []).map(x => x.opportunity_id);
      if (ids.length) {
        const { data: opps } = await db.from("opportunities").select("id,title,deadline").in("id", ids);
        const { data: reminders } = await db.from("user_reminders").select("opportunity_id,bucket").eq("user_id", user.id);
        const now = Date.now();
        for (const o of opps ?? []) {
          if (!o.deadline) continue;
          const deadline = new Date(o.deadline).getTime();
          if (!Number.isFinite(deadline) || deadline <= now) continue;
          const days = Math.ceil((deadline-now)/864e5);
          const bucket = days <= 1 ? "1d" : days <= 3 ? "3d" : days <= 7 ? "7d" : "";
          if (!bucket || (reminders ?? []).some(r => r.opportunity_id === o.id && r.bucket === bucket)) continue;
          const title = "EDUKEN deadline reminder";
          const body = o.title + " — " + days + " days left.";
          await db.from("notifications").insert({ user_id: user.id, title, body, read: false });
          await db.from("user_reminders").insert({ user_id: user.id, opportunity_id: o.id, bucket });
        }
      }
      return json({ ok: true });
    }

    if (path === "/api/ai-assistant" && req.method === "POST") {
      let b: any;
      try { b = await req.json(); } catch { return json({ error: "A valid JSON request body is required." }, 400); }
      if (typeof b?.question !== "string") return json({ error: "Question must be a text string." }, 400);
      const question = b.question.trim();
      if (!question) return json({ error: "Question is required." }, 400);
      // Bound public input before loading database context or calling the paid AI provider.
      if (question.length > 2000) return json({ error: "Question must be 2000 characters or fewer." }, 400);
      return json({ answer: await aiAnswer(question) });
    }



    if (path === "/api/email-alerts/subscribe" && req.method === "POST") {
      let rateAllowed: boolean | null;
      try { rateAllowed = await consumeEmailAlertRateLimit(req, "subscribe"); } catch { return json({ error: "Email alerts are temporarily unavailable." }, 503); }
      if (rateAllowed === null) return json({ error: "Email alerts are temporarily unavailable." }, 503);
      if (!rateAllowed) return json({ error: "Too many requests. Please try again in 15 minutes." }, 429);
      let body: any;
      try { body = await req.json(); } catch { return json({ error: "A valid JSON request body is required." }, 400); }
      const validation = validateEmailAlertSubscription(body);
      if (validation.error || !validation.data) return json({ error: validation.error || "Invalid request." }, 400);
      const config = emailAlertConfiguration();
      if (!config) return json({ error: "Email alerts are not configured yet. Please use the EDUKEN WhatsApp Channel for updates." }, 503);

      const { email, topics } = validation.data;
      const now = new Date();
      const verificationToken = secureRandomToken();
      const verificationTokenHash = await sha256Hex(verificationToken);
      const { data: existing, error: lookupError } = await db
        .from("email_alert_subscriptions")
        .select("id,is_active,verified_at,updated_at")
        .eq("email", email)
        .maybeSingle();
      if (lookupError) throw lookupError;

      // Per-address cooldown prevents repeated confirmation-email spam without
      // blocking already-verified subscribers from updating their preferences.
      if (existing && !(existing.is_active && existing.verified_at)) {
        if (isWithinEmailAlertCooldown(existing.updated_at, now.getTime())) {
          return json({ message: "If this address is eligible, your request has been processed. Check your inbox if confirmation is required." }, 202);
        }
      }

      if (existing?.is_active && existing?.verified_at) {
        const { error } = await db.from("email_alert_subscriptions")
          .update({ topics, updated_at: now.toISOString() })
          .eq("id", existing.id);
        if (error) throw error;
        return json({ message: "If this address is eligible, your request has been processed. Check your inbox if confirmation is required." }, 202);
      }

      const subscriptionId = existing?.id || crypto.randomUUID();
      const unsubscribeToken = await deriveUnsubscribeToken(subscriptionId, config.tokenSecret);
      const unsubscribeTokenHash = await sha256Hex(unsubscribeToken);
      const subscriptionValues = {
        email,
        topics,
        verified_at: null,
        verification_token_hash: verificationTokenHash,
        verification_expires_at: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
        unsubscribe_token_hash: unsubscribeTokenHash,
        is_active: false,
        updated_at: now.toISOString(),
      };
      if (existing) {
        const { error } = await db.from("email_alert_subscriptions")
          .update(subscriptionValues)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await db.from("email_alert_subscriptions")
          .insert({ id: subscriptionId, ...subscriptionValues });
        if (error) throw error;
      }

      const verificationUrl = new URL(config.siteUrl.toString());
      verificationUrl.searchParams.set("email_alert_verify", verificationToken);
      const unsubscribeUrl = new URL(config.siteUrl.toString());
      unsubscribeUrl.searchParams.set("email_alert_unsubscribe", unsubscribeToken);
      try {
        await sendEmailAlertMessage(
          config,
          email,
          "Confirm your EDUKEN CONSULT email alerts",
          "Confirm your email alerts within 30 minutes: " + verificationUrl.toString() +
            "\n\nIf you did not request this, ignore this message. You can also unsubscribe: " + unsubscribeUrl.toString(),
          "<p>Confirm your EDUKEN CONSULT email alerts within 30 minutes.</p><p><a href=\"" +
            escapeEmailHtml(verificationUrl.toString()) + "\">Confirm email alerts</a></p><p>If you did not request this, ignore this message.</p><p><a href=\"" +
            escapeEmailHtml(unsubscribeUrl.toString()) + "\">Unsubscribe</a></p>"
        );
      } catch {
        await db.from("email_alert_subscriptions")
          .update({ verification_token_hash: null, verification_expires_at: null, updated_at: new Date().toISOString() })
          .eq("id", subscriptionId);
        // Keep provider failures indistinguishable from other valid subscription
        // requests so this endpoint cannot reveal whether an address is subscribed.
        return json({ message: "If this address is eligible, your request has been processed. Check your inbox if confirmation is required." }, 202);
      }
      return json({ message: "If this address is eligible, your request has been processed. Check your inbox if confirmation is required." }, 202);
    }

    if (path === "/api/email-alerts/verify" && req.method === "POST") {
      let rateAllowed: boolean | null;
      try { rateAllowed = await consumeEmailAlertRateLimit(req, "verify"); } catch { return json({ error: "Email alerts are temporarily unavailable." }, 503); }
      if (rateAllowed === null) return json({ error: "Email alerts are temporarily unavailable." }, 503);
      if (!rateAllowed) return json({ error: "Too many requests. Please try again in 15 minutes." }, 429);
      let body: any;
      try { body = await req.json(); } catch { return json({ error: "A valid JSON request body is required." }, 400); }
      const token = typeof body?.token === "string" ? body.token.trim() : "";
      if (!/^[a-f0-9]{64}$/i.test(token)) return json({ error: "This confirmation link is invalid or expired." }, 400);
      const tokenHash = await sha256Hex(token);
      const now = new Date().toISOString();
      const { data: subscription, error: lookupError } = await db.from("email_alert_subscriptions")
        .select("id")
        .eq("verification_token_hash", tokenHash)
        .gt("verification_expires_at", now)
        .maybeSingle();
      if (lookupError) throw lookupError;
      if (!subscription) return json({ error: "This confirmation link is invalid or expired." }, 400);
      // Consume the one-time token atomically. A second concurrent request cannot
      // verify the same subscription after the token hash has been cleared.
      const { data: verifiedSubscription, error } = await db.from("email_alert_subscriptions")
        .update({ verified_at: now, is_active: true, verification_token_hash: null, verification_expires_at: null, updated_at: now })
        .eq("id", subscription.id)
        .eq("verification_token_hash", tokenHash)
        .gt("verification_expires_at", now)
        .select("id")
        .maybeSingle();
      if (error) throw error;
      if (!verifiedSubscription) return json({ error: "This confirmation link is invalid or expired." }, 400);
      return json({ message: "Your email alerts are confirmed and active." });
    }

    if (path === "/api/email-alerts/unsubscribe" && req.method === "POST") {
      let rateAllowed: boolean | null;
      try { rateAllowed = await consumeEmailAlertRateLimit(req, "unsubscribe"); } catch { return json({ error: "Email alerts are temporarily unavailable." }, 503); }
      if (rateAllowed === null) return json({ error: "Email alerts are temporarily unavailable." }, 503);
      if (!rateAllowed) return json({ error: "Too many requests. Please try again in 15 minutes." }, 429);
      let body: any;
      try { body = await req.json(); } catch { return json({ error: "A valid JSON request body is required." }, 400); }
      const token = typeof body?.token === "string" ? body.token.trim() : "";
      if (!/^[a-f0-9]{64}$/i.test(token)) return json({ error: "This unsubscribe link is invalid." }, 400);
      const tokenHash = await sha256Hex(token);
      const { data: subscription, error: lookupError } = await db.from("email_alert_subscriptions")
        .select("id")
        .eq("unsubscribe_token_hash", tokenHash)
        .maybeSingle();
      if (lookupError) throw lookupError;
      if (!subscription) return json({ error: "This unsubscribe link is invalid." }, 400);
      const now = new Date().toISOString();
      const { error } = await db.from("email_alert_subscriptions")
        .update({ is_active: false, updated_at: now })
        .eq("id", subscription.id);
      if (error) throw error;
      const { error: cancelError } = await db.from("email_alert_deliveries")
        .update({ status: "cancelled" })
        .eq("subscription_id", subscription.id)
        .eq("status", "pending");
      if (cancelError) throw cancelError;
      return json({ message: "You have been unsubscribed from EDUKEN email alerts." });
    }

    if (path === "/api/internal/email-alerts/process" && req.method === "POST") {
      const cronSecret = Deno.env.get("EMAIL_ALERTS_CRON_SECRET");
      if (!cronSecret || cronSecret.length < 32) return json({ error: "Email alert processing is not configured." }, 503);
      if (req.headers.get("Authorization") !== "Bearer " + cronSecret) return json({ error: "Unauthorized." }, 401);
      const config = emailAlertConfiguration();
      if (!config) return json({ error: "Email alerts are not configured." }, 503);

      // Pause dispatch without claiming or cancelling queued work. Re-enabling alerts
      // allows still-valid reminders to resume; expired deadlines are filtered below.
      const systemSettings = await readSystemSettings();
      if (!systemSettings.deadlineEmailAlertsEnabled) {
        return json({ ok: true, paused: true, processed: 0, sent: 0, failed: 0, skipped: 0 });
      }

      const now = new Date();
      // Keep the private rate-limit table bounded without retaining inactive hashed IP keys indefinitely.
      const rateLimitRetentionBefore = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
      const { error: rateLimitCleanupError } = await db.from("email_alert_rate_limits")
        .delete()
        .lt("updated_at", rateLimitRetentionBefore);
      if (rateLimitCleanupError) throw new Error("Could not clean up expired email alert rate limits.");
      const staleProcessingBefore = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
      // Recover expired worker leases without ever exceeding the five-attempt cap.
      const { error: exhaustedRecoveryError } = await db.from("email_alert_deliveries")
        .update({ status: "failed", processing_started_at: null, last_error: "Processing lease expired after maximum attempts." })
        .eq("status", "processing")
        .lt("processing_started_at", staleProcessingBefore)
        .gte("attempt_count", 5);
      if (exhaustedRecoveryError) throw exhaustedRecoveryError;
      const { error: staleRecoveryError } = await db.from("email_alert_deliveries")
        .update({ status: "pending", scheduled_for: now.toISOString(), processing_started_at: null })
        .eq("status", "processing")
        .lt("processing_started_at", staleProcessingBefore)
        .lt("attempt_count", 5);
      if (staleRecoveryError) throw staleRecoveryError;
      const { data: dueDeliveries, error: dueError } = await db.from("email_alert_deliveries")
        .select("id,subscription_id,opportunity_id,event_type,attempt_count")
        .eq("status", "pending")
        .lte("scheduled_for", now.toISOString())
        .order("scheduled_for", { ascending: true })
        .limit(25);
      if (dueError) throw dueError;
      let sent = 0, failed = 0, skipped = 0;

      for (const delivery of dueDeliveries ?? []) {
        const attemptCount = Number(delivery.attempt_count || 0) + 1;
        const { data: claimed, error: claimError } = await db.from("email_alert_deliveries")
          .update({ status: "processing", attempt_count: attemptCount, processing_started_at: now.toISOString() })
          .eq("id", delivery.id)
          .eq("status", "pending")
          .select("id,attempt_count")
          .maybeSingle();
        if (claimError) throw claimError;
        if (!claimed) continue;

        try {
          const { data: subscription, error: subscriptionError } = await db.from("email_alert_subscriptions")
            .select("id,email,topics,verified_at,is_active,unsubscribe_token_hash")
            .eq("id", delivery.subscription_id)
            .maybeSingle();
          if (subscriptionError) throw subscriptionError;
          if (!subscription || !subscription.is_active || !subscription.verified_at) {
            await updateEmailAlertDelivery(delivery.id, { status: "cancelled", processing_started_at: null });
            skipped++;
            continue;
          }

          const { data: opportunity, error: opportunityError } = await db.from("opportunities")
            .select("id,title,slug,category,description,deadline,application_url,official_source,is_published,verified,notify_on_publish")
            .eq("id", delivery.opportunity_id)
            .maybeSingle();
          if (opportunityError) throw opportunityError;
          if (!opportunity) {
            await updateEmailAlertDelivery(delivery.id, { status: "cancelled", processing_started_at: null });
            skipped++;
            continue;
          }
          const eligible = isEmailAlertOpportunityEligible(opportunity);
          const topic = opportunity ? opportunityAlertTopic(opportunity) : null;
          if (!eligible || !topic || !Array.isArray(subscription.topics) || !subscription.topics.includes(topic)) {
            await updateEmailAlertDelivery(delivery.id, { status: "cancelled", processing_started_at: null });
            skipped++;
            continue;
          }

          const deadlineMs = opportunity.deadline ? new Date(String(opportunity.deadline)).getTime() : NaN;
          if (String(delivery.event_type).startsWith("deadline_") && (!Number.isFinite(deadlineMs) || deadlineMs <= now.getTime())) {
            await updateEmailAlertDelivery(delivery.id, { status: "cancelled", processing_started_at: null });
            skipped++;
            continue;
          }

          const slug = String(opportunity.slug || slugify(opportunity.title || opportunity.id));
          const opportunityUrl = new URL(config.siteUrl.toString());
          opportunityUrl.hash = "opportunity/" + encodeURIComponent(slug);
          const unsubscribeToken = await deriveUnsubscribeToken(subscription.id, config.tokenSecret);
          if (await sha256Hex(unsubscribeToken) !== subscription.unsubscribe_token_hash) {
            throw new Error("Unsubscribe token configuration mismatch.");
          }
          const unsubscribeUrl = new URL(config.siteUrl.toString());
          unsubscribeUrl.searchParams.set("email_alert_unsubscribe", unsubscribeToken);
          const title = String(opportunity.title || "EDUKEN opportunity").slice(0, 180);
          let subject = "New EDUKEN opportunity: " + title;
          let intro = "A new verified opportunity matching your selected interests is available.";
          if (delivery.event_type === "deadline_7d" || delivery.event_type === "deadline_3d" || delivery.event_type === "deadline_1d") {
            const days = Number(String(delivery.event_type).match(/deadline_(\d+)d/)?.[1] || 0);
            subject = "EDUKEN deadline reminder: " + title;
            intro = "The deadline for this opportunity is approaching in " + days + (days === 1 ? " day." : " days.");
          }
          const description = String(opportunity.description || "").slice(0, 1200);
          const officialSourceUrl = safeHttpUrl(opportunity.official_source);
          const textBody = intro + "\n\n" + title + "\n" + description + "\n\nOpen: " + opportunityUrl.toString() +
            (officialSourceUrl ? "\nOfficial source: " + officialSourceUrl : "") + "\nUnsubscribe: " + unsubscribeUrl.toString();
          const htmlBody = "<p>" + escapeEmailHtml(intro) + "</p><h2>" + escapeEmailHtml(title) + "</h2><p>" +
            escapeEmailHtml(description) + "</p><p><a href=\"" + escapeEmailHtml(opportunityUrl.toString()) +
            "\">View opportunity</a></p>" +
            (officialSourceUrl ? "<p><a href=\"" + escapeEmailHtml(officialSourceUrl) + "\">Official source</a></p>" : "") +
            "<p><a href=\"" + escapeEmailHtml(unsubscribeUrl.toString()) + "\">Unsubscribe from email alerts</a></p>";
          // Re-check subscription consent immediately before the external send. The first
          // read above is needed to build the message, but an unsubscribe may happen while
          // the worker is preparing it. This second read narrows that race window; fully
          // atomic coordination with an external email provider is not possible here.
          const { data: latestSubscription, error: latestSubscriptionError } = await db
            .from("email_alert_subscriptions")
            .select("is_active,verified_at,topics")
            .eq("id", subscription.id)
            .maybeSingle();
          if (latestSubscriptionError) throw latestSubscriptionError;
          if (
            !latestSubscription ||
            !latestSubscription.is_active ||
            !latestSubscription.verified_at ||
            !Array.isArray(latestSubscription.topics) ||
            !latestSubscription.topics.includes(topic)
          ) {
            await updateEmailAlertDelivery(delivery.id, {
              status: "cancelled",
              processing_started_at: null,
            });
            skipped++;
            continue;
          }

          // Re-check the global pause immediately before the external send. If an
          // administrator paused alerts while this batch was running, release the
          // delivery back to pending rather than sending or losing the queued reminder.
          const latestSystemSettings = await readSystemSettings();
          if (!latestSystemSettings.deadlineEmailAlertsEnabled) {
            await updateEmailAlertDelivery(delivery.id, {
              status: "pending",
              scheduled_for: new Date().toISOString(),
              processing_started_at: null,
            });
            break;
          }

          // Reuse the same provider idempotency key on retries to avoid duplicate messages
          // if the provider accepted a send but the database update failed.
          const providerMessageId = await sendEmailAlertMessage(
            config,
            subscription.email,
            subject,
            textBody,
            htmlBody,
            "eduken-alert-delivery-" + delivery.id,
          );
          const { error: markSentError } = await db.from("email_alert_deliveries")
            .update({ status: "sent", provider_message_id: providerMessageId, sent_at: new Date().toISOString(), last_error: null, processing_started_at: null })
            .eq("id", delivery.id);
          if (markSentError) throw markSentError;
          sent++;
        } catch {
          const exhausted = isEmailAlertAttemptExhausted(attemptCount);
          const retryDelayMs = emailAlertRetryDelayMs(attemptCount);
          const { error: retryStateError } = await db.from("email_alert_deliveries").update({
            status: exhausted ? "failed" : "pending",
            processing_started_at: null,
            scheduled_for: new Date(Date.now() + retryDelayMs).toISOString(),
            last_error: "Delivery attempt failed; details withheld from public logs.",
          }).eq("id", delivery.id);
          if (retryStateError) throw new Error("Could not record the email alert retry state.");
          failed++;
        }
      }
      return json({ ok: true, processed: sent + failed + skipped, sent, failed, skipped });
    }

    if (path === "/api/service-requests" && req.method === "POST") {
      let rateAllowed: boolean | null;
      try { rateAllowed = await consumeEmailAlertRateLimit(req, "service-request"); } catch { return json({ error: "Service requests are temporarily unavailable." }, 503); }
      if (rateAllowed === null) return json({ error: "Service requests are temporarily unavailable." }, 503);
      if (!rateAllowed) return json({ error: "Too many service requests. Please try again in 15 minutes." }, 429);
      let b: any;
      try { b = await req.json(); } catch { return json({ error: "A valid JSON request body is required." }, 400); }
      const validation = validateServiceRequestBody(b);
      if (validation.error || !validation.data) return json({ error: validation.error || "Invalid request." }, 400);
      const { customerName, whatsapp, details, email, serviceId, quantity } = validation.data;
      // Reject stale, deleted, or unpublished service selections before creating a request.
      // A null serviceId remains valid for general enquiries.
      let selectedServiceForRequest: any = null;
      if (!serviceId && quantity !== 1) return json({ error: "A service must be selected when requesting multiple candidates." }, 400);
      if (serviceId) {
        const { data: service, error: serviceError } = await db
          .from("services")
          .select("id,is_published,is_available,price,name,is_catalog_item")
          .eq("id", serviceId)
          .maybeSingle();
        if (serviceError) throw serviceError;
        if (!service || !isPublishedService(service)) {
          return json({ error: "Please choose an available published service." }, 400);
        }
        if (quantity > 1 && service.is_catalog_item !== true) {
          return json({ error: "Only catalogue services can be requested for multiple candidates." }, 400);
        }
        selectedServiceForRequest = service;
      }
      // Selected service requests must belong to a signed-in customer account so payment
      // and deliverables can be tied to that student. General enquiries without serviceId stay public.
      const user = serviceId ? await requireUser(req) : await currentUser(req);
      const reference = "EDK-" + new Date().toISOString().slice(0,10).replace(/-/g, "") + "-" + crypto.randomUUID().slice(0,8).toUpperCase();
      const onlinePrice = Number(selectedServiceForRequest?.price) * quantity;
      const checkoutToken = selectedServiceForRequest && Number.isFinite(onlinePrice) && onlinePrice > 0 ? secureRandomToken() : null;
      const checkoutTokenHash = checkoutToken ? await sha256Hex(checkoutToken) : null;
      const { data, error } = await db.from("service_requests").insert({
        user_id: user?.id ?? null, service_id: serviceId, customer_name: customerName,
        whatsapp, email: email || null, details, quantity, checkout_token_hash: checkoutTokenHash,
        status: "New Requests", reference_number: reference
      }).select("id,reference_number,status,created_at").single();
      if (error) throw error;
      return json({ request: data, referenceNumber: reference, ...(checkoutToken ? { checkoutToken } : {}) }, 201);
    }

    if (path === "/api/service-requests" && req.method === "GET") {
      const user = await requireUser(req);
      const { data, error } = await db.from("service_requests").select("id,user_id,service_id,customer_name,whatsapp,email,details,status,reference_number,quantity,created_at,updated_at,services(name,price)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return json({ items: data ?? [] });
    }

    const serviceRequestMatch = path.match(/^\/api\/service-requests\/([^/]+)$/);
    if (serviceRequestMatch && req.method === "GET") {
      const user = await requireUser(req);
      const { data, error } = await db.from("service_requests").select("id,user_id,service_id,customer_name,whatsapp,email,details,status,reference_number,quantity,created_at,updated_at,services(name,price)").eq("id", serviceRequestMatch[1]).eq("user_id", user.id).maybeSingle();
      if (error) throw error;
      if (!data) return json({ error: "Service request not found." }, 404);
      return json({ request: data });
    }


    if (path === "/api/wallet" && req.method === "GET") {
      const user = await requireUser(req);
      const { data: wallet, error: walletError } = await db.from("customer_wallets")
        .select("id,balance,currency,created_at,updated_at").eq("user_id", user.id).maybeSingle();
      if (walletError) throw walletError;
      if (!wallet) return json({ error: "Wallet is being prepared. Please refresh shortly." }, 503);
      const { data: transactions, error: transactionError } = await db.from("wallet_transactions")
        .select("id,transaction_type,amount,balance_after,description,created_at,payment_id,service_request_id")
        .eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
      if (transactionError) throw transactionError;
      return json({ wallet, transactions: transactions ?? [] });
    }

    if (path === "/api/wallet/deposit/initialize" && req.method === "POST") {
      let rateAllowed: boolean | null;
      try { rateAllowed = await consumeEmailAlertRateLimit(req, "wallet-deposit-initialize"); } catch { return json({ error: "Wallet deposits are temporarily unavailable." }, 503); }
      if (rateAllowed === null) return json({ error: "Wallet deposits are temporarily unavailable." }, 503);
      if (!rateAllowed) return json({ error: "Too many wallet deposit attempts. Please wait before trying again." }, 429);
      const user = await requireUser(req);
      let b: any;
      try { b = await req.json(); } catch { return json({ error: "A valid JSON request body is required." }, 400); }
      const amount = Number(b?.amount);
      const idempotencyKey = typeof b?.idempotencyKey === "string" ? b.idempotencyKey.trim() : "";
      if (!Number.isInteger(amount) || amount < 100 || amount > 500000) {
        return json({ error: "Enter a whole-naira top-up amount between ₦100 and ₦500,000." }, 400);
      }
      if (!/^[A-Za-z0-9:_-]{8,100}$/.test(idempotencyKey)) {
        return json({ error: "A valid deposit attempt key is required. Please retry." }, 400);
      }
      const { data: existing, error: existingError } = await db.from("payments")
        .select("id,amount,currency,status,payment_reference,authorization_url,payment_type,idempotency_key")
        .eq("user_id", user.id).eq("idempotency_key", idempotencyKey).eq("payment_type", "wallet_deposit").eq("payment_provider", "paystack").maybeSingle();
      if (existingError) throw existingError;
      if (existing) {
        if (existing.status === "Paid") return json({ error: "This deposit attempt is already completed.", code: "WALLET_DEPOSIT_ALREADY_PAID" }, 409);
        const savedUrl = getPaystackAuthorizationUrl({ status: true, data: { authorization_url: existing.authorization_url } });
        if (savedUrl && existing.payment_reference && Number(existing.amount) === amount) {
          return json({ payment: existing, authorizationUrl: savedUrl, reference: existing.payment_reference, reused: true });
        }
        return json({ error: "This deposit attempt is still being prepared or needs support. Do not start another payment with the same attempt.", code: "WALLET_DEPOSIT_ATTEMPT_UNCERTAIN" }, 409);
      }

      const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
      if (!isPaystackTestModeEnabled(Deno.env.get("PAYSTACK_MODE"), secret)) {
        return json({ error: "Paystack is disabled unless PAYSTACK_MODE=test and a sk_test_ key is configured.", code: "PAYSTACK_TEST_MODE_REQUIRED" }, 503);
      }
      if (!user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
        return json({ error: "Your account needs a valid email address before you can fund your wallet." }, 400);
      }
      const reference = "EDK-PAY-" + crypto.randomUUID().replace(/-/g, "").slice(0, 18).toUpperCase();
      const baseCallbackUrl = getPaystackCallbackUrl(Deno.env.get("PUBLIC_SITE_URL"), reference);
      if (!baseCallbackUrl) return json({ error: "Secure payment callback configuration is missing.", code: "PAYMENT_CALLBACK_NOT_CONFIGURED" }, 503);
      const callbackUrl = baseCallbackUrl + "&wallet=1";

      const { data: reservation, error: reservationError } = await db.from("payments").insert({
        user_id: user.id, service_request_id: null, amount, currency: "NGN", status: "Pending",
        payment_reference: reference, authorization_url: null, payment_type: "wallet_deposit",
        idempotency_key: idempotencyKey,
      }).select("id,amount,currency,status,service_request_id,payment_reference,authorization_url,payment_type,idempotency_key").single();
      if (reservationError) {
        if (reservationError.code === "23505") {
          const { data: raced, error: racedError } = await db.from("payments")
            .select("id,amount,currency,status,payment_reference,authorization_url,payment_type,idempotency_key")
            .eq("user_id", user.id).eq("idempotency_key", idempotencyKey).eq("payment_type", "wallet_deposit").eq("payment_provider", "paystack").maybeSingle();
          if (racedError) throw racedError;
          const racedUrl = getPaystackAuthorizationUrl({ status: true, data: { authorization_url: raced?.authorization_url } });
          if (raced && racedUrl && Number(raced.amount) === amount && raced.payment_reference) {
            return json({ payment: raced, authorizationUrl: racedUrl, reference: raced.payment_reference, reused: true });
          }
          return json({ error: "This deposit attempt is already being prepared. Do not pay again; refresh or contact EDUKEN support.", code: "WALLET_DEPOSIT_ATTEMPT_UNCERTAIN" }, 409);
        }
        throw reservationError;
      }

      let providerResponse: Response;
      try {
        providerResponse = await fetch("https://api.paystack.co/transaction/initialize", {
          method: "POST",
          headers: { "Authorization": "Bearer " + secret, "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email, amount: amount * 100, currency: "NGN", reference, callback_url: callbackUrl,
            metadata: { type: "wallet_deposit", user_id: user.id, idempotency_key: idempotencyKey },
          }),
        });
      } catch {
        return json({ error: "Paystack did not confirm whether checkout was created. Do not start another deposit yet; refresh or contact support.", code: "WALLET_DEPOSIT_INITIALIZATION_UNCERTAIN" }, 502);
      }
      let providerResult: any;
      try { providerResult = await providerResponse.json(); } catch {
        return json({ error: "Paystack returned an unreadable response. Do not start another deposit yet; contact support.", code: "WALLET_DEPOSIT_INITIALIZATION_UNCERTAIN" }, 502);
      }
      const authorizationUrl = getPaystackAuthorizationUrl(providerResult);
      if (!providerResponse.ok || providerResult?.status !== true) {
        if (getPaystackInitializationFailureDisposition({ ok: providerResponse.ok, status: providerResponse.status, providerStatus: providerResult?.status === true, hasAuthorizationUrl: Boolean(authorizationUrl) }) === "unconfirmed") {
          return json({ error: "Paystack did not confirm whether checkout was created. Do not start another deposit yet; contact support.", code: "WALLET_DEPOSIT_INITIALIZATION_UNCERTAIN", reference }, 502);
        }
        const { error: failError } = await db.from("payments").update({ status: "Failed" }).eq("id", reservation.id).eq("status", "Pending");
        if (failError) {
          console.error("Could not mark rejected wallet deposit initialization as failed.", failError.message);
          return json({ error: "Wallet deposit initialization needs support before retrying.", code: "WALLET_DEPOSIT_ATTEMPT_UNCERTAIN" }, 503);
        }
        return json({ error: "Unable to initialize wallet deposit. You can safely try again with a new attempt.", code: "WALLET_DEPOSIT_INITIALIZATION_FAILED" }, 502);
      }
      if (!authorizationUrl) {
        return json({ error: "Paystack checkout could not be confirmed. Do not retry yet; contact support.", code: "WALLET_DEPOSIT_INITIALIZATION_UNCERTAIN" }, 502);
      }
      const { data: savedPayment, error: saveError } = await db.from("payments")
        .update({ authorization_url: authorizationUrl }).eq("id", reservation.id).eq("status", "Pending")
        .select("id,amount,currency,status,payment_reference,authorization_url,payment_type,idempotency_key").maybeSingle();
      if (saveError || !savedPayment) {
        console.error("Wallet deposit checkout URL persistence needs recovery.", saveError?.message || "Reservation changed.");
        return json({ error: "Paystack checkout was created but needs recovery. Do not create another deposit; contact support with reference " + reference + ".", code: "WALLET_DEPOSIT_ATTEMPT_UNCERTAIN", reference }, 503);
      }
      return json({ payment: savedPayment, authorizationUrl, reference });
    }

    if (path === "/api/wallet/deposit/initialize-flutterwave" && req.method === "POST") {
      let rateAllowed: boolean | null;
      try { rateAllowed = await consumeEmailAlertRateLimit(req, "wallet-deposit-initialize"); } catch { return json({ error: "Wallet deposits are temporarily unavailable." }, 503); }
      if (rateAllowed === null) return json({ error: "Wallet deposits are temporarily unavailable." }, 503);
      if (!rateAllowed) return json({ error: "Too many wallet deposit attempts. Please wait before trying again." }, 429);
      const user = await requireUser(req);
      const secret = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
      if (!isFlutterwaveModeEnabled(Deno.env.get("FLUTTERWAVE_MODE"), secret)) {
        return json({ error: "Flutterwave wallet deposits are not enabled for the configured key and mode.", code: "FLUTTERWAVE_MODE_OR_KEY_MISMATCH" }, 503);
      }
      let b: any;
      try { b = await req.json(); } catch { return json({ error: "A valid JSON request body is required." }, 400); }
      const amount = Number(b?.amount);
      const clientKey = typeof b?.idempotencyKey === "string" ? b.idempotencyKey.trim() : "";
      if (!Number.isInteger(amount) || amount < 100 || amount > 500000) {
        return json({ error: "Enter a whole-naira top-up amount between ₦100 and ₦500,000." }, 400);
      }
      if (!/^[A-Za-z0-9:_-]{8,100}$/.test(clientKey)) {
        return json({ error: "A valid deposit attempt key is required. Please retry." }, 400);
      }
      if (!user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
        return json({ error: "Your account needs a valid email address before you can fund your wallet." }, 400);
      }
      const idempotencyKey = "flutterwave:" + clientKey;
      const { data: existing, error: existingError } = await db.from("payments")
        .select("id,amount,currency,status,payment_reference,authorization_url,payment_type,idempotency_key,payment_provider")
        .eq("user_id", user.id).eq("idempotency_key", idempotencyKey).eq("payment_type", "wallet_deposit").eq("payment_provider", "flutterwave").maybeSingle();
      if (existingError) throw existingError;
      if (existing) {
        if (existing.status === "Paid") return json({ error: "This deposit attempt is already completed.", code: "WALLET_DEPOSIT_ALREADY_PAID" }, 409);
        const savedUrl = getFlutterwaveCheckoutUrl({ status: "success", data: { link: existing.authorization_url } });
        if (savedUrl && existing.payment_reference && Number(existing.amount) === amount) {
          return json({ payment: existing, authorizationUrl: savedUrl, reference: existing.payment_reference, provider: "flutterwave", reused: true });
        }
        if (existing.status === "Pending" && !existing.authorization_url && existing.payment_reference && Number(existing.amount) === amount) {
          let recoveryResponse: Response;
          try {
            const verifyUrl = new URL("https://api.flutterwave.com/v3/transactions/verify_by_reference");
            verifyUrl.searchParams.set("tx_ref", existing.payment_reference);
            recoveryResponse = await fetch(verifyUrl, { headers: { "Authorization": "Bearer " + secret, "Content-Type": "application/json" } });
          } catch {
            return json({ error: "Flutterwave is still checking the earlier attempt. Do not start another payment; try again later or contact EDUKEN CONSULT.", code: "WALLET_DEPOSIT_INITIALIZATION_UNCERTAIN" }, 409);
          }
          let recoveryResult: any = null;
          try { recoveryResult = await recoveryResponse.json(); } catch { /* remain conservative */ }
          if (recoveryResponse.ok && recoveryResult?.status === "success" && recoveryResult?.data) {
            return json({ error: "Flutterwave found a transaction for the earlier reference. Do not start another payment; refresh your wallet or contact EDUKEN CONSULT for recovery.", code: "WALLET_DEPOSIT_INITIALIZATION_UNCERTAIN", reference: existing.payment_reference }, 409);
          }
          if (recoveryResponse.status === 400) {
            const { error: releaseError } = await db.from("payments").update({ status: "Failed" })
              .eq("id", existing.id).eq("payment_provider", "flutterwave").eq("status", "Pending").is("authorization_url", null);
            if (releaseError) throw releaseError;
            return json({ error: "No Flutterwave transaction was found for the earlier attempt. Refresh and start a new deposit.", code: "WALLET_DEPOSIT_INITIALIZATION_FAILED" }, 409);
          }
        }
        return json({ error: "This deposit attempt is still being prepared or needs support. Do not start another payment with the same attempt.", code: "WALLET_DEPOSIT_ATTEMPT_UNCERTAIN" }, 409);
      }

      const reference = "EDK-PAY-" + crypto.randomUUID().replace(/-/g, "").slice(0, 18).toUpperCase();
      const baseCallbackUrl = getFlutterwaveCallbackUrl(Deno.env.get("PUBLIC_SITE_URL"), reference);
      if (!baseCallbackUrl) return json({ error: "Secure payment callback configuration is missing.", code: "PAYMENT_CALLBACK_NOT_CONFIGURED" }, 503);
      const callbackUrl = baseCallbackUrl;
      const { data: reservation, error: reservationError } = await db.from("payments").insert({
        user_id: user.id, service_request_id: null, amount, currency: "NGN", status: "Pending",
        payment_reference: reference, authorization_url: null, payment_type: "wallet_deposit",
        payment_provider: "flutterwave", idempotency_key: idempotencyKey,
      }).select("id,amount,currency,status,service_request_id,payment_reference,authorization_url,payment_type,idempotency_key,payment_provider").single();
      if (reservationError) {
        if (reservationError.code === "23505") {
          return json({ error: "This deposit attempt is already being prepared. Do not pay again; refresh or contact EDUKEN support.", code: "WALLET_DEPOSIT_ATTEMPT_UNCERTAIN" }, 409);
        }
        throw reservationError;
      }

      let providerResponse: Response;
      try {
        providerResponse = await fetch("https://api.flutterwave.com/v3/payments", {
          method: "POST",
          headers: { "Authorization": "Bearer " + secret, "Content-Type": "application/json" },
          body: JSON.stringify({
            tx_ref: reference, amount, currency: "NGN", redirect_url: callbackUrl,
            customer: { email: user.email },
            customizations: { title: "EDUKEN CONSULT", description: "EDUKEN Wallet deposit" },
            meta: { type: "wallet_deposit", user_id: user.id, idempotency_key: idempotencyKey },
          }),
        });
      } catch {
        return json({ error: "Flutterwave could not confirm whether checkout was created. Do not start another deposit; contact EDUKEN support.", code: "WALLET_DEPOSIT_INITIALIZATION_UNCERTAIN", reference }, 502);
      }
      let providerResult: any;
      try { providerResult = await providerResponse.json(); } catch {
        return json({ error: "Flutterwave returned an unreadable response. Do not start another deposit; contact EDUKEN support.", code: "WALLET_DEPOSIT_INITIALIZATION_UNCERTAIN", reference }, 502);
      }
      const authorizationUrl = getFlutterwaveCheckoutUrl(providerResult);
      if (!providerResponse.ok || providerResult?.status !== "success" || !authorizationUrl) {
        const definitiveRejection = providerResponse.status >= 400 && providerResponse.status < 500
          && providerResponse.status !== 408 && providerResponse.status !== 429 && providerResult?.status !== "success";
        if (definitiveRejection) {
          const { error: failError } = await db.from("payments").update({ status: "Failed" })
            .eq("id", reservation.id).eq("payment_provider", "flutterwave").eq("status", "Pending");
          if (failError) return json({ error: "Flutterwave rejected the deposit but its state needs support before retrying.", code: "WALLET_DEPOSIT_ATTEMPT_UNCERTAIN" }, 503);
          return json({ error: "Unable to initialize Flutterwave deposit. You can safely start a new attempt.", code: "WALLET_DEPOSIT_INITIALIZATION_FAILED" }, 502);
        }
        return json({ error: "Flutterwave could not confirm whether checkout was created. Do not start another deposit; contact EDUKEN support.", code: "WALLET_DEPOSIT_INITIALIZATION_UNCERTAIN", reference }, 502);
      }
      const { data: savedPayment, error: saveError } = await db.from("payments").update({ authorization_url: authorizationUrl })
        .eq("id", reservation.id).eq("payment_provider", "flutterwave").eq("status", "Pending")
        .select("id,amount,currency,status,payment_reference,authorization_url,payment_type,idempotency_key,payment_provider").maybeSingle();
      if (saveError || !savedPayment) {
        return json({ error: "Flutterwave checkout was created but needs recovery. Do not start another deposit; contact EDUKEN support with reference " + reference + ".", code: "WALLET_DEPOSIT_ATTEMPT_UNCERTAIN", reference }, 503);
      }
      return json({ payment: savedPayment, authorizationUrl, reference, provider: "flutterwave" });
    }

    if (path === "/api/wallet/deposit/initialize-flutterwave-transfer" && req.method === "POST") {
      let rateAllowed: boolean | null;
      try { rateAllowed = await consumeEmailAlertRateLimit(req, "wallet-transfer-initialize"); } catch { return json({ error: "Wallet bank transfers are temporarily unavailable." }, 503); }
      if (rateAllowed === null) return json({ error: "Wallet bank transfers are temporarily unavailable." }, 503);
      if (!rateAllowed) return json({ error: "Too many wallet transfer attempts. Please wait before trying again." }, 429);
      const user = await requireUser(req);
      const secret = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
      if (!isFlutterwaveModeEnabled(Deno.env.get("FLUTTERWAVE_MODE"), secret)) {
        return json({ error: "Flutterwave wallet transfers are not enabled for the configured key and mode.", code: "FLUTTERWAVE_MODE_OR_KEY_MISMATCH" }, 503);
      }
      let b: any;
      try { b = await req.json(); } catch { return json({ error: "A valid JSON request body is required." }, 400); }
      const amount = Number(b?.amount);
      const clientKey = typeof b?.idempotencyKey === "string" ? b.idempotencyKey.trim() : "";
      if (!Number.isInteger(amount) || amount < 100 || amount > 500000) return json({ error: "Enter a whole-naira top-up amount between ₦100 and ₦500,000." }, 400);
      if (!/^[A-Za-z0-9:_-]{8,100}$/.test(clientKey)) return json({ error: "A valid deposit attempt key is required. Please retry." }, 400);
      if (!user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) return json({ error: "Your account needs a valid email address before you can fund your wallet." }, 400);
      const idempotencyKey = "flutterwave-transfer:" + clientKey;
      const { data: existing, error: existingError } = await db.from("payments")
        .select("id,amount,status,payment_reference,payment_type,idempotency_key,payment_provider,flutterwave_account_number,flutterwave_bank_name,flutterwave_account_name,flutterwave_account_expires_at,flutterwave_transfer_amount")
        .eq("user_id", user.id).eq("idempotency_key", idempotencyKey).eq("payment_type", "wallet_deposit").eq("payment_provider", "flutterwave").maybeSingle();
      if (existingError) throw existingError;
      if (existing) {
        if (existing.status === "Paid") return json({ error: "This deposit attempt is already completed.", code: "WALLET_DEPOSIT_ALREADY_PAID" }, 409);
        if (existing.flutterwave_account_number && existing.flutterwave_bank_name && existing.payment_reference && Number(existing.amount) === amount) {
          return json({ reference: existing.payment_reference, transferAccount: { accountNumber: existing.flutterwave_account_number, bankName: existing.flutterwave_bank_name, accountName: existing.flutterwave_account_name || null, amount: Number(existing.flutterwave_transfer_amount || existing.amount), expiresAt: existing.flutterwave_account_expires_at }, provider: "flutterwave", reused: true });
        }
        return json({ error: "This bank-transfer attempt is still being prepared or needs support. Do not start another attempt.", code: "WALLET_DEPOSIT_ATTEMPT_UNCERTAIN" }, 409);
      }
      const reference = "EDK-PAY-" + crypto.randomUUID().replace(/-/g, "").slice(0, 18).toUpperCase();
      const { data: reservation, error: reservationError } = await db.from("payments").insert({
        user_id: user.id, service_request_id: null, amount, currency: "NGN", status: "Pending",
        payment_reference: reference, authorization_url: null, payment_type: "wallet_deposit",
        payment_provider: "flutterwave", idempotency_key: idempotencyKey,
      }).select("id,payment_reference").single();
      if (reservationError) {
        if (reservationError.code === "23505") return json({ error: "This bank-transfer attempt is already being prepared. Refresh or contact EDUKEN support.", code: "WALLET_DEPOSIT_ATTEMPT_UNCERTAIN" }, 409);
        throw reservationError;
      }
      const metadata = user.user_metadata || {};
      const displayName = String(metadata.full_name || metadata.name || metadata.display_name || "").trim();
      const nameParts = displayName.split(/\s+/).filter(Boolean);
      let providerResponse: Response;
      try {
        providerResponse = await fetch("https://api.flutterwave.com/v3/virtual-account-numbers", {
          method: "POST",
          headers: { "Authorization": "Bearer " + secret, "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            email: user.email, amount, currency: "NGN", tx_ref: reference,
            firstname: (nameParts[0] || "EDUKEN").slice(0, 80),
            lastname: (nameParts.slice(1).join(" ") || "Customer").slice(0, 80),
            narration: "EDUKEN Wallet Top-up", expires: "3600",
          }),
        });
      } catch {
        return json({ error: "Flutterwave could not confirm whether bank details were created. Do not start another deposit; contact EDUKEN support with reference " + reference + ".", code: "WALLET_DEPOSIT_ATTEMPT_UNCERTAIN", reference }, 502);
      }
      let providerResult: any;
      try { providerResult = await providerResponse.json(); } catch {
        return json({ error: "Flutterwave returned an unreadable response. Do not start another deposit; contact EDUKEN support with reference " + reference + ".", code: "WALLET_DEPOSIT_ATTEMPT_UNCERTAIN", reference }, 502);
      }
      const account = parseFlutterwaveVirtualAccount(providerResult);
      if (!providerResponse.ok || providerResult?.status !== "success" || !account) {
        const rejected = providerResponse.status >= 400 && providerResponse.status < 500 && providerResponse.status !== 408 && providerResponse.status !== 429 && providerResult?.status !== "success";
        if (rejected) {
          const { error: failError } = await db.from("payments").update({ status: "Failed" }).eq("id", reservation.id).eq("payment_provider", "flutterwave").eq("status", "Pending");
          if (failError) return json({ error: "Flutterwave rejected the transfer but its state needs support before retrying.", code: "WALLET_DEPOSIT_ATTEMPT_UNCERTAIN" }, 503);
          return json({ error: "Flutterwave could not create bank-transfer details. You can safely start a new attempt.", code: "WALLET_DEPOSIT_INITIALIZATION_FAILED" }, 502);
        }
        return json({ error: "Flutterwave could not confirm bank-transfer details. Do not start another deposit; contact support with reference " + reference + ".", code: "WALLET_DEPOSIT_ATTEMPT_UNCERTAIN", reference }, 502);
      }
      const { data: savedPayment, error: saveError } = await db.from("payments").update({
        flutterwave_account_number: account.accountNumber, flutterwave_bank_name: account.bankName, flutterwave_account_name: account.accountName || null,
        flutterwave_account_expires_at: account.expiresAt, flutterwave_transfer_amount: account.transferAmount,
      }).eq("id", reservation.id).eq("payment_provider", "flutterwave").eq("status", "Pending")
        .select("id,payment_reference,flutterwave_account_number,flutterwave_bank_name,flutterwave_account_name,flutterwave_account_expires_at,flutterwave_transfer_amount").maybeSingle();
      if (saveError || !savedPayment) return json({ error: "Flutterwave created bank details but saving them needs recovery. Do not transfer yet; contact support with reference " + reference + ".", code: "WALLET_DEPOSIT_ATTEMPT_UNCERTAIN", reference }, 503);
      return json({ reference, provider: "flutterwave", transferAccount: { accountNumber: savedPayment.flutterwave_account_number, bankName: savedPayment.flutterwave_bank_name, accountName: savedPayment.flutterwave_account_name || null, amount: Number(savedPayment.flutterwave_transfer_amount || amount), expiresAt: savedPayment.flutterwave_account_expires_at } });
    }

    if (path === "/api/wallet/deposit/verify" && req.method === "POST") {
      let rateAllowed: boolean | null;
      try { rateAllowed = await consumeEmailAlertRateLimit(req, "wallet-deposit-verify"); } catch { return json({ error: "Wallet verification is temporarily unavailable." }, 503); }
      if (rateAllowed === null) return json({ error: "Wallet verification is temporarily unavailable." }, 503);
      if (!rateAllowed) return json({ error: "Too many wallet verification attempts. Please wait before trying again." }, 429);
      const user = await requireUser(req);
      let b: any;
      try { b = await req.json(); } catch { return json({ error: "A valid JSON request body is required." }, 400); }
      const reference = typeof b?.reference === "string" ? b.reference.trim() : "";
      if (!/^EDK-PAY-[A-Z0-9]{18}$/.test(reference)) return json({ error: "A valid wallet deposit reference is required." }, 400);
      const { data: payment, error: lookupError } = await db.from("payments")
        .select("id,amount,currency,status,payment_reference,payment_type,payment_provider,user_id")
        .eq("payment_reference", reference).eq("user_id", user.id).eq("payment_type", "wallet_deposit").maybeSingle();
      if (lookupError) throw lookupError;
      if (!payment || !["paystack", "flutterwave"].includes(payment.payment_provider)) return json({ error: "Wallet deposit not found for this account." }, 404);

      if (payment.payment_provider === "flutterwave") {
        const secret = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
        if (!isFlutterwaveModeEnabled(Deno.env.get("FLUTTERWAVE_MODE"), secret)) {
          return json({ error: "Flutterwave verification is not enabled for the configured key and mode.", code: "FLUTTERWAVE_MODE_OR_KEY_MISMATCH" }, 503);
        }
        let response: Response;
        try {
          const verifyUrl = new URL("https://api.flutterwave.com/v3/transactions/verify_by_reference");
          verifyUrl.searchParams.set("tx_ref", reference);
          response = await fetch(verifyUrl, { headers: { "Authorization": "Bearer " + secret, "Content-Type": "application/json" } });
        } catch {
          return json({ error: "Unable to verify the Flutterwave deposit yet. Do not pay again immediately." }, 502);
        }
        let result: any;
        try { result = await response.json(); } catch { return json({ error: "Unable to verify the Flutterwave deposit yet." }, 502); }
        if (!response.ok || result?.status !== "success" || !result?.data) return json({ error: "Unable to verify the Flutterwave deposit yet. Do not pay again immediately." }, 502);
        const transaction = result.data;
        if (String(transaction.tx_ref || "") !== reference) return json({ error: "Flutterwave returned a different reference. Contact support before taking further action." }, 409);
        const paid = isSuccessfulFlutterwaveTransaction(transaction);
        if (paid && !matchesStoredFlutterwavePayment(transaction, { amount: payment.amount, currency: payment.currency, reference })) {
          return json({ error: "Flutterwave payment details do not match this deposit. Contact EDUKEN CONSULT." }, 409);
        }
        if (payment.status === "Paid" && !paid) return json({ error: "Stored deposit status conflicts with Flutterwave. Contact support before taking further action." }, 409);
        const nextStatus = getNextFlutterwavePaymentStatus(transaction);
        if (paid) {
          const { data: settled, error: settleError } = await db.rpc("settle_customer_wallet_deposit", { p_payment_id: payment.id, p_reference: reference });
          if (settleError) throw settleError;
          await sendPaymentNotifications(user.id, reference, Number(payment.amount), "deposit");
          return json({ paid: true, status: "Paid", wallet: settled, payment: { ...payment, status: "Paid" } });
        }
        const { error: statusError } = await db.from("payments").update({ status: nextStatus, paid_at: null })
          .eq("id", payment.id).eq("payment_provider", "flutterwave").in("status", ["Pending", "Failed"]);
        if (statusError) throw statusError;
        return json({ paid: false, status: nextStatus });
      }

      if (payment.status === "Paid") {
        const { data: settled, error: settleError } = await db.rpc("settle_customer_wallet_deposit", { p_payment_id: payment.id, p_reference: reference });
        if (settleError) throw settleError;
        // Re-enqueue missing rows safely; delivered rows remain delivered.
        await sendPaymentNotifications(user.id, reference, Number(payment.amount), "deposit");
        return json({ paid: true, wallet: settled, payment });
      }
      const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
      if (!isPaystackTestModeEnabled(Deno.env.get("PAYSTACK_MODE"), secret)) {
        return json({ error: "Paystack is disabled unless PAYSTACK_MODE=test and a sk_test_ key is configured.", code: "PAYSTACK_TEST_MODE_REQUIRED" }, 503);
      }
      const response = await fetch("https://api.paystack.co/transaction/verify/" + encodeURIComponent(reference), {
        headers: { "Authorization": "Bearer " + secret },
      });
      let result: any;
      try { result = await response.json(); } catch { return json({ error: "Unable to verify deposit with Paystack." }, 502); }
      if (!response.ok || !result?.status || !result?.data) return json({ error: "Unable to verify deposit with Paystack." }, 502);
      const transaction = result.data;
      if (String(transaction.reference || "") !== reference) return json({ error: "Paystack returned a different reference. Contact support before taking further action." }, 409);
      const paid = isSuccessfulPaystackTransaction(transaction);
      if (paid && !matchesStoredPaystackPayment(transaction, { amount: payment.amount, currency: payment.currency, reference })) {
        return json({ error: "Paystack's payment details do not match this deposit. Contact support before retrying." }, 409);
      }
      if (paid) {
        const { data: settled, error: settleError } = await db.rpc("settle_customer_wallet_deposit", { p_payment_id: payment.id, p_reference: reference });
        if (settleError) throw settleError;
        // Idempotent enqueue repairs a notification missed by an earlier partial failure.
        await sendPaymentNotifications(user.id, reference, Number(payment.amount), "deposit");
        return json({ paid: true, wallet: settled, payment: { ...payment, status: "Paid" } });
      }
      const nextStatus = getNextPaymentStatus(transaction);
      const { error: statusError } = await db.from("payments").update({ status: nextStatus }).eq("id", payment.id).in("status", ["Pending", "Failed"]);
      if (statusError) throw statusError;
      return json({ paid: false, status: nextStatus });
    }

    if (path === "/api/wallet/pay-service" && req.method === "POST") {
      const user = await requireUser(req);
      let b: any;
      try { b = await req.json(); } catch { return json({ error: "A valid JSON request body is required." }, 400); }
      const serviceRequestId = typeof b?.serviceRequestId === "string" ? b.serviceRequestId : "";
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(serviceRequestId)) {
        return json({ error: "A valid service request is required." }, 400);
      }
      const paymentReference = "EDK-WAL-" + crypto.randomUUID().replace(/-/g, "").slice(0, 18).toUpperCase();
      const { data: result, error } = await db.rpc("pay_service_from_customer_wallet", {
        p_user_id: user.id,
        p_service_request_id: serviceRequestId,
        p_idempotency_key: "wallet-service:" + serviceRequestId,
        p_payment_reference: paymentReference,
      });
      if (error) {
        const message = String(error.message || "");
        if (message.includes("WALLET_INSUFFICIENT_FUNDS")) return json({ error: "Your wallet balance is too low for this service. Add funds or use an available checkout method.", code: "WALLET_INSUFFICIENT_FUNDS" }, 409);
        if (message.includes("SERVICE_REQUEST_ALREADY_PAID")) return json({ error: "This service request is already paid.", code: "SERVICE_REQUEST_ALREADY_PAID" }, 409);
        if (message.includes("WALLET_SERVICE_REQUEST_NOT_FOUND")) return json({ error: "This service request was not found for your account.", code: "SERVICE_REQUEST_NOT_FOUND" }, 404);
        if (message.includes("WALLET_SERVICE_NOT_PAYABLE")) return json({ error: "This service does not have a confirmed online price or is unavailable.", code: "WALLET_SERVICE_NOT_PAYABLE" }, 409);
        if (message.includes("WALLET_SERVICE_QUANTITY_INVALID")) return json({ error: "The saved service quantity is invalid for wallet payment.", code: "WALLET_SERVICE_QUANTITY_INVALID" }, 409);
        throw error;
      }
      // Re-enqueue safely even for an idempotent wallet-payment retry.
      await sendPaymentNotifications(user.id, String(result?.payment_reference || paymentReference), Number(result?.amount || 0), "service_payment");
      return json({ paid: true, wallet: result });
    }

    if (path === "/api/flutterwave/payments/initialize-guest" && req.method === "POST") {
      let rateAllowed: boolean | null;
      try { rateAllowed = await consumeEmailAlertRateLimit(req, "guest-payment-initialize"); } catch { return json({ error: "Checkout is temporarily unavailable." }, 503); }
      if (rateAllowed === null) return json({ error: "Checkout is temporarily unavailable." }, 503);
      if (!rateAllowed) return json({ error: "Too many checkout attempts. Please wait before trying again." }, 429);
      const secret = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
      if (!isFlutterwaveModeEnabled(Deno.env.get("FLUTTERWAVE_MODE"), secret)) {
        return json({ error: "Flutterwave is disabled unless FLUTTERWAVE_MODE explicitly matches the configured secret key type.", code: "FLUTTERWAVE_TEST_MODE_REQUIRED" }, 503);
      }
      let b: any;
      try { b = await req.json(); } catch { return json({ error: "A valid JSON request body is required." }, 400); }
      const serviceRequestId = typeof b?.serviceRequestId === "string" ? b.serviceRequestId : "";
      const checkoutToken = typeof b?.checkoutToken === "string" ? b.checkoutToken : "";
      const email = typeof b?.email === "string" ? b.email.trim() : "";
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(serviceRequestId)
        || !/^[0-9a-f]{64}$/.test(checkoutToken)
        || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        || email.length > 200) {
        return json({ error: "A valid checkout session and receipt email are required." }, 400);
      }
      const tokenHash = await sha256Hex(checkoutToken);
      const { data: request, error: requestError } = await db.from("service_requests")
        .select("id,user_id,service_id,reference_number,email,status,quantity,checkout_token_hash,services(name,price,is_published,is_available,is_catalog_item)")
        .eq("id", serviceRequestId).eq("checkout_token_hash", tokenHash).maybeSingle();
      if (requestError) throw requestError;
      if (!request) return json({ error: "Checkout session is invalid or expired. Contact EDUKEN CONSULT with your request reference." }, 404);
      if (request.status === "Paid") return json({ error: "This service request is already paid.", code: "SERVICE_REQUEST_ALREADY_PAID" }, 409);
      const service = Array.isArray(request.services) ? request.services[0] : request.services;
      const quantity = Number(request.quantity ?? 1);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100 || (quantity > 1 && service?.is_catalog_item !== true)) {
        return json({ error: "The saved service quantity is invalid. Please contact EDUKEN CONSULT.", code: "INVALID_SERVICE_QUANTITY" }, 409);
      }
      const trustedAmount = Number(service?.price) * quantity;
      if (!service || !service.is_published || service.is_available === false || !Number.isFinite(trustedAmount) || trustedAmount <= 0) {
        return json({ error: "This service does not have a confirmed online price. Please contact EDUKEN CONSULT for a quote." }, 409);
      }
      const { data: paidPayment, error: paidLookupError } = await db.from("payments")
        .select("id,status,payment_reference").eq("service_request_id", request.id).eq("status", "Paid").maybeSingle();
      if (paidLookupError) throw paidLookupError;
      if (paidPayment) return json({ error: "This service request is already paid.", code: "SERVICE_REQUEST_ALREADY_PAID" }, 409);
      const { data: pendingPayment, error: pendingLookupError } = await db.from("payments")
        .select("id,amount,currency,status,service_request_id,payment_reference,authorization_url,payment_provider")
        .eq("service_request_id", request.id).eq("status", "Pending").maybeSingle();
      if (pendingLookupError) throw pendingLookupError;
      if (pendingPayment) {
        if (pendingPayment.payment_provider !== "flutterwave") {
          return json({ error: "A Paystack payment attempt already exists for this request. Continue that checkout or contact EDUKEN CONSULT before switching providers.", code: "PAYMENT_ATTEMPT_EXISTS" }, 409);
        }
        const savedUrl = getFlutterwaveCheckoutUrl({ status: "success", data: { link: pendingPayment.authorization_url } });
        const amountMatches = pendingPayment.payment_reference && Math.round(Number(pendingPayment.amount) * 100) === Math.round(trustedAmount * 100);
        if (savedUrl && amountMatches) {
          return json({ payment: pendingPayment, authorizationUrl: savedUrl, reference: pendingPayment.payment_reference, provider: "flutterwave", reused: true });
        }
        if (amountMatches && !pendingPayment.authorization_url) {
          // Recover an uncertain initialization by checking Flutterwave first. Never create a
          // second provider attempt while the original reference may already exist.
          let verifyResponse: Response;
          try {
            const verifyUrl = new URL("https://api.flutterwave.com/v3/transactions/verify_by_reference");
            verifyUrl.searchParams.set("tx_ref", pendingPayment.payment_reference);
            verifyResponse = await fetch(verifyUrl, {
              method: "GET",
              headers: { "Authorization": "Bearer " + secret, "Content-Type": "application/json" },
            });
          } catch {
            return json({ error: "Flutterwave is still checking the earlier attempt. Do not start another payment; try again later or contact EDUKEN CONSULT.", code: "PAYMENT_INITIALIZATION_UNCERTAIN" }, 409);
          }
          let verifyResult: any = null;
          try { verifyResult = await verifyResponse.json(); } catch { /* handled as uncertain below */ }
          if (verifyResponse.ok && verifyResult?.status === "success" && verifyResult?.data) {
            return json({ error: "Flutterwave found a transaction for this reference. Do not start another payment; contact EDUKEN CONSULT for recovery.", code: "PAYMENT_INITIALIZATION_UNCERTAIN", reference: pendingPayment.payment_reference }, 409);
          }
          // Flutterwave v3 returns 400 when no transaction matches the reference.
          // Only in that case is it safe to release the orphaned reservation for a fresh attempt.
          if (verifyResponse.status === 400) {
            const { error: releaseError } = await db.from("payments").update({ status: "Failed" })
              .eq("id", pendingPayment.id).eq("payment_provider", "flutterwave").eq("status", "Pending")
              .is("authorization_url", null);
            if (releaseError) throw releaseError;
            return json({ error: "No Flutterwave transaction was found for the earlier attempt. Refresh the checkout and try again.", code: "PAYMENT_INITIALIZATION_FAILED", reference: pendingPayment.payment_reference }, 409);
          }
          return json({ error: "Flutterwave could not verify the earlier attempt yet. Do not start another payment; contact EDUKEN CONSULT.", code: "PAYMENT_INITIALIZATION_UNCERTAIN", reference: pendingPayment.payment_reference }, 409);
        }
        return json({ error: "A Flutterwave payment attempt is still being prepared or needs support. Do not start another payment; contact EDUKEN CONSULT.", code: "PAYMENT_INITIALIZATION_UNCERTAIN" }, 409);
      }
      const reference = "EDK-PAY-" + crypto.randomUUID().replace(/-/g, "").slice(0, 18).toUpperCase();
      const callbackUrl = getFlutterwaveCallbackUrl(Deno.env.get("PUBLIC_SITE_URL"), reference);
      if (!callbackUrl) return json({ error: "Secure payment callback configuration is missing.", code: "PAYMENT_CALLBACK_NOT_CONFIGURED" }, 503);
      const { data: reservation, error: reservationError } = await db.from("payments").insert({
        user_id: request.user_id ?? null, service_request_id: request.id, amount: trustedAmount,
        currency: "NGN", status: "Pending", payment_reference: reference, authorization_url: null,
        payment_provider: "flutterwave",
      }).select("id,amount,currency,status,service_request_id,payment_reference,authorization_url,payment_provider").single();
      if (reservationError) {
        if (reservationError.code === "23505") {
          return json({ error: "A payment attempt is already being prepared or needs support. Do not retry payment; contact EDUKEN CONSULT with your request reference.", code: "PAYMENT_ATTEMPT_EXISTS" }, 409);
        }
        throw reservationError;
      }
      let providerResponse: Response;
      try {
        providerResponse = await fetch("https://api.flutterwave.com/v3/payments", {
          method: "POST",
          headers: { "Authorization": "Bearer " + secret, "Content-Type": "application/json" },
          body: JSON.stringify({
            tx_ref: reference, amount: trustedAmount, currency: "NGN", redirect_url: callbackUrl,
            customer: { email },
            customizations: { title: "EDUKEN CONSULT", description: "Education service payment" },
            meta: { service_request_id: request.id, reference_number: request.reference_number, customer_email: email },
          }),
        });
      } catch (error) {
        console.error("Flutterwave checkout initialization request failed.", {
          reference,
          error: error instanceof Error ? error.message : "Unknown fetch error",
        });
        return json({ error: "Flutterwave could not confirm whether checkout was created. Do not start another payment; contact EDUKEN CONSULT.", code: "PAYMENT_INITIALIZATION_UNCERTAIN", reference }, 502);
      }
      let providerResult: any;
      try { providerResult = await providerResponse.json(); } catch {
        console.error("Flutterwave returned an unreadable checkout initialization response.", {
          reference, httpStatus: providerResponse.status,
        });
        return json({ error: "Flutterwave returned an unreadable response. Do not start another payment; contact EDUKEN CONSULT.", code: "PAYMENT_INITIALIZATION_UNCERTAIN", reference }, 502);
      }
      const authorizationUrl = getFlutterwaveCheckoutUrl(providerResult);
      if (!providerResponse.ok || providerResult?.status !== "success" || !authorizationUrl) {
        let returnedLinkHost: string | null = null;
        try { returnedLinkHost = typeof providerResult?.data?.link === "string" ? new URL(providerResult.data.link).hostname : null; } catch { /* malformed link */ }
        console.error("Flutterwave checkout initialization was rejected or returned an invalid link.", {
          reference,
          httpStatus: providerResponse.status,
          providerStatus: typeof providerResult?.status === "string" ? providerResult.status : null,
          providerMessage: typeof providerResult?.message === "string" ? providerResult.message.slice(0, 200) : null,
          hasLink: typeof providerResult?.data?.link === "string",
          returnedLinkHost,
          linkAccepted: Boolean(authorizationUrl),
        });
      }
      if (!providerResponse.ok || providerResult?.status !== "success") {
        const definitiveRejection = providerResponse.status >= 400 && providerResponse.status < 500 && providerResponse.status !== 408 && providerResult?.status !== "success";
        if (definitiveRejection) {
          const { error: markFailedError } = await db.from("payments").update({ status: "Failed" })
            .eq("id", reservation.id).eq("payment_provider", "flutterwave").eq("status", "Pending");
          if (markFailedError) return json({ error: "Flutterwave initialization failed and needs support before retrying.", code: "PAYMENT_ATTEMPT_REQUIRES_SUPPORT" }, 503);
          return json({ error: "Unable to initialize Flutterwave payment. You can safely try again.", code: "PAYMENT_INITIALIZATION_FAILED" }, 502);
        }
        return json({ error: "Flutterwave could not confirm whether checkout was created. Do not start another payment; contact EDUKEN CONSULT.", code: "PAYMENT_INITIALIZATION_UNCERTAIN", reference }, 502);
      }
      if (!authorizationUrl) return json({ error: "Flutterwave checkout could not be confirmed. Do not retry yet; contact EDUKEN CONSULT.", code: "PAYMENT_INITIALIZATION_UNCERTAIN", reference }, 502);
      const { data: payment, error: saveUrlError } = await db.from("payments").update({ authorization_url: authorizationUrl })
        .eq("id", reservation.id).eq("payment_provider", "flutterwave").eq("status", "Pending")
        .select("id,amount,currency,status,service_request_id,payment_reference,authorization_url,payment_provider").maybeSingle();
      if (saveUrlError || !payment) {
        console.error("Flutterwave initialized but checkout URL persistence needs recovery.", saveUrlError?.message || "Payment reservation changed.");
        return json({ payment: reservation, authorizationUrl, reference, provider: "flutterwave", recoveryRequired: true });
      }
      return json({ payment, authorizationUrl, reference, provider: "flutterwave" });
    }

    if (path === "/api/payments/initialize-guest" && req.method === "POST") {
      let rateAllowed: boolean | null;
      try { rateAllowed = await consumeEmailAlertRateLimit(req, "guest-payment-initialize"); } catch { return json({ error: "Checkout is temporarily unavailable." }, 503); }
      if (rateAllowed === null) return json({ error: "Checkout is temporarily unavailable." }, 503);
      if (!rateAllowed) return json({ error: "Too many checkout attempts. Please wait before trying again." }, 429);
      let b: any;
      try { b = await req.json(); } catch { return json({ error: "A valid JSON request body is required." }, 400); }
      const serviceRequestId = typeof b?.serviceRequestId === "string" ? b.serviceRequestId : "";
      const checkoutToken = typeof b?.checkoutToken === "string" ? b.checkoutToken : "";
      const email = typeof b?.email === "string" ? b.email.trim() : "";
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(serviceRequestId)
        || !/^[0-9a-f]{64}$/.test(checkoutToken)
        || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        || email.length > 200) {
        return json({ error: "A valid checkout session and receipt email are required." }, 400);
      }
      const tokenHash = await sha256Hex(checkoutToken);
      const { data: request, error: requestError } = await db.from("service_requests")
        .select("id,user_id,service_id,reference_number,email,status,quantity,checkout_token_hash,services(name,price,is_published,is_available,is_catalog_item)")
        .eq("id", serviceRequestId).eq("checkout_token_hash", tokenHash).maybeSingle();
      if (requestError) throw requestError;
      if (!request) return json({ error: "Checkout session is invalid or expired. Contact EDUKEN CONSULT with your request reference." }, 404);
      if (request.status === "Paid") {
        return json({ error: "This service request is already paid.", code: "SERVICE_REQUEST_ALREADY_PAID" }, 409);
      }
      const service = Array.isArray(request.services) ? request.services[0] : request.services;
      const quantity = Number(request.quantity ?? 1);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
        return json({ error: "The saved service quantity is invalid. Please contact EDUKEN CONSULT.", code: "INVALID_SERVICE_QUANTITY" }, 409);
      }
      if (quantity > 1 && service?.is_catalog_item !== true) {
        return json({ error: "Only catalogue services can be paid for multiple candidates.", code: "INVALID_SERVICE_QUANTITY" }, 409);
      }
      const trustedAmount = Number(service?.price) * quantity;
      if (!service || !service.is_published || service.is_available === false || !Number.isFinite(trustedAmount) || trustedAmount <= 0) {
        return json({ error: "This service does not have a confirmed online price. Please contact EDUKEN CONSULT for a quote." }, 409);
      }
      const { data: paidPayment, error: paidLookupError } = await db.from("payments")
        .select("id,status,payment_reference").eq("service_request_id", request.id).eq("status", "Paid").maybeSingle();
      if (paidLookupError) throw paidLookupError;
      if (paidPayment) return json({ error: "This service request is already paid.", code: "SERVICE_REQUEST_ALREADY_PAID" }, 409);
      const { data: pendingPayment, error: pendingLookupError } = await db.from("payments")
        .select("id,amount,currency,status,service_request_id,payment_reference,authorization_url,payment_provider")
        .eq("service_request_id", request.id).eq("status", "Pending").maybeSingle();
      if (pendingLookupError) throw pendingLookupError;
      if (pendingPayment) {
        if (Math.round(Number(pendingPayment.amount) * 100) !== Math.round(trustedAmount * 100)) {
          return json({ error: "The service price changed after a payment attempt was started. Do not pay using an old checkout link; contact EDUKEN CONSULT with your request reference.", code: "PENDING_PAYMENT_PRICE_CHANGED" }, 409);
        }
        const savedAuthorizationUrl = getPaystackAuthorizationUrl({ status: true, data: { authorization_url: pendingPayment.authorization_url } });
        if (savedAuthorizationUrl && pendingPayment.payment_reference) {
          return json({ payment: pendingPayment, authorizationUrl: savedAuthorizationUrl, reference: pendingPayment.payment_reference, reused: true });
        }
        return json({ error: "A payment attempt already exists for this request. Please contact EDUKEN CONSULT with your request reference before trying again.", code: "PAYMENT_ATTEMPT_EXISTS" }, 409);
      }
      const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
      if (!isPaystackTestModeEnabled(Deno.env.get("PAYSTACK_MODE"), secret)) return json({ error: "Paystack is disabled unless PAYSTACK_MODE=test and a sk_test_ key is configured.", code: "PAYSTACK_TEST_MODE_REQUIRED" }, 503);
      const reference = "EDK-PAY-" + crypto.randomUUID().replace(/-/g, "").slice(0, 18).toUpperCase();
      const callbackUrl = getPaystackCallbackUrl(Deno.env.get("PUBLIC_SITE_URL"), reference);
      if (!callbackUrl) return json({ error: "Secure payment callback configuration is missing.", code: "PAYMENT_CALLBACK_NOT_CONFIGURED" }, 503);

      // Reserve the request before contacting Paystack. The partial unique index prevents
      // concurrent requests from creating multiple provider transactions for one request.
      const { data: reservation, error: reservationError } = await db.from("payments").insert({
        user_id: request.user_id ?? null, service_request_id: request.id, amount: trustedAmount,
        currency: "NGN", status: "Pending", payment_reference: reference, authorization_url: null
      }).select("id,amount,currency,status,service_request_id,payment_reference,authorization_url").single();
      if (reservationError) {
        if (reservationError.code === "23505") {
          const { data: racedPayment, error: racedLookupError } = await db.from("payments")
            .select("id,amount,currency,status,service_request_id,payment_reference,authorization_url")
            .eq("service_request_id", request.id).eq("status", "Pending").maybeSingle();
          if (racedLookupError) throw racedLookupError;
          const racedUrl = getPaystackAuthorizationUrl({ status: true, data: { authorization_url: racedPayment?.authorization_url } });
          if (racedPayment && Math.round(Number(racedPayment.amount) * 100) === Math.round(trustedAmount * 100) && racedUrl && racedPayment.payment_reference) {
            return json({ payment: racedPayment, authorizationUrl: racedUrl, reference: racedPayment.payment_reference, reused: true });
          }
          return json({ error: "A payment attempt is already being prepared or needs support. Do not retry payment; contact EDUKEN CONSULT with your request reference.", code: "PAYMENT_ATTEMPT_EXISTS" }, 409);
        }
        throw reservationError;
      }

      let paystack: Response;
      try {
        paystack = await fetch("https://api.paystack.co/transaction/initialize", {
          method: "POST",
          headers: { "Authorization": "Bearer " + secret, "Content-Type": "application/json" },
          body: JSON.stringify({
            email, amount: Math.round(trustedAmount * 100), currency: "NGN", reference, callback_url: callbackUrl,
            metadata: { service_request_id: request.id, reference_number: request.reference_number, customer_email: email },
          })
        });
      } catch {
        // A network failure can happen after the provider accepted the request. Keep the
        // reservation Pending so a retry cannot create a duplicate transaction.
        return json({ error: "Payment initialization could not be confirmed. Do not retry yet; contact EDUKEN CONSULT with your request reference.", code: "PAYMENT_INITIALIZATION_UNCERTAIN" }, 502);
      }

      let result: any;
      try { result = await paystack.json(); } catch {
        return json({ error: "Payment initialization could not be confirmed. Do not retry yet; contact EDUKEN CONSULT with your request reference.", code: "PAYMENT_INITIALIZATION_UNCERTAIN" }, 502);
      }
      const authorizationUrl = getPaystackAuthorizationUrl(result);
      if (!paystack.ok || result?.status !== true) {
        if (getPaystackInitializationFailureDisposition({ ok: paystack.ok, status: paystack.status, providerStatus: result?.status === true, hasAuthorizationUrl: Boolean(authorizationUrl) }) === "unconfirmed") {
          return json({ error: "Payment initialization could not be confirmed. Do not retry yet; contact EDUKEN CONSULT with your request reference.", code: "PAYMENT_INITIALIZATION_UNCERTAIN", reference }, 502);
        }
        const { error: markFailedError } = await db.from("payments").update({ status: "Failed" })
          .eq("id", reservation.id).eq("status", "Pending");
        if (markFailedError) {
          console.error("Could not mark rejected Paystack initialization as failed.", markFailedError.message);
          return json({ error: "Payment initialization failed and needs support before retrying.", code: "PAYMENT_ATTEMPT_REQUIRES_SUPPORT" }, 503);
        }
        return json({ error: "Unable to initialize payment. You can safely try again.", code: "PAYMENT_INITIALIZATION_FAILED" }, 502);
      }

      if (!authorizationUrl) {
        // The provider may have created a transaction despite an unexpected response shape.
        // Keep the reservation Pending to prevent duplicate charges on retry.
        return json({ error: "Payment initialization could not be confirmed. Do not retry yet; contact EDUKEN CONSULT with your request reference.", code: "PAYMENT_INITIALIZATION_UNCERTAIN" }, 502);
      }

      const { data: payment, error: saveUrlError } = await db.from("payments").update({
        authorization_url: authorizationUrl
      }).eq("id", reservation.id).eq("status", "Pending")
        .select("id,amount,currency,status,service_request_id,payment_reference,authorization_url").maybeSingle();
      if (!saveUrlError && !payment) {
        const { data: currentPayment, error: currentPaymentError } = await db.from("payments")
          .select("status").eq("id", reservation.id).maybeSingle();
        if (currentPaymentError) throw currentPaymentError;
        if (currentPayment?.status === "Paid") {
          return json({ error: "This service request is already paid.", code: "SERVICE_REQUEST_ALREADY_PAID" }, 409);
        }
        if (currentPayment?.status !== "Pending") {
          return json({ error: "Payment state changed while checkout was being prepared. Contact EDUKEN CONSULT before retrying.", code: "PAYMENT_ATTEMPT_REQUIRES_SUPPORT" }, 409);
        }
      }
      if (saveUrlError || !payment) {
        // If persistence failed, the reserved row remains verifiable by reference/webhook.
        // Return the provider URL only when the reservation's status is still unresolved.
        console.error("Paystack initialized but checkout URL persistence needs recovery.", saveUrlError?.message || "Payment reservation changed.");
        return json({ payment: reservation, authorizationUrl, accessCode: result.data.access_code, reference, recoveryRequired: true });
      }
      return json({ payment, authorizationUrl, accessCode: result.data.access_code, reference });
    }

    if (path === "/api/payments/initialize" && req.method === "POST") {
      const user = await requireUser(req);
      let b: any;
      try { b = await req.json(); } catch { return json({ error: "A valid JSON request body is required." }, 400); }
      if (typeof b?.serviceRequestId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(b.serviceRequestId)) {
        return json({ error: "A valid service request is required." }, 400);
      }
      const { data: request, error: requestError } = await db.from("service_requests")
        .select("id,service_id,reference_number,email,status,quantity,services(name,price,is_published,is_available,is_catalog_item)")
        .eq("id", b.serviceRequestId).eq("user_id", user.id).maybeSingle();
      if (requestError) throw requestError;
      if (!request) return json({ error: "Service request not found." }, 404);
      if (request.status === "Paid") {
        return json({ error: "This service request is already paid.", code: "SERVICE_REQUEST_ALREADY_PAID" }, 409);
      }
      const { data: paidPayment, error: paidLookupError } = await db.from("payments")
        .select("id,status,payment_reference").eq("service_request_id", request.id).eq("status", "Paid").maybeSingle();
      if (paidLookupError) throw paidLookupError;
      if (paidPayment) return json({ error: "This service request is already paid.", code: "SERVICE_REQUEST_ALREADY_PAID" }, 409);
      const service = Array.isArray(request.services) ? request.services[0] : request.services;
      const quantity = Number(request.quantity ?? 1);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
        return json({ error: "The saved service quantity is invalid. Please contact EDUKEN CONSULT.", code: "INVALID_SERVICE_QUANTITY" }, 409);
      }
      if (quantity > 1 && service?.is_catalog_item !== true) {
        return json({ error: "Only catalogue services can be paid for multiple candidates.", code: "INVALID_SERVICE_QUANTITY" }, 409);
      }
      const trustedAmount = Number(service?.price) * quantity;
      if (!service || !service.is_published || service.is_available === false || !Number.isFinite(trustedAmount) || trustedAmount <= 0) {
        return json({ error: "This service does not have a confirmed online price. Please contact EDUKEN CONSULT for a quote." }, 409);
      }
      // If the client sends a display amount, reject stale or tampered values;
      // the server-side published service price remains authoritative.
      if (b.amount !== undefined && (!Number.isFinite(Number(b.amount)) || Math.round(Number(b.amount) * 100) !== Math.round(trustedAmount * 100))) {
        return json({ error: "The service price has changed. Refresh and try again." }, 409);
      }
      const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
      if (!isPaystackTestModeEnabled(Deno.env.get("PAYSTACK_MODE"), secret)) return json({ error: "Paystack is disabled unless PAYSTACK_MODE=test and a sk_test_ key is configured.", code: "PAYSTACK_TEST_MODE_REQUIRED" }, 503);
      const { data: pendingPayment, error: pendingLookupError } = await db.from("payments")
        .select("id,amount,currency,status,service_request_id,payment_reference,authorization_url,payment_provider")
        .eq("service_request_id", request.id).eq("status", "Pending").maybeSingle();
      if (pendingLookupError) throw pendingLookupError;
      if (pendingPayment) {
        if (Math.round(Number(pendingPayment.amount) * 100) !== Math.round(trustedAmount * 100)) {
          return json({ error: "The service price changed after a payment attempt was started. Contact EDUKEN CONSULT before retrying.", code: "PENDING_PAYMENT_PRICE_CHANGED" }, 409);
        }
        const savedUrl = getPaystackAuthorizationUrl({ status: true, data: { authorization_url: pendingPayment.authorization_url } });
        if (savedUrl && pendingPayment.payment_reference) return json({ payment: pendingPayment, authorizationUrl: savedUrl, reference: pendingPayment.payment_reference, reused: true });
        return json({ error: "A payment attempt is already being prepared or needs support. Do not retry payment; contact EDUKEN CONSULT.", code: "PAYMENT_ATTEMPT_EXISTS" }, 409);
      }
      const reference = "EDK-PAY-" + crypto.randomUUID().replace(/-/g, "").slice(0, 18).toUpperCase();
      const callbackUrl = getPaystackCallbackUrl(Deno.env.get("PUBLIC_SITE_URL"), reference);
      if (!callbackUrl) return json({ error: "Secure payment callback configuration is missing.", code: "PAYMENT_CALLBACK_NOT_CONFIGURED" }, 503);
      const { data: reservation, error: reservationError } = await db.from("payments").insert({
        user_id: user.id, service_request_id: request.id, amount: trustedAmount,
        currency: "NGN", status: "Pending", payment_reference: reference, authorization_url: null
      }).select("id,amount,currency,status,service_request_id,payment_reference,authorization_url").single();
      if (reservationError) {
        if (reservationError.code === "23505") return json({ error: "A payment attempt already exists. Refresh and check its status before retrying.", code: "PAYMENT_ATTEMPT_EXISTS" }, 409);
        throw reservationError;
      }
      let paystack: Response;
      try {
        paystack = await fetch("https://api.paystack.co/transaction/initialize", {
          method: "POST",
          headers: { "Authorization": "Bearer " + secret, "Content-Type": "application/json" },
          body: JSON.stringify({ email: request.email || "edukenconsult00@gmail.com", amount: Math.round(trustedAmount * 100), currency: "NGN", reference, callback_url: callbackUrl, metadata: { service_request_id: request.id, user_id: user.id, reference_number: request.reference_number } })
        });
      } catch {
        return json({ error: "Payment initialization could not be confirmed. Do not retry yet; contact EDUKEN CONSULT.", code: "PAYMENT_INITIALIZATION_UNCERTAIN" }, 502);
      }
      let result: any;
      try { result = await paystack.json(); } catch {
        return json({ error: "Payment initialization could not be confirmed. Do not retry yet; contact EDUKEN CONSULT.", code: "PAYMENT_INITIALIZATION_UNCERTAIN" }, 502);
      }
      const authorizationUrl = getPaystackAuthorizationUrl(result);
      if (!paystack.ok || result?.status !== true) {
        if (getPaystackInitializationFailureDisposition({ ok: paystack.ok, status: paystack.status, providerStatus: result?.status === true, hasAuthorizationUrl: Boolean(authorizationUrl) }) === "unconfirmed") {
          return json({ error: "Payment initialization could not be confirmed. Do not retry yet; contact EDUKEN CONSULT.", code: "PAYMENT_INITIALIZATION_UNCERTAIN", reference }, 502);
        }
        const { error: markFailedError } = await db.from("payments").update({ status: "Failed" }).eq("id", reservation.id).eq("status", "Pending");
        if (markFailedError) return json({ error: "Payment initialization failed and needs support before retrying.", code: "PAYMENT_ATTEMPT_REQUIRES_SUPPORT" }, 503);
        return json({ error: "Unable to initialize payment. You can safely try again.", code: "PAYMENT_INITIALIZATION_FAILED" }, 502);
      }
      if (!authorizationUrl) return json({ error: "Payment initialization could not be confirmed. Do not retry yet; contact EDUKEN CONSULT.", code: "PAYMENT_INITIALIZATION_UNCERTAIN" }, 502);
      const { data: payment, error: saveUrlError } = await db.from("payments").update({ authorization_url: authorizationUrl })
        .eq("id", reservation.id).eq("status", "Pending").select().maybeSingle();
      if (!saveUrlError && !payment) {
        const { data: currentPayment, error: currentPaymentError } = await db.from("payments")
          .select("status").eq("id", reservation.id).eq("user_id", user.id).maybeSingle();
        if (currentPaymentError) throw currentPaymentError;
        if (currentPayment?.status === "Paid") return json({ error: "This service request is already paid.", code: "SERVICE_REQUEST_ALREADY_PAID" }, 409);
        if (currentPayment?.status !== "Pending") {
          return json({ error: "Payment state changed while checkout was being prepared. Contact EDUKEN CONSULT before retrying.", code: "PAYMENT_ATTEMPT_REQUIRES_SUPPORT" }, 409);
        }
      }
      if (saveUrlError || !payment) {
        console.error("Paystack initialized but checkout URL persistence needs recovery.", saveUrlError?.message || "Payment reservation changed.");
        return json({ payment: reservation, authorizationUrl, accessCode: result.data.access_code, reference, recoveryRequired: true });
      }
      return json({ payment, authorizationUrl, accessCode: result.data.access_code, reference });
    }

    if (path === "/api/flutterwave/payments/recover-guest" && req.method === "POST") {
      let rateAllowed: boolean | null;
      try { rateAllowed = await consumeEmailAlertRateLimit(req, "guest-payment-recovery"); } catch { return json({ error: "Payment recovery is temporarily unavailable." }, 503); }
      if (rateAllowed === null) return json({ error: "Payment recovery is temporarily unavailable." }, 503);
      if (!rateAllowed) return json({ error: "Too many recovery attempts. Please wait before trying again." }, 429);
      const secret = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
      if (!isFlutterwaveModeEnabled(Deno.env.get("FLUTTERWAVE_MODE"), secret)) {
        return json({ error: "Flutterwave verification is temporarily unavailable.", code: "FLUTTERWAVE_TEST_MODE_REQUIRED" }, 503);
      }
      let b: any;
      try { b = await req.json(); } catch { return json({ error: "A valid JSON request body is required." }, 400); }
      const reference = typeof b?.reference === "string" ? b.reference.trim() : "";
      const transactionId = typeof b?.transactionId === "string" || typeof b?.transactionId === "number" ? String(b.transactionId) : "";
      if (!/^EDK-PAY-[A-Z0-9]{18}$/.test(reference) || !/^\d{1,30}$/.test(transactionId)) {
        return json({ error: "A valid Flutterwave reference and transaction ID are required." }, 400);
      }
      const { data: payment, error: lookupError } = await db.from("payments")
        .select("id,amount,currency,status,service_request_id,payment_reference,payment_provider,user_id")
        .eq("payment_reference", reference).eq("payment_provider", "flutterwave").maybeSingle();
      if (lookupError) throw lookupError;
      if (!payment?.service_request_id) return json({ error: "We could not match this reference to a Flutterwave service checkout. Contact EDUKEN CONSULT before paying again." }, 404);
      const { data: request, error: requestError } = await db.from("service_requests")
        .select("id,email,user_id").eq("id", payment.service_request_id).maybeSingle();
      if (requestError) throw requestError;
      if (!request) return json({ error: "We could not match this reference to a service checkout. Contact EDUKEN CONSULT before paying again." }, 404);
      let response: Response;
      try {
        response = await fetch("https://api.flutterwave.com/v3/transactions/" + encodeURIComponent(transactionId) + "/verify", {
          headers: { "Authorization": "Bearer " + secret, "Content-Type": "application/json" },
        });
      } catch { return json({ error: "Unable to verify the Flutterwave payment yet. Do not pay again immediately." }, 502); }
      let result: any;
      try { result = await response.json(); } catch { return json({ error: "Unable to verify the Flutterwave payment yet." }, 502); }
      if (!response.ok || result?.status !== "success" || !result?.data) return json({ error: "Unable to verify the Flutterwave payment yet." }, 502);
      const transaction = result.data;
      if (String(transaction.tx_ref || "") !== reference) return json({ error: "Flutterwave returned a different payment reference. Contact support before taking further action." }, 409);
      const paid = isSuccessfulFlutterwaveTransaction(transaction);
      if (paid && !matchesStoredFlutterwavePayment(transaction, { amount: payment.amount, currency: payment.currency, reference })) {
        return json({ error: "Flutterwave payment details do not match this checkout. Contact EDUKEN CONSULT." }, 409);
      }
      if (payment.status === "Paid" && !paid) return json({ error: "Stored payment status conflicts with Flutterwave. Contact support before taking further action." }, 409);
      const nextStatus = getNextFlutterwavePaymentStatus(transaction);
      const { data: updatedPayment, error: updateError } = await db.from("payments").update({
        status: nextStatus, paid_at: paid ? new Date().toISOString() : null,
      }).eq("id", payment.id).eq("payment_provider", "flutterwave").in("status", ["Pending", "Failed"])
        .select("id,status").maybeSingle();
      if (updateError) throw updateError;
      if (paid && !updatedPayment && payment.status !== "Paid") {
        const { data: currentPayment, error: currentError } = await db.from("payments").select("status").eq("id", payment.id).maybeSingle();
        if (currentError) throw currentError;
        if (currentPayment?.status !== "Paid") return json({ error: "Payment status changed concurrently. Please refresh and check again." }, 409);
      }
      if (paid) {
        const { error: requestUpdateError } = await db.from("service_requests").update({ status: "Paid" }).eq("id", request.id);
        if (requestUpdateError) throw requestUpdateError;
        if (updatedPayment) await sendPaymentNotifications(request.user_id || payment.user_id || null, reference, Number(payment.amount), "service_payment", request.email || null);
      }
      return json({ paid, recovered: true, status: paid ? "Paid" : nextStatus });
    }

    if (path === "/api/payments/recover-guest" && req.method === "POST") {
      // Safe callback recovery when the browser lost sessionStorage: the high-entropy
      // EDUKEN reference is only a lookup key; Paystack remains the source of truth.
      let rateAllowed: boolean | null;
      try { rateAllowed = await consumeEmailAlertRateLimit(req, "guest-payment-recovery"); } catch { return json({ error: "Payment recovery is temporarily unavailable." }, 503); }
      if (rateAllowed === null) return json({ error: "Payment recovery is temporarily unavailable." }, 503);
      if (!rateAllowed) return json({ error: "Too many recovery attempts. Please wait before trying again." }, 429);
      let b: any;
      try { b = await req.json(); } catch { return json({ error: "A valid JSON request body is required." }, 400); }
      const reference = typeof b?.reference === "string" ? b.reference.trim() : "";
      if (!/^EDK-PAY-[A-Z0-9]{18}$/.test(reference)) return json({ error: "A valid payment reference is required." }, 400);
      const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
      if (!isPaystackTestModeEnabled(Deno.env.get("PAYSTACK_MODE"), secret)) return json({ error: "Paystack verification is temporarily unavailable." }, 503);
      const { data: existingPayment, error: lookupError } = await db.from("payments")
        .select("id,amount,currency,status,service_request_id,payment_reference,user_id")
        .eq("payment_reference", reference).eq("payment_provider", "paystack").maybeSingle();
      if (lookupError) throw lookupError;
      if (!existingPayment || !existingPayment.service_request_id) return json({ error: "We could not match this reference to a service checkout. Please contact EDUKEN CONSULT before paying again." }, 404);
      const { data: request, error: requestError } = await db.from("service_requests")
        .select("id,email,user_id").eq("id", existingPayment.service_request_id).maybeSingle();
      if (requestError) throw requestError;
      if (!request) return json({ error: "We could not match this reference to a service checkout. Please contact EDUKEN CONSULT before paying again." }, 404);
      // Even when our database already says Paid, recovery must verify the provider
      // and match the stored amount/currency/reference before reporting confirmation.
      // Do not resend payment notifications merely because a customer revisits the callback.
      const response = await fetch("https://api.paystack.co/transaction/verify/" + encodeURIComponent(reference), {
        headers: { "Authorization": "Bearer " + secret }
      });
      let result: any;
      try { result = await response.json(); } catch { return json({ error: "Unable to verify payment with the provider yet. Do not pay again immediately." }, 502); }
      if (!response.ok || !result.status || !result.data) return json({ error: "Unable to verify payment with the provider yet. Do not pay again immediately." }, 502);
      const transaction = result.data;
      // The provider response must correspond to the exact reference we asked to verify,
      // even when the provider reports a non-success status. Never mutate a local payment
      // based on a contradictory transaction response.
      if (String(transaction.reference || "") !== reference) {
        return json({ error: "The provider returned a different payment reference. Please contact support before taking further action." }, 409);
      }
      const paid = isSuccessfulPaystackTransaction(transaction);
      if (paid && !matchesStoredPaystackPayment(transaction, { amount: existingPayment.amount, currency: existingPayment.currency, reference })) {
        return json({ error: "The provider's payment details do not match this checkout. Please contact support." }, 409);
      }
      // Never report a previously-Paid database row as Failed/Pending if the provider
      // response conflicts. Preserve the stored state and require support investigation.
      if (existingPayment.status === "Paid" && !paid) {
        return json({ error: "The stored payment status conflicts with the provider response. Please contact support before taking further action." }, 409);
      }
      const nextPaymentStatus = getNextPaymentStatus(transaction);
      const { data: payment, error: updateError } = await db.from("payments").update({
        status: nextPaymentStatus, paid_at: paid ? new Date().toISOString() : null
      }).eq("id", existingPayment.id).eq("payment_reference", reference).eq("payment_provider", "paystack").in("status", ["Pending", "Failed"]).select("id,status").maybeSingle();
      if (updateError) throw updateError;
      if (paid && !payment) {
        const { data: currentPayment, error: currentError } = await db.from("payments").select("status").eq("id", existingPayment.id).maybeSingle();
        if (currentError) throw currentError;
        if (currentPayment?.status !== "Paid") return json({ error: "Payment status changed concurrently. Please refresh and check again." }, 409);
      }
      if (paid) {
        const { error: requestUpdateError } = await db.from("service_requests").update({ status: "Paid" }).eq("id", request.id);
        if (requestUpdateError) throw requestUpdateError;
        // Notify only on the successful Pending/Failed -> Paid transition performed
        // by this request. A repeated recovery of an already-Paid row is read/repair-only.
        if (payment) {
          await sendPaymentNotifications(request.user_id || existingPayment.user_id || null, reference, Number(existingPayment.amount), "service_payment", request.email || null);
        }
      }
      return json({ paid, recovered: true, status: paid ? "Paid" : nextPaymentStatus });
    }

    if (path === "/api/flutterwave/payments/verify-guest" && req.method === "POST") {
      let rateAllowed: boolean | null;
      try { rateAllowed = await consumeEmailAlertRateLimit(req, "guest-payment-verify"); } catch { return json({ error: "Payment verification is temporarily unavailable." }, 503); }
      if (rateAllowed === null) return json({ error: "Payment verification is temporarily unavailable." }, 503);
      if (!rateAllowed) return json({ error: "Too many verification attempts. Please wait before trying again." }, 429);
      const secret = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
      if (!isFlutterwaveModeEnabled(Deno.env.get("FLUTTERWAVE_MODE"), secret)) {
        return json({ error: "Flutterwave verification is temporarily unavailable for the selected mode.", code: "FLUTTERWAVE_TEST_MODE_REQUIRED" }, 503);
      }
      let b: any;
      try { b = await req.json(); } catch { return json({ error: "A valid JSON request body is required." }, 400); }
      const serviceRequestId = typeof b?.serviceRequestId === "string" ? b.serviceRequestId : "";
      const checkoutToken = typeof b?.checkoutToken === "string" ? b.checkoutToken : "";
      const reference = typeof b?.reference === "string" ? b.reference.trim() : "";
      const transactionId = typeof b?.transactionId === "string" || typeof b?.transactionId === "number" ? String(b.transactionId) : "";
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(serviceRequestId)
        || !/^[0-9a-f]{64}$/.test(checkoutToken)
        || !/^EDK-PAY-[A-Z0-9]{18}$/.test(reference)
        || !/^\d{1,30}$/.test(transactionId)) {
        return json({ error: "A valid checkout session, payment reference and Flutterwave transaction ID are required." }, 400);
      }
      const tokenHash = await sha256Hex(checkoutToken);
      const { data: request, error: requestError } = await db.from("service_requests")
        .select("id,checkout_token_hash,email,user_id").eq("id", serviceRequestId).eq("checkout_token_hash", tokenHash).maybeSingle();
      if (requestError) throw requestError;
      if (!request) return json({ error: "Checkout session is invalid or expired." }, 404);
      const { data: payment, error: lookupError } = await db.from("payments")
        .select("id,amount,currency,status,service_request_id,payment_reference,payment_provider,user_id")
        .eq("payment_reference", reference).eq("service_request_id", serviceRequestId).eq("payment_provider", "flutterwave").maybeSingle();
      if (lookupError) throw lookupError;
      if (!payment) return json({ error: "Flutterwave payment record not found for this service request." }, 404);
      if (payment.status === "Paid") {
        await sendPaymentNotifications(request.user_id || payment.user_id || null, reference, Number(payment.amount), "service_payment", request.email || null);
        const { error: requestUpdateError } = await db.from("service_requests").update({ status: "Paid" })
          .eq("id", serviceRequestId).eq("checkout_token_hash", tokenHash);
        if (requestUpdateError) throw requestUpdateError;
        return json({ paid: true, status: "Paid", recovered: true });
      }
      let response: Response;
      try {
        response = await fetch("https://api.flutterwave.com/v3/transactions/" + encodeURIComponent(transactionId) + "/verify", {
          headers: { "Authorization": "Bearer " + secret, "Content-Type": "application/json" },
        });
      } catch { return json({ error: "Unable to verify payment with Flutterwave yet. Do not pay again immediately." }, 502); }
      let result: any;
      try { result = await response.json(); } catch { return json({ error: "Unable to verify payment with Flutterwave yet." }, 502); }
      if (!response.ok || result?.status !== "success" || !result?.data) return json({ error: "Unable to verify payment with Flutterwave yet." }, 502);
      const transaction = result.data;
      if (String(transaction.tx_ref || "") !== reference) {
        return json({ error: "Flutterwave returned a different payment reference. Contact EDUKEN CONSULT before taking further action." }, 409);
      }
      const paid = isSuccessfulFlutterwaveTransaction(transaction);
      if (paid && !matchesStoredFlutterwavePayment(transaction, { amount: payment.amount, currency: payment.currency, reference })) {
        return json({ error: "Flutterwave payment details do not match this checkout. Contact EDUKEN CONSULT." }, 409);
      }
      if (payment.status === "Paid" && !paid) return json({ error: "Stored payment status conflicts with Flutterwave. Contact EDUKEN CONSULT." }, 409);
      const nextStatus = getNextFlutterwavePaymentStatus(transaction);
      const { data: updatedPayment, error: updateError } = await db.from("payments").update({
        status: nextStatus, paid_at: paid ? new Date().toISOString() : null,
      }).eq("id", payment.id).eq("payment_provider", "flutterwave").in("status", ["Pending", "Failed"])
        .select("id,status").maybeSingle();
      if (updateError) throw updateError;
      if (paid && !updatedPayment) {
        const { data: currentPayment, error: currentError } = await db.from("payments").select("status").eq("id", payment.id).maybeSingle();
        if (currentError) throw currentError;
        if (currentPayment?.status !== "Paid") return json({ error: "Payment status changed concurrently. Refresh and check again." }, 409);
      }
      if (paid) {
        const { error: requestUpdateError } = await db.from("service_requests").update({ status: "Paid" })
          .eq("id", serviceRequestId).eq("checkout_token_hash", tokenHash);
        if (requestUpdateError) throw requestUpdateError;
        if (updatedPayment) await sendPaymentNotifications(request.user_id || payment.user_id || null, reference, Number(payment.amount), "service_payment", request.email || null);
      }
      return json({ paid, status: nextStatus, recovered: true });
    }

    if (path === "/api/payments/verify-guest" && req.method === "POST") {
      let rateAllowed: boolean | null;
      try { rateAllowed = await consumeEmailAlertRateLimit(req, "guest-payment-verify"); } catch { return json({ error: "Payment verification is temporarily unavailable." }, 503); }
      if (rateAllowed === null) return json({ error: "Payment verification is temporarily unavailable." }, 503);
      if (!rateAllowed) return json({ error: "Too many verification attempts. Please wait before trying again." }, 429);
      let b: any;
      try { b = await req.json(); } catch { return json({ error: "A valid JSON request body is required." }, 400); }
      const serviceRequestId = typeof b?.serviceRequestId === "string" ? b.serviceRequestId : "";
      const checkoutToken = typeof b?.checkoutToken === "string" ? b.checkoutToken : "";
      const reference = typeof b?.reference === "string" ? b.reference.trim() : "";
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(serviceRequestId)
        || !/^[0-9a-f]{64}$/.test(checkoutToken)
        || !/^EDK-PAY-[A-Z0-9]{18}$/.test(reference)) {
        return json({ error: "A valid checkout session and payment reference are required." }, 400);
      }
      const tokenHash = await sha256Hex(checkoutToken);
      const { data: request, error: requestError } = await db.from("service_requests")
        .select("id,checkout_token_hash,email,user_id").eq("id", serviceRequestId).eq("checkout_token_hash", tokenHash).maybeSingle();
      if (requestError) throw requestError;
      if (!request) return json({ error: "Checkout session is invalid or expired." }, 404);
      const { data: existingPayment, error: lookupError } = await db.from("payments")
        .select("id,amount,currency,status,service_request_id,payment_reference,user_id")
        .eq("payment_reference", reference).eq("service_request_id", serviceRequestId).eq("payment_provider", "paystack").maybeSingle();
      if (lookupError) throw lookupError;
      if (!existingPayment) return json({ error: "Payment record not found for this service request." }, 404);
      if (existingPayment.status === "Paid") {
        // Re-enqueue missing outbox rows; already-delivered receipts are preserved by idempotency.
        await sendPaymentNotifications(request.user_id || existingPayment.user_id || null, reference, Number(existingPayment.amount), "service_payment", request.email || null);
        // Repair request state after a prior partial failure without duplicating delivered receipts.
        if (existingPayment.service_request_id) {
          const { error: requestUpdateError } = await db.from("service_requests").update({ status: "Paid" })
            .eq("id", serviceRequestId).eq("checkout_token_hash", tokenHash);
          if (requestUpdateError) throw requestUpdateError;
        }
        return json({ paid: true, payment: existingPayment });
      }
      const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
      if (!isPaystackTestModeEnabled(Deno.env.get("PAYSTACK_MODE"), secret)) return json({ error: "Paystack is disabled unless PAYSTACK_MODE=test and a sk_test_ key is configured.", code: "PAYSTACK_TEST_MODE_REQUIRED" }, 503);
      const response = await fetch("https://api.paystack.co/transaction/verify/" + encodeURIComponent(reference), {
        headers: { "Authorization": "Bearer " + secret }
      });
      let result: any;
      try { result = await response.json(); } catch { return json({ error: "Unable to verify payment with the provider." }, 502); }
      if (!response.ok || !result.status || !result.data) return json({ error: "Unable to verify payment with the provider." }, 502);
      const transaction = result.data;
      const paid = isSuccessfulPaystackTransaction(transaction);
      if (paid && !matchesStoredPaystackPayment(transaction, { amount: existingPayment.amount, currency: existingPayment.currency, reference })) {
        return json({ error: "The provider's payment details do not match this payment. Please contact support." }, 409);
      }
      const nextPaymentStatus = getNextPaymentStatus(transaction);
      const { data: payment, error } = await db.from("payments").update({
        status: nextPaymentStatus, paid_at: paid ? new Date().toISOString() : null
      }).eq("id", existingPayment.id).eq("service_request_id", serviceRequestId).in("status", ["Pending", "Failed"]).select().maybeSingle();
      if (error) throw error;
      if (paid && !payment && existingPayment.status !== "Paid") {
        const { data: currentPayment, error: currentError } = await db.from("payments").select("status").eq("id", existingPayment.id).maybeSingle();
        if (currentError) throw currentError;
        if (currentPayment?.status !== "Paid") return json({ error: "Payment status changed concurrently. Please refresh and check your payment status." }, 409);
      }
      if (paid) {
        const { error: requestUpdateError } = await db.from("service_requests").update({ status: "Paid" })
          .eq("id", serviceRequestId).eq("checkout_token_hash", tokenHash);
        if (requestUpdateError) throw requestUpdateError;
        // Stable outbox idempotency makes this safe after concurrent or repeated verification.
        await sendPaymentNotifications(request.user_id || existingPayment.user_id || null, reference, Number(existingPayment.amount), "service_payment", request.email || null);
      }
      return json({ paid, payment: payment || existingPayment });
    }

    if (path === "/api/payments/verify" && req.method === "POST") {
      const user = await requireUser(req);
      let b: any;
      try { b = await req.json(); } catch { return json({ error: "A valid JSON request body is required." }, 400); }
      const reference = typeof b?.reference === "string" ? b.reference.trim() : "";
      if (!/^EDK-PAY-[A-Z0-9]{18}$/.test(reference)) return json({ error: "A valid payment reference is required." }, 400);
      const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
      if (!isPaystackTestModeEnabled(Deno.env.get("PAYSTACK_MODE"), secret)) return json({ error: "Paystack is disabled unless PAYSTACK_MODE=test and a sk_test_ key is configured.", code: "PAYSTACK_TEST_MODE_REQUIRED" }, 503);
      const { data: existingPayment, error: lookupError } = await db.from("payments")
        .select("id,amount,currency,status,service_request_id,payment_reference,user_id")
        .eq("payment_reference", reference).eq("user_id", user.id).eq("payment_provider", "paystack").maybeSingle();
      if (lookupError) throw lookupError;
      if (!existingPayment) return json({ error: "Payment record not found." }, 404);
      if (existingPayment.status === "Paid") {
        // Re-enqueue missing outbox rows; already-delivered receipts are preserved by idempotency.
        await sendServicePaymentNotifications(existingPayment);
        // Repair request state after a prior partial failure without duplicating delivered receipts.
        if (existingPayment.service_request_id) {
          const { error: requestUpdateError } = await db.from("service_requests").update({ status: "Paid" })
            .eq("id", existingPayment.service_request_id).eq("user_id", user.id);
          if (requestUpdateError) throw requestUpdateError;
        }
        return json({ paid: true, payment: existingPayment });
      }
      const response = await fetch("https://api.paystack.co/transaction/verify/" + encodeURIComponent(reference), {
        headers: { "Authorization": "Bearer " + secret }
      });
      const result = await response.json();
      if (!response.ok || !result.status || !result.data) return json({ error: "Unable to verify payment with the provider." }, 502);
      const transaction = result.data;
      const paid = isSuccessfulPaystackTransaction(transaction);
      if (paid && !matchesStoredPaystackPayment(transaction, {
        amount: existingPayment.amount,
        currency: existingPayment.currency,
        reference,
      })) {
        return json({ error: "The provider's payment details do not match this payment. Please contact support." }, 409);
      }
      // Non-final provider statuses remain Pending until settlement is resolved.
      const nextPaymentStatus = getNextPaymentStatus(transaction);
      const { data: payment, error } = await db.from("payments").update({
        status: nextPaymentStatus, paid_at: paid ? new Date().toISOString() : null
      }).eq("id", existingPayment.id).eq("user_id", user.id).in("status", ["Pending", "Failed"]).select().maybeSingle();
      if (error) throw error;
      if (paid && !payment && existingPayment.status !== "Paid") {
        const { data: currentPayment, error: currentError } = await db.from("payments").select("status").eq("id", existingPayment.id).eq("user_id", user.id).maybeSingle();
        if (currentError) throw currentError;
        if (currentPayment?.status !== "Paid") return json({ error: "Payment status changed concurrently. Please refresh and check your payment history." }, 409);
      }
      if (paid && existingPayment.service_request_id) {
        const { error: requestUpdateError } = await db.from("service_requests").update({ status: "Paid" })
          .eq("id", existingPayment.service_request_id).eq("user_id", user.id);
        if (requestUpdateError) throw requestUpdateError;
        // Stable outbox idempotency makes this safe after concurrent or repeated verification.
        await sendServicePaymentNotifications(existingPayment);
      }
      return json({ paid, payment: payment || existingPayment });
    }

    if (path === "/api/payments" && req.method === "GET") {
      const user = await requireUser(req);
      const { data, error } = await db.from("payments").select("id,amount,currency,status,payment_reference,created_at,paid_at,service_requests(reference_number,customer_name)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return json({ items: data ?? [] });
    }

    if (path === "/api/admin/service-deliverables/upload-url" && req.method === "POST") {
      await requireAdmin(req);
      let body: any;
      try { body = await req.json(); } catch { return json({ error: "A valid JSON request body is required." }, 400); }
      const requestId = typeof body?.serviceRequestId === "string" ? body.serviceRequestId : "";
      const title = typeof body?.title === "string" ? body.title.trim() : "";
      const description = typeof body?.description === "string" ? body.description.trim() : "";
      const filename = typeof body?.filename === "string" ? body.filename.trim().replace(/[\\/\\r\\n\\0]/g, "_") : "";
      const mimeType = typeof body?.mimeType === "string" ? body.mimeType.trim().toLowerCase() : "";
      const size = Number(body?.fileSizeBytes);
      const allowedMimeTypes = new Set([
        "application/pdf", "image/jpeg", "image/png", "image/webp", "text/plain",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ]);
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId) ||
          title.length < 1 || title.length > 160 || description.length > 3000 ||
          filename.length < 1 || filename.length > 255 ||
          !allowedMimeTypes.has(mimeType) || !Number.isSafeInteger(size) || size < 1 || size > 15728640) {
        return json({ error: "Provide a valid request, title, filename, supported file type and file size up to 15 MB." }, 400);
      }
      const { data: request, error: requestError } = await db.from("service_requests")
        .select("id,user_id,status").eq("id", requestId).maybeSingle();
      if (requestError) throw requestError;
      if (!request) return json({ error: "Service request not found." }, 404);
      if (!request.user_id || !["Paid", "In Progress", "Completed"].includes(String(request.status))) {
        return json({ error: "Documents can only be prepared for an account-linked, payment-confirmed service request." }, 409);
      }
      const { data: paidPayment, error: paidPaymentError } = await db.from("payments").select("id")
        .eq("service_request_id", request.id).eq("user_id", request.user_id).eq("status", "Paid").maybeSingle();
      if (paidPaymentError) throw paidPaymentError;
      if (!paidPayment) {
        return json({ error: "A confirmed successful payment record is required before documents can be prepared." }, 409);
      }
      const extension = filename.includes(".") ? filename.split(".").pop()!.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10) : "bin";
      const objectPath = request.user_id + "/" + request.id + "/" + crypto.randomUUID() + "." + extension;
      const { data: signedUpload, error: uploadError } = await db.storage
        .from("eduken-service-deliverables").createSignedUploadUrl(objectPath, { upsert: false });
      if (uploadError || !signedUpload?.signedUrl || !signedUpload?.token) {
        console.error("Could not create admin deliverable upload URL.", uploadError?.message);
        return json({ error: "Secure upload is unavailable. Confirm the private storage bucket migration has been applied in the isolated test environment." }, 503);
      }
      return json({
        uploadUrl: signedUpload.signedUrl,
        uploadToken: signedUpload.token,
        storagePath: objectPath,
        serviceRequestId: request.id,
        userId: request.user_id,
        title,
        description: description || null,
        originalFilename: filename,
        mimeType,
        fileSizeBytes: size,
        expiresInSeconds: 120,
      }, 201);
    }

    if (path === "/api/admin/service-deliverables" && req.method === "POST") {
      const admin = await requireAdmin(req);
      let body: any;
      try { body = await req.json(); } catch { return json({ error: "A valid JSON request body is required." }, 400); }
      const requestId = typeof body?.serviceRequestId === "string" ? body.serviceRequestId : "";
      const storagePath = typeof body?.storagePath === "string" ? body.storagePath : "";
      const title = typeof body?.title === "string" ? body.title.trim() : "";
      const description = typeof body?.description === "string" ? body.description.trim() : "";
      const filename = typeof body?.originalFilename === "string" ? body.originalFilename.trim() : "";
      const mimeType = typeof body?.mimeType === "string" ? body.mimeType.trim().toLowerCase() : "";
      const size = Number(body?.fileSizeBytes);
      const publish = body?.publish === true;
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId) ||
          title.length < 1 || title.length > 160 || description.length > 3000 ||
          filename.length < 1 || filename.length > 255 || !Number.isSafeInteger(size) || size < 1 || size > 15728640 ||
          !["application/pdf", "image/jpeg", "image/png", "image/webp", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"].includes(mimeType)) {
        return json({ error: "Deliverable metadata is invalid." }, 400);
      }
      const { data: request, error: requestError } = await db.from("service_requests")
        .select("id,user_id,status").eq("id", requestId).maybeSingle();
      if (requestError) throw requestError;
      if (!request) return json({ error: "Service request not found." }, 404);
      if (!request.user_id || !["Paid", "In Progress", "Completed"].includes(String(request.status))) {
        return json({ error: "Documents can only be published for an account-linked, payment-confirmed service request." }, 409);
      }
      const { data: paidPayment, error: paidPaymentError } = await db.from("payments").select("id")
        .eq("service_request_id", request.id).eq("user_id", request.user_id).eq("status", "Paid").maybeSingle();
      if (paidPaymentError) throw paidPaymentError;
      if (!paidPayment) {
        return json({ error: "A confirmed successful payment record is required before documents can be published." }, 409);
      }
      // Object paths are generated by the upload-url endpoint; constrain the path to this exact student's request.
      const pathPrefix = request.user_id + "/" + request.id + "/";
      if (!storagePath.startsWith(pathPrefix) || storagePath.includes("..") || storagePath.includes("\\\\")) {
        return json({ error: "Upload path does not match this student's service request." }, 400);
      }
      const folder = request.user_id + "/" + request.id;
      const basename = storagePath.slice(pathPrefix.length);
      if (!basename || basename.includes("/")) return json({ error: "Upload path is invalid." }, 400);
      const { data: storedObjects, error: objectError } = await db.storage.from("eduken-service-deliverables")
        .list(folder, { search: basename, limit: 10 });
      if (objectError) {
        console.error("Could not verify uploaded deliverable object.", objectError.message);
        return json({ error: "Uploaded file could not be verified. Please retry the upload." }, 503);
      }
      const storedObject = (storedObjects ?? []).find((item: any) => item.name === basename);
      if (!storedObject) return json({ error: "The file upload has not completed. Upload the file before saving its details." }, 409);
      const actualSize = Number(storedObject.metadata?.size ?? 0);
      if (actualSize !== size || (storedObject.metadata?.mimetype && storedObject.metadata.mimetype !== mimeType)) {
        return json({ error: "Uploaded file details do not match the supplied metadata." }, 409);
      }
      const { data: created, error: createError } = await db.from("service_deliverables").insert({
        service_request_id: request.id,
        user_id: request.user_id,
        title,
        description: description || null,
        storage_path: storagePath,
        original_filename: filename,
        mime_type: mimeType,
        file_size_bytes: size,
        published_at: publish ? new Date().toISOString() : null,
        published_by: publish ? admin.id : null,
      }).select("id,title,published_at,created_at").single();
      if (createError) {
        if (createError.code === "23505") return json({ error: "This uploaded file has already been registered." }, 409);
        throw createError;
      }
      return json({ ok: true, deliverable: created }, 201);
    }

    if (path === "/api/service-deliverables" && req.method === "GET") {
      const user = await requireUser(req);
      const { data, error } = await db.from("service_deliverables")
        .select("id,service_request_id,title,description,original_filename,mime_type,file_size_bytes,published_at,created_at,service_requests(reference_number,service_id,status,services(name))")
        .eq("user_id", user.id).not("published_at", "is", null)
        .order("published_at", { ascending: false }).limit(100);
      if (error) {
        if (error.code === "42P01" || error.code === "PGRST205") {
          return json({ error: "Student document delivery is not enabled on this environment yet.", code: "DELIVERABLES_NOT_CONFIGURED" }, 503);
        }
        throw error;
      }
      return json({ items: data ?? [] });
    }

    if (path.startsWith("/api/service-deliverables/") && path.endsWith("/download") && req.method === "POST") {
      const user = await requireUser(req);
      const segments = path.split("/").filter(Boolean);
      const deliverableId = segments.length === 4 ? segments[2] : "";
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(deliverableId)) {
        return json({ error: "A valid document ID is required." }, 400);
      }
      const { data: item, error } = await db.from("service_deliverables")
        .select("id,storage_path,original_filename,mime_type")
        .eq("id", deliverableId).eq("user_id", user.id)
        .not("published_at", "is", null).maybeSingle();
      if (error) {
        if (error.code === "42P01" || error.code === "PGRST205") {
          return json({ error: "Student document delivery is not enabled on this environment yet.", code: "DELIVERABLES_NOT_CONFIGURED" }, 503);
        }
        throw error;
      }
      if (!item) return json({ error: "Published document not found." }, 404);
      const { data: signed, error: signError } = await db.storage
        .from("eduken-service-deliverables")
        .createSignedUrl(item.storage_path, 60, { download: item.original_filename });
      if (signError || !signed?.signedUrl) {
        console.error("Could not create student deliverable download URL.", signError?.message);
        return json({ error: "This document cannot be downloaded right now. Please try again later." }, 503);
      }
      return json({ url: signed.signedUrl, expiresInSeconds: 60 });
    }

    const adminRequests = path.match(/^\/api\/admin\/service-requests(?:\/([^/]+))?$/);
    if (adminRequests) {
      await requireAdmin(req); const id = adminRequests[1];
      if (req.method === "GET") {
        const { data, error } = await db.from("service_requests").select("id,user_id,service_id,customer_name,whatsapp,email,details,status,reference_number,quantity,created_at,updated_at,services(name,price)").order("created_at", { ascending: false }).limit(200);
        if (error) throw error;
        return json({ items: data ?? [] });
      }
      if (req.method === "PUT" && id) {
        let b: any;
        try { b = await req.json(); } catch { return json({ error: "A valid JSON request body is required." }, 400); }
        if (!b || !isAllowedServiceRequestStatus(b.status)) return json({ error: "Invalid service request status." }, 400);
        const { data: existing, error: existingError } = await db.from("service_requests").select("id,status").eq("id", id).maybeSingle();
        if (existingError) throw existingError;
        if (!existing) return json({ error: "Service request not found." }, 404);
        if (existing.status === "Paid") return json({ error: "Payment-confirmed service requests cannot be changed through the status manager." }, 409);

        // Keep the protection in the database update predicate as well as the
        // pre-check, so a request becoming Paid between the read and write is
        // not overwritten by an admin status change.
        const { data, error } = await db.from("service_requests").update({ status: b.status }).eq("id", id).neq("status", "Paid").select("id,status").maybeSingle();
        if (error) throw error;
        if (!data) {
          const { data: current, error: currentError } = await db.from("service_requests").select("id,status").eq("id", id).maybeSingle();
          if (currentError) throw currentError;
          if (!current) return json({ error: "Service request not found." }, 404);
          if (current.status === "Paid") return json({ error: "Payment-confirmed service requests cannot be changed through the status manager." }, 409);
          return json({ error: "Service request status could not be updated." }, 409);
        }
        return json({ ok: true, request: data });
      }
    }

    if (path === "/api/admin/session" && req.method === "GET") {
      await requireAdmin(req);
      return json({ admin: true });
    }

    if (path === "/api/admin/payments" && req.method === "GET") {
      await requireAdmin(req);
      const { data, error } = await db.from("payments").select("id,amount,currency,status,payment_reference,created_at,paid_at,service_requests(reference_number,customer_name)").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return json({ items: data ?? [] });
    }

    if (path === "/api/admin/wallet/refund" && req.method === "POST") {
      await requireAdmin(req);
      let b: any;
      try { b = await req.json(); } catch { return json({ error: "A valid JSON request body is required." }, 400); }
      const paymentId = typeof b?.paymentId === "string" ? b.paymentId : "";
      const reason = typeof b?.reason === "string" ? b.reason.trim() : "";
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(paymentId)
        || reason.length < 4 || reason.length > 200) {
        return json({ error: "Provide a valid wallet service-payment ID and a refund reason of 4–200 characters." }, 400);
      }
      const { data: originalPayment, error: paymentLookupError } = await db.from("payments")
        .select("id,user_id,amount,payment_reference,payment_type,status")
        .eq("id", paymentId).maybeSingle();
      if (paymentLookupError) throw paymentLookupError;
      if (!originalPayment) return json({ error: "Payment not found." }, 404);
      if (originalPayment.payment_type !== "wallet_service" || !["Paid", "Refunded"].includes(originalPayment.status) || !originalPayment.user_id) {
        return json({ error: "Only confirmed wallet-funded service payments can be refunded to the wallet through this endpoint." }, 409);
      }
      const { data: refund, error: refundError } = await db.rpc("refund_customer_wallet_service_payment", {
        p_payment_id: paymentId,
        p_reason: reason,
      });
      if (refundError) {
        const message = String(refundError.message || "");
        if (message.includes("WALLET_REFUND_INVALID")) return json({ error: "The refund details are invalid." }, 400);
        if (message.includes("WALLET_REFUND_NOT_ALLOWED")) return json({ error: "This payment is not eligible for a wallet refund." }, 409);
        if (message.includes("WALLET_REFUND_WALLET_MISSING")) return json({ error: "Customer wallet is unavailable. No refund was processed." }, 503);
        throw refundError;
      }
      // Re-enqueue safely if the refund settled but the first notification attempt was interrupted.
      await sendPaymentNotifications(
        originalPayment.user_id, String(originalPayment.payment_reference || originalPayment.id),
        Number(originalPayment.amount), "refund",
      );
      return json({ ok: true, refund });
    }

    if (path === "/api/admin/system-health" && req.method === "GET") {
      await requireAdmin(req);
      const checkedAt = new Date().toISOString();
      const check = async (name: string, run: () => Promise<boolean>, detail: string) => {
        try {
          const ok = await run();
          return { name, status: ok ? "operational" : "degraded", checkedAt, detail: ok ? "Check passed." : detail };
        } catch {
          return { name, status: "down", checkedAt, detail };
        }
      };
      const checks = await Promise.all([
        check("Public website", async () => {
          const response = await fetch("https://eduken-consult.timmyjoe385.workers.dev/", { signal: AbortSignal.timeout(8000) });
          return response.ok && /EDUKEN/i.test(await response.text());
        }, "Website did not return a healthy EDUKEN page."),
        check("Database and API", async () => {
          const { error } = await db.from("opportunities").select("id").limit(1);
          return !error;
        }, "Database/API query failed."),
        check("Authentication service", async () => {
          const response = await fetch(url + "/auth/v1/health", { headers: { apikey: secretKeys.default }, signal: AbortSignal.timeout(8000) });
          return response.ok;
        }, "Authentication health endpoint did not return success."),
        check("Transactional email provider", async () => Boolean(Deno.env.get("RESEND_API_KEY") && Deno.env.get("EMAIL_FROM")), "Resend configuration is incomplete. This does not verify outage-alert delivery to Gmail."),
        { name: "Outage email alerts", status: "not_checked", checkedAt, detail: "GitHub Actions SMTP secrets and Gmail delivery must be verified with the workflow test-email option." },
        check("Payment safety configuration", async () => {
          const mode = (Deno.env.get("PAYSTACK_MODE") || "").trim().toLowerCase();
          const secret = (Deno.env.get("PAYSTACK_SECRET_KEY") || "").trim();
          // Require both the explicit mode flag and a test secret key, matching checkout initialization safety.
          return mode === "test" && /^sk_test_[A-Za-z0-9]+$/.test(secret);
        }, "Paystack is not configured in explicit test-only mode. No payment was initiated."),
      ]);
      return json({ checkedAt, checks });
    }

    if (path === "/api/admin/system-settings") {
      const user = await requireAdmin(req);
      if (req.method === "GET") {
        const { data, error } = await db.from("admin_system_settings").select("settings,updated_at").eq("id", "global").maybeSingle();
        if (error) return json({ error: "System settings are not initialized yet. Apply the admin system settings migration, then retry." }, 503);
        return json({ settings: { ...DEFAULT_SYSTEM_SETTINGS, ...(data?.settings || {}) }, updated_at: data?.updated_at ?? null });
      }
      if (req.method === "PUT") {
        let body: any;
        try { body = await req.json(); } catch { return json({ error: "A valid JSON request body is required." }, 400); }
        const incoming = body?.settings;
        const allowedKeys = Object.keys(DEFAULT_SYSTEM_SETTINGS);
        if (!incoming || typeof incoming !== "object" || Array.isArray(incoming) ||
            allowedKeys.some((key) => typeof incoming[key] !== "boolean") ||
            Object.keys(incoming).some((key) => !allowedKeys.includes(key))) {
          return json({ error: "Provide boolean values for all supported system settings only." }, 400);
        }
        const { data, error } = await db.from("admin_system_settings")
          .upsert({ id: "global", settings: incoming, updated_by: user.id, updated_at: new Date().toISOString() }, { onConflict: "id" })
          .select("settings,updated_at").single();
        if (error) throw error;
        // Do not cancel queued deliveries when pausing alerts. The private worker
        // checks this setting before sending and leaves queued work available to resume.
        return json({ ok: true, settings: data.settings, updated_at: data.updated_at });
      }
      return json({ error: "Method not allowed." }, 405);
    }


    const adminCbtQuestion = path.match(/^\/api\/admin\/cbt\/questions(?:\/([^/]+))?$/);
    if (adminCbtQuestion) {
      const user = await requireAdmin(req);
      const id = adminCbtQuestion[1];
      if (req.method === "GET") {
        const params = new URL(req.url).searchParams;
        const status = params.get("status");
        const q = (params.get("q") || "").trim().replace(/[,%()]/g, " ");
        let query = db.from("cbt_questions").select("*").order("updated_at", { ascending: false }).limit(200);
        if (status && ["draft","reviewed","approved","published","unpublished"].includes(status)) query = query.eq("status", status);
        if (q) query = query.or("question_text.ilike.%"+q+"%,subject.ilike.%"+q+"%,topic.ilike.%"+q+"%");
        const { data, error } = await query;
        if (error) throw error;
        return json({ items: data ?? [] });
      }
      if (req.method === "POST" && !id) {
        const parsed = parseJsonObjectBody(await req.text());
        if (!parsed.valid) return json({ error: parsed.error }, 400);
        const checked = validateQuestionInput(parsed.value);
        if (!checked.valid) return json({ error: "Question validation failed.", errors: checked.errors }, 400);
        const { data, error } = await db.from("cbt_questions").insert({ ...checked.question, created_by: user.id, updated_by: user.id }).select("*").single();
        if (error?.code === "23505") return json({ error: "A matching question already exists." }, 409);
        if (error) throw error;
        return json({ question: data }, 201);
      }
      if (req.method === "PUT" && id) {
        const parsed = parseJsonObjectBody(await req.text());
        if (!parsed.valid) return json({ error: parsed.error }, 400);
        const { data: current, error: readError } = await db.from("cbt_questions").select("*").eq("id", id).maybeSingle();
        if (readError) throw readError;
        if (!current) return json({ error: "Question not found." }, 404);
        const incoming = parsed.value as Record<string, unknown>;
        const checked = validateQuestionInput({ ...current, ...incoming, status: incoming.status ?? current.status }, { allowStatus: true });
        if (!checked.valid) return json({ error: "Question validation failed.", errors: checked.errors }, 400);
        const contentFields = ["exam_type", "subject", "topic", "subtopic", "question_text", "options", "correct_option", "explanation", "difficulty", "source_type", "source_name", "source_year", "provenance_notes", "licensing_notes"] as const;
        const contentChanged = contentFields.some((field) => JSON.stringify(checked.question[field] ?? null) !== JSON.stringify(current[field] ?? null));
        const nextStatus = contentChanged ? "draft" : checked.question.status;
        const transition = validateStatusTransition(current.status, nextStatus);
        if (!transition.valid && !contentChanged) return json({ error: transition.error }, 409);
        if (nextStatus === "published" && current.status !== "approved") return json({ error: "Only approved questions can be published." }, 409);
        const now = new Date().toISOString();
        const update: Record<string, unknown> = { ...checked.question, status: nextStatus, updated_by: user.id, updated_at: now };
        if (contentChanged) Object.assign(update, { reviewed_by: null, approved_by: null, published_by: null, reviewed_at: null, approved_at: null, published_at: null });
        if (nextStatus === "reviewed") Object.assign(update, { reviewed_by: user.id, reviewed_at: now });
        if (nextStatus === "approved") Object.assign(update, { approved_by: user.id, approved_at: now });
        if (nextStatus === "published") Object.assign(update, { published_by: user.id, published_at: now });
        const { data, error } = await db.from("cbt_questions").update(update).eq("id", id).select("*").single();
        if (error?.code === "23505") return json({ error: "A matching question already exists." }, 409);
        if (error) throw error;
        return json({ question: data, ...(contentChanged ? { notice: "Question content changed and was returned to draft for fresh review." } : {}) });
      }
      if (req.method === "DELETE" && id) {
        const { data: current, error: readError } = await db.from("cbt_questions").select("id,status").eq("id", id).maybeSingle();
        if (readError) throw readError;
        if (!current) return json({ error: "Question not found." }, 404);
        if (!["draft","unpublished"].includes(current.status)) return json({ error: "Only draft or unpublished questions can be deleted." }, 409);
        const { error } = await db.from("cbt_questions").delete().eq("id", id);
        if (error) throw error;
        return json({ ok: true });
      }
      return json({ error: "Method not allowed." }, 405);
    }

    if (path === "/api/admin/cbt/import" && req.method === "POST") {
      const user = await requireAdmin(req);
      const parsed = parseJsonObjectBody(await req.text());
      if (!parsed.valid) return json({ error: parsed.error }, 400);
      const body = parsed.value as Record<string, unknown>;
      if (!Array.isArray(body.rows) || body.rows.length === 0) return json({ error: "Provide at least one question row." }, 400);
      if (body.rows.length > 500) return json({ error: "Import is limited to 500 rows per batch." }, 413);
      const prepared = parseQuestionImportRows(body.rows as Record<string, unknown>[]);
      const fingerprints = prepared.valid.map(item => item.question.question_fingerprint);
      const existing = new Set<string>();
      for (let i = 0; i < fingerprints.length; i += 100) {
        const { data, error } = await db.from("cbt_questions").select("question_fingerprint").in("question_fingerprint", fingerprints.slice(i, i + 100));
        if (error) throw error;
        for (const row of data ?? []) existing.add(row.question_fingerprint);
      }
      const errors = [...prepared.errors];
      const candidates = prepared.valid.filter(item => {
        if (!existing.has(item.question.question_fingerprint)) return true;
        errors.push({ row: item.row, type: "duplicate_existing", errors: ["Matching question already exists in the bank."] });
        return false;
      });
      const { data: batch, error: batchError } = await db.from("cbt_question_imports").insert({
        filename: String(body.filename || "").trim().slice(0, 200),
        source_label: String(body.sourceLabel || "").trim().slice(0, 200),
        total_rows: prepared.totalRows, status: "validated", imported_by: user.id, error_report: errors,
      }).select("*").single();
      if (batchError) throw batchError;
      let inserted: any[] = [];
      if (candidates.length) {
        const records = candidates.map(item => ({ ...item.question, status: "draft", import_batch_id: batch.id, created_by: user.id, updated_by: user.id }));
        const { data, error } = await db.from("cbt_questions").upsert(records, { onConflict: "question_fingerprint", ignoreDuplicates: true }).select("id,question_fingerprint");
        if (error) {
          await db.from("cbt_question_imports").update({ status: "failed" }).eq("id", batch.id);
          throw error;
        }
        inserted = data ?? [];
      }
      const insertedFingerprints = new Set(inserted.map(item => item.question_fingerprint));
      for (const item of candidates) if (!insertedFingerprints.has(item.question.question_fingerprint)) errors.push({ row: item.row, type: "duplicate_existing", errors: ["Matching question already exists in the bank."] });
      const duplicates = errors.filter(item => String(item.type).startsWith("duplicate")).length;
      const invalid = errors.filter(item => item.type === "invalid").length;
      const { data: finalBatch, error: updateError } = await db.from("cbt_question_imports").update({
        status: "completed", inserted_rows: inserted.length, duplicate_rows: duplicates, invalid_rows: invalid, error_report: errors,
      }).eq("id", batch.id).select("*").single();
      if (updateError) throw updateError;
      return json({ batch: finalBatch, inserted: inserted.length, duplicates, invalid, errors }, 201);
    }

    if (path === "/api/admin/cbt/imports" && req.method === "GET") {
      await requireAdmin(req);
      const { data, error } = await db.from("cbt_question_imports")
        .select("id,filename,source_label,total_rows,inserted_rows,duplicate_rows,invalid_rows,status,created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return json({ items: data ?? [] });
    }

    if (path === "/api/cbt/attempts" && req.method === "GET") {
      const user = await requireUser(req);
      const { data, error } = await db.from("cbt_attempts")
        .select("id,mode,subject,score,total,duration_seconds,submitted_at")
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return json({ items: data ?? [] });
    }

    if (path === "/api/cbt/attempts" && req.method === "POST") {
      const user = await requireUser(req);
      const parsed = parseJsonObjectBody(await req.text());
      if (!parsed.valid) return json({ error: parsed.error }, 400);
      const body = parsed.value as Record<string, unknown>;
      const mode = body.mode;
      const subject = String(body.subject || "").trim().slice(0, 120);
      const score = Number(body.score);
      const total = Number(body.total);
      const duration = body.durationSeconds == null ? null : Number(body.durationSeconds);
      if (!["practice","mock"].includes(String(mode)) || !subject ||
          !Number.isInteger(score) || !Number.isInteger(total) || total < 1 ||
          score < 0 || score > total ||
          (duration !== null && (!Number.isInteger(duration) || duration < 0 || duration > 86400))) {
        return json({ error: "Invalid CBT attempt summary." }, 400);
      }
      const { data, error } = await db.from("cbt_attempts").insert({
        user_id: user.id, mode, subject, score, total, duration_seconds: duration,
      }).select("id,mode,subject,score,total,duration_seconds,submitted_at").single();
      if (error) throw error;
      return json({ attempt: data }, 201);
    }

    if (path === "/api/cbt/questions" && req.method === "GET") {
      const params = new URL(req.url).searchParams;
      let query = db.from("cbt_questions").select("id,exam_type,subject,topic,subtopic,question_text,options,correct_option,explanation,difficulty,source_type,source_name,source_year").eq("status", "published").order("subject").order("topic").limit(100);
      for (const key of ["exam_type", "subject", "topic"] as const) {
        const value = params.get(key)?.trim();
        if (value) query = query.eq(key, value);
      }
      const { data, error } = await query;
      if (error) throw error;
      return json({ items: data ?? [] });
    }

    const adminContent = path.match(/^\/api\/admin\/content\/([^/]+)(?:\/([^/]+))?$/);
    if (adminContent) {
      await requireAdmin(req);
      const table = adminContent[1], id = adminContent[2];
      if (!CONTENT_TABLES.has(table)) return json({ error: "Unknown content type." }, 404);
      if (req.method === "GET") return json({ items: await adminList(table) });
      if (req.method === "POST") {
        const parsedBody = parseJsonObjectBody(await req.text());
        if (!parsedBody.valid) return json({ error: parsedBody.error }, 400);
        const b = mapAdminInput(table, parsedBody.value as Record<string, unknown>);
        if ((table === "opportunities" || table === "admissions") && Object.prototype.hasOwnProperty.call(b, "deadline")) {
          const normalizedDeadline = normalizeContentDeadline(b.deadline);
          if (normalizedDeadline === undefined) {
            return json({ error: "Enter a valid deadline date, for example 2026-10-21, or leave it blank." }, 400);
          }
          b.deadline = normalizedDeadline;
        }
        if (table === "services" && Object.prototype.hasOwnProperty.call(b, "price")) {
          const normalizedPrice = normalizeServicePrice(b.price);
          if (!normalizedPrice.valid) {
            return json({ error: "Service price must be a non-negative whole number, or be left blank for To be confirmed." }, 400);
          }
          if (normalizedPrice.provided) b.price = normalizedPrice.value;
        }
        if (table === "opportunities") {
          const verification = validateOpportunityVerification(b);
          if (!verification.valid) return json({ error: verification.error }, 400);
        }
        const { data, error } = await db.from(table).insert(b).select().single();
        if (error) throw error;
        let warnings: string[] = [];
        if (table === "opportunities") {
          const tasks: { run: () => Promise<unknown>; errorLabel: string; warning: string }[] = [
            {
              run: () => notifyOpportunitySubscribers(data),
              errorLabel: "Opportunity was saved, but subscriber notifications failed.",
              warning: "Subscriber notifications could not be completed.",
            },
          ];
          if (data.is_published) {
            tasks.push({
              run: () => enqueueOpportunityEmailAlerts(data, { queueNew: true, rescheduleDeadlines: true }),
              errorLabel: "Opportunity was saved, but email alert scheduling failed.",
              warning: "Email alert scheduling could not be completed.",
            });
          }
          warnings = await runContentSaveSideEffects(tasks);
        } else if (table === "admissions" || table === "updates") {
          warnings = await runContentSaveSideEffects([{
            run: () => notifyEditorialSubscribers(table, data),
            errorLabel: "Editorial content was saved, but subscriber notifications failed.",
            warning: "Subscriber notifications could not be completed.",
          }]);
        }
        return json({ id: data.id, ...(warnings.length ? { warnings } : {}) }, 201);
      }
      if (req.method === "PUT" && id) {
        const parsedBody = parseJsonObjectBody(await req.text());
        if (!parsedBody.valid) return json({ error: parsedBody.error }, 400);
        const b = mapAdminInput(table, parsedBody.value as Record<string, unknown>);
        if ((table === "opportunities" || table === "admissions") && Object.prototype.hasOwnProperty.call(b, "deadline")) {
          const normalizedDeadline = normalizeContentDeadline(b.deadline);
          if (normalizedDeadline === undefined) {
            return json({ error: "Enter a valid deadline date, for example 2026-10-21, or leave it blank." }, 400);
          }
          b.deadline = normalizedDeadline;
        }
        if (table === "services" && Object.prototype.hasOwnProperty.call(b, "price")) {
          const normalizedPrice = normalizeServicePrice(b.price);
          if (!normalizedPrice.valid) {
            return json({ error: "Service price must be a non-negative whole number, or be left blank for To be confirmed." }, 400);
          }
          if (normalizedPrice.provided) b.price = normalizedPrice.value;
        }
        let previousOpportunity: any = null;
        let previousEditorialItem: any = null;
        if (table === "admissions" || table === "updates") {
          const { data: existing, error: readError } = await db.from(table)
            .select("is_published")
            .eq("id", id)
            .maybeSingle();
          if (readError) throw readError;
          if (!existing) return json({ error: "Record not found." }, 404);
          previousEditorialItem = existing;
        }
        if (table === "opportunities") {
          const { data: existing, error: readError } = await db.from(table)
            .select("is_published,notify_on_publish,verified,official_source,deadline,category")
            .eq("id", id)
            .maybeSingle();
          if (readError) throw readError;
          if (!existing) return json({ error: "Record not found." }, 404);
          previousOpportunity = existing;
          const verification = validateOpportunityVerification({ ...existing, ...b });
          if (!verification.valid) return json({ error: verification.error }, 400);
        }
        const { data, error } = await db.from(table).update(b).eq("id", id).select().maybeSingle();
        if (error) throw error;
        if (!data) return json({ error: "Record not found." }, 404);
        let warnings: string[] = [];
        if (table === "opportunities") {
          const tasks: { run: () => Promise<unknown>; errorLabel: string; warning: string }[] = [];
          if (!previousOpportunity.is_published && data.is_published) {
            tasks.push({
              run: () => notifyOpportunitySubscribers(data),
              errorLabel: "Opportunity was saved, but subscriber notifications failed.",
              warning: "Subscriber notifications could not be completed.",
            });
          }
          const wasEligible = Boolean(previousOpportunity.is_published && previousOpportunity.notify_on_publish && previousOpportunity.verified && (!String(previousOpportunity.official_source || "").trim() || safeHttpUrl(previousOpportunity.official_source)));
          const isEligible = Boolean(data.is_published && data.notify_on_publish && data.verified && (!String(data.official_source || "").trim() || safeHttpUrl(data.official_source)));
          const deadlineChanged = previousOpportunity.deadline !== data.deadline;
          const categoryChanged = previousOpportunity.category !== data.category;
          tasks.push({
            run: () => enqueueOpportunityEmailAlerts(data, {
              queueNew: isEligible && (!wasEligible || categoryChanged),
              rescheduleDeadlines: !isEligible || !wasEligible || deadlineChanged || categoryChanged,
            }),
            errorLabel: "Opportunity was saved, but email alert scheduling failed.",
            warning: "Email alert scheduling could not be completed.",
          });
          warnings = await runContentSaveSideEffects(tasks);
        } else if (
          (table === "admissions" || table === "updates") &&
          !previousEditorialItem?.is_published &&
          data.is_published
        ) {
          warnings = await runContentSaveSideEffects([{
            run: () => notifyEditorialSubscribers(table, data),
            errorLabel: "Editorial content was saved, but subscriber notifications failed.",
            warning: "Subscriber notifications could not be completed.",
          }]);
        }
        return json({ ok: true, ...(warnings.length ? { warnings } : {}) });
      }
      if (req.method === "DELETE" && id) {
        const { error } = await db.from(table).delete().eq("id", id);
        if (error) throw error;
        return json({ ok: true });
      }
    }

    const adminConsult = path.match(/^\/api\/admin\/consultations(?:\/([^/]+))?$/);
    if (adminConsult) {
      await requireAdmin(req);
      const id = adminConsult[1];
      if (req.method === "GET") {
        const { data, error } = await db.from("consultations").select("*").order("created_at", { ascending: false }).limit(100);
        if (error) throw error; return json({ items: data ?? [] });
      }
      if (req.method === "PUT" && id) {
        const parsedBody = parseJsonObjectBody(await req.text());
        if (!parsedBody.valid) return json({ error: parsedBody.error }, 400);
        const b = parsedBody.value as Record<string, unknown>;
        const { data, error } = await db.from("consultations").update(b).eq("id", id).select().maybeSingle();
        if (error) throw error; if (!data) return json({ error: "Consultation not found." }, 404);
        return json({ ok: true });
      }
    }

    return json({ error: "Route not found." }, 404);
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return json({ error: e instanceof Error ? e.message : "Unexpected server error." }, 500);
  }
});