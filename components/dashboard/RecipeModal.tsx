"use client"

import { useMemo, useState } from "react"
import type { Recipe } from "@/app/dashboard/providers"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

type RecipeDraft = Omit<Recipe, "id" | "createdAt" | "updatedAt">

function splitLines(text: string) {
  return text
    .split(/\r?\n/g)
    .map((l) => l.trim())
    .filter(Boolean)
}

function parseIngredients(text: string) {
  return splitLines(text).map((line) => {
    const parts = line.split(" - ")
    if (parts.length >= 2) {
      const amount = parts[0].trim()
      const item = parts.slice(1).join(" - ").trim()
      return { item, amount: amount || undefined }
    }
    return { item: line }
  })
}

function ingredientsToText(ingredients: Recipe["ingredients"]) {
  return ingredients
    .map((ing) => (ing.amount ? `${ing.amount} - ${ing.item}` : ing.item))
    .join("\n")
}

interface RecipeModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "add" | "edit"
  initial: RecipeDraft
  onSave: (draft: RecipeDraft) => void
}

export function RecipeModal({ isOpen, onClose, mode, initial, onSave }: RecipeModalProps) {
  const [title, setTitle] = useState(initial.title)
  const [description, setDescription] = useState(initial.description ?? "")
  const [category, setCategory] = useState(initial.category || "General")
  const [tags, setTags] = useState((initial.tags ?? []).join(", "))
  const [ingredientsText, setIngredientsText] = useState(
    ingredientsToText(initial.ingredients ?? [])
  )
  const [stepsText, setStepsText] = useState((initial.steps ?? []).join("\n"))
  const [sourceUrl, setSourceUrl] = useState(initial.sourceUrl ?? "")
  const [imageUrl, setImageUrl] = useState(initial.imageUrl ?? "")

  const canSave = useMemo(() => title.trim().length > 0, [title])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave) return

    const draft: RecipeDraft = {
      title: title.trim(),
      description: description.trim() || undefined,
      category: category.trim() || "General",
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      ingredients: parseIngredients(ingredientsText),
      steps: splitLines(stepsText),
      sourceUrl: sourceUrl.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
    }

    onSave(draft)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "add" ? "Add Recipe" : "Edit Recipe"}
      description="Store recipes by category and tags."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recipe-title">Title</Label>
          <Input
            id="recipe-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Chicken Alfredo"
            autoFocus
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="recipe-desc">Description (Optional)</Label>
          <Textarea
            id="recipe-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A quick note about this recipe…"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="recipe-category">Category</Label>
            <Input
              id="recipe-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Dinner"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipe-tags">Tags</Label>
            <Input
              id="recipe-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. high-protein, quick, family"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="recipe-ingredients">Ingredients</Label>
          <Textarea
            id="recipe-ingredients"
            value={ingredientsText}
            onChange={(e) => setIngredientsText(e.target.value)}
            placeholder={"One per line.\nExample:\n2 cups - Flour\n1 tsp - Salt"}
            rows={5}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="recipe-steps">Steps</Label>
          <Textarea
            id="recipe-steps"
            value={stepsText}
            onChange={(e) => setStepsText(e.target.value)}
            placeholder={"One step per line.\nExample:\nBoil water\nCook pasta\nMix sauce"}
            rows={5}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="recipe-source">Source URL (Optional)</Label>
            <Input
              id="recipe-source"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipe-image">Image URL (Optional)</Label>
            <Input
              id="recipe-image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!canSave}>
            {mode === "add" ? "Save Recipe" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

