"use client"

import { useEffect, useRef } from "react"
import type { MapPin, MapViewState, PinCategory } from "@/app/dashboard/providers"
import { cn } from "@/lib/utils"
import type { LayerGroup, LeafletMouseEvent, Map as LeafletMapInstance } from "leaflet"

type LatLng = { lat: number; lng: number }

const CATEGORY_COLORS: Record<PinCategory, string> = {
  personal: "#2563eb", // blue-600
  task: "#f59e0b", // amber-500
  job: "#10b981", // emerald-500
  goal: "#a855f7", // purple-500
}

interface LeafletMapProps {
  className?: string
  pins: MapPin[]
  selectedPinId: string | null
  onSelectPin: (id: string | null) => void
  mapView: MapViewState
  onViewChange: (view: MapViewState) => void
  placing: boolean
  onPickLocation: (latlng: LatLng) => void
  currentLocation?: LatLng | null
}

export function LeafletMap({
  className,
  pins,
  selectedPinId,
  onSelectPin,
  mapView,
  onViewChange,
  placing,
  onPickLocation,
  currentLocation,
}: LeafletMapProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<LeafletMapInstance | null>(null)
  const leafletRef = useRef<(typeof import("leaflet")) | null>(null)
  const pinsLayerRef = useRef<LayerGroup | null>(null)
  const currentLocationLayerRef = useRef<LayerGroup | null>(null)

  const placingRef = useRef(false)
  const onPickLocationRef = useRef(onPickLocation)
  const onViewChangeRef = useRef(onViewChange)
  const onSelectPinRef = useRef(onSelectPin)

  useEffect(() => {
    placingRef.current = placing
  }, [placing])

  useEffect(() => {
    onPickLocationRef.current = onPickLocation
  }, [onPickLocation])

  useEffect(() => {
    onViewChangeRef.current = onViewChange
  }, [onViewChange])

  useEffect(() => {
    onSelectPinRef.current = onSelectPin
  }, [onSelectPin])

  // Init map once
  useEffect(() => {
    let cancelled = false

    async function init() {
      if (!rootRef.current || mapRef.current) return

      type LeafletModule = typeof import("leaflet")
      type LeafletModuleWithDefault = LeafletModule & { default?: LeafletModule }

      const leafletImport = (await import("leaflet")) as unknown as LeafletModuleWithDefault
      if (cancelled) return

      const L = leafletImport.default ?? leafletImport
      leafletRef.current = L

      const map = L.map(rootRef.current, {
        zoomControl: true,
        attributionControl: true,
      })
      mapRef.current = map

      map.setView([mapView.lat, mapView.lng], mapView.zoom)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)

      pinsLayerRef.current = L.layerGroup().addTo(map)
      currentLocationLayerRef.current = L.layerGroup().addTo(map)

      map.on("moveend", () => {
        const center = map.getCenter()
        onViewChangeRef.current({
          lat: Number(center.lat.toFixed(6)),
          lng: Number(center.lng.toFixed(6)),
          zoom: map.getZoom(),
        })
      })

      map.on("click", (e: LeafletMouseEvent) => {
        if (!placingRef.current) return
        const { lat, lng } = e.latlng
        onPickLocationRef.current({ lat, lng })
      })

      map.on("click", () => {
        if (!placingRef.current) onSelectPinRef.current(null)
      })

      // Fix initial sizing when mounted inside flex layouts
      setTimeout(() => {
        try {
          map.invalidateSize()
        } catch {
          // ignore
        }
      }, 0)
    }

    init()

    return () => {
      cancelled = true
      if (mapRef.current) {
        try {
          mapRef.current.remove()
        } catch {
          // ignore
        }
      }
      mapRef.current = null
      leafletRef.current = null
      pinsLayerRef.current = null
      currentLocationLayerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync external view changes (e.g. "Locate me" or clicking a list item)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const center = map.getCenter()
    const zoom = map.getZoom()
    const latDiff = Math.abs(center.lat - mapView.lat)
    const lngDiff = Math.abs(center.lng - mapView.lng)

    if (zoom === mapView.zoom && latDiff < 1e-4 && lngDiff < 1e-4) return

    map.setView([mapView.lat, mapView.lng], mapView.zoom, { animate: true })
  }, [mapView])

  // Render pins
  useEffect(() => {
    const L = leafletRef.current
    const layer = pinsLayerRef.current
    if (!L || !layer) return

    layer.clearLayers()

    for (const pin of pins) {
      const color = CATEGORY_COLORS[pin.category] ?? CATEGORY_COLORS.personal
      const isSelected = pin.id === selectedPinId

      const marker = L.circleMarker([pin.lat, pin.lng], {
        radius: isSelected ? 10 : 8,
        color,
        weight: isSelected ? 3 : 2,
        fillColor: color,
        fillOpacity: 0.9,
      })

      marker.addTo(layer)
      marker.on("click", (e: LeafletMouseEvent) => {
        if (placingRef.current) {
          e.originalEvent?.stopPropagation?.()
          return
        }
        onSelectPinRef.current(pin.id)
      })
      marker.bindTooltip(pin.title, { direction: "top", opacity: 0.9 })
    }
  }, [pins, selectedPinId])

  // Render current location marker (not persisted)
  useEffect(() => {
    const L = leafletRef.current
    const layer = currentLocationLayerRef.current
    if (!L || !layer) return

    layer.clearLayers()
    if (!currentLocation) return

    const marker = L.circleMarker([currentLocation.lat, currentLocation.lng], {
      radius: 8,
      color: "#0ea5e9", // sky-500
      weight: 2,
      fillColor: "#38bdf8", // sky-400
      fillOpacity: 0.9,
    })

    marker.addTo(layer)
    marker.bindTooltip("You are here", { direction: "top", opacity: 0.9 })
  }, [currentLocation])

  return (
    <div
      ref={rootRef}
      className={cn(
        "h-[520px] w-full rounded-xl border border-border bg-card overflow-hidden",
        className
      )}
    />
  )
}
