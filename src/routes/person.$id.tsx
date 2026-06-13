import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { personDetailsQO, personMovieCreditsQO } from "@/lib/tmdb";
import { img } from "@/lib/tmdb-types";
import { MovieCard } from "@/components/MovieCard";

export const Route = createFileRoute("/person/$id")({
  parseParams: ({ id }) => ({ id: Number(id) }),
  stringifyParams: ({ id }) => ({ id: String(id) }),
  component: PersonPage,
  errorComponent: ({ error }) => <div className="px-6 py-20 text-center text-muted-foreground">{error.message}</div>,
  notFoundComponent: () => <div className="px-6 py-20 text-center text-muted-foreground">Person not found.</div>,
});

type SortKey = "year" | "rating";

function PersonPage() {
  const { id } = Route.useParams();
  const details = useQuery(personDetailsQO(id));
  const credits = useQuery(personMovieCreditsQO(id));
  const [sort, setSort] = useState<SortKey>("year");
  const [dir, setDir] = useState<1 | -1>(-1);
  const [expandBio, setExpandBio] = useState(false);

  if (!details.data) {
    return <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6"><div className="h-64 animate-pulse rounded-2xl bg-muted" /></div>;
  }
  const p = details.data;
  const photo = img(p.profile_path, "w500");
  const cast = credits.data?.cast ?? [];
  const knownFor = [...cast].sort((a, b) => b.popularity - a.popularity).slice(0, 8);

  const sorted = [...cast].sort((a, b) => {
    const va = sort === "year" ? new Date(a.release_date || "1900-01-01").getTime() : a.vote_average;
    const vb = sort === "year" ? new Date(b.release_date || "1900-01-01").getTime() : b.vote_average;
    return (va - vb) * dir;
  });

  const toggleSort = (k: SortKey) => {
    if (sort === k) setDir((d) => (d === 1 ? -1 : 1));
    else { setSort(k); setDir(-1); }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-8 md:grid-cols-[260px_1fr]">
        <div>
          {photo ? (
            <img src={photo} alt={p.name} className="w-full rounded-2xl ring-1 ring-border" />
          ) : (
            <div className="aspect-[2/3] w-full rounded-2xl bg-muted" />
          )}
        </div>
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{p.name}</h1>
          {p.known_for_department && <p className="mt-1 text-sm text-muted-foreground">{p.known_for_department}</p>}
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            {p.birthday && (<><dt className="text-muted-foreground">Born</dt><dd>{new Date(p.birthday).toLocaleDateString()}</dd></>)}
            {p.place_of_birth && (<><dt className="text-muted-foreground">From</dt><dd>{p.place_of_birth}</dd></>)}
            {p.deathday && (<><dt className="text-muted-foreground">Died</dt><dd>{new Date(p.deathday).toLocaleDateString()}</dd></>)}
          </dl>
          {p.biography && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Biography</h2>
              <p className={`mt-2 whitespace-pre-line text-foreground/85 ${expandBio ? "" : "line-clamp-6"}`}>{p.biography}</p>
              {p.biography.length > 400 && (
                <button onClick={() => setExpandBio((v) => !v)} className="mt-2 text-sm text-primary hover:underline">
                  {expandBio ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {knownFor.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold">Known For</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {knownFor.map((m) => <MovieCard key={`kf-${m.id}`} movie={m} />)}
          </div>
        </section>
      )}

      {sorted.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold">Filmography</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-card text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Movie</th>
                    <th className="px-4 py-3 text-left">
                      <button onClick={() => toggleSort("year")} className="inline-flex items-center gap-1 hover:text-foreground">
                        Year <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left">Character</th>
                    <th className="px-4 py-3 text-left">
                      <button onClick={() => toggleSort("rating")} className="inline-flex items-center gap-1 hover:text-foreground">
                        Rating <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-background">
                  {sorted.map((m) => (
                    <tr key={`${m.id}-${m.release_date}`} className="hover:bg-card/60">
                      <td className="px-4 py-3 font-medium">
                        <Link to="/movie/$id" params={{ id: String(m.id) }} className="hover:text-primary">{m.title}</Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{m.release_date ? new Date(m.release_date).getFullYear() : "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.character || "—"}</td>
                      <td className="px-4 py-3">{m.vote_average ? m.vote_average.toFixed(1) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
