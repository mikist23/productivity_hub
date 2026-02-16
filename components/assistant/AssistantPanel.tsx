"use client"

import { Loader2, RotateCcw, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export type AssistantChatMessage = {
  role: "user" | "assistant"
  content: string
}

type AssistantPanelProps = {
  isOpen: boolean
  isLoading: boolean
  messages: AssistantChatMessage[]
  value: string
  onChange: (value: string) => void
  onClose: () => void
  onClear: () => void
  onSubmit: () => void
}

export function AssistantPanel({
  isOpen,
  isLoading,
  messages,
  value,
  onChange,
  onClose,
  onClear,
  onSubmit,
}: AssistantPanelProps) {
  if (!isOpen) return null

  return (
    <section
      aria-label="AI assistant panel"
      className={cn(
        "fixed bottom-20 right-4 z-[90] flex w-[calc(100vw-2rem)] max-w-[420px] flex-col rounded-xl border border-border bg-card shadow-2xl",
        "max-sm:bottom-16 max-sm:right-2 max-sm:w-[calc(100vw-1rem)]"
      )}
    >
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">Assistant</h2>
          <p className="text-xs text-muted-foreground">Ask about app features and where to find them.</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Clear chat"
            onClick={onClear}
            className="h-8 w-8"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close assistant"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="max-h-[55vh] space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
            Try: "How do I track time for a goal?" or "Where do I manage job applications?"
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={cn(
                "max-w-[90%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm",
                message.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              )}
            >
              {message.content}
            </div>
          ))
        )}
        {isLoading && (
          <div className="inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
          </div>
        )}
      </div>

      <form
        className="border-t border-border p-3"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
      >
        <label htmlFor="assistant-input" className="sr-only">
          Ask assistant
        </label>
        <Textarea
          id="assistant-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Ask how to use this app..."
          className="min-h-[72px] resize-none"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()
              onSubmit()
            }
          }}
        />
        <div className="mt-2 flex justify-end">
          <Button type="submit" size="sm" disabled={isLoading || value.trim().length === 0}>
            <Send className="mr-2 h-4 w-4" /> Send
          </Button>
        </div>
      </form>
    </section>
  )
}
