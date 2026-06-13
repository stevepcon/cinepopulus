import { Link } from "@tanstack/react-router";
import { Heart, Star } from "lucide-react";
import { img, type Movie } from "@/lib/tmdb-types";
import { useFavorites } from "@/hooks/use-local-list";
import { cn } from "@/lib/utils";

interface Props {
  movie: Pick<Movie, "id" | "title" | "poster_path" | "release_date" | "vote_average" | "overview">;
  className?: string;
}

export function MovieCard({ movie, className }: Props) {
  const fav = useFavorites();
  const isFav = fav.has(movie.id);
  const poster = img(movie.poster_path, "w500");
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "—";

  return (
    <Link
      to="/movie/$id"
      params={{ id: String(movie.id) }}
      className={cn(
        "group relative block w-full overflow-hidden rounded-xl bg-card ring-1 ring-border/60 transition-all duration-300 hover:-translate-y-1 hover:ring-primary/60",
        className,
      )}
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-muted">
        {poster ? (
          <img
            src={poster}
            alt={movie.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">No image</div>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            fav.toggle({ id: movie.id, title: movie.title, poster_path: movie.poster_path, release_date: movie.release_date, vote_average: movie.vote_average });
          }}
          aria-label={isFav ? "Remove favorite" : "Add favorite"}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-background/70 backdrop-blur transition hover:bg-background"
        >
          <Heart className={cn("h-4 w-4", isFav ? "fill-primary text-primary" : "text-foreground")} />
        </button>
        {typeof movie.vote_average === "number" && movie.vote_average > 0 && (
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 text-xs font-medium backdrop-blur">
            <Star className="h-3 w-3 fill-gold text-gold" />
            {movie.vote_average.toFixed(1)}
          </div>
        )}
        {movie.overview && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-background via-background/95 to-transparent p-3 text-xs text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <p className="line-clamp-4">{movie.overview}</p>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-1 text-sm font-semibold">{movie.title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{year}</p>
      </div>
    </Link>
  );
}
