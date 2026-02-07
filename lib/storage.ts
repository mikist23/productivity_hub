"use client"

import { useCallback, useSyncExternalStore } from "react"

type SetStateAction<T> = T | ((prev: T) => T)

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (raw == null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function safeGetItem(key: string) {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function emitStorageKey(key: string) {
  if (typeof window === "undefined") return
  try {
    window.dispatchEvent(new CustomEvent("mm-storage", { detail: { key } }))
  } catch {
    // ignore
  }
}

function safeSetItem(key: string, value: string) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // ignore
  } finally {
    emitStorageKey(key)
  }
}

function safeRemoveItem(key: string) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(key)
  } catch {
    // ignore
  } finally {
    emitStorageKey(key)
  }
}

function subscribeToKey(key: string, onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {}

  const onStorage = (e: StorageEvent) => {
    if (e.key === key) onStoreChange()
  }

  const onCustom = (e: Event) => {
    const detail = (e as CustomEvent<{ key?: string }>).detail
    if (!detail?.key || detail.key === key) onStoreChange()
  }

  window.addEventListener("storage", onStorage)
  window.addEventListener("mm-storage", onCustom as EventListener)

  return () => {
    window.removeEventListener("storage", onStorage)
    window.removeEventListener("mm-storage", onCustom as EventListener)
  }
}

export function useLocalStorageJsonState<T>(key: string, fallback: T) {
  const getSnapshot = () => safeJsonParse<T>(safeGetItem(key), fallback)
  const getServerSnapshot = () => fallback

  const value = useSyncExternalStore(
    (onStoreChange) => subscribeToKey(key, onStoreChange),
    getSnapshot,
    getServerSnapshot
  )

  const setValue = useCallback(
    (action: SetStateAction<T>) => {
      const prev = safeJsonParse<T>(safeGetItem(key), fallback)
      const next = typeof action === "function" ? (action as (p: T) => T)(prev) : action
      safeSetItem(key, JSON.stringify(next))
    },
    [fallback, key]
  )

  const remove = useCallback(() => safeRemoveItem(key), [key])

  return [value, setValue, remove] as const
}

export function useLocalStorageStringState(key: string, fallback = "") {
  const getSnapshot = () => {
    const raw = safeGetItem(key)
    if (raw == null) return fallback
    return raw
  }
  const getServerSnapshot = () => fallback

  const value = useSyncExternalStore(
    (onStoreChange) => subscribeToKey(key, onStoreChange),
    getSnapshot,
    getServerSnapshot
  )

  const setValue = useCallback(
    (action: SetStateAction<string>) => {
      const prev = safeGetItem(key) ?? fallback
      const next = typeof action === "function" ? (action as (p: string) => string)(prev) : action
      safeSetItem(key, next)
    },
    [fallback, key]
  )

  const remove = useCallback(() => safeRemoveItem(key), [key])

  return [value, setValue, remove] as const
}

