import { Link } from "@tanstack/react-router";
import { Play, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { img, type Movie } from "@/lib/tmdb-types";

export function Hero({ movies }: { movies: Movie[] }) {
  const [idx, setIdx] = useState(0);
  const top = movies.slice(0, 5);
  useEffect(() => {
    if (top.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % top.length), 7000);
    return () => clearInterval(t);
  }, [top.length]);

  if (!top.length) return null;
  const m = top[idx];
  const backdrop = img(m.backdrop_path, "original");
  const year = m.release_date ? new Date(m.release_date).getFullYear() : "";

  return (
    <section className="relative h-[70vh] min-h-[460px] w-full overflow-hidden">
      {top.map((movie, i) => {
        const b = img(movie.backdrop_path, "original");
        return (
          <div
            key={movie.id}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === idx ? 1 : 0 }}
            aria-hidden={i !== idx}
          >
            {b && <img src={b} alt="" className="h-full w-full object-cover" />}
          </div>
        );
      })}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-12 sm:px-6 sm:pb-16">
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
          Trending Now
        </span>
        <h1 className="mt-4 max-w-2xl text-balance text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          {m.title}
        </h1>
        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          {year && <span>{year}</span>}
          {m.vote_average > 0 && (
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-gold text-gold" />
              {m.vote_average.toFixed(1)}
            </span>
          )}
        </div>
        <p className="mt-4 max-w-xl text-balance text-sm text-foreground/85 sm:text-base">
          {m.overview}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/movie/$id"
            params={{ id: String(m.id) }}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <Play className="h-4 w-4 fill-current" /> View Details
          </Link>
        </div>
        {top.length > 1 && (
          <div className="mt-6 flex gap-1.5">
            {top.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === idx ? "w-8 bg-primary" : "w-4 bg-muted-foreground/40"}`}
              />
            ))}
          </div>
        )}
      </div>

      {backdrop ? null : <div className="absolute inset-0 bg-muted" />}
    </section>
  );
}
