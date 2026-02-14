"use client"

import { useMemo, useState } from "react"
import type { Post, PostKind } from "@/app/dashboard/providers"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { AuthPromptModal } from "@/components/dashboard/AuthPromptModal"
import { useGuardedAction } from "@/components/dashboard/useGuardedAction"

type PostDraft = Omit<Post, "id" | "createdAt" | "updatedAt">

interface PostModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "add" | "edit"
  kind: PostKind
  initial: Omit<PostDraft, "kind">
  onSave: (draft: PostDraft) => void
}

export function PostModal({ isOpen, onClose, mode, kind, initial, onSave }: PostModalProps) {
  const { guard, authPrompt } = useGuardedAction(kind === "blog" ? "/dashboard/blog" : "/dashboard/stories")
  const [title, setTitle] = useState(initial.title)
  const [tags, setTags] = useState((initial.tags ?? []).join(", "))
  const [content, setContent] = useState(initial.content ?? "")

  const canSave = useMemo(() => title.trim().length > 0, [title])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave) return

    guard(mode === "add" ? `add ${kind}` : `update ${kind}`, () => {
      onSave({
        kind,
        title: title.trim(),
        content,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      })
      onClose()
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "add" ? `New ${kind}` : `Edit ${kind}`}
      description={kind === "blog" ? "Write and organize posts." : "Capture human stories and reflections."}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="post-form" disabled={!canSave}>
            {mode === "add" ? "Save" : "Save changes"}
          </Button>
        </div>
      }
    >
      <form id="post-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="post-title">Title</Label>
          <Input
            id="post-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={kind === "blog" ? "e.g. Next.js notes" : "e.g. A lesson I learned"}
            autoFocus
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="post-tags">Tags</Label>
          <Input
            id="post-tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. react, systems, career"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="post-content">Content</Label>
          <Textarea
            id="post-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write here… (plain text or Markdown)"
            rows={10}
          />
        </div>

        <AuthPromptModal
          isOpen={authPrompt.isOpen}
          onClose={authPrompt.closePrompt}
          action={authPrompt.action}
          nextPath={authPrompt.nextPath}
        />
      </form>
    </Modal>
  )
}
