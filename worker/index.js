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
        query: `${question.slice(0, 350)}. Research this exact question, institution, and academic session. First search official university pages and portals, official JAMB sources, and relevant official school news pages for direct evidence. Then search reputable Nigerian education news/admissions sites for corroboration and recent publicly indexed posts from identifiable official school social accounts when available. If asking whether an admission list has been released, search specifically for the exact session and release/batch status, and include the official admission-status portal even if it is a portal rather than a news article. If asking about course requirements, search for programme-specific UTME/O'Level requirements and JAMB IBASS. Do not use a generic screening or application page as proof that a particular admission batch has or has not been released. Return the most relevant results from multiple source types, prioritising direct official evidence; include secondary reporting when official evidence is incomplete. Exclude unrelated institutions, stale sessions, and results that do not substantively answer the question. Official portal silence does not prove that no update exists.`,
        topic: "general",
        search_depth: "basic",
        max_results: 12,
        include_answer: false,
        include_raw_content: false,
      }),
    });

    if (!response.ok) {
      // Do not retry or fall back to a paid provider. Fail safely if the
      // provider limit is reached, the key is invalid, or the service is down.
      const failureCode = response.status === 401 || response.status === 403
        ? "provider_auth_failed"
        : response.status === 429
          ? "rate_limited"
          : response.status >= 500
            ? "provider_server_error"
            : "provider_http_error";
      console.error("Tavily search request failed", {
        status: response.status,
        failureCode,
      });
      return {
        results: [],
        status: "unavailable",
        error: failureCode === "provider_auth_failed"
          ? "The live-search provider rejected the configured credentials."
          : failureCode === "rate_limited"
            ? "The live-search allowance or rate limit has been reached."
            : failureCode === "provider_server_error"
              ? "The live-search provider returned a server error."
              : "The live-search provider rejected the request.",
        diagnosticCode: failureCode,
      };
    }

    const data = await response.json();
    const rawResults = Array.isArray(data?.results) ? data.results : [];
    if (!rawResults.length) {
      return { results: [], status: "no_results", error: "The search provider returned no results." };
    }

    // Keep results tied to the institution the student actually asked about.
    // Do not silently replace an empty relevant set with unrelated search hits.
    const questionLower = question.toLowerCase();
    const knownInstitutions = [
      ["fuoye", /\bfuoye\b|federal university oye[- ]?ekiti/i],
      ["kwasu", /\bkwasu\b|kwara state university/i],
      ["unilorin", /\bunilorin\b|university of ilorin/i],
      ["fut minna", /\bfut\s?minna\b|federal university of technology,? minna/i],
      ["futminna", /\bfut\s?minna\b|federal university of technology,? minna/i],
      ["oau", /\boau\b|obafemi awolowo university/i],
      ["ui", /\bui\b|university of ibadan/i],
      ["uniabuja", /\buniabuja\b|university of abuja/i],
      ["lasu", /\blasu\b|lagos state university/i],
      ["lautech", /\blautech\b|ladoke akintola university/i],
      ["fudma", /\bfudma\b|federal university dutse/i],
      ["fud", /\bfud\b|federal university dutse/i],
    ];
    const institution = knownInstitutions.find(([, pattern]) => pattern.test(questionLower));
    const mapped = rawResults.slice(0, 12).map((item) => ({
      title: item?.title || "",
      url: item?.url || "",
      description: String(item?.content || item?.snippet || "").slice(0, 700),
    }));
    const relevant = institution
      ? mapped.filter((item) => institution[1].test(`${item.title} ${item.description} ${item.url}`))
      : mapped;

    // Apply programme-specific filtering only to course-requirement questions.
    // Admission-release questions need official status portals and batch-specific announcements.
    const asksCourseRequirements = /\\b(requirements?|subject combination|utme subjects?|o['’]?level|waec|neco|literature[- ]?in[- ]?english|english education|course requirements?)\\b/i.test(question);
    const finalRelevant = asksCourseRequirements
      ? relevant.filter((item) => {
          const evidenceText = [item.title, item.description, item.url].join(" ");
          const hasProgrammeEvidence = /english education|education.{0,35}english|literature[- ]?in[- ]?english|subject combination|utme subjects?|o['’]?level.{0,35}(english|literature|credit)|requirements?.{0,50}(english education|utme|o['’]?level)/i.test(evidenceText);
          const isGenericAdmissionNews = /admission list|first batch|second batch|third batch|supplementary batch|admission.*released|released.*admission/i.test(evidenceText);
          return hasProgrammeEvidence && !isGenericAdmissionNews;
        })
      : relevant;

    if (!finalRelevant.length) {
      return { results: [], status: "no_relevant_results", error: asksCourseRequirements
        ? "Search returned no programme-specific evidence for the requested requirements."
        : "Search returned results, but none clearly matched the named institution and question." };
    }

    return { status: "completed", error: null, results: finalRelevant };
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
    .slice(0, 32000);
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
          "Use a wider evidence base, not only the school’s official portal. Check official institution, government, examination-body, or programme sources first, then reputable independent education news outlets and established admissions-information websites for corroboration and context. Also investigate recent, publicly indexed Facebook/social posts from identifiable official school accounts or established school-related pages when available. Use social posts as leads unless the account is clearly official and the post itself supports the claim. Private Facebook groups and WhatsApp groups cannot be assumed accessible; never claim to have checked them unless their content was actually supplied. Compare publication dates and session years.",
          "If an official portal has no update, do not conclude that no update exists. Look for recent reports from reputable education news sites and established admissions-information platforms; label them as secondary reporting. When possible, use at least two independent sources for batch-specific claims. The search results are limited snapshots, not proof that a page or announcement does not exist. Never claim to have checked a portal or JAMB CAPS unless the supplied results actually support that claim.",
          "Avoid anonymous blogs, copied articles with no attribution, unverified social media rumours, sponsored adverts, and stale pages. A Facebook/Instagram/Telegram post or WhatsApp forward is not official confirmation simply because it is recent or shared in a trusted group. Never use the heading or label ‘Officially Confirmed’ unless a relevant official institution/JAMB/government source supplied in the research results directly supports the specific claim and session. If evidence is from independent education sites or social posts only, label it ‘Recent secondary reports (not officially confirmed)’ and state the limitation clearly. Do not infer that a social account is official from its display name alone.",
          "Do not invent admission openings, deadlines, fees, scholarships, jobs, or official requirements.",
          "EXACT COURSE REQUIREMENTS: For a named programme and session, state exact UTME subject combinations or O'Level requirements only when a supplied research result directly supports them. If evidence is missing, say the exact requirements could not be verified from available evidence. Do not substitute generic or likely requirements, and omit unrelated admission-list news. Direct the user to official university admissions information and JAMB IBASS/brochure for confirmation. Distinguish official evidence from secondary sources.",
          "ADMISSION RELEASE VERIFICATION: Determine status from the strongest and most recent evidence supplied. Search for exact-session, batch-specific announcements AND the official admission-status portal. A live official portal explicitly showing an admission release/status button and a relevant date is direct official evidence that admission status checking/release is available; describe exactly what it says and do not overstate it as proof that every batch or the full list is out. Prefer official evidence over secondary reports, then use 1–3 reputable secondary sources for context. Ongoing screening or application notices alone do NOT prove that no admission list has been released. If official evidence is missing, say that official status could not be confirmed, then report relevant secondary evidence with its uncertainty. Distinguish a released batch from whether further batches are expected; do not guess about future batches.",
          "Use source URLs internally for research and verification, but NEVER display URLs, clickable links, or markdown links inside the answer. Do not include scraped page text, a source dump, or unrelated search results. Return a short, natural synthesized answer. At the end, add a brief “Sources checked” line listing only 2–4 of the most relevant sources that were actually supplied in LIVE WEB RESEARCH and used to support the answer, using source/site names only—never URLs. Distinguish official sources from secondary reporting where relevant. Do not claim to have checked any source that was not actually supplied and relevant. If no live research was needed or completed, do not invent a source list.",
          "STRICT SEARCH RELEVANCE: Before using any result, check that its title or description is substantively about the named institution, the requested academic session, and the admission question. Ignore irrelevant results completely, including dictionaries, general reference pages, unrelated schools, and generic articles. Never list a source under “sources checked” or claim it was checked unless it was actually supplied in LIVE WEB RESEARCH and is relevant to the answer. If the results are mostly irrelevant, say relevant search evidence was insufficient; do not fill gaps with guesses or pretend official portals were checked.",
          "Treat search snippets as evidence to investigate, not as unquestionable truth. Search results may be stale, inaccurate, promotional, or unrelated; check the institution name, academic session, publication date, and whether a claim is actually supported before using it. Do not state that an admission list is released unless at least one relevant result explicitly supports that exact institution and session. If evidence is secondary-only, begin with “Recent reports indicate...” and immediately clarify that this is not official confirmation. If results do not establish the exact session or batch, say that the status remains unconfirmed from the available evidence; do not turn a weak snippet into a definite claim.",
          "NEVER dump or reproduce raw search results, scraped article text, or a long list of search-result headlines as your answer. Synthesize the findings in your own words. Give a direct answer first, then a few key details. Do not show URLs or clickable links. If useful, mention source names only in plain text, distinguishing official sources from secondary reports. If the results do not reliably establish whether admission has started, say that the status could not be confirmed from the available sources and explain briefly which sources conflict or are outdated. Do not present a search result as an official confirmation unless it is from an official source.",
          "FORMATTING RULE: Do not use asterisks for bold, italics, or decorative bullets in the final answer. Use plain text headings, short paragraphs, and simple hyphen bullets. Never output stray * characters or Markdown formatting markers. Never display URLs or clickable links in the answer; mention source names/domains only when relevant.",
          "When reporting a current opportunity, include the institution/programme, deadline when available, key requirements when available, and the official source URL.",
          "MULTI-INSTITUTION ADMISSION QUESTIONS: For questions specifically about Nigerian universities, include Nigerian institutions only; exclude foreign universities even if search results mention them. Do not turn a few broad search results into a long unverified list. Verify each institution separately against a relevant current official university or JAMB source wherever possible, and use reputable secondary education news only as corroboration/context. For every institution mentioned, ensure the supplied evidence actually names that institution and the requested academic session. Separate results into clearly labelled groups: Officially confirmed, and Reported by secondary sources only (official confirmation not found). If the available results do not support institution-by-institution verification, say the search results are insufficient to produce a reliable complete list and provide only the institutions that can be supported. Never imply every university in a list has been verified. Remove duplicate institution names, exclude unrelated/old-session results, and do not infer that an admission list is released just because it appears on a generic admission roundup page or search-result headline.",
          "If sources disagree, clearly explain the difference and prioritize the most authoritative and recent evidence. If a fact cannot be verified, say so instead of guessing.",
          "CRITICAL LIVE-SEARCH FAILURE RULE: If LIVE WEB SEARCH STATUS says search was not available, returned no results, or returned no relevant results, do not guess specific current admission requirements, subject combinations, O’Level credits, departmental cut-off marks, dates, fees, or whether a session's requirements have been published. Do not claim you checked FUOYE, JAMB, or another official portal unless the live research supplied relevant evidence from that source. Clearly say live verification failed or relevant evidence was insufficient, give only general guidance explicitly labelled as general and not verified for the requested session, and advise checking the official institution/JAMB pages. Never infer that information is unpublished merely because search results are missing. If research is unavailable, do not fill the answer with plausible-sounding requirements.",
          "When live search is unavailable, include a short transparent reason if provided by the search status, but do not reveal secrets or internal implementation details. The API response will separately expose a diagnostic status for troubleshooting.",
          "Treat EDUKEN’s own published records as the first source for what EDUKEN has posted. If those records do not contain the answer, say so clearly. For current admissions facts, use official live sources when available; never imply EDUKEN-posted information was independently verified unless the supplied research supports that claim.",
          "Give practical next steps and distinguish confirmed information from guidance.",
          "GENERAL EDUCATIONAL QUESTIONS: Answer stable, general educational questions directly from reliable general knowledge. Do not begin with statements about EDUKEN records being incomplete unless the user specifically asks what EDUKEN has published or the record limitation materially affects the answer.",
          "EDUKEN SERVICE PROMOTION: EDUKEN may promote relevant services as a genuine opportunity, but the student’s question must be answered fully and accurately first. Add at most one short, natural call-to-action only when the service directly helps with the student’s stated need or a clear next step (for example, personalised admission-prospect guidance after an admission-status answer). Do not insert generic sales pitches into unrelated questions, do not imply that paying EDUKEN is required to access public information, and never promise guaranteed admission or outcomes. The promotion must be optional, transparent, and secondary to the answer. If no service is relevant, do not force one into the response.",
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
