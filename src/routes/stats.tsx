import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueries, useQuery } from "@tanstack/react-query";
import { discoverMoviesQO, movieDetailsQO, popularPeopleQO } from "@/lib/tmdb";
import { formatCurrency, formatNumber, formatRuntime } from "@/lib/format";
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

function StatsPage() {
  // Fetch top revenue + runtime candidates via discover endpoint
  const revenueList = useQuery(discoverMoviesQO({ sort_by: "revenue.desc", "vote_count.gte": 500 }));
  const runtimeList = useQuery(discoverMoviesQO({ sort_by: "popularity.desc", "with_runtime.gte": 180 }));
  const people = useQuery(popularPeopleQO(1));

  const revIds = (revenueList.data?.results ?? []).slice(0, 10).map((m) => m.id);
  const runIds = (runtimeList.data?.results ?? []).slice(0, 20).map((m) => m.id);

  const rev = useDetailedMovies(revIds);
  const run = useDetailedMovies(runIds);

  const highestGross = [...rev.data].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  const bestROI = [...rev.data].filter((m) => m.budget > 1_000_000).map((m) => ({ ...m, roi: m.revenue / m.budget }))
    .sort((a, b) => b.roi - a.roi).slice(0, 10);
  const longest = [...run.data].filter((m) => m.runtime && m.runtime > 0).sort((a, b) => (b.runtime ?? 0) - (a.runtime ?? 0)).slice(0, 10);

  const maxRevenue = Math.max(1, ...highestGross.map((m) => m.revenue));
  const maxRoi = Math.max(1, ...bestROI.map((m) => m.roi));
  const maxRun = Math.max(1, ...longest.map((m) => m.runtime ?? 0));

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

        <StatsCard title="Most Popular Actors">
          <ul className="divide-y divide-border">
            {(people.data?.results ?? []).slice(0, 10).map((p, i) => {
              const max = Math.max(1, ...(people.data?.results.slice(0, 10).map((x) => x.popularity) ?? [1]));
              return (
                <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-6 text-xs text-muted-foreground">{i + 1}</span>
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                    {p.profile_path && <img src={img(p.profile_path, "w185") ?? ""} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link to="/person/$id" params={{ id: String(p.id) }} className="block truncate text-sm font-medium hover:text-primary">
                      {p.name}
                    </Link>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div className="h-full bg-primary" style={{ width: `${(p.popularity / max) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatNumber(p.popularity)}</span>
                </li>
              );
            })}
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
