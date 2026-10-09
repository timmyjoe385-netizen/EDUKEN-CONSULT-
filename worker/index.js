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

function needsLiveResearch(question) {
  const q = String(question || "").toLowerCase();

  // Jobs, scholarships and other opportunities must come from EDUKEN's own
  // published records unless the user explicitly asks for outside verification.
  const opportunityTopic = /\\b(job|jobs|vacanc(?:y|ies)|career opportunities|scholarships?|grants?|internships?|fellowships?|graduate trainee|remote work|funding opportunities)\\b/.test(q);
  const explicitExternalCheck = /\\b(search the web|search online|look online|verify externally|external verification|verify (this|these|the|it)|fact[- ]?check|check (the )?official source|confirm (from|on|with) (the )?official|official website|official source)\\b/.test(q);
  if (opportunityTopic && !explicitExternalCheck) return false;

  // Stable/general EDUKEN questions never trigger a paid or metered search.
  const timeSensitive = /\\b(latest|current|currently|today|tonight|this week|this month|this year|2026|2027|deadline|closing date|still open|open now|available now|application open|admission status|admission form|post[- ]?utme|screening form|acceptance fee|application portal|cut[- ]?off mark|cutoff|screening date|application fee|school fees|tuition|how much does|price|requirements for|official source|verify|fact[- ]?check|recent update|news about)\\b/.test(q);
  const lookupIntent = /\\b(find|search for|look up|check|confirm|verify|list|recommend|which (schools|universities|polytechnics)|available (forms|admissions))\\b/.test(q);
  const changingTopic = /\\b(admission form|post[- ]?utme|screening form|school fees|acceptance fee|application deadline|application portal|admission status|cut[- ]?off mark|cutoff|screening date)\\b/.test(q);

  return timeSensitive || (lookupIntent && changingTopic);
}

async function webResearch(env, question) {
  if (!env.TAVILY_API_KEY) {
    return { results: [], status: "unavailable", error: "Live verification is not configured." };
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        api_key: env.TAVILY_API_KEY,
        query: question.slice(0, 1000),
        topic: "general",
        search_depth: "basic",
        max_results: 5,
        include_answer: false,
        include_raw_content: false,
      }),
    });

    if (!response.ok) {
      // Do not retry or fall back to a paid provider. Fail safely if the
      // provider limit is reached, the key is invalid, or the service is down.
      console.error("Tavily search request failed", { status: response.status });
      return {
        results: [],
        status: "unavailable",
        error: response.status === 429
          ? "The live-search allowance or rate limit has been reached."
          : "The live-search provider could not complete the request.",
      };
    }

    const data = await response.json();
    const results = Array.isArray(data?.results) ? data.results : [];
    if (!results.length) {
      return { results: [], status: "no_results", error: "The search provider returned no results." };
    }

    return {
      status: "completed",
      error: null,
      results: results.slice(0, 5).map((item) => ({
        title: item?.title || "",
        url: item?.url || "",
        description: item?.content || item?.snippet || "",
      })),
    };
  } catch (error) {
    console.error("Tavily search threw an error", {
      message: String(error?.message || error).slice(0, 300),
    });
    return {
      results: [],
      status: "unavailable",
      error: "Live verification failed before returning results.",
    };
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
        // Avoid web-search calls and related costs for stable/general questions.
        const shouldResearch = needsLiveResearch(question);
        const researchResult = shouldResearch
          ? await webResearch(env, question)
          : { results: [], status: "not_needed", error: null };
        const research = researchResult.results;
        const researchContext = compactResearch(research);
        const searchStatus = researchResult.status === "completed"
          ? "LIVE WEB SEARCH COMPLETED. Use only the supplied search results as live web evidence."
          : researchResult.status === "not_needed"
            ? "LIVE WEB SEARCH NOT NEEDED. This is a general/stable question. Answer directly using EDUKEN content and general knowledge; do not mention search availability or verification warnings."
            : `LIVE WEB SEARCH NOT AVAILABLE (${researchResult.status}). Do not claim that you searched the web or that any opportunity is currently open. Be transparent that current details could not be verified live.`;

        const prompt = [
          "You are the EDUKEN CONSULT AI Assistant and a web-research and verification assistant for Nigerian students.",
          "Answer clearly and naturally.",
          "Use EDUKEN’s published admissions, updates, FAQs and service records first. Use live web research only for current admissions/policy facts that need verification, and prefer official sources. Do not automatically search external websites for jobs, scholarships, grants, internships, fellowships or other opportunities; answer from EDUKEN’s published records unless the user explicitly asks for external verification.",
          "Prefer official institution, government, examination-body, or programme websites over blogs, social posts, aggregators, and adverts.",
          "Do not invent admission openings, deadlines, fees, scholarships, jobs, or official requirements.",
          "Treat search snippets as evidence to investigate, not as unquestionable truth.",
          "When reporting a current opportunity, include the institution/programme, deadline when available, key requirements when available, and the official source URL.",
          "If sources disagree or a fact cannot be verified, clearly say so instead of guessing.",
          "Treat EDUKEN’s own published records as the first source for what EDUKEN has posted. If those records do not contain the answer, say so clearly. For current admissions facts, use official live sources when available; never imply EDUKEN-posted information was independently verified unless the supplied research supports that claim.",
          "Give practical next steps and distinguish confirmed information from guidance.",
          "DEFAULT ANSWER STYLE: Be concise and summary-first. For simple questions, answer in 1–3 short sentences. For service lists or broad questions, use at most 4 short bullets and aim for under 100 words. Give only the most useful details first; avoid repeating the question, long introductions, and unnecessary sections. Expand only when the user asks for more detail.",
          "",
          "LIVE WEB SEARCH STATUS:",
          searchStatus,
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
          max_tokens: 1200,
          chat_template_kwargs: {
            enable_thinking: false,
          },
        });

        const answer = extractAnswer(result);

        if (!answer) {
          console.error("Workers AI returned no extractable text", {
            model: MODEL,
            responseType: typeof result,
            responseKeys: result && typeof result === "object" ? Object.keys(result) : [],
            responsePreview: JSON.stringify(result)?.slice(0, 3000) || String(result).slice(0, 1000),
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
          researchStatus: researchResult.status,
          researchError: researchResult.error,
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
