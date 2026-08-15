/*
 * AI Decision edge function
 *
 * Handles two actions via a single endpoint:
 *   - "questions": generates 5-7 clarification questions tailored to the user's decision
 *   - "criteria": generates 5-8 comparison criteria with scores and reasoning
 *
 * The AI provider is abstracted through callLLM() so it can be swapped later.
 * The API key is read from the OPENAI_API_KEY secret and NEVER sent to the client.
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface QuestionsRequest {
  action: "questions";
  decisionQuestion: string;
  optionA: string;
  optionB: string;
}

interface CriteriaRequest {
  action: "criteria";
  decisionQuestion: string;
  optionA: string;
  optionB: string;
  questions: { id: string; question: string; type: string }[];
  answers: Record<string, string | number>;
}

type RequestBody = QuestionsRequest | CriteriaRequest;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as RequestBody;

    if (body.action === "questions") {
      const result = await generateQuestions(body);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.action === "criteria") {
      const result = await generateCriteria(body);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("ai-decision error:", err);
    return new Response(
      JSON.stringify({ error: "We couldn't analyze your decision right now." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

/* ------------------------------------------------------------------ */
/* AI provider abstraction — swap callLLM to change providers          */
/* ------------------------------------------------------------------ */

interface LLMMessage {
  role: "system" | "user";
  content: string;
}

async function callLLM(messages: LLMMessage[]): Promise<string> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY secret is not configured");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("LLM API error:", response.status, text);
    throw new Error(`LLM request failed (${response.status})`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/* ------------------------------------------------------------------ */
/* Question generation                                                 */
/* ------------------------------------------------------------------ */

async function generateQuestions(req: QuestionsRequest) {
  const system = `You are a neutral decision analyst. Your job is NOT to recommend an option. Your job is to identify what additional information is necessary to make a useful comparison between two options.

Generate 5 to 7 highly relevant clarification questions that are specific to the actual decision. Do NOT generate generic questions when more specific factual questions are possible.

For each question, choose the most appropriate input type from this list:
- "scale": for importance/preference ratings (1-5)
- "number": for plain numeric quantities
- "currency": for monetary amounts
- "percentage": for percentage values
- "single_choice": when there are distinct categories to pick from
- "yes_no": for binary yes/no questions
- "text": for open-ended answers

Rules:
- Do NOT ask multiple questions that measure the same thing.
- Ask about facts that would meaningfully affect the recommendation.
- If an important fact is missing, ask about it.
- Be specific to the decision domain.

Return ONLY a JSON object with this exact shape:
{
  "decisionType": "short label for the decision domain",
  "questions": [
    {
      "id": "snake_case_id",
      "question": "the question text",
      "description": "why this matters for the decision",
      "type": "one of the types above",
      "options": ["a","b"],          // only for single_choice
      "min": 1, "max": 5,            // only for scale
      "minLabel": "Not important",   // only for scale
      "maxLabel": "Critical"         // only for scale
    }
  ]
}`;

  const user = `Decision question: ${req.decisionQuestion}
Option A: ${req.optionA}
Option B: ${req.optionB}

Generate clarification questions for this decision.`;

  const raw = await callLLM([
    { role: "system", content: system },
    { role: "user", content: user },
  ]);

  const parsed = JSON.parse(raw);
  const validated = validateQuestions(parsed);
  return validated;
}

function validateQuestions(parsed: any) {
  if (!parsed || typeof parsed.decisionType !== "string") {
    throw new Error("Invalid AI response: missing decisionType");
  }
  if (!Array.isArray(parsed.questions) || parsed.questions.length < 3) {
    throw new Error("Invalid AI response: missing or too few questions");
  }

  const validTypes = new Set([
    "scale", "number", "currency", "percentage", "single_choice", "yes_no", "text",
  ]);

  const questions = parsed.questions
    .filter((q: any) => q && typeof q.question === "string" && validTypes.has(q.type))
    .slice(0, 7)
    .map((q: any, i: number) => ({
      id: typeof q.id === "string" ? q.id : `q${i + 1}`,
      question: q.question,
      description: typeof q.description === "string" ? q.description : "",
      type: q.type,
      options: Array.isArray(q.options) ? q.options.map(String) : undefined,
      min: typeof q.min === "number" ? q.min : 1,
      max: typeof q.max === "number" ? q.max : 5,
      minLabel: typeof q.minLabel === "string" ? q.minLabel : "Not important",
      maxLabel: typeof q.maxLabel === "string" ? q.maxLabel : "Critical",
    }));

  if (questions.length < 3) {
    throw new Error("Invalid AI response: not enough valid questions after filtering");
  }

  return { decisionType: parsed.decisionType, questions };
}

/* ------------------------------------------------------------------ */
/* Criteria generation                                                 */
/* ------------------------------------------------------------------ */

async function generateCriteria(req: CriteriaRequest) {
  const answersText = req.questions
    .map((q) => `Q: ${q.question}\nA: ${formatAnswer(req.answers[q.id])}`)
    .join("\n\n");

  const system = `You are a neutral decision analyst. Based on the decision and the user's answers, identify 5 to 8 criteria that should be used to compare the two options.

For each criterion return:
- id: snake_case identifier
- name: short criterion name
- description: one-sentence explanation
- suggestedWeight: integer weight (all weights MUST total 100)
- optionAScore: integer 1-10
- optionBScore: integer 1-10
- scoreReasonA: one-sentence reason for Option A's score
- scoreReasonB: one-sentence reason for Option B's score
- confidence: "high", "medium", or "low"

CRITICAL RULES:
- Do NOT invent facts. If the user has not supplied enough information to objectively score a criterion, use a neutral score of 5/10 and set confidence to "low".
- Never fabricate home prices, mortgage rates, salaries, tax rates, investment returns, product specs, or travel costs unless the user provided them.
- Distinguish between user-provided facts, user preferences, and your assumptions.
- Be neutral. Do NOT manipulate criteria to force one option to win.
- Scores must be from 1 to 10.
- Suggested weights across all criteria MUST total exactly 100.

Return ONLY a JSON object: { "criteria": [ ... ] }`;

  const user = `Decision question: ${req.decisionQuestion}
Option A: ${req.optionA}
Option B: ${req.optionB}

User's answers to clarification questions:
${answersText}

Generate comparison criteria with scores and reasoning based on the information provided.`;

  const raw = await callLLM([
    { role: "system", content: system },
    { role: "user", content: user },
  ]);

  const parsed = JSON.parse(raw);
  const validated = validateCriteria(parsed);
  return validated;
}

function validateCriteria(parsed: any) {
  if (!parsed || !Array.isArray(parsed.criteria) || parsed.criteria.length < 3) {
    throw new Error("Invalid AI response: missing or too few criteria");
  }

  const criteria = parsed.criteria
    .filter((c: any) => c && typeof c.name === "string")
    .slice(0, 8)
    .map((c: any, i: number) => {
      const optionAScore = clampScore(c.optionAScore);
      const optionBScore = clampScore(c.optionBScore);
      return {
        id: typeof c.id === "string" ? c.id : `c${i + 1}`,
        name: c.name,
        description: typeof c.description === "string" ? c.description : "",
        suggestedWeight: typeof c.suggestedWeight === "number" ? Math.round(c.suggestedWeight) : Math.round(100 / parsed.criteria.length),
        optionAScore,
        optionBScore,
        scoreReasonA: typeof c.scoreReasonA === "string" ? c.scoreReasonA : "",
        scoreReasonB: typeof c.scoreReasonB === "string" ? c.scoreReasonB : "",
        confidence: ["high", "medium", "low"].includes(c.confidence) ? c.confidence : "medium",
      };
    });

  if (criteria.length < 3) {
    throw new Error("Invalid AI response: not enough valid criteria after filtering");
  }

  // Normalize weights to total 100
  const total = criteria.reduce((sum: number, c: any) => sum + c.suggestedWeight, 0);
  if (total !== 100 && total > 0) {
    const factor = 100 / total;
    criteria.forEach((c: any) => {
      c.suggestedWeight = Math.round(c.suggestedWeight * factor);
    });
    // Fix rounding drift
    const newTotal = criteria.reduce((sum: number, c: any) => sum + c.suggestedWeight, 0);
    if (newTotal !== 100 && criteria.length > 0) {
      criteria[0].suggestedWeight += 100 - newTotal;
    }
  }

  return { criteria };
}

function clampScore(v: any): number {
  const n = typeof v === "number" ? v : 5;
  return Math.max(1, Math.min(10, Math.round(n)));
}

function formatAnswer(v: string | number | undefined): string {
  if (v === undefined || v === null || v === "") return "No answer provided";
  return String(v);
}
