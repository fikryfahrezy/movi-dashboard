import type { TmdbGenre, TmdbMovie } from "../features/movies/types";

const TMDB_BASE_URL = process.env.TMDB_BASE_URL || "";
const TMDB_API_KEY = process.env.TMDB_API_KEY || "";

type TmdbGenresResponse = {
  genres: TmdbGenre[];
};

type TmdbMoviesPage = {
  results: TmdbMovie[];
  total_pages: number;
  total_results: number;
};

let genreCache: Map<number, string> | null = null;

async function fetchGenres(): Promise<Map<number, string>> {
  if (genreCache) return genreCache;

  const url = `${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`TMDB genre fetch failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as TmdbGenresResponse;
  genreCache = new Map(data.genres.map((g) => {
    return [g.id, g.name]
  }));
  return genreCache;
}

async function fetchMoviesPage(page: number): Promise<TmdbMoviesPage> {
  const url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`TMDB movies fetch failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<TmdbMoviesPage>;
}

export type TmdbMovieWithGenre = {
  externalId: number;
  title: string;
  genre: string;
  releaseDate: string;
  overview: string;
  voteAverage: number;
};

export async function fetchPopularMovies(
  pages: number = 5,
): Promise<TmdbMovieWithGenre[]> {
  const genres = await fetchGenres();
  const allMovies: TmdbMovieWithGenre[] = [];

  for (let page = 1; page <= pages; page++) {
    const data = await fetchMoviesPage(page);
    const mapped = data.results
      .filter((m) => {
        return m.release_date
      }) // skip movies without release date
      .map((m) => {
        return {
          externalId: m.id,
          title: m.title,
          genre: m.genre_ids.length > 0 ? (genres.get(m.genre_ids[0]) ?? "Unknown") : "Unknown",
          releaseDate: m.release_date,
          overview: m.overview,
          voteAverage: m.vote_average,
        }
      });
    allMovies.push(...mapped);

    if (page >= data.total_pages) break;
  }

  return allMovies;
}

export function clearGenreCache(): void {
  genreCache = null;
}
