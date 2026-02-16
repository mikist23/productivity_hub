import OpenAI from "openai"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { buildAssistantSystemPrompt } from "@/lib/assistant/prompt"
import { resolveAssistantProviderConfig } from "@/lib/assistant/provider"
import { resolveRequestUserId } from "@/lib/resolve-user-id"

const MAX_MESSAGES = 20
const MAX_MESSAGE_LENGTH = 1000
const MAX_TOTAL_CHARS = 10_000
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 12

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
})

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(MAX_MESSAGES),
})

type RateLimitBucket = {
  count: number
  windowStart: number
}

const rateLimitStore = new Map<string, RateLimitBucket>()

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status })
}

function asError(error: unknown) {
  if (!error || typeof error !== "object") return null
  const candidate = error as {
    status?: unknown
    code?: unknown
    name?: unknown
    message?: unknown
  }
  return {
    status: typeof candidate.status === "number" ? candidate.status : undefined,
    code: typeof candidate.code === "string" ? candidate.code : undefined,
    name: typeof candidate.name === "string" ? candidate.name : undefined,
    message: typeof candidate.message === "string" ? candidate.message : undefined,
  }
}

function canProceed(userId: string, now = Date.now()) {
  const bucket = rateLimitStore.get(userId)

  if (!bucket || now - bucket.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(userId, { count: 1, windowStart: now })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (bucket.count >= RATE_LIMIT_MAX_REQUESTS) {
    const elapsed = now - bucket.windowStart
    const retryAfterSeconds = Math.max(1, Math.ceil((RATE_LIMIT_WINDOW_MS - elapsed) / 1000))
    return { allowed: false, retryAfterSeconds }
  }

  bucket.count += 1
  rateLimitStore.set(userId, bucket)
  return { allowed: true, retryAfterSeconds: 0 }
}

export async function POST(req: NextRequest) {
  const userId = await resolveRequestUserId(req)
  if (!userId) {
    return json({ error: "Unauthorized" }, 401)
  }

  const providerConfig = resolveAssistantProviderConfig()
  if (!providerConfig) {
    return json({ error: "AI assistant is not configured on the server (missing GEMINI_API_KEY)." }, 503)
  }

  const rateLimit = canProceed(userId)
  if (!rateLimit.allowed) {
    const response = json({ error: "Rate limit exceeded. Please try again shortly." }, 429)
    response.headers.set("Retry-After", String(rateLimit.retryAfterSeconds))
    return response
  }

  const rawBody = await req.json().catch(() => null)
  const parsed = requestSchema.safeParse(rawBody)

  if (!parsed.success) {
    return json({ error: "Invalid chat payload." }, 400)
  }

  const totalChars = parsed.data.messages.reduce((acc, message) => acc + message.content.length, 0)
  if (totalChars > MAX_TOTAL_CHARS) {
    return json({ error: "Chat payload exceeds maximum size." }, 400)
  }

  const { apiKey, baseURL, model } = providerConfig

  try {
    const client = new OpenAI({ apiKey, baseURL })

    const completion = await client.chat.completions.create({
      model,
      temperature: 0.2,
      max_tokens: 450,
      messages: [
        {
          role: "system",
          content: buildAssistantSystemPrompt(),
        },
        ...parsed.data.messages,
      ],
    })

    const reply = completion.choices[0]?.message?.content?.trim()

    if (!reply) {
      return json({ error: "Assistant could not generate a response." }, 500)
    }

    return json({
      reply,
      model,
      usage: completion.usage
        ? {
            input_tokens: completion.usage.prompt_tokens,
            output_tokens: completion.usage.completion_tokens,
            total_tokens: completion.usage.total_tokens,
          }
        : undefined,
    })
  } catch (error) {
    const apiError = asError(error)

    if (apiError?.status === 429 || apiError?.code === "insufficient_quota") {
      return json(
        {
          error:
            "Gemini quota or rate limit was reached. Check Google AI Studio/GCP usage limits and try again.",
        },
        429
      )
    }

    if (apiError?.status === 401 || apiError?.status === 403) {
      return json({ error: "Gemini API key is invalid or does not have access in this environment." }, 503)
    }

    if (apiError?.status === 404 || apiError?.code === "model_not_found") {
      return json({ error: `Configured Gemini model is unavailable: ${model}` }, 400)
    }

    if (process.env.NODE_ENV !== "production") {
      console.error("Assistant chat error:", apiError ?? error)
    }

    return json({ error: "Unable to answer right now. Please try again." }, 500)
  }
}
