export interface Movie {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  original_language?: string;
  adult?: boolean;
  video?: boolean;
  media_type?: "movie";
}

export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  media_type?: "tv";
}

export interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department?: string;
  popularity: number;
  known_for?: Array<Movie | TVShow>;
  media_type?: "person";
}

export interface Genre { id: number; name: string }

export interface MovieDetails extends Movie {
  budget: number;
  revenue: number;
  runtime: number | null;
  tagline: string | null;
  status: string;
  genres: Genre[];
  homepage: string | null;
  imdb_id: string | null;
  production_companies: Array<{ id: number; name: string; logo_path: string | null }>;
  spoken_languages: Array<{ english_name: string; iso_639_1: string; name: string }>;
}

export interface Credits {
  cast: Array<{
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
  }>;
  crew: Array<{
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
  }>;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string; // "YouTube"
  type: string; // "Trailer" | "Teaser" ...
  official: boolean;
  published_at: string;
}

export interface ImagesResponse {
  backdrops: Array<{ file_path: string; width: number; height: number }>;
  posters: Array<{ file_path: string; width: number; height: number }>;
}

export interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  homepage: string | null;
  also_known_as: string[];
}

export interface PersonMovieCredits {
  cast: Array<Movie & { character: string; credit_id: string }>;
  crew: Array<Movie & { job: string; department: string; credit_id: string }>;
}

export interface PagedResult<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export type MultiSearchItem =
  | (Movie & { media_type: "movie" })
  | (TVShow & { media_type: "tv" })
  | (Person & { media_type: "person" });

export const TMDB_IMG = "https://image.tmdb.org/t/p";
export const img = (path: string | null | undefined, size: "w92" | "w154" | "w185" | "w300" | "w500" | "w780" | "original" = "w500") =>
  path ? `${TMDB_IMG}/${size}${path}` : null;
