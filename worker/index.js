const SUPABASE_PUBLIC_CONTENT = "https://pphxltbkwygqjtjgkhxu.supabase.co/functions/v1/eduken-api/public-content";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable__qH331oDMJzmjqlOig3C0Q_EIHRa24p";
const MODEL = "@cf/google/gemma-4-26b-a4b-it";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

async function getLiveContent() {
  try {
    const response = await fetch(SUPABASE_PUBLIC_CONTENT, {
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
      cf: { cacheTtl: 30 },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function webResearch(env, question) {
  if (!env.AI?.websearch) return null;

  try {
    const response = await env.AI.websearch({
      gatewayId: "default",
      query: question,
      provider: "ceramic",
      limit: 8,
    });

    if (!response.ok) return null;
    const data = await response.json();
    const results = Array.isArray(data?.items) ? data.items : [];

    return results.slice(0, 8).map((item) => ({
      title: item?.title || "",
      url: item?.url || item?.link || "",
      description: item?.description || item?.snippet || item?.text || "",
    }));
  } catch {
    return null;
  }
}

function compactResearch(results) {
  if (!Array.isArray(results) || !results.length) {
    return "No live web research results were available.";
  }

  return results
    .map((item, index) =>
      [
        `SOURCE ${index + 1}`,
        `TITLE: ${item.title}`,
        `URL: ${item.url}`,
        `DESCRIPTION: ${item.description}`,
      ].join("\n")
    )
    .join("\n\n")
    .slice(0, 24000);
}

function extractAnswer(result) {
  const candidates = [
    result?.response,
    result?.output_text,
    result?.text,
    result?.generated_text,
    result?.answer,
    result?.result?.response,
    result?.result?.output_text,
    result?.result?.text,
    result?.output,
    result?.content,
    result?.choices?.[0]?.message?.content,
    result?.choices?.[0]?.text,
    result?.message?.content,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
    if (Array.isArray(candidate)) {
      const text = candidate
        .map((part) => typeof part === "string" ? part : part?.text || part?.content || "")
        .filter(Boolean)
        .join("\n")
        .trim();
      if (text) return text;
    }
    if (candidate && typeof candidate === "object") {
      const nested = candidate.response || candidate.text || candidate.content || candidate.output_text;
      if (typeof nested === "string" && nested.trim()) return nested.trim();
    }
  }

  return "";
}

function compactContent(content) {
  if (!content) return "No EDUKEN live content was available.";
  const sections = ["opportunities", "admissions", "updates", "faqs", "services"];
  return sections
    .map((section) => {
      const items = Array.isArray(content[section]) ? content[section] : [];
      return section.toUpperCase() + ":\n" + items.slice(0, 20).map((item) => JSON.stringify(item)).join("\n");
    })
    .join("\n\n")
    .slice(0, 30000);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/ai-assistant") {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "POST, OPTIONS",
            "access-control-allow-headers": "content-type, authorization",
          },
        });
      }

      if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

      try {
        const body = await request.json();
        const question = String(body?.question || "").trim();
        if (!question) return json({ error: "Please enter a question." }, 400);

        const content = await getLiveContent();
        const context = compactContent(content);
        const research = await webResearch(env, question);
        const researchContext = compactResearch(research);

        const prompt = [
          "You are the EDUKEN CONSULT AI Assistant and a web-research and verification assistant for Nigerian students.",
          "Answer clearly and naturally.",
          "For current questions (admissions, deadlines, scholarships, jobs, internships, fees, policies, news, or other changing information), use the LIVE WEB RESEARCH when available.",
          "Prefer official institution, government, examination-body, or programme websites over blogs, social posts, aggregators, and adverts.",
          "Do not invent admission openings, deadlines, fees, scholarships, jobs, or official requirements.",
          "Treat search snippets as evidence to investigate, not as unquestionable truth.",
          "When reporting a current opportunity, include the institution/programme, deadline when available, key requirements when available, and the official source URL.",
          "If sources disagree or a fact cannot be verified, clearly say so instead of guessing.",
          "Use EDUKEN content as supplementary context, not as proof of a current fact unless it is independently verified by the web research.",
          "Give practical next steps and distinguish confirmed information from guidance.",
          "Keep answers concise but useful.",
          "",
          "LIVE WEB RESEARCH:",
          researchContext,
          "",
          "LIVE EDUKEN CONSULT CONTENT:",
          context,
          "",
          "USER QUESTION:",
          question,
        ].join("\n");

        const result = await env.AI.run(MODEL, {
          messages: [
            {
              role: "system",
              content: "You are a careful educational information and admissions assistant. Accuracy and verification come before confidence.",
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 700,
        });

        const answer = extractAnswer(result);

        if (!answer) {
          console.error("Workers AI returned no extractable text", {
            model: MODEL,
            responseKeys: result && typeof result === "object" ? Object.keys(result) : [],
          });
          return json(
            {
              error: "The AI model returned an empty or unexpected response. Please try again shortly.",
              model: MODEL,
            },
            502
          );
        }

        return json({
          answer,
          model: MODEL,
          sources: Array.isArray(research) ? research.filter((item) => item.url) : [],
        });
      } catch (error) {
        return json(
          {
            error: "AI assistant is temporarily unavailable.",
            detail: String(error?.message || error),
          },
          500
        );
      }
    }

    return env.ASSETS.fetch(request);
  },
};
