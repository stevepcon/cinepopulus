import { queryOptions } from "@tanstack/react-query";
import { tmdbFetch } from "./tmdb.functions";
import type {
  Credits, Genre, ImagesResponse, Movie, MovieDetails, MultiSearchItem,
  PagedResult, Person, PersonDetails, PersonMovieCredits, Video,
} from "./tmdb-types";

const get = <T>(path: string, params?: Record<string, string | number | boolean>) =>
  tmdbFetch({ data: { path, params } }) as unknown as Promise<T>;

// ---------------------------------------------------------------------------
// Curation: keep the catalogue closer to Criterion / arthouse cinema and
// away from sleazy, exploitation and softcore content.
// ---------------------------------------------------------------------------

// TMDB keyword IDs we never want to surface.
// erotic movie / softcore / rape / sexploitation / sexual violence / sexual abuse
// / erotica / nudity (as primary theme) / sex tape / pornography
const EXCLUDED_KEYWORDS = [
  190370, 10115, 9748, 233211, 165270, 263591, 13059, 2626, 161645, 6149,
].join("|");

// Distributors / labels that anchor the Criterion-Channel sensibility:
// arthouse, world cinema, classics, indie auteurs.
// Criterion Collection, Janus Films, A24, Neon, IFC, Magnolia, Focus Features,
// Fox Searchlight, Sony Pictures Classics, StudioCanal, Studio Ghibli,
// Mubi, Strand Releasing, Kino Lorber, Zeitgeist, Oscilloscope, Roadside Attractions
const CURATED_COMPANIES = [
  1773, 1602, 41077, 90733, 2575, 11341, 10146, 43, 58, 694, 10342,
  102382, 23332, 4923, 23341, 24640, 22213,
].join("|");

// Defaults applied to every discover call.
const SAFE_DEFAULTS = {
  include_adult: false,
  include_video: false,
  without_keywords: EXCLUDED_KEYWORDS,
  // Drop genres that are almost exclusively where sleaze hides on TMDB.
  // (No dedicated "erotic" genre exists; keywords above do the heavy lifting.)
};

// Heuristic post-filter for endpoints that don't accept discover params
// (trending, recommendations, etc.). Drops obvious low-quality / sleaze items.
export function curateMovies<T extends Movie>(movies: T[] | undefined): T[] {
  if (!movies) return [];
  return movies.filter((m) => {
    if (m.adult) return false;
    if (!m.poster_path) return false;
    // Almost every sleaze title has a junk title with unicode hearts / "xxx"
    const t = (m.title || "").toLowerCase();
    if (/\b(xxx|erotic|softcore|sex tape|nymph|orgy|swinger)\b/.test(t)) return false;
    return true;
  });
}

// ---- Movies ----
export const trendingQO = (window: "day" | "week" = "week") =>
  queryOptions({
    queryKey: ["tmdb", "trending", window],
    queryFn: async () => {
      const res = await get<PagedResult<Movie>>(`trending/movie/${window}`);
      return { ...res, results: curateMovies(res.results) };
    },
    staleTime: 5 * 60_000,
  });

export const popularMoviesQO = (page = 1) =>
  queryOptions({
    queryKey: ["tmdb", "popular_curated", page],
    queryFn: () =>
      get<PagedResult<Movie>>("discover/movie", {
        ...SAFE_DEFAULTS,
        sort_by: "popularity.desc",
        "vote_count.gte": 200,
        page,
      }),
    staleTime: 5 * 60_000,
  });

export const topRatedQO = (page = 1) =>
  queryOptions({
    queryKey: ["tmdb", "top_rated_curated", page],
    queryFn: () =>
      get<PagedResult<Movie>>("discover/movie", {
        ...SAFE_DEFAULTS,
        sort_by: "vote_average.desc",
        "vote_count.gte": 1500,
        page,
      }),
    staleTime: 10 * 60_000,
  });

export const upcomingQO = (page = 1) =>
  queryOptions({
    queryKey: ["tmdb", "upcoming_curated", page],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const later = new Date(Date.now() + 1000 * 60 * 60 * 24 * 120).toISOString().slice(0, 10);
      return get<PagedResult<Movie>>("discover/movie", {
        ...SAFE_DEFAULTS,
        sort_by: "popularity.desc",
        "primary_release_date.gte": today,
        "primary_release_date.lte": later,
        page,
      });
    },
    staleTime: 10 * 60_000,
  });

// Curated "Criterion-style" row — films from arthouse / indie distributors.
export const criterionStyleQO = (page = 1) =>
  queryOptions({
    queryKey: ["tmdb", "criterion_style", page],
    queryFn: () =>
      get<PagedResult<Movie>>("discover/movie", {
        ...SAFE_DEFAULTS,
        with_companies: CURATED_COMPANIES,
        sort_by: "popularity.desc",
        "vote_count.gte": 50,
        page,
      }),
    staleTime: 30 * 60_000,
  });

// World cinema — non-English language, well-reviewed.
export const worldCinemaQO = (page = 1) =>
  queryOptions({
    queryKey: ["tmdb", "world_cinema", page],
    queryFn: () =>
      get<PagedResult<Movie>>("discover/movie", {
        ...SAFE_DEFAULTS,
        without_original_language: "en",
        sort_by: "vote_average.desc",
        "vote_count.gte": 500,
        page,
      }),
    staleTime: 30 * 60_000,
  });

// Classics — pre-1990, highly regarded.
export const classicsQO = (page = 1) =>
  queryOptions({
    queryKey: ["tmdb", "classics", page],
    queryFn: () =>
      get<PagedResult<Movie>>("discover/movie", {
        ...SAFE_DEFAULTS,
        sort_by: "vote_average.desc",
        "primary_release_date.lte": "1989-12-31",
        "vote_count.gte": 800,
        page,
      }),
    staleTime: 30 * 60_000,
  });

export const movieDetailsQO = (id: number) =>
  queryOptions({
    queryKey: ["tmdb", "movie", id],
    queryFn: () => get<MovieDetails>(`movie/${id}`),
    staleTime: 30 * 60_000,
  });

export const movieCreditsQO = (id: number) =>
  queryOptions({
    queryKey: ["tmdb", "movie", id, "credits"],
    queryFn: () => get<Credits>(`movie/${id}/credits`),
    staleTime: 30 * 60_000,
  });

export const movieVideosQO = (id: number) =>
  queryOptions({
    queryKey: ["tmdb", "movie", id, "videos"],
    queryFn: () => get<{ results: Video[] }>(`movie/${id}/videos`),
    staleTime: 30 * 60_000,
  });

export const movieImagesQO = (id: number) =>
  queryOptions({
    queryKey: ["tmdb", "movie", id, "images"],
    queryFn: () => get<ImagesResponse>(`movie/${id}/images`),
    staleTime: 30 * 60_000,
  });

export const movieRecommendationsQO = (id: number) =>
  queryOptions({
    queryKey: ["tmdb", "movie", id, "recs"],
    queryFn: async () => {
      const res = await get<PagedResult<Movie>>(`movie/${id}/recommendations`);
      return { ...res, results: curateMovies(res.results) };
    },
    staleTime: 30 * 60_000,
  });

// ---- People ----
export const personDetailsQO = (id: number) =>
  queryOptions({
    queryKey: ["tmdb", "person", id],
    queryFn: () => get<PersonDetails>(`person/${id}`),
    staleTime: 30 * 60_000,
  });

export const personMovieCreditsQO = (id: number) =>
  queryOptions({
    queryKey: ["tmdb", "person", id, "credits"],
    queryFn: () => get<PersonMovieCredits>(`person/${id}/movie_credits`),
    staleTime: 30 * 60_000,
  });

export const popularPeopleQO = (page = 1) =>
  queryOptions({
    queryKey: ["tmdb", "popular_people", page],
    queryFn: () => get<PagedResult<Person>>("person/popular", { page }),
    staleTime: 30 * 60_000,
  });

// ---- Search ----
export const multiSearchQO = (query: string, page = 1) =>
  queryOptions({
    queryKey: ["tmdb", "search", query, page],
    queryFn: async () => {
      const res = await get<PagedResult<MultiSearchItem>>("search/multi", {
        query, page, include_adult: false,
      });
      // Curate the movie results inside multi-search; leave tv/person as-is.
      const results = res.results.filter((r) => {
        if (r.media_type !== "movie") return true;
        return curateMovies([r as Movie]).length === 1;
      });
      return { ...res, results };
    },
    enabled: query.trim().length > 0,
    staleTime: 60_000,
  });

// ---- Discover ----
export interface DiscoverFilters {
  with_genres?: string;
  primary_release_year?: number;
  "vote_average.gte"?: number;
  "with_runtime.gte"?: number;
  "with_runtime.lte"?: number;
  with_original_language?: string;
  sort_by?: string;
  page?: number;
  "vote_count.gte"?: number;
  "vote_count.lte"?: number;
}
export const discoverMoviesQO = (filters: DiscoverFilters) =>
  queryOptions({
    queryKey: ["tmdb", "discover", filters],
    queryFn: () =>
      get<PagedResult<Movie>>("discover/movie", { ...SAFE_DEFAULTS, ...filters }),
    staleTime: 5 * 60_000,
  });

// ---- Genres ----
export const movieGenresQO = () =>
  queryOptions({
    queryKey: ["tmdb", "genres"],
    queryFn: () => get<{ genres: Genre[] }>("genre/movie/list"),
    staleTime: 24 * 60 * 60_000,
  });
