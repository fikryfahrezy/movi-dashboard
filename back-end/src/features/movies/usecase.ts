import * as repository from "./repository.ts";
import { fetchPopularMovies } from "../../lib/tmdb.ts";
import type {
  DashboardData,
  ListMoviesQuery,
  ListMoviesResult,
  MovieResponse,
  NewMovieInput,
  SyncLog,
  SyncLogResponse,
  UpdateMovieInput,
} from "./types.ts";

function toSyncLogResponse(log: SyncLog): SyncLogResponse {
  return {
    id: log.id,
    synced_at: log.syncedAt,
    status: log.status,
    records_synced: log.recordsSynced,
    error_message: log.errorMessage,
  };
}

export async function listMovies(
  query: ListMoviesQuery,
): Promise<ListMoviesResult> {
  return repository.listMovies(query);
}

export async function getMovieById(
  id: number,
): Promise<MovieResponse | null> {
  return repository.getMovieById(id);
}

export async function createMovie(input: NewMovieInput): Promise<MovieResponse> {
  return repository.createMovie(input);
}

export async function updateMovie(
  id: number,
  input: UpdateMovieInput,
): Promise<MovieResponse | null> {
  return repository.updateMovie(id, input);
}

export async function deleteMovie(id: number): Promise<boolean> {
  return repository.deleteMovie(id);
}

export async function syncMovies(): Promise<SyncLogResponse> {
  try {
    const movies = await fetchPopularMovies(5);
    const recordsSynced = await repository.upsertMovies(movies);
    const log = await repository.createSyncLog("success", recordsSynced);
    return toSyncLogResponse(log);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown sync error";
    const log = await repository.createSyncLog("failed", 0, message);
    return toSyncLogResponse(log);
  }
}

export async function getGenres(): Promise<string[]> {
  return repository.getDistinctGenres();
}

export async function getLastSync(): Promise<SyncLogResponse | null> {
  const log = await repository.getLastSyncLog();
  if (!log) return null;
  return toSyncLogResponse(log);
}

export async function getDashboardData(
  startDate?: string,
  endDate?: string,
): Promise<DashboardData> {
  const [totalMovies, genreRows, dateRows, latestMovieTitle] = await Promise.all([
    repository.getMoviesTotalCount(startDate, endDate),
    repository.getGenreDistribution(startDate, endDate),
    repository.getMoviesByDate(startDate, endDate),
    repository.getLatestMovieTitle(startDate, endDate),
  ]);

  return {
    total_movies: totalMovies,
    top_genre: genreRows[0]?.genre ?? "N/A",
    latest_movie: latestMovieTitle ?? "N/A",
    genre_distribution: genreRows.map((r) => {
      return {
        name: r.genre,
        value: Number(r.count),
      };
    }),
    movies_by_date: dateRows.map((r) => {
      return {
        date: r.date,
        count: Number(r.count),
      };
    }),
  };
}
