import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Hero } from "@/components/Hero";
import { MovieRow } from "@/components/MovieRow";
import { RowSkeleton, HeroSkeleton } from "@/components/Skeletons";
import { popularMoviesQO, topRatedQO, trendingQO, upcomingQO } from "@/lib/tmdb";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cinephile — Discover Movies" },
      { name: "description", content: "Trending, popular, top rated and upcoming movies, powered by TMDB." },
    ],
  }),
  component: Home,
});

function Home() {
  const trending = useQuery(trendingQO("day"));
  const popular = useQuery(popularMoviesQO(1));
  const top = useQuery(topRatedQO(1));
  const upcoming = useQuery(upcomingQO(1));

  return (
    <div className="space-y-12 pb-10">
      {trending.data ? <Hero movies={trending.data.results} /> : <HeroSkeleton />}
      {trending.data ? (
        <MovieRow title="Trending Today" movies={trending.data.results.slice(0, 20)} />
      ) : <RowSkeleton />}
      {popular.data ? <MovieRow title="Popular" movies={popular.data.results} /> : <RowSkeleton />}
      {top.data ? <MovieRow title="Top Rated" movies={top.data.results} /> : <RowSkeleton />}
      {upcoming.data ? <MovieRow title="Upcoming" movies={upcoming.data.results} /> : <RowSkeleton />}
    </div>
  );
}
