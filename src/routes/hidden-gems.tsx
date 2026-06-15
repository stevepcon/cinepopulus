import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { discoverMoviesQO } from "@/lib/tmdb";
import { MovieGrid } from "@/components/MovieGrid";
import { GridSkeleton } from "@/components/Skeletons";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/hidden-gems")({
  head: () => ({ meta: [{ title: "Hidden Gems — Cinepopulus" }] }),
  component: HiddenGems,
});

function HiddenGems() {
  const { data, isFetching } = useQuery(
    discoverMoviesQO({
      sort_by: "vote_average.desc",
      "vote_average.gte": 7.5,
      "vote_count.gte": 100,
      "vote_count.lte": 5000,
      "primary_release_date.lte": "2011-12-31",
    }),

  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary">
          <Sparkles className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hidden Gems</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Highly rated movies most people haven't seen yet — released before 2012, rated 7.5+ with between 100 and 5,000 votes.
          </p>

        </div>
      </div>

      <div className="mt-8">
        {isFetching && !data ? <GridSkeleton /> : <MovieGrid movies={data?.results ?? []} />}
      </div>
    </div>
  );
}
