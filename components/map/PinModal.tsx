"use client"

import { useMemo, useState } from "react"
import type { MapPin, PinCategory } from "@/app/dashboard/providers"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

type PinDraft = Pick<MapPin, "title" | "note" | "lat" | "lng" | "category">

interface PinModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "add" | "edit"
  initial: PinDraft
  onSave: (draft: PinDraft) => void
}

export function PinModal({ isOpen, onClose, mode, initial, onSave }: PinModalProps) {
  const [title, setTitle] = useState(initial.title)
  const [note, setNote] = useState(initial.note ?? "")
  const [category, setCategory] = useState<PinCategory>(initial.category)
  const [lat, setLat] = useState(String(initial.lat))
  const [lng, setLng] = useState(String(initial.lng))

  const canSave = useMemo(() => title.trim().length > 0, [title])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave) return

    const parsedLat = Number(lat)
    const parsedLng = Number(lng)
    if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) return

    onSave({
      title: title.trim(),
      note: note.trim() || undefined,
      category,
      lat: parsedLat,
      lng: parsedLng,
    })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "add" ? "Add Pin" : "Edit Pin"}
      description="Save important places, tasks, and goals on your map."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pin-title">Title</Label>
          <Input
            id="pin-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Gym, Coffee shop, Client office"
            autoFocus
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pin-category">Category</Label>
          <Select
            id="pin-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as PinCategory)}
          >
            <option value="personal">Personal</option>
            <option value="task">Task</option>
            <option value="goal">Goal</option>
            <option value="job">Job</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pin-note">Note (Optional)</Label>
          <Textarea
            id="pin-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add any details you want to remember…"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pin-lat">Latitude</Label>
            <Input
              id="pin-lat"
              type="number"
              inputMode="decimal"
              step="0.000001"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pin-lng">Longitude</Label>
            <Input
              id="pin-lng"
              type="number"
              inputMode="decimal"
              step="0.000001"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!canSave}>
            {mode === "add" ? "Save Pin" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
