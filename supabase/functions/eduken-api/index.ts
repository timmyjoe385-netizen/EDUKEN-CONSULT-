import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { isAllowedServiceRequestStatus, validateServiceRequestBody } from "./service-request-validation.mjs";
import { validateEmailAlertSubscription } from "./email-alert-validation.mjs";

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
  verified: Boolean(x.verified),
  featured: Boolean(x.featured),
  urgent: Boolean(x.urgent),
  notifyOnPublish: Boolean(x.notify_on_publish),
});

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
    db.from("opportunities").select("*").eq("is_published", true).order("created_at", { ascending: false }).limit(100),
    db.from("admissions").select("*").eq("is_published", true).order("created_at", { ascending: false }).limit(100),
    db.from("updates").select("*").eq("is_published", true).order("created_at", { ascending: false }).limit(100),
    db.from("faqs").select("*").eq("is_published", true).order("created_at", { ascending: false }).limit(100),
    db.from("services").select("*").eq("is_published", true).order("created_at", { ascending: false }).limit(100),
  ]);
  const err = [a,b,c,d,e].find(x => x.error)?.error;
  if (err) throw err;
  return {
    opportunities: (a.data ?? []).map(toOpportunity),
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
    if (x.title === undefined && x.school !== undefined) x.title = x.school;
    delete x.course; delete x.type; delete x.details; delete x.link; delete x.sourceUrl; delete x.status;
  }
  if (table === "updates") {
    if (x.body !== undefined && x.content === undefined) x.content = x.body;
    if (x.sourceUrl !== undefined && x.source_url === undefined) x.source_url = x.sourceUrl;
    delete x.body; delete x.sourceUrl; delete x.date;
    // These controls are not columns in the updates table.
    delete x.verified; delete x.featured; delete x.urgent;
  }
  // status is a UI-only field for every non-opportunity content table.
  delete x.status;
  return x;
}

async function notifyOpportunitySubscribers(opportunity: Record<string, any>) {
  if (!opportunity.notify_on_publish || !opportunity.is_published) return;
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
  if (siteUrl.protocol !== "https:" || siteUrl.username || siteUrl.password) return null;
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
  const eligible = Boolean(
    opportunity.is_published &&
    opportunity.notify_on_publish &&
    opportunity.verified &&
    String(opportunity.official_source || "").trim()
  );
  if (!eligible) {
    await db.from("email_alert_deliveries")
      .update({ status: "cancelled" })
      .eq("opportunity_id", opportunity.id)
      .eq("status", "pending");
    return;
  }

  const topic = opportunityAlertTopic(opportunity);
  if (!topic || !EMAIL_ALERT_TOPICS.has(topic)) return;
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
    await db.from("email_alert_deliveries")
      .update({ status: "cancelled" })
      .eq("opportunity_id", opportunity.id)
      .in("event_type", ["deadline_7d", "deadline_3d", "deadline_1d"])
      .eq("status", "pending");

    const deadlineMs = opportunity.deadline ? new Date(String(opportunity.deadline)).getTime() : NaN;
    if (Number.isFinite(deadlineMs) && deadlineMs > now.getTime()) {
      for (const subscription of recipients) {
        for (const days of [7, 3, 1]) {
          const scheduledMs = Math.max(now.getTime(), deadlineMs - days * 24 * 60 * 60 * 1000);
          if (scheduledMs >= deadlineMs) continue;
          rows.push({
            subscription_id: subscription.id,
            opportunity_id: opportunity.id,
            event_type: "deadline_" + days + "d",
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

async function sendEmailAlertMessage(config: { apiKey: string; from: string }, to: string, subject: string, textBody: string, htmlBody: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + config.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: config.from, to: [to], subject, text: textBody, html: htmlBody }),
  });
  if (!response.ok) {
    // Keep provider response bodies and subscriber data out of public error messages.
    throw new Error("Transactional email provider rejected the message.");
  }
  const result = await response.json();
  return typeof result.id === "string" ? result.id : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const path = pathOf(req);
  try {
    if (req.method === "GET" && path === "/health") return json({ ok: true, service: "EDUKEN CONSULT API", version: 4 });

    if (req.method === "GET" && (path === "/public-content" || path === "/api/public-content")) return json(await publicContent());

    if (req.method === "POST" && (path === "/consultations" || path === "/api/consultations")) {
      const b = await req.json();
      if (!b?.name?.trim() || !b?.whatsapp?.trim() || !b?.message?.trim()) return json({ error: "Name, WhatsApp number and message are required." }, 400);
      const { data, error } = await db.from("consultations").insert({
        name: b.name.trim(), whatsapp: b.whatsapp.trim(), email: b.email || null, state: b.state || null,
        education_level: b.educationLevel || b.education_level || null, interest: b.interest || null,
        school_course: b.schoolCourse || b.school_course || null, message: b.message.trim(), status: "New"
      }).select().single();
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
      const b = await req.json(); const question = String(b.question || "").trim();
      if (!question) return json({ error: "Question is required." }, 400);
      return json({ answer: await aiAnswer(question) });
    }



    if (path === "/api/email-alerts/subscribe" && req.method === "POST") {
      let body: any;
      try { body = await req.json(); } catch { return json({ error: "A valid JSON request body is required." }, 400); }
      const validation = validateEmailAlertSubscription(body);
      if (validation.error) return json({ error: validation.error }, 400);
      const config = emailAlertConfiguration();
      if (!config) return json({ error: "Email alerts are not configured yet. Please use the EDUKEN WhatsApp Channel for updates." }, 503);

      const { email, topics } = validation.data;
      const now = new Date();
      const verificationToken = secureRandomToken();
      const verificationTokenHash = await sha256Hex(verificationToken);
      const { data: existing, error: lookupError } = await db
        .from("email_alert_subscriptions")
        .select("id,is_active,verified_at")
        .eq("email", email)
        .maybeSingle();
      if (lookupError) throw lookupError;

      if (existing?.is_active && existing?.verified_at) {
        const { error } = await db.from("email_alert_subscriptions")
          .update({ topics, updated_at: now.toISOString() })
          .eq("id", existing.id);
        if (error) throw error;
        return json({ message: "Your email alert preferences have been updated." });
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
            verificationUrl.toString() + "\">Confirm email alerts</a></p><p>If you did not request this, ignore this message.</p><p><a href=\"" +
            unsubscribeUrl.toString() + "\">Unsubscribe</a></p>"
        );
      } catch {
        await db.from("email_alert_subscriptions")
          .update({ verification_token_hash: null, verification_expires_at: null, updated_at: new Date().toISOString() })
          .eq("id", subscriptionId);
        return json({ error: "We could not send the confirmation email. Please try again later." }, 502);
      }
      return json({ message: "Check your inbox for a confirmation link. The link expires in 30 minutes." }, 202);
    }

    if (path === "/api/email-alerts/verify" && req.method === "POST") {
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
      const { error } = await db.from("email_alert_subscriptions")
        .update({ verified_at: now, is_active: true, verification_token_hash: null, verification_expires_at: null, updated_at: now })
        .eq("id", subscription.id);
      if (error) throw error;
      return json({ message: "Your email alerts are confirmed and active." });
    }

    if (path === "/api/email-alerts/unsubscribe" && req.method === "POST") {
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
      await db.from("email_alert_deliveries")
        .update({ status: "cancelled" })
        .eq("subscription_id", subscription.id)
        .eq("status", "pending");
      return json({ message: "You have been unsubscribed from EDUKEN email alerts." });
    }

    if (path === "/api/internal/email-alerts/process" && req.method === "POST") {
      const cronSecret = Deno.env.get("EMAIL_ALERTS_CRON_SECRET");
      if (!cronSecret || cronSecret.length < 32) return json({ error: "Email alert processing is not configured." }, 503);
      if (req.headers.get("Authorization") !== "Bearer " + cronSecret) return json({ error: "Unauthorized." }, 401);
      const config = emailAlertConfiguration();
      if (!config) return json({ error: "Email alerts are not configured." }, 503);

      const now = new Date();
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
          .update({ status: "processing", attempt_count: attemptCount })
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
            await db.from("email_alert_deliveries").update({ status: "cancelled" }).eq("id", delivery.id);
            skipped++;
            continue;
          }

          const { data: opportunity, error: opportunityError } = await db.from("opportunities")
            .select("id,title,slug,category,description,deadline,application_url,official_source,is_published,verified,notify_on_publish")
            .eq("id", delivery.opportunity_id)
            .maybeSingle();
          if (opportunityError) throw opportunityError;
          const eligible = Boolean(
            opportunity && opportunity.is_published && opportunity.verified &&
            opportunity.notify_on_publish && String(opportunity.official_source || "").trim()
          );
          const topic = opportunity ? opportunityAlertTopic(opportunity) : null;
          if (!eligible || !topic || !Array.isArray(subscription.topics) || !subscription.topics.includes(topic)) {
            await db.from("email_alert_deliveries").update({ status: "cancelled" }).eq("id", delivery.id);
            skipped++;
            continue;
          }

          const deadlineMs = opportunity.deadline ? new Date(String(opportunity.deadline)).getTime() : NaN;
          if (String(delivery.event_type).startsWith("deadline_") && (!Number.isFinite(deadlineMs) || deadlineMs <= now.getTime())) {
            await db.from("email_alert_deliveries").update({ status: "cancelled" }).eq("id", delivery.id);
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
          const textBody = intro + "\n\n" + title + "\n" + description + "\n\nOpen: " + opportunityUrl.toString() +
            "\nOfficial source: " + String(opportunity.official_source || "") + "\nUnsubscribe: " + unsubscribeUrl.toString();
          const htmlBody = "<p>" + escapeEmailHtml(intro) + "</p><h2>" + escapeEmailHtml(title) + "</h2><p>" +
            escapeEmailHtml(description) + "</p><p><a href=\"" + opportunityUrl.toString() +
            "\">View opportunity</a></p><p><a href=\"" + escapeEmailHtml(String(opportunity.official_source || "")) +
            "\">Official source</a></p><p><a href=\"" + unsubscribeUrl.toString() + "\">Unsubscribe from email alerts</a></p>";
          const providerMessageId = await sendEmailAlertMessage(config, subscription.email, subject, textBody, htmlBody);
          const { error: markSentError } = await db.from("email_alert_deliveries")
            .update({ status: "sent", provider_message_id: providerMessageId, sent_at: new Date().toISOString(), last_error: null })
            .eq("id", delivery.id);
          if (markSentError) throw markSentError;
          sent++;
        } catch {
          const exhausted = attemptCount >= 5;
          const retryDelayMs = Math.min(6 * 60 * 60 * 1000, 60 * 1000 * (2 ** Math.max(0, attemptCount - 1)));
          await db.from("email_alert_deliveries").update({
            status: exhausted ? "failed" : "pending",
            scheduled_for: new Date(Date.now() + retryDelayMs).toISOString(),
            last_error: "Delivery attempt failed; details withheld from public logs.",
          }).eq("id", delivery.id);
          failed++;
        }
      }
      return json({ ok: true, processed: sent + failed + skipped, sent, failed, skipped });
    }

    if (path === "/api/service-requests" && req.method === "POST") {
      let b: any;
      try { b = await req.json(); } catch { return json({ error: "A valid JSON request body is required." }, 400); }
      const validation = validateServiceRequestBody(b);
      if (validation.error) return json({ error: validation.error }, 400);
      const { customerName, whatsapp, details, email, serviceId } = validation.data;
      const user = await currentUser(req);
      const reference = "EDK-" + new Date().toISOString().slice(0,10).replace(/-/g, "") + "-" + crypto.randomUUID().slice(0,8).toUpperCase();
      const { data, error } = await db.from("service_requests").insert({
        user_id: user?.id ?? null, service_id: serviceId, customer_name: customerName,
        whatsapp, email: email || null, details,
        status: "New Requests", reference_number: reference
      }).select("id,reference_number,status,created_at").single();
      if (error) throw error;
      return json({ request: data, referenceNumber: reference }, 201);
    }

    if (path === "/api/service-requests" && req.method === "GET") {
      const user = await requireUser(req);
      const { data, error } = await db.from("service_requests").select("*, services(name,price)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return json({ items: data ?? [] });
    }

    const serviceRequestMatch = path.match(/^\/api\/service-requests\/([^/]+)$/);
    if (serviceRequestMatch && req.method === "GET") {
      const user = await requireUser(req);
      const { data, error } = await db.from("service_requests").select("*, services(name,price)").eq("id", serviceRequestMatch[1]).eq("user_id", user.id).maybeSingle();
      if (error) throw error;
      if (!data) return json({ error: "Service request not found." }, 404);
      return json({ request: data });
    }

    if (path === "/api/payments/initialize" && req.method === "POST") {
      const user = await requireUser(req); const b = await req.json();
      if (!b.serviceRequestId || !Number(b.amount) || Number(b.amount) <= 0) return json({ error: "A valid service request and amount are required." }, 400);
      const { data: request, error: requestError } = await db.from("service_requests").select("id,reference_number,customer_name,email,whatsapp").eq("id", b.serviceRequestId).eq("user_id", user.id).maybeSingle();
      if (requestError) throw requestError;
      if (!request) return json({ error: "Service request not found." }, 404);
      const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
      if (!secret) return json({ error: "Payment gateway is not configured yet.", code: "PAYMENT_GATEWAY_NOT_CONFIGURED" }, 503);
      const reference = "EDK-PAY-" + crypto.randomUUID().replace(/-/g, "").slice(0, 18).toUpperCase();
      const paystack = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: { "Authorization": "Bearer " + secret, "Content-Type": "application/json" },
        body: JSON.stringify({ email: request.email || "edukenconsult00@gmail.com", amount: Math.round(Number(b.amount) * 100), reference, callback_url: b.callbackUrl || undefined, metadata: { service_request_id: request.id, user_id: user.id, reference_number: request.reference_number } })
      });
      const result = await paystack.json();
      if (!paystack.ok || !result.status) return json({ error: result.message || "Unable to initialize payment." }, 502);
      const { data: payment, error } = await db.from("payments").insert({
        user_id: user.id, service_request_id: request.id, amount: Number(b.amount), currency: "NGN", status: "Pending", payment_reference: reference
      }).select().single();
      if (error) throw error;
      return json({ payment, authorizationUrl: result.data.authorization_url, accessCode: result.data.access_code, reference });
    }

    if (path === "/api/payments/verify" && req.method === "POST") {
      const user = await requireUser(req); const b = await req.json();
      if (!b.reference) return json({ error: "Payment reference is required." }, 400);
      const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
      if (!secret) return json({ error: "Payment gateway is not configured yet.", code: "PAYMENT_GATEWAY_NOT_CONFIGURED" }, 503);
      const response = await fetch("https://api.paystack.co/transaction/verify/" + encodeURIComponent(String(b.reference)), { headers: { "Authorization": "Bearer " + secret } });
      const result = await response.json();
      if (!response.ok || !result.status) return json({ error: result.message || "Unable to verify payment." }, 502);
      const paid = result.data?.status === "success";
      const { data: payment, error } = await db.from("payments").update({ status: paid ? "Paid" : "Failed", paid_at: paid ? new Date().toISOString() : null }).eq("payment_reference", b.reference).eq("user_id", user.id).select().maybeSingle();
      if (error) throw error;
      if (paid && payment?.service_request_id) await db.from("service_requests").update({ status: "Paid" }).eq("id", payment.service_request_id).eq("user_id", user.id);
      return json({ paid, payment, provider: result.data });
    }

    if (path === "/api/payments" && req.method === "GET") {
      const user = await requireUser(req);
      const { data, error } = await db.from("payments").select("*, service_requests(reference_number,customer_name)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return json({ items: data ?? [] });
    }

    const adminRequests = path.match(/^\/api\/admin\/service-requests(?:\/([^/]+))?$/);
    if (adminRequests) {
      await requireAdmin(req); const id = adminRequests[1];
      if (req.method === "GET") {
        const { data, error } = await db.from("service_requests").select("*, services(name,price)").order("created_at", { ascending: false }).limit(200);
        if (error) throw error;
        return json({ items: data ?? [] });
      }
      if (req.method === "PUT" && id) {
        let b: any;
        try { b = await req.json(); } catch { return json({ error: "A valid JSON request body is required." }, 400); }
        if (!b || !isAllowedServiceRequestStatus(b.status)) return json({ error: "Invalid service request status." }, 400);
        const { data, error } = await db.from("service_requests").update({ status: b.status }).eq("id", id).select("id,status").maybeSingle();
        if (error) throw error; if (!data) return json({ error: "Service request not found." }, 404);
        return json({ ok: true, request: data });
      }
    }

    if (path === "/api/admin/payments" && req.method === "GET") {
      await requireAdmin(req);
      const { data, error } = await db.from("payments").select("*, service_requests(reference_number,customer_name)").order("created_at", { ascending: false }).limit(200);
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
        const b = mapAdminInput(table, await req.json());
        const { data, error } = await db.from(table).insert(b).select().single();
        if (error) throw error;
        if (table === "opportunities") {
          await notifyOpportunitySubscribers(data);
          if (data.is_published) {
            await enqueueOpportunityEmailAlerts(data, { queueNew: true, rescheduleDeadlines: true });
          }
        }
        return json({ id: data.id }, 201);
      }
      if (req.method === "PUT" && id) {
        const b = mapAdminInput(table, await req.json());
        let previousOpportunity: any = null;
        if (table === "opportunities") {
          const { data: existing, error: readError } = await db.from(table)
            .select("is_published,notify_on_publish,verified,official_source,deadline,category")
            .eq("id", id)
            .maybeSingle();
          if (readError) throw readError;
          if (!existing) return json({ error: "Record not found." }, 404);
          previousOpportunity = existing;
        }
        const { data, error } = await db.from(table).update(b).eq("id", id).select().maybeSingle();
        if (error) throw error;
        if (!data) return json({ error: "Record not found." }, 404);
        if (table === "opportunities") {
          if (!previousOpportunity.is_published && data.is_published) await notifyOpportunitySubscribers(data);
          const wasEligible = Boolean(previousOpportunity.is_published && previousOpportunity.notify_on_publish && previousOpportunity.verified && String(previousOpportunity.official_source || "").trim());
          const isEligible = Boolean(data.is_published && data.notify_on_publish && data.verified && String(data.official_source || "").trim());
          const deadlineChanged = previousOpportunity.deadline !== data.deadline;
          const categoryChanged = previousOpportunity.category !== data.category;
          await enqueueOpportunityEmailAlerts(data, {
            queueNew: isEligible && (!wasEligible || categoryChanged),
            rescheduleDeadlines: !isEligible || !wasEligible || deadlineChanged || categoryChanged,
          });
        }
        return json({ ok: true });
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
        const b = await req.json();
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