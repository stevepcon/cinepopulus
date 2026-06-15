import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { discoverMoviesQO, movieGenresQO } from "@/lib/tmdb";
import { MovieGrid } from "@/components/MovieGrid";
import { GridSkeleton } from "@/components/Skeletons";

export const Route = createFileRoute("/discover")({
  head: () => ({ meta: [{ title: "Discover — Cinepopulus" }] }),
  component: DiscoverPage,
});

const sortOptions = [
  { label: "Popularity", value: "popularity.desc" },
  { label: "Rating", value: "vote_average.desc" },
  { label: "Newest", value: "primary_release_date.desc" },
  { label: "Oldest", value: "primary_release_date.asc" },
];

const languages = [
  { label: "Any", value: "" },
  { label: "English", value: "en" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "Hindi", value: "hi" },
];

function DiscoverPage() {
  const genres = useQuery(movieGenresQO());
  const [genre, setGenre] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [minRating, setMinRating] = useState<number>(0);
  const [minRuntime, setMinRuntime] = useState<number>(0);
  const [maxRuntime, setMaxRuntime] = useState<number>(300);
  const [language, setLanguage] = useState<string>("");
  const [sort, setSort] = useState<string>("popularity.desc");

  const filters = {
    sort_by: sort,
    ...(genre ? { with_genres: genre } : {}),
    ...(year ? { primary_release_year: Number(year) } : {}),
    ...(minRating > 0 ? { "vote_average.gte": minRating, "vote_count.gte": 50 } : {}),
    ...(minRuntime > 0 ? { "with_runtime.gte": minRuntime } : {}),
    ...(maxRuntime < 300 ? { "with_runtime.lte": maxRuntime } : {}),
    ...(language ? { with_original_language: language } : {}),
  };
  const { data, isFetching } = useQuery(discoverMoviesQO(filters));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Discover</h1>
      <p className="mt-1 text-sm text-muted-foreground">Filter the entire TMDB catalogue to find your next favorite.</p>

      <div className="mt-6 grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2 lg:grid-cols-4">
        <Select label="Genre" value={genre} onChange={setGenre}>
          <option value="">All genres</option>
          {genres.data?.genres.map((g) => <option key={g.id} value={String(g.id)}>{g.name}</option>)}
        </Select>
        <Select label="Year" value={year} onChange={setYear}>
          <option value="">Any year</option>
          {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map((y) => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </Select>
        <Select label="Language" value={language} onChange={setLanguage}>
          {languages.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
        </Select>
        <Select label="Sort by" value={sort} onChange={setSort}>
          {sortOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </Select>
        <Range label={`Minimum rating: ${minRating.toFixed(1)}`} min={0} max={10} step={0.5} value={minRating} onChange={setMinRating} />
        <Range label={`Min runtime: ${minRuntime}m`} min={0} max={240} step={10} value={minRuntime} onChange={setMinRuntime} />
        <Range label={`Max runtime: ${maxRuntime}m`} min={30} max={300} step={10} value={maxRuntime} onChange={setMaxRuntime} />
        <div className="flex items-end">
          <button
            onClick={() => { setGenre(""); setYear(""); setMinRating(0); setMinRuntime(0); setMaxRuntime(300); setLanguage(""); setSort("popularity.desc"); }}
            className="w-full rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80"
          >
            Reset filters
          </button>
        </div>
      </div>

      <div className="mt-8">
        {isFetching && !data ? <GridSkeleton /> : <MovieGrid movies={data?.results ?? []} />}
      </div>
    </div>
  );
}

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
        {children}
      </select>
    </label>
  );
}

function Range({ label, min, max, step, value, onChange }: { label: string; min: number; max: number; step: number; value: number; onChange: (n: number) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-primary" />
    </label>
  );
}
