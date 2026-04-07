import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { portfolioKnowledge } from "@/content/portfolio-knowledge"

// ---------------------------------------------------------------------------
// Rate limiting (in-memory, per serverless instance)
// For a low-traffic portfolio site this is a reasonable trade-off without
// needing a Redis/KV store. Set a budget cap in your Anthropic dashboard too.
// ---------------------------------------------------------------------------
const RATE_LIMIT_MAX = 20
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  const realIp = request.headers.get("x-real-ip")
  if (realIp) return realIp.trim()
  return "unknown"
}

function checkRateLimit(ip: string): {
  allowed: boolean
  remaining: number
  resetAt: number
} {
  const now = Date.now()
  const existing = rateLimitStore.get(ip)

  if (!existing || now > existing.resetAt) {
    const resetAt = now + RATE_LIMIT_WINDOW_MS
    rateLimitStore.set(ip, { count: 1, resetAt })
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetAt }
  }

  if (existing.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count += 1
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX - existing.count,
    resetAt: existing.resetAt,
  }
}

// ---------------------------------------------------------------------------
// Response cache (in-memory)
// Caches AI responses for the common first-message preset prompts so they
// don't always hit the API. Keyed by normalised message text.
// ---------------------------------------------------------------------------
const responseCache = new Map<string, string>()

const CACHEABLE_PROMPTS = new Set([
  "tell me about yourself",
  "what are you working on now?",
  "can i see your resume?",
  "let's see some examples of your work",
])

// ---------------------------------------------------------------------------
// System prompt builder — reads everything from portfolio-knowledge.ts
// ---------------------------------------------------------------------------
function buildSystemPrompt(): string {
  const { meta, about, projects, resume, workingStyle, faq, actions } =
    portfolioKnowledge

  const projectBlocks = Object.entries(projects)
    .map(([, project]) => {
      const lines = [
        `Project: ${project.title}`,
        `Role: ${project.role}`,
        `Timeline: ${project.timeline}`,
        "summary" in project ? `Summary: ${project.summary}` : null,
        "problem" in project ? `Problem: ${project.problem}` : null,
        "approach" in project ? `Approach: ${project.approach}` : null,
        "outcomes" in project ? `Outcomes: ${project.outcomes}` : null,
      ]
        .filter(Boolean)
        .join("\n")
      return lines
    })
    .join("\n\n")

  const careerBlocks = resume.experience
    .map(
      (e) => `• ${e.role} at ${e.company} (${e.years}): ${e.highlights}`
    )
    .join("\n")

  const faqBlocks = Object.entries(faq)
    .map(([q, a]) => `Q: ${q}\nA: ${a}`)
    .join("\n\n")

  // Build project links section dynamically from actions config
  const projectLinks = actions.projects
    .map((p) => `- ${p.label}: ${p.url}`)
    .join("\n")

  return `You are an AI assistant representing ${meta.name}, a product designer. You speak in the first person as ${meta.name} — as if the visitor is talking directly to them. You are embedded in ${meta.name}'s portfolio website to help recruiters and hiring managers learn about them.

ABOUT
${about.overview}

WHAT I'M LOOKING FOR
${about.whatImLookingFor}

MY DESIGN PROCESS
${about.process}

MY APPROACH
${about.approach}

MY STRENGTHS
${about.strengths}

COLLABORATION STYLE
${about.collaboration}

BACKGROUND
${about.background}

PROJECTS
${projectBlocks}

CAREER HISTORY
${careerBlocks}

WORKING STYLE
Best environment: ${workingStyle.bestEnvironment}
Communication: ${workingStyle.communicationStyle}
Pet peeves: ${workingStyle.petPeeves}
Outside work: ${workingStyle.whatIDoOutsideWork}

FREQUENTLY ASKED QUESTIONS
${faqBlocks}

USEFUL LINKS (reference when relevant — mention by name only, never include URLs in your text)
- Resume: ${actions.resume.url}
- LinkedIn: ${actions.linkedin.url}
${projectLinks}

GUIDELINES
- Be conversational, warm, and concise. Keep responses to 2–4 sentences unless the visitor clearly wants more detail.
- Speak in first person ("I", "my", "me").
- Do not make up information not provided above. If asked something you don't know, say you're not sure and suggest reaching out directly via LinkedIn.
- When it makes sense, naturally reference the resume, LinkedIn, or case study links — but don't force it.
- Stay professional but personable. This is a portfolio, not a customer support bot.
- Do not end responses with a question. Close every response with a statement.
- Never include URLs or links in your response text. If a resource is relevant, mention it by name only and let the user find it via the buttons below.
- Do not discuss topics unrelated to the designer's professional background and work.
- Do not use any markdown formatting in your responses. No bold (**), italics (*), bullet points (-), or headers (#). Write in plain prose only.`
}

// ---------------------------------------------------------------------------
// Message type (matches Anthropic SDK)
// ---------------------------------------------------------------------------
type ConversationMessage = {
  role: "user" | "assistant"
  content: string
}

// ---------------------------------------------------------------------------
// POST /api/chat
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  // --- Rate limit check ---
  const ip = getClientIP(request)
  const rateLimit = checkRateLimit(ip)

  if (!rateLimit.allowed) {
    const minutesUntilReset = Math.ceil(
      (rateLimit.resetAt - Date.now()) / 60_000
    )
    return NextResponse.json(
      {
        error: "rate_limited",
        message: `You've reached the message limit (${RATE_LIMIT_MAX} messages/hour). Please try again in about ${minutesUntilReset} minute${minutesUntilReset !== 1 ? "s" : ""}.`,
      },
      { status: 429 }
    )
  }

  // --- Parse request body ---
  let body: { message?: string; history?: ConversationMessage[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "invalid_body", message: "Request body must be valid JSON." },
      { status: 400 }
    )
  }

  const { message, history = [] } = body

  if (!message?.trim()) {
    return NextResponse.json(
      { error: "missing_message", message: "message field is required." },
      { status: 400 }
    )
  }

  // --- Cache check (only for common first-turn prompts with no prior history) ---
  const cacheKey = message.trim().toLowerCase()
  const isFirstMessage = history.length === 0

  if (isFirstMessage && CACHEABLE_PROMPTS.has(cacheKey)) {
    const cached = responseCache.get(cacheKey)
    if (cached) {
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(cached))
          controller.close()
        },
      })
      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Cache": "HIT",
        },
      })
    }
  }

  // --- Anthropic streaming call ---
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is not set")
    return NextResponse.json(
      {
        error: "server_error",
        message: "Chat is temporarily unavailable. Please try again later.",
      },
      { status: 500 }
    )
  }

  // Model is configurable via env var — defaults to Haiku for cost efficiency.
  // Switch to claude-sonnet-4-5 or claude-opus-4 for higher quality responses.
  const model = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5"

  const client = new Anthropic({ apiKey })

  // Limit conversation history to the last 6 messages to control token cost
  const limitedHistory: ConversationMessage[] = history.slice(-6)

  const messages: ConversationMessage[] = [
    ...limitedHistory,
    { role: "user", content: message.trim() },
  ]

  const encoder = new TextEncoder()
  let fullResponse = ""

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = client.messages.stream({
          model,
          max_tokens: 512,
          system: buildSystemPrompt(),
          messages,
        })

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const chunk = event.delta.text
            fullResponse += chunk
            controller.enqueue(encoder.encode(chunk))
          }
        }

        // Cache the response for future identical first-turn prompts
        if (isFirstMessage && CACHEABLE_PROMPTS.has(cacheKey) && fullResponse) {
          responseCache.set(cacheKey, fullResponse)
        }

        controller.close()
      } catch (err) {
        console.error("Anthropic streaming error:", err)
        const errorMsg =
          "\n\nSomething went wrong on my end. Please try again in a moment."
        controller.enqueue(encoder.encode(errorMsg))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-store",
      "X-Cache": "MISS",
    },
  })
}
