"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "pml.compare.v1";
export const MAX_COMPARE = 4;

interface CompareContextValue {
  ids: string[];
  count: number;
  has: (id: string) => boolean;
  isFull: boolean;
  toggle: (id: string) => void;
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  /** True once the client has hydrated from localStorage (avoids SSR flash). */
  ready: boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setIds(parsed.filter((v) => typeof v === "string").slice(0, MAX_COMPARE));
        }
      }
    } catch {
      /* ignore corrupt / unavailable storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  }, [ids, ready]);

  const add = useCallback((id: string) => {
    setIds((prev) =>
      prev.includes(id) || prev.length >= MAX_COMPARE ? prev : [...prev, id],
    );
  }, []);

  const remove = useCallback((id: string) => {
    setIds((prev) => prev.filter((v) => v !== id));
  }, []);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      if (prev.includes(id)) return prev.filter((v) => v !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  }, []);

  const clear = useCallback(() => setIds([]), []);

  const value = useMemo<CompareContextValue>(
    () => ({
      ids,
      count: ids.length,
      has: (id: string) => ids.includes(id),
      isFull: ids.length >= MAX_COMPARE,
      toggle,
      add,
      remove,
      clear,
      ready,
    }),
    [ids, toggle, add, remove, clear, ready],
  );

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  );
}

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within a CompareProvider");
  return ctx;
}
