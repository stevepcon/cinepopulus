import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bookmark, Check, Heart, Play, Star } from "lucide-react";
import { ActorCard } from "@/components/ActorCard";
import { MovieCard } from "@/components/MovieCard";
import { GridSkeleton } from "@/components/Skeletons";
import { useFavorites, useWatchlist } from "@/hooks/use-local-list";
import { formatCurrency, formatNumber, formatRuntime } from "@/lib/format";
import {
  movieCreditsQO, movieDetailsQO, movieImagesQO, movieRecommendationsQO, movieVideosQO,
} from "@/lib/tmdb";
import { img } from "@/lib/tmdb-types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/movie/$id")({
  parseParams: ({ id }) => ({ id: Number(id) }),
  stringifyParams: ({ id }) => ({ id: String(id) }),
  component: MoviePage,
  errorComponent: ({ error }) => <div className="px-6 py-20 text-center text-muted-foreground">{error.message}</div>,
  notFoundComponent: () => <div className="px-6 py-20 text-center text-muted-foreground">Movie not found.</div>,
});

function MoviePage() {
  const { id } = Route.useParams();
  const details = useQuery(movieDetailsQO(id));
  const credits = useQuery(movieCreditsQO(id));
  const videos = useQuery(movieVideosQO(id));
  const images = useQuery(movieImagesQO(id));
  const recs = useQuery(movieRecommendationsQO(id));
  const watchlist = useWatchlist();
  const favorites = useFavorites();

  if (details.isError) throw notFound();
  const m = details.data;

  if (!m) {
    return (
      <div>
        <div className="aspect-[16/9] w-full animate-pulse bg-muted md:aspect-[21/9]" />
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6">
          <div className="h-10 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          <GridSkeleton count={6} />
        </div>
      </div>
    );
  }

  const backdrop = img(m.backdrop_path, "original");
  const poster = img(m.poster_path, "w500");
  const trailer = videos.data?.results.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official)
    ?? videos.data?.results.find((v) => v.site === "YouTube" && v.type === "Trailer")
    ?? videos.data?.results.find((v) => v.site === "YouTube");
  const director = credits.data?.crew.find((c) => c.job === "Director");
  const writers = credits.data?.crew.filter((c) => c.department === "Writing").slice(0, 4) ?? [];
  const producers = credits.data?.crew.filter((c) => c.job === "Producer").slice(0, 4) ?? [];

  const inWatchlist = watchlist.has(m.id);
  const isFav = favorites.has(m.id);
  const lite = { id: m.id, title: m.title, poster_path: m.poster_path, release_date: m.release_date, vote_average: m.vote_average };

  return (
    <div>
      {/* Hero */}
      <section className="relative">
        <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
          {backdrop && <img src={backdrop} alt="" className="h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
        </div>
        <div className="relative -mt-48 sm:-mt-56">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 md:flex-row">
            {poster && (
              <img src={poster} alt={m.title} className="hidden h-auto w-52 shrink-0 rounded-2xl ring-1 ring-border md:block" />
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-balance text-3xl font-extrabold tracking-tight sm:text-5xl">{m.title}</h1>
              {m.tagline && <p className="mt-2 text-base italic text-muted-foreground">"{m.tagline}"</p>}
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                {m.release_date && <span>{new Date(m.release_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>}
                {m.runtime != null && <span>• {formatRuntime(m.runtime)}</span>}
                {m.vote_average > 0 && (
                  <span className="flex items-center gap-1 text-foreground">
                    <Star className="h-4 w-4 fill-gold text-gold" /> {m.vote_average.toFixed(1)} ({formatNumber(m.vote_count)})
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {m.genres.map((g) => (
                  <span key={g.id} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">{g.name}</span>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {trailer && (
                  <a href={`https://youtube.com/watch?v=${trailer.key}`} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
                    <Play className="h-4 w-4 fill-current" /> Play Trailer
                  </a>
                )}
                <button
                  onClick={() => watchlist.toggle(lite)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
                    inWatchlist ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary hover:bg-secondary/80",
                  )}
                >
                  {inWatchlist ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
                </button>
                <button
                  onClick={() => favorites.toggle(lite)}
                  className={cn(
                    "grid h-10 w-10 place-items-center rounded-full border transition",
                    isFav ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary hover:bg-secondary/80",
                  )}
                  aria-label="Favorite"
                >
                  <Heart className={cn("h-4 w-4", isFav && "fill-current")} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-12 sm:px-6">
        {/* Overview */}
        <section>
          <h2 className="text-xl font-bold">Overview</h2>
          <p className="mt-3 max-w-3xl text-foreground/85">{m.overview || "No overview available."}</p>
        </section>

        {/* Statistics */}
        <section>
          <h2 className="text-xl font-bold">Statistics</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-5">
            {[
              { label: "Budget", value: formatCurrency(m.budget) },
              { label: "Revenue", value: formatCurrency(m.revenue) },
              { label: "Popularity", value: formatNumber(m.popularity) },
              { label: "Votes", value: formatNumber(m.vote_count) },
              { label: "Language", value: (m.original_language ?? "—").toUpperCase() },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-4">
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</dt>
                <dd className="mt-1 text-lg font-semibold">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Cast */}
        {credits.data && credits.data.cast.length > 0 && (
          <section>
            <h2 className="text-xl font-bold">Top Cast</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
              {credits.data.cast.slice(0, 12).map((c) => (
                <ActorCard key={c.id} id={c.id} name={c.name} profile_path={c.profile_path} subtitle={c.character} />
              ))}
            </div>
          </section>
        )}

        {/* Crew */}
        {credits.data && (
          <section>
            <h2 className="text-xl font-bold">Crew</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <CrewBlock title="Director" people={director ? [director] : []} />
              <CrewBlock title="Writers" people={writers} />
              <CrewBlock title="Producers" people={producers} />
            </div>
          </section>
        )}

        {/* Trailer */}
        {trailer && (
          <section>
            <h2 className="text-xl font-bold">Trailer</h2>
            <div className="mt-4 aspect-video w-full overflow-hidden rounded-2xl bg-black ring-1 ring-border">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title={trailer.name}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>
        )}

        {/* Gallery */}
        {images.data && images.data.backdrops.length > 0 && (
          <section>
            <h2 className="text-xl font-bold">Gallery</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {images.data.backdrops.slice(0, 9).map((b) => (
                <div key={b.file_path} className="aspect-video overflow-hidden rounded-xl ring-1 ring-border">
                  <img src={img(b.file_path, "w780") ?? ""} alt="" loading="lazy" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Similar */}
        {recs.data && recs.data.results.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">You Might Also Like</h2>
              <Link to="/discover" className="text-sm text-primary hover:underline">More →</Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {recs.data.results.slice(0, 12).map((r) => <MovieCard key={r.id} movie={r} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function CrewBlock({ title, people }: { title: string; people: Array<{ id: number; name: string; job?: string; profile_path: string | null }> }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground">{title}</h3>
      {people.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">—</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {people.map((p) => (
            <li key={p.id}>
              <Link to="/person/$id" params={{ id: String(p.id) }} className="text-sm font-medium hover:text-primary">
                {p.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
