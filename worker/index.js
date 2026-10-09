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

  // Jobs, scholarships and other opportunities use EDUKEN's own published
  // records by default. Only search outside when the user clearly asks for it.
  const opportunityTopic = /\b(job|jobs|vacanc(?:y|ies)|career opportunities|scholarships?|grants?|internships?|fellowships?|graduate trainee|remote work|funding opportunities)\b/.test(q);
  const explicitExternalCheck = /\b(search the web|search online|look online|verify externally|external verification|verify (this|these|the|it)|fact[- ]?check|check (the )?official source|confirm (from|on|with) (the )?official|official website|official source)\b/.test(q);
  if (opportunityTopic && !explicitExternalCheck) return false;

  // Recognise ordinary student wording about current admissions across any
  // Nigerian institution; students should not need to write special prompts.
  const admissionsIntent = /\b(has|have|is|are|when|what|which|can|did|does|do|any|latest|current|check|confirm|verify|search)\b.{0,70}\b(admission|admissions|giving admission|admission list|admission status|post[- ]?utme|screening|cut[- ]?off|cutoff|school fees|acceptance fee|admission form|application form|registration|requirements|deadline|closing date|portal)\b|\b(admission|admissions|giving admission|admission list|admission status|post[- ]?utme|screening|cut[- ]?off|cutoff|school fees|acceptance fee|admission form|application form|registration deadline|admission portal)\b.{0,70}\b(out|open|started|released|available|closing|deadline|requirements|fees|mark|status|list|form|date|2026|2027)\b/.test(q);

  const timeSensitive = /\b(latest|current|currently|today|tonight|this week|this month|this year|2026|2027|deadline|closing date|still open|open now|available now|application open|admission status|admission form|post[- ]?utme|screening form|acceptance fee|application portal|cut[- ]?off mark|cutoff|screening date|application fee|school fees|tuition|how much does|price|requirements for|official source|verify|fact[- ]?check|recent update|news about)\b/.test(q);
  const lookupIntent = /\b(find|search for|look up|check|confirm|verify|list|recommend|which (schools|universities|polytechnics)|available (forms|admissions))\b/.test(q);
  const changingTopic = /\b(admission form|post[- ]?utme|screening form|school fees|acceptance fee|application deadline|application portal|admission status|cut[- ]?off mark|cutoff|screening date)\b/.test(q);

  return admissionsIntent || timeSensitive || (lookupIntent && changingTopic);
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
        query: `${question.slice(0, 500)}. For a question about a specific university admission status, search the exact institution name plus 2026/2027 admission list, latest batch, second batch, third batch, admission screening, official admission portal, and recent Nigerian education news reports. Search both the institution official admission/news pages and reputable independent Nigerian education/admissions sites. Prefer the newest dated evidence and evidence explicitly about the requested session. Do not infer that admission has not been released because screening or applications are ongoing. For lists of universities, verify each institution separately where possible, exclude unrelated institutions and old sessions, and report uncertainty when evidence is insufficient.`,
        topic: "general",
        search_depth: "basic",
        max_results: 8,
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
      results: results.slice(0, 8).map((item) => ({
        title: item?.title || "",
        url: item?.url || "",
        description: String(item?.content || item?.snippet || "").slice(0, 700),
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
        const officialEvidence = research.some((item) => {
          const url = String(item.url || "").toLowerCase();
          return /(^|\.)fuoye\.edu\.ng\//.test(url) ||
            /(^|\.)jamb\.gov\.ng\//.test(url);
        });
        const secondaryAdmissionClaim = research.some((item) => {
          const text = `${item.title || ""} ${item.description || ""}`.toLowerCase();
          return /admission list|admission offers|released.*admission|admission.*released|giving admission/.test(text);
        });
        const searchStatus = researchResult.status === "completed"
          ? "LIVE WEB SEARCH COMPLETED. Use only the supplied search results as live web evidence."
          : researchResult.status === "not_needed"
            ? "LIVE WEB SEARCH NOT NEEDED. This is a general/stable question. Answer directly using EDUKEN content and general knowledge; do not mention search availability or verification warnings."
            : `LIVE WEB SEARCH NOT AVAILABLE (${researchResult.status}). Do not claim that you searched the web or that any opportunity is currently open. Be transparent that current details could not be verified live.`;

        const prompt = [
          "You are the EDUKEN CONSULT AI Assistant and a web-research and verification assistant for Nigerian students.",
          "Answer clearly and naturally.",
          "SOURCE ORDER FOR ADMISSIONS: Always check and use relevant EDUKEN CONSULT published admissions, updates, FAQs and service records first. If EDUKEN has a useful matching update, summarize it as the starting point and clearly identify it as EDUKEN-published information. Then, when the question asks about current status or details that may have changed, use live web research to verify or update the EDUKEN information. Explain briefly whether external research confirms, adds context to, or conflicts with the site information. Do not silently replace relevant EDUKEN information with external search results, and do not claim the site contains information that is not present in LIVE EDUKEN CONSULT CONTENT. If EDUKEN has no matching record, answer the question using current external research when needed; do not imply EDUKEN records are the only source for admissions. Do not automatically search external websites for jobs, scholarships, grants, internships, fellowships or other opportunities; use EDUKEN’s published records only unless the user explicitly asks for external research or verification.",
          "Use a wider evidence base, not only the school’s official portal. Check official institution, government, examination-body, or programme sources first, then reputable independent education news outlets and established admissions-information websites for corroboration and context. Use multiple relevant sources when available and compare publication dates and session years.",
          "If an official portal has no update, do not conclude that no update exists. Look for recent reports from reputable education news sites and established admissions-information platforms; label them as secondary reporting. For important current claims, seek corroboration from at least two independent reliable sources where possible. Never claim to have checked a portal or JAMB CAPS unless the supplied results actually support that claim.",
          "Avoid anonymous blogs, copied articles with no attribution, social media rumours, sponsored adverts, and stale pages. Do not treat a site as reliable merely because it appears in search results.",
          "Do not invent admission openings, deadlines, fees, scholarships, jobs, or official requirements.",
          "ADMISSION RELEASE VERIFICATION: Determine the status from the strongest and most recent evidence actually supplied. Search for batch-specific updates (first, second, third, supplementary/final batch) and current admission-list announcements, not only general application or screening notices. Ongoing applications or screening do NOT prove that no admission list has been released; never make that inference. A current official university or JAMB source can confirm a release. Recent, reputable secondary reports can support a carefully labelled statement such as “recent reports indicate that the third batch is being released,” but do not describe that as official confirmation unless an official source supports it. If official evidence is missing, do not confidently say “No, it has not been released.” State precisely that official status could not be confirmed from the sources checked, and report relevant secondary evidence with its uncertainty. Distinguish a batch already released from whether further batches are expected; do not guess about future batches.",
          "Use source URLs internally for research and verification, but NEVER display URLs, clickable links, or markdown links in the answer. Do not include scraped page text, a source dump, unrelated search results, or a separate raw-search-results section in the answer. Return a short synthesized answer and, when relevant, mention up to 5 source names/domains in plain text only. Do not add a separate list of URLs.",
          "Treat search snippets as evidence to investigate, not as unquestionable truth. Search results may be stale, inaccurate, promotional, or unrelated; check the institution name, academic session, publication date, and whether a claim is actually supported before using it.",
          "NEVER dump or reproduce raw search results, scraped article text, or a long list of search-result headlines as your answer. Synthesize the findings in your own words. Give a direct answer first, then a few key details. Do not show URLs or clickable links. If useful, mention source names only in plain text, distinguishing official sources from secondary reports. If the results do not reliably establish whether admission has started, say that the status could not be confirmed from the available sources and explain briefly which sources conflict or are outdated. Do not present a search result as an official confirmation unless it is from an official source.",
          "FORMATTING RULE: Do not use asterisks for bold, italics, or decorative bullets in the final answer. Use plain text headings, short paragraphs, and simple hyphen bullets. Never output stray * characters or Markdown formatting markers. Never display URLs or clickable links in the answer; mention source names/domains only when relevant.",
          "When reporting a current opportunity, include the institution/programme, deadline when available, key requirements when available, and the official source URL.",
          "MULTI-INSTITUTION ADMISSION QUESTIONS: For questions specifically about Nigerian universities, include Nigerian institutions only; exclude foreign universities even if search results mention them. Do not turn a few broad search results into a long unverified list. Verify each institution separately against a relevant current official university or JAMB source wherever possible, and use reputable secondary education news only as corroboration/context. For every institution mentioned, ensure the supplied evidence actually names that institution and the requested academic session. Separate results into clearly labelled groups: Officially confirmed, and Reported by secondary sources only (official confirmation not found). If the available results do not support institution-by-institution verification, say the search results are insufficient to produce a reliable complete list and provide only the institutions that can be supported. Never imply every university in a list has been verified. Remove duplicate institution names, exclude unrelated/old-session results, and do not infer that an admission list is released just because it appears on a generic admission roundup page or search-result headline.",
          "If sources disagree, clearly explain the difference and prioritize the most authoritative and recent evidence. If a fact cannot be verified, say so instead of guessing.",
          "Treat EDUKEN’s own published records as the first source for what EDUKEN has posted. If those records do not contain the answer, say so clearly. For current admissions facts, use official live sources when available; never imply EDUKEN-posted information was independently verified unless the supplied research supports that claim.",
          "Give practical next steps and distinguish confirmed information from guidance.",
          "GENERAL EDUCATIONAL QUESTIONS: Answer stable, general educational questions directly from reliable general knowledge. Do not begin with statements about EDUKEN records being incomplete unless the user specifically asks what EDUKEN has published or the record limitation materially affects the answer. Do not add a consultation sales pitch unless it is genuinely relevant to the question.",
      "OPPORTUNITIES RULE: For scholarships, jobs, grants, internships, fellowships, graduate trainee roles, remote work and similar opportunities, use EDUKEN’s published records ONLY by default. Do not search external websites for these topics unless the user explicitly asks for external research or verification. If no matching opportunity is in EDUKEN’s records, say only that EDUKEN’s records do not currently list a matching opportunity; do not imply no opportunities exist elsewhere. Do not direct users to filters or features unless you know they exist.",
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
