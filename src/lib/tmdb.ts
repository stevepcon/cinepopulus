import { queryOptions } from "@tanstack/react-query";
import { tmdbFetch } from "./tmdb.functions";
import type {
  Credits, Genre, ImagesResponse, Movie, MovieDetails, MultiSearchItem,
  PagedResult, Person, PersonDetails, PersonMovieCredits, Video,
} from "./tmdb-types";

const get = <T>(path: string, params?: Record<string, string | number | boolean>) =>
  tmdbFetch({ data: { path, params } }) as Promise<T>;

// ---- Movies ----
export const trendingQO = (window: "day" | "week" = "day") =>
  queryOptions({
    queryKey: ["tmdb", "trending", window],
    queryFn: () => get<PagedResult<Movie>>(`trending/movie/${window}`),
    staleTime: 5 * 60_000,
  });

export const popularMoviesQO = (page = 1) =>
  queryOptions({
    queryKey: ["tmdb", "popular", page],
    queryFn: () => get<PagedResult<Movie>>("movie/popular", { page }),
    staleTime: 5 * 60_000,
  });

export const topRatedQO = (page = 1) =>
  queryOptions({
    queryKey: ["tmdb", "top_rated", page],
    queryFn: () => get<PagedResult<Movie>>("movie/top_rated", { page }),
    staleTime: 10 * 60_000,
  });

export const upcomingQO = (page = 1) =>
  queryOptions({
    queryKey: ["tmdb", "upcoming", page],
    queryFn: () => get<PagedResult<Movie>>("movie/upcoming", { page }),
    staleTime: 10 * 60_000,
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
    queryFn: () => get<PagedResult<Movie>>(`movie/${id}/recommendations`),
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
    queryFn: () => get<PagedResult<MultiSearchItem>>("search/multi", { query, page, include_adult: false }),
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
    queryFn: () => get<PagedResult<Movie>>("discover/movie", { include_adult: false, ...filters }),
    staleTime: 5 * 60_000,
  });

// ---- Genres ----
export const movieGenresQO = () =>
  queryOptions({
    queryKey: ["tmdb", "genres"],
    queryFn: () => get<{ genres: Genre[] }>("genre/movie/list"),
    staleTime: 24 * 60 * 60_000,
  });
