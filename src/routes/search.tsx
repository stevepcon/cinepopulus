import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { multiSearchQO } from "@/lib/tmdb";
import { MovieCard } from "@/components/MovieCard";
import { ActorCard } from "@/components/ActorCard";
import { GridSkeleton } from "@/components/Skeletons";

const searchSchema = z.object({ q: fallback(z.string(), "").default("") });

export const Route = createFileRoute("/search")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({ meta: [{ title: "Search — Cinepopulus" }] }),
  component: SearchPage,
});

type Tab = "all" | "movie" | "tv" | "person";

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [tab, setTab] = useState<Tab>("all");
  const { data, isFetching } = useQuery(multiSearchQO(q, 1));

  const results = data?.results ?? [];
  const filtered = tab === "all" ? results : results.filter((r) => r.media_type === tab);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Search</h1>
      <div className="mt-4">
        <input
          autoFocus
          value={q}
          onChange={(e) => navigate({ search: { q: e.target.value } })}
          placeholder="Search for movies, shows, actors…"
          className="w-full rounded-full border border-border bg-secondary/50 px-5 py-3 text-base outline-none transition focus:border-primary"
        />
      </div>

      {q.trim() === "" ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
          <p className="text-base font-semibold">Find something to watch</p>
          <p className="mt-1 text-sm text-muted-foreground">Search across millions of movies, shows and people.</p>
        </div>
      ) : (
        <>
          <div className="mt-6 flex gap-1 border-b border-border">
            {(["all", "movie", "tv", "person"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium capitalize transition ${
                  tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "all" ? "All" : t === "tv" ? "TV Shows" : t === "movie" ? "Movies" : "People"}
                <span className="ml-1.5 text-xs text-muted-foreground">
                  {t === "all" ? results.length : results.filter((r) => r.media_type === t).length}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-6">
            {isFetching && results.length === 0 ? (
              <GridSkeleton />
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center text-muted-foreground">
                No results found for “{q}”.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {filtered.map((r) => {
                  if (r.media_type === "person") {
                    return <ActorCard key={`p-${r.id}`} id={r.id} name={r.name} profile_path={r.profile_path} subtitle={r.known_for_department} />;
                  }
                  if (r.media_type === "movie") {
                    return <MovieCard key={`m-${r.id}`} movie={r} />;
                  }
                  // TV — render lightly as a card
                  return (
                    <Link key={`tv-${r.id}`} to="/search" search={{ q }} className="block overflow-hidden rounded-xl bg-card ring-1 ring-border">
                      <div className="aspect-[2/3] bg-muted">
                        {r.poster_path && <img src={`https://image.tmdb.org/t/p/w500${r.poster_path}`} alt={r.name} className="h-full w-full object-cover" />}
                      </div>
                      <div className="p-3">
                        <h3 className="line-clamp-1 text-sm font-semibold">{r.name}</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">TV {r.first_air_date ? `• ${r.first_air_date.slice(0, 4)}` : ""}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
