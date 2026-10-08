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

        const prompt = [
          "You are the EDUKEN CONSULT AI Assistant.",
          "Answer clearly and naturally for Nigerian students.",
          "Use the live EDUKEN CONSULT content below whenever it is relevant.",
          "Do not invent admission openings, deadlines, fees, scholarships, jobs, or official requirements.",
          "If the live content does not establish a current fact, say that it needs official-source verification.",
          "Give practical next steps and distinguish guidance from confirmed information.",
          "Keep answers concise but useful.",
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

        const answer =
          result?.response ||
          result?.choices?.[0]?.message?.content ||
          result?.output_text ||
          "I could not produce a confident answer right now.";

        return json({ answer, model: MODEL });
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
