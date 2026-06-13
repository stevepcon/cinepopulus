import { useCallback, useEffect, useState } from "react";

export interface SavedMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date?: string;
  vote_average?: number;
  watched?: boolean;
  addedAt: number;
}

function read(key: string): SavedMovie[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as SavedMovie[]) : [];
  } catch {
    return [];
  }
}

function write(key: string, items: SavedMovie[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(`local-list:${key}`));
}

function useLocalList(key: string) {
  const [items, setItems] = useState<SavedMovie[]>([]);

  useEffect(() => {
    setItems(read(key));
    const onChange = () => setItems(read(key));
    window.addEventListener(`local-list:${key}`, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(`local-list:${key}`, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [key]);

  const add = useCallback((m: Omit<SavedMovie, "addedAt">) => {
    const current = read(key);
    if (current.some((x) => x.id === m.id)) return;
    write(key, [{ ...m, addedAt: Date.now() }, ...current]);
  }, [key]);

  const remove = useCallback((id: number) => {
    write(key, read(key).filter((x) => x.id !== id));
  }, [key]);

  const toggle = useCallback((m: Omit<SavedMovie, "addedAt">) => {
    const current = read(key);
    if (current.some((x) => x.id === m.id)) write(key, current.filter((x) => x.id !== m.id));
    else write(key, [{ ...m, addedAt: Date.now() }, ...current]);
  }, [key]);

  const has = useCallback((id: number) => items.some((x) => x.id === id), [items]);

  const setWatched = useCallback((id: number, watched: boolean) => {
    write(key, read(key).map((x) => (x.id === id ? { ...x, watched } : x)));
  }, [key]);

  return { items, add, remove, toggle, has, setWatched };
}

export const useWatchlist = () => useLocalList("tmdb:watchlist");
export const useFavorites = () => useLocalList("tmdb:favorites");
