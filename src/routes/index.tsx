import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Hero } from "@/components/Hero";
import { MovieRow } from "@/components/MovieRow";
import { RowSkeleton, HeroSkeleton } from "@/components/Skeletons";
import {
  classicsQO,
  criterionStyleQO,
  popularMoviesQO,
  topRatedQO,
  trendingQO,
  upcomingQO,
  worldCinemaQO,
} from "@/lib/tmdb";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cinephile — Discover Movies" },
      { name: "description", content: "A curated, Criterion-inspired window into world cinema, indie auteurs, and timeless classics." },
    ],
  }),
  component: Home,
});

function Home() {
  const trending = useQuery(trendingQO("week"));
  const criterion = useQuery(criterionStyleQO(1));
  const world = useQuery(worldCinemaQO(1));
  const classics = useQuery(classicsQO(1));
  const top = useQuery(topRatedQO(1));
  const popular = useQuery(popularMoviesQO(1));
  const upcoming = useQuery(upcomingQO(1));

  // Use the curated arthouse selection for the hero when available, falling
  // back to trending. This keeps sleazy "trending" hits off the front page.
  const heroMovies = criterion.data?.results ?? trending.data?.results;

  return (
    <div className="space-y-12 pb-10">
      {heroMovies ? <Hero movies={heroMovies} /> : <HeroSkeleton />}
      {criterion.data ? (
        <MovieRow title="Arthouse & Indie" movies={criterion.data.results} />
      ) : <RowSkeleton />}
      {world.data ? (
        <MovieRow title="World Cinema" movies={world.data.results} />
      ) : <RowSkeleton />}
      {classics.data ? (
        <MovieRow title="Classics" movies={classics.data.results} />
      ) : <RowSkeleton />}
      {top.data ? <MovieRow title="Top Rated" movies={top.data.results} /> : <RowSkeleton />}
      {popular.data ? <MovieRow title="Popular" movies={popular.data.results} /> : <RowSkeleton />}
      {upcoming.data ? <MovieRow title="Upcoming" movies={upcoming.data.results} /> : <RowSkeleton />}
    </div>
  );
}
