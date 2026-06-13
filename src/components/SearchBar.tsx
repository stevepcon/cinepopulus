import { Link, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { multiSearchQO } from "@/lib/tmdb";
import { img } from "@/lib/tmdb-types";
import { cn } from "@/lib/utils";

export function SearchBar({ onSelect }: { onSelect?: () => void }) {
  const [value, setValue] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value.trim()), 250);
    return () => clearTimeout(t);
  }, [value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const { data, isFetching } = useQuery({ ...multiSearchQO(debounced, 1) });
  const results = (data?.results ?? []).slice(0, 7);

  const submit = () => {
    if (!value.trim()) return;
    setOpen(false);
    onSelect?.();
    navigate({ to: "/search", search: { q: value.trim() } });
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") {
      const r = results[active];
      if (r) {
        setOpen(false); onSelect?.();
        if (r.media_type === "person") navigate({ to: "/person/$id", params: { id: String(r.id) } });
        else if (r.media_type === "movie") navigate({ to: "/movie/$id", params: { id: String(r.id) } });
        else submit();
      } else submit();
    } else if (e.key === "Escape") setOpen(false);
  };

  return (
    <div ref={ref} className="relative w-full">
      <div className="flex items-center gap-2 rounded-full border border-border/80 bg-secondary/50 px-3 py-1.5 focus-within:border-primary/60 focus-within:bg-secondary">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={value}
          onChange={(e) => { setValue(e.target.value); setOpen(true); setActive(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder="Search movies, shows, people…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          aria-label="Search"
        />
      </div>
      {open && debounced.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border/80 bg-popover shadow-2xl">
          {isFetching && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-muted-foreground">Searching…</div>
          )}
          {!isFetching && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-muted-foreground">No results for “{debounced}”</div>
          )}
          {results.map((r, i) => {
            const isPerson = r.media_type === "person";
            const isMovie = r.media_type === "movie";
            const title = isPerson ? r.name : isMovie ? r.title : r.name;
            const sub = isPerson ? (r.known_for_department ?? "Person") : isMovie ? (r.release_date?.slice(0, 4) ?? "Movie") : "TV";
            const image = isPerson ? img(r.profile_path, "w92") : img(r.poster_path, "w92");
            const to = isPerson ? "/person/$id" : isMovie ? "/movie/$id" : "/search";
            return (
              <Link
                key={`${r.media_type}-${r.id}`}
                to={to as "/person/$id" | "/movie/$id" | "/search"}
                params={isPerson || isMovie ? { id: String(r.id) } : undefined}
                search={!(isPerson || isMovie) ? { q: value.trim() } : undefined}
                onClick={() => { setOpen(false); onSelect?.(); }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm transition hover:bg-secondary",
                  i === active && "bg-secondary",
                )}
              >
                <div className="h-12 w-9 shrink-0 overflow-hidden rounded bg-muted">
                  {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{title}</p>
                  <p className="truncate text-xs text-muted-foreground">{sub}</p>
                </div>
              </Link>
            );
          })}
          <button onClick={submit} className="block w-full border-t border-border/60 px-3 py-2 text-left text-xs font-medium text-primary hover:bg-secondary">
            See all results for “{debounced}” →
          </button>
        </div>
      )}
    </div>
  );
}
