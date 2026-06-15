import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  discoverMoviesQO,
  movieDetailsQO,
  personDetailsQO,
  personMovieCreditsQO,
} from "@/lib/tmdb";
import { formatCurrency, formatRuntime } from "@/lib/format";
import type { MovieDetails } from "@/lib/tmdb-types";
import { img } from "@/lib/tmdb-types";

export const Route = createFileRoute("/stats")({
  head: () => ({ meta: [{ title: "Trivia — Cinepopulus" }] }),
  component: StatsPage,
});

function useDetailedMovies(ids: number[]) {
  const results = useQueries({
    queries: ids.map((id) => movieDetailsQO(id)),
  });
  const data = results.map((r) => r.data).filter((m): m is MovieDetails => !!m);
  const isLoading = results.some((r) => r.isLoading);
  return { data, isLoading };
}

// --- Curated trivia data sets ---

const BEST_PICTURE_WINNERS: Array<{ id: number; year: number }> = [
  { id: 872585, year: 2023 }, // Oppenheimer
  { id: 545611, year: 2022 }, // Everything Everywhere All at Once
  { id: 776503, year: 2021 }, // CODA
  { id: 581734, year: 2020 }, // Nomadland
  { id: 496243, year: 2019 }, // Parasite
  { id: 490132, year: 2018 }, // Green Book
  { id: 399055, year: 2017 }, // The Shape of Water
  { id: 376867, year: 2016 }, // Moonlight
  { id: 314365, year: 2015 }, // Spotlight
  { id: 194662, year: 2014 }, // Birdman
];

const FAMOUS_DIRECTORS: number[] = [
  488,   // Steven Spielberg
  1032,  // Martin Scorsese
  138,   // Quentin Tarantino
  525,   // Christopher Nolan
  240,   // Stanley Kubrick
  1776,  // Francis Ford Coppola
  7467,  // David Fincher
  1223,  // Paul Thomas Anderson
  45400, // Greta Gerwig
  21684, // Bong Joon-ho
];

const FUN_FACTS: string[] = [
  "Anthony Hopkins won Best Actor for The Silence of the Lambs with only ~16 minutes of screen time.",
  "The Lord of the Rings: The Return of the King swept all 11 of its Oscar nominations — tied for the most wins ever.",
  "Toy Story (1995) was the first fully computer-animated feature film.",
  "Psycho (1960) was the first American film to show a flushing toilet on screen.",
  "Jaws is why summer blockbusters exist — it invented the wide release model in 1975.",
  "Parasite was the first non-English language film to win Best Picture (2019).",
  "Kubrick shot scenes in Barry Lyndon by candlelight using NASA-developed f/0.7 lenses.",
  "Pixar's Up opens with a 4-minute montage that critics consistently rank among the best scenes in animation.",
  "The Wilhelm Scream — first used in 1951 — has appeared in over 400 films.",
  "Casablanca was largely written day-by-day during shooting; the famous ending wasn't decided until late.",
  "The original Star Wars (1977) was edited largely by Marcia Lucas, who won an Oscar for it.",
  "Mad Max: Fury Road used over 150 real vehicles and minimal CGI for its chase sequences.",
];

function StatsPage() {
  // Revenue + runtime candidates
  const revenueList = useQuery(discoverMoviesQO({ sort_by: "revenue.desc", "vote_count.gte": 500 }));
  const runtimeList = useQuery(discoverMoviesQO({ sort_by: "popularity.desc", "with_runtime.gte": 180 }));

  const revIds = (revenueList.data?.results ?? []).slice(0, 10).map((m) => m.id);
  const runIds = (runtimeList.data?.results ?? []).slice(0, 20).map((m) => m.id);

  const rev = useDetailedMovies(revIds);
  const run = useDetailedMovies(runIds);

  const highestGross = [...rev.data].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  const bestROI = [...rev.data]
    .filter((m) => m.budget > 1_000_000)
    .map((m) => ({ ...m, roi: m.revenue / m.budget }))
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 10);
  const longest = [...run.data]
    .filter((m) => m.runtime && m.runtime > 0)
    .sort((a, b) => (b.runtime ?? 0) - (a.runtime ?? 0))
    .slice(0, 10);

  const maxRevenue = Math.max(1, ...highestGross.map((m) => m.revenue));
  const maxRoi = Math.max(1, ...bestROI.map((m) => m.roi));
  const maxRun = Math.max(1, ...longest.map((m) => m.runtime ?? 0));

  // Best Picture winners — fetch details for poster + title
  const bpResults = useQueries({
    queries: BEST_PICTURE_WINNERS.map((w) => movieDetailsQO(w.id)),
  });
  const bestPicture = BEST_PICTURE_WINNERS.map((w, i) => ({
    year: w.year,
    movie: bpResults[i].data,
  })).filter((x): x is { year: number; movie: MovieDetails } => !!x.movie);

  // Famous directors — fetch person + credits, find earliest "Director" job
  const directorPeople = useQueries({
    queries: FAMOUS_DIRECTORS.map((id) => personDetailsQO(id)),
  });
  const directorCredits = useQueries({
    queries: FAMOUS_DIRECTORS.map((id) => personMovieCreditsQO(id)),
  });
  const debutFilms = FAMOUS_DIRECTORS.map((_id, i) => {
    const person = directorPeople[i].data;
    const credits = directorCredits[i].data;
    if (!person || !credits) return null;
    const directed = credits.crew
      .filter((c) => c.job === "Director" && c.release_date)
      .sort((a, b) => a.release_date.localeCompare(b.release_date));
    const first = directed[0];
    if (!first) return null;
    return { person, first };
  }).filter((x): x is { person: NonNullable<typeof directorPeople[number]["data"]>; first: NonNullable<ReturnType<typeof directorCredits[number]["data"] & object>["crew"][number]> } => !!x);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Trivia</h1>
      <p className="mt-1 text-sm text-muted-foreground">Stuff you did not know about movies.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <StatsCard title="Highest Grossing Movies">
          <Table>
            <thead><tr><Th>#</Th><Th>Title</Th><Th className="text-right">Budget</Th><Th className="text-right">Revenue</Th></tr></thead>
            <tbody>
              {highestGross.map((m, i) => (
                <tr key={m.id} className="hover:bg-card/60">
                  <Td>{i + 1}</Td>
                  <Td><Link to="/movie/$id" params={{ id: String(m.id) }} className="font-medium hover:text-primary">{m.title}</Link></Td>
                  <Td className="text-right text-muted-foreground">{formatCurrency(m.budget)}</Td>
                  <Td className="text-right">
                    <BarValue value={m.revenue} max={maxRevenue} format={formatCurrency} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </StatsCard>

        <StatsCard title="Best Return on Investment">
          <Table>
            <thead><tr><Th>#</Th><Th>Title</Th><Th className="text-right">ROI</Th></tr></thead>
            <tbody>
              {bestROI.map((m, i) => (
                <tr key={m.id} className="hover:bg-card/60">
                  <Td>{i + 1}</Td>
                  <Td><Link to="/movie/$id" params={{ id: String(m.id) }} className="font-medium hover:text-primary">{m.title}</Link></Td>
                  <Td className="text-right">
                    <BarValue value={m.roi} max={maxRoi} format={(v) => `${v.toFixed(1)}×`} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </StatsCard>

        <StatsCard title="Longest Movies">
          <Table>
            <thead><tr><Th>#</Th><Th>Title</Th><Th className="text-right">Runtime</Th></tr></thead>
            <tbody>
              {longest.map((m, i) => (
                <tr key={m.id} className="hover:bg-card/60">
                  <Td>{i + 1}</Td>
                  <Td><Link to="/movie/$id" params={{ id: String(m.id) }} className="font-medium hover:text-primary">{m.title}</Link></Td>
                  <Td className="text-right"><BarValue value={m.runtime ?? 0} max={maxRun} format={(v) => formatRuntime(v)} /></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </StatsCard>

        <StatsCard title="Recent Best Picture Winners">
          <ul className="divide-y divide-border">
            {bestPicture.map(({ year, movie }) => (
              <li key={movie.id} className="flex items-center gap-3 px-4 py-3">
                <span className="w-12 shrink-0 text-xs font-medium text-muted-foreground">{year}</span>
                <div className="h-14 w-10 shrink-0 overflow-hidden rounded bg-muted">
                  {movie.poster_path && (
                    <img src={img(movie.poster_path, "w185") ?? ""} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <Link
                  to="/movie/$id"
                  params={{ id: String(movie.id) }}
                  className="min-w-0 flex-1 truncate text-sm font-medium hover:text-primary"
                >
                  {movie.title}
                </Link>
              </li>
            ))}
          </ul>
        </StatsCard>

        <StatsCard title="Famous Directors' First Films">
          <ul className="divide-y divide-border">
            {debutFilms.map(({ person, first }) => (
              <li key={person.id} className="flex items-center gap-3 px-4 py-3">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                  {person.profile_path && (
                    <img src={img(person.profile_path, "w185") ?? ""} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    to="/person/$id"
                    params={{ id: String(person.id) }}
                    className="block truncate text-sm font-medium hover:text-primary"
                  >
                    {person.name}
                  </Link>
                  <div className="truncate text-xs text-muted-foreground">
                    <Link to="/movie/$id" params={{ id: String(first.id) }} className="hover:text-primary">
                      {first.title}
                    </Link>
                    {first.release_date && ` · ${first.release_date.slice(0, 4)}`}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </StatsCard>

        <StatsCard title="Fun Facts">
          <ul className="divide-y divide-border">
            {FUN_FACTS.map((fact, i) => (
              <li key={i} className="flex gap-3 px-4 py-3 text-sm">
                <span className="shrink-0 text-xs font-semibold text-primary">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-muted-foreground">{fact}</span>
              </li>
            ))}
          </ul>
        </StatsCard>
      </div>
    </div>
  );
}

function StatsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <header className="border-b border-border px-5 py-4"><h2 className="text-base font-semibold">{title}</h2></header>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

const Table = (p: { children: React.ReactNode }) => <table className="w-full text-sm">{p.children}</table>;
const Th = (p: { children: React.ReactNode; className?: string }) => <th className={`px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground ${p.className ?? ""}`}>{p.children}</th>;
const Td = (p: { children: React.ReactNode; className?: string }) => <td className={`px-4 py-3 ${p.className ?? ""}`}>{p.children}</td>;

function BarValue({ value, max, format }: { value: number; max: number; format: (n: number) => string }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-secondary sm:inline-block">
        <span className="block h-full bg-primary" style={{ width: `${Math.max(2, (value / max) * 100)}%` }} />
      </span>
      <span className="font-medium">{format(value)}</span>
    </div>
  );
}
