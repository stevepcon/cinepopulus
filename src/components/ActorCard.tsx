import { Link } from "@tanstack/react-router";
import { img } from "@/lib/tmdb-types";

interface Props {
  id: number;
  name: string;
  profile_path: string | null;
  subtitle?: string;
}

export function ActorCard({ id, name, profile_path, subtitle }: Props) {
  const src = img(profile_path, "w300");
  return (
    <Link
      to="/person/$id"
      params={{ id: String(id) }}
      className="group block w-full overflow-hidden rounded-xl bg-card ring-1 ring-border/60 transition hover:-translate-y-1 hover:ring-primary/60"
    >
      <div className="aspect-[2/3] overflow-hidden bg-muted">
        {src ? (
          <img src={src} alt={name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">No photo</div>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-1 text-sm font-semibold">{name}</h3>
        {subtitle && <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </Link>
  );
}
