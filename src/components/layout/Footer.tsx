import { Link } from "@tanstack/react-router";
import { Film } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <Film className="h-4 w-4" />
            </span>
            <span className="text-lg font-bold tracking-tight">Cinephile</span>
          </div>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Discover trending movies, hidden gems and deep insights — powered by The Movie Database.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Explore</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground">Home</Link></li>
            <li><Link to="/discover" className="hover:text-foreground">Discover</Link></li>
            <li><Link to="/hidden-gems" className="hover:text-foreground">Hidden Gems</Link></li>
            <li><Link to="/stats" className="hover:text-foreground">Statistics</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Personal</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/watchlist" className="hover:text-foreground">Watchlist</Link></li>
            <li><Link to="/search" className="hover:text-foreground">Search</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Cinephile. Data provided by{" "}
        <a className="underline hover:text-foreground" href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">TMDB</a>.
      </div>
    </footer>
  );
}
