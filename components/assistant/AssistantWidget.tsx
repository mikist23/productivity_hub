"use client"

import { useEffect, useState } from "react"
import { MessageCircle } from "lucide-react"
import { AssistantPanel, type AssistantChatMessage } from "@/components/assistant/AssistantPanel"
import { Button } from "@/components/ui/button"

const STORAGE_KEY = "assistant-chat-history-v1"
const MAX_HISTORY = 20

type ChatSuccessResponse = {
  reply: string
}

type ChatErrorResponse = {
  error?: string
}

function trimHistory(messages: AssistantChatMessage[]) {
  if (messages.length <= MAX_HISTORY) return messages
  return messages.slice(messages.length - MAX_HISTORY)
}

export function AssistantWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [messages, setMessages] = useState<AssistantChatMessage[]>([])

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as AssistantChatMessage[]
      if (!Array.isArray(parsed)) return
      const valid = parsed.filter(
        (message) =>
          message &&
          (message.role === "user" || message.role === "assistant") &&
          typeof message.content === "string" &&
          message.content.trim().length > 0
      )
      setMessages(trimHistory(valid))
    } catch {
      // Ignore invalid session cache.
    }
  }, [])

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(trimHistory(messages)))
    } catch {
      // Ignore storage issues.
    }
  }, [messages])

  useEffect(() => {
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    window.addEventListener("keydown", onEsc)
    return () => window.removeEventListener("keydown", onEsc)
  }, [])

  const sendMessage = async () => {
    const prompt = inputValue.trim()
    if (!prompt || isLoading) return

    const nextMessages = trimHistory([...messages, { role: "user", content: prompt }])
    setInputValue("")
    setMessages(nextMessages)
    setIsLoading(true)

    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      })

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as ChatErrorResponse | null
        const message = errorBody?.error || "Assistant is unavailable right now."
        setMessages((prev) => trimHistory([...prev, { role: "assistant", content: message }]))
        return
      }

      const payload = (await response.json()) as ChatSuccessResponse
      const answer = payload.reply?.trim()
      if (!answer) {
        setMessages((prev) =>
          trimHistory([...prev, { role: "assistant", content: "I could not generate a response. Please retry." }])
        )
        return
      }

      setMessages((prev) => trimHistory([...prev, { role: "assistant", content: answer }]))
    } catch {
      setMessages((prev) =>
        trimHistory([...prev, { role: "assistant", content: "Network error. Please try again in a moment." }])
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <AssistantPanel
        isOpen={isOpen}
        isLoading={isLoading}
        messages={messages}
        value={inputValue}
        onChange={setInputValue}
        onClose={() => setIsOpen(false)}
        onClear={() => setMessages([])}
        onSubmit={sendMessage}
      />
      <Button
        type="button"
        size="icon"
        className="fixed bottom-4 right-4 z-[80] h-14 w-14 rounded-full shadow-lg"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Close assistant" : "Open assistant"}
        aria-expanded={isOpen}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </>
  )
}
