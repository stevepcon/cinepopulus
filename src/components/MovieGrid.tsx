import type { Movie } from "@/lib/tmdb-types";
import { MovieCard } from "./MovieCard";

export function MovieGrid({ movies }: { movies: Movie[] }) {
  if (!movies.length) {
    return (
      <div className="grid place-items-center rounded-2xl border border-dashed border-border/80 bg-card/40 px-6 py-20 text-center">
        <div>
          <p className="text-base font-semibold">No movies found</p>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or search.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {movies.map((m) => <MovieCard key={m.id} movie={m} />)}
    </div>
  );
}
