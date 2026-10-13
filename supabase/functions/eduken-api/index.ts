import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { isAllowedServiceRequestStatus, validateServiceRequestBody } from "./service-request-validation.mjs";

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
        if (table === "opportunities") await notifyOpportunitySubscribers(data);
        return json({ id: data.id }, 201);
      }
      if (req.method === "PUT" && id) {
        const b = mapAdminInput(table, await req.json());
        let wasPublished = false;
        if (table === "opportunities") {
          const { data: existing, error: readError } = await db.from(table).select("is_published").eq("id", id).maybeSingle();
          if (readError) throw readError;
          if (!existing) return json({ error: "Record not found." }, 404);
          wasPublished = Boolean(existing.is_published);
        }
        const { data, error } = await db.from(table).update(b).eq("id", id).select().maybeSingle();
        if (error) throw error; if (!data) return json({ error: "Record not found." }, 404);
        if (table === "opportunities" && !wasPublished && data.is_published) await notifyOpportunitySubscribers(data);
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