import { useCallback, useEffect, useState } from 'react'

const PREFIX = 'gym-tracker:'

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // localStorage can throw in private-browsing / quota-exceeded cases;
    // the app still works for the current tab session, just without persistence.
  }
}

/** React state that mirrors a localStorage key, kept in sync across tabs. */
export function usePersistedState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readStorage(key, fallback))

  useEffect(() => {
    writeStorage(key, value)
  }, [key, value])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === PREFIX + key) {
        setValue(readStorage(key, fallback))
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const update = useCallback((updater: T | ((prev: T) => T)) => {
    setValue((prev) =>
      typeof updater === 'function' ? (updater as (prev: T) => T)(prev) : updater,
    )
  }, [])

  return [value, update] as const
}

export function newId(): string {
  return crypto.randomUUID()
}
