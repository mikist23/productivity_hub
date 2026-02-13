"use client"

import { useCallback, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Crosshair, Pencil, Plus, Search, Sparkles, Trash2 } from "lucide-react"
import { useDashboard, type MapPin, type PinCategory } from "@/app/dashboard/providers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { LeafletMap } from "@/components/map/LeafletMap"
import { PinModal } from "@/components/map/PinModal"

type LatLng = { lat: number; lng: number }

function starterPins(center: LatLng): Array<Omit<MapPin, "id" | "createdAt" | "updatedAt">> {
  return [
    {
      title: "Deep Work Zone",
      note: "Quiet spot. Best for 90-minute focus sessions. Noise level low.",
      category: "goal",
      lat: center.lat + 0.01,
      lng: center.lng + 0.01,
    },
    {
      title: "Weekly Planning Cafe",
      note: "Sunday planning, weekly review, and roadmap updates.",
      category: "task",
      lat: center.lat - 0.012,
      lng: center.lng + 0.006,
    },
    {
      title: "Networking Meetup Hub",
      note: "Use for career events and relationship-building tasks.",
      category: "job",
      lat: center.lat + 0.008,
      lng: center.lng - 0.012,
    },
    {
      title: "Recharge Walk Route",
      note: "15-minute walk between deep-work blocks.",
      category: "personal",
      lat: center.lat - 0.01,
      lng: center.lng - 0.008,
    },
  ]
}

export default function MapPage() {
  const { mapPins, addMapPin, updateMapPin, deleteMapPin, mapView, setMapView } =
    useDashboard()

  const [query, setQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<PinCategory | "all">("all")
  const [placing, setPlacing] = useState(false)
  const [pendingLocation, setPendingLocation] = useState<LatLng | null>(null)
  const [editingPinId, setEditingPinId] = useState<string | null>(null)
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null)
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null)
  const [isLocating, setIsLocating] = useState(false)

  const selectedPin = useMemo(
    () => mapPins.find((p) => p.id === selectedPinId) ?? null,
    [mapPins, selectedPinId]
  )

  const filteredPins = useMemo(() => {
    const q = query.trim().toLowerCase()
    return mapPins.filter((pin) => {
      if (filterCategory !== "all" && pin.category !== filterCategory) return false
      if (!q) return true
      const haystack = `${pin.title} ${pin.note ?? ""} ${pin.category}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [filterCategory, mapPins, query])

  const beginPlacing = () => {
    setPlacing(true)
    setSelectedPinId(null)
  }

  const cancelPlacing = () => setPlacing(false)

  const onPickLocation = useCallback((latlng: LatLng) => {
    setPendingLocation({ lat: latlng.lat, lng: latlng.lng })
    setPlacing(false)
  }, [])

  const startEditing = (pinId: string) => {
    setEditingPinId(pinId)
    setPendingLocation(null)
  }

  const stopEditing = () => setEditingPinId(null)

  const handleLocateMe = () => {
    if (!navigator.geolocation) return
    setIsLocating(true)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6))
        const lng = Number(pos.coords.longitude.toFixed(6))
        setCurrentLocation({ lat, lng })
        setMapView({ lat, lng, zoom: 14 })
        setIsLocating(false)
      },
      () => {
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    )
  }

  const focusPin = (pin: MapPin) => {
    setSelectedPinId(pin.id)
    setMapView({ lat: pin.lat, lng: pin.lng, zoom: Math.max(mapView.zoom, 14) })
  }

  const handleDeletePin = (pinId: string) => {
    const pin = mapPins.find((p) => p.id === pinId)
    const ok = window.confirm(`Delete pin${pin ? `: "${pin.title}"` : ""}?`)
    if (!ok) return
    deleteMapPin(pinId)
    if (selectedPinId === pinId) setSelectedPinId(null)
  }

  const addStarterMapPins = () => {
    const existingTitles = new Set(mapPins.map((pin) => pin.title.trim().toLowerCase()))
    starterPins({ lat: mapView.lat, lng: mapView.lng }).forEach((pin) => {
      if (!existingTitles.has(pin.title.trim().toLowerCase())) {
        addMapPin(pin)
      }
    })
  }

  const addModalInitial = useMemo(() => {
    const lat = pendingLocation?.lat ?? mapView.lat
    const lng = pendingLocation?.lng ?? mapView.lng
    return {
      title: "",
      note: "",
      category: "personal" as const,
      lat,
      lng,
    }
  }, [mapView.lat, mapView.lng, pendingLocation?.lat, pendingLocation?.lng])

  const editModalInitial = useMemo(() => {
    const pin = mapPins.find((p) => p.id === editingPinId)
    if (!pin) return null
    return {
      title: pin.title,
      note: pin.note ?? "",
      category: pin.category,
      lat: pin.lat,
      lng: pin.lng,
    }
  }, [editingPinId, mapPins])

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-3xl font-bold tracking-tight">Map</h1>
        <p className="text-muted-foreground">
          Pin places for your tasks, goals, job search, and daily life — saved to MongoDB.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-3">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg">Pins</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addStarterMapPins}
                  title="Add productivity-focused map pins"
                >
                  <Sparkles className="h-4 w-4 mr-2" /> Starter pins
                </Button>
                <Button
                  variant={placing ? "secondary" : "outline"}
                  size="sm"
                  onClick={placing ? cancelPlacing : beginPlacing}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {placing ? "Click map…" : "Add Pin"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLocateMe}
                  disabled={isLocating}
                  title="Center map on your current location"
                >
                  <Crosshair className="h-4 w-4 mr-2" />
                  {isLocating ? "Locating…" : "Locate"}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                  placeholder="Search pins…"
                />
              </div>

              <Select
                value={filterCategory}
                onChange={(e) =>
                  setFilterCategory(e.target.value as PinCategory | "all")
                }
              >
                <option value="all">All categories</option>
                <option value="personal">Personal</option>
                <option value="task">Task</option>
                <option value="goal">Goal</option>
                <option value="job">Job</option>
              </Select>

              {placing && (
                <div className="rounded-lg border border-dashed border-border bg-accent/30 p-3 text-sm text-muted-foreground">
                  Click on the map to drop a pin.
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-2">
            {filteredPins.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No pins found.
              </div>
            ) : (
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-2">
                {filteredPins.map((pin) => {
                  const isSelected = pin.id === selectedPinId
                  return (
                    <div
                      key={pin.id}
                      className={cn(
                        "rounded-lg border border-border p-3 bg-card hover:bg-accent/30 transition-colors cursor-pointer",
                        isSelected && "border-primary/60 bg-accent/40"
                      )}
                      onClick={() => focusPin(pin)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") focusPin(pin)
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm truncate">
                              {pin.title}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-accent/60 text-muted-foreground uppercase tracking-wide">
                              {pin.category}
                            </span>
                          </div>
                          {pin.note && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {pin.note}
                            </p>
                          )}
                          <p className="text-[11px] text-muted-foreground mt-2 font-mono">
                            {pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}
                          </p>
                        </div>

                        <div className="flex gap-1 shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              startEditing(pin.id)
                            }}
                            title="Edit pin"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeletePin(pin.id)
                            }}
                            title="Delete pin"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {selectedPin && (
              <div className="pt-4">
                <div className="rounded-xl border border-border bg-accent/20 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{selectedPin.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {selectedPin.category} •{" "}
                        {new Date(selectedPin.updatedAt).toLocaleString()}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(selectedPin.id)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                  {selectedPin.note && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      {selectedPin.note}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-4 space-y-3">
          <LeafletMap
            pins={mapPins}
            selectedPinId={selectedPinId}
            onSelectPin={setSelectedPinId}
            mapView={mapView}
            onViewChange={setMapView}
            placing={placing}
            onPickLocation={onPickLocation}
            currentLocation={currentLocation}
          />
          <div className="text-[11px] text-muted-foreground">
            Map data: © OpenStreetMap contributors.
          </div>
        </div>
      </div>

      {pendingLocation && (
        <PinModal
          isOpen
          onClose={() => setPendingLocation(null)}
          mode="add"
          initial={addModalInitial}
          onSave={(draft) => addMapPin(draft)}
        />
      )}

      {editingPinId && editModalInitial && (
        <PinModal
          isOpen
          onClose={stopEditing}
          mode="edit"
          initial={editModalInitial}
          onSave={(draft) => updateMapPin(editingPinId, draft)}
        />
      )}
    </div>
  )
}
