import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, Check, Heart, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFavorites, useWatchlist, type SavedMovie } from "@/hooks/use-local-list";
import { img } from "@/lib/tmdb-types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/watchlist")({
  head: () => ({ meta: [{ title: "My Watchlist — Cinephile" }] }),
  component: WatchlistPage,
});

type Tab = "watchlist" | "favorites";

function WatchlistPage() {
  const [tab, setTab] = useState<Tab>("watchlist");
  const watchlist = useWatchlist();
  const favorites = useFavorites();
  const list = tab === "watchlist" ? watchlist : favorites;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">My Library</h1>
      <p className="mt-1 text-sm text-muted-foreground">Saved locally on this device — no account required.</p>

      <div className="mt-6 inline-flex rounded-full border border-border bg-card p-1">
        {(["watchlist", "favorites"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition",
              tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t === "watchlist" ? <Bookmark className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
            {t === "watchlist" ? `Watchlist (${watchlist.items.length})` : `Favorites (${favorites.items.length})`}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {list.items.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-20 text-center">
            <div>
              <p className="text-base font-semibold">Nothing here yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Browse movies and tap the {tab === "watchlist" ? "bookmark" : "heart"} icon to save them.</p>
              <Link to="/" className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                Discover movies
              </Link>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {list.items.map((m) => (
              <WatchlistItem key={m.id} m={m} tab={tab} watchlist={watchlist} favorites={favorites} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function WatchlistItem({
  m, tab, watchlist, favorites,
}: {
  m: SavedMovie;
  tab: Tab;
  watchlist: ReturnType<typeof useWatchlist>;
  favorites: ReturnType<typeof useFavorites>;
}) {
  const list = tab === "watchlist" ? watchlist : favorites;
  const poster = img(m.poster_path, "w185");
  const year = m.release_date ? new Date(m.release_date).getFullYear() : "—";
  return (
    <li className="flex items-center gap-4 rounded-2xl border border-border bg-card p-3">
      <Link to="/movie/$id" params={{ id: String(m.id) }} className="h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
        {poster && <img src={poster} alt={m.title} className="h-full w-full object-cover" />}
      </Link>
      <div className="min-w-0 flex-1">
        <Link to="/movie/$id" params={{ id: String(m.id) }} className="block truncate text-base font-semibold hover:text-primary">
          {m.title}
        </Link>
        <p className="text-xs text-muted-foreground">{year} • Added {new Date(m.addedAt).toLocaleDateString()}</p>
        {tab === "watchlist" && m.watched && (
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
            <Check className="h-3 w-3" /> Watched
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {tab === "watchlist" && (
          <button
            onClick={() => watchlist.setWatched(m.id, !m.watched)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition",
              m.watched ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary hover:bg-secondary/80",
            )}
          >
            {m.watched ? "Watched" : "Mark watched"}
          </button>
        )}
        <button
          onClick={() => list.remove(m.id)}
          className="grid h-9 w-9 place-items-center rounded-full border border-border bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-destructive"
          aria-label="Remove"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}
