import type { Movie } from "@/lib/tmdb-types";
import { MovieCard } from "./MovieCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

export function MovieRow({ title, movies, action }: { title: string; movies: Movie[]; action?: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.8), behavior: "smooth" });
  };
  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
        <div className="flex items-center gap-2">
          {action}
          <button onClick={() => scroll(-1)} className="hidden h-9 w-9 place-items-center rounded-full bg-secondary text-foreground hover:bg-secondary/80 sm:grid" aria-label="Scroll left">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => scroll(1)} className="hidden h-9 w-9 place-items-center rounded-full bg-secondary text-foreground hover:bg-secondary/80 sm:grid" aria-label="Scroll right">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div ref={ref} className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
        {movies.map((m) => (
          <div key={m.id} className="w-40 shrink-0 snap-start sm:w-48 md:w-52">
            <MovieCard movie={m} />
          </div>
        ))}
      </div>
    </section>
  );
}
