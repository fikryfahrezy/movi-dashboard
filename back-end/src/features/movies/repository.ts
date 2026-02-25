import { sql } from "../../lib/db.ts";
import type {
  ListMoviesQuery,
  ListMoviesResult,
  Movie,
  MovieResponse,
  NewMovieInput,
  SyncLog,
  UpdateMovieInput,
} from "./types.ts";

const SORT_KEY_MAP: Record<string, string> = {
  title: "title",
  genre: "genre",
  releaseDate: "release_date",
  voteAverage: "vote_average",
  updatedAt: "updated_at",
};

function toMovieResponse(movie: Movie): MovieResponse {
  return {
    id: movie.id,
    external_id: movie.externalId,
    title: movie.title,
    genre: movie.genre,
    release_date: movie.releaseDate,
    overview: movie.overview,
    vote_average: movie.voteAverage,
    created_at: movie.createdAt,
    updated_at: movie.updatedAt,
  };
}

export async function listMovies(
  query: ListMoviesQuery,
): Promise<ListMoviesResult> {
  const {
    search,
    genre,
    sort_key: sortKey = "updatedAt",
    sort_dir: sortDir = "desc",
    page = 1,
    limit = 20,
  } = query;

  const dbSortKey = SORT_KEY_MAP[sortKey] ?? "updated_at";
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const values: (string | number)[] = [];
  let paramIndex = 1;

  if (search) {
    conditions.push(`(title ILIKE $${paramIndex} OR genre ILIKE $${paramIndex + 1})`);
    values.push(`%${search}%`, `%${search}%`);
    paramIndex += 2;
  }

  if (genre) {
    conditions.push(`genre = $${paramIndex}`);
    values.push(genre);
    paramIndex += 1;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderClause = `ORDER BY ${dbSortKey} ${sortDir.toUpperCase()}`;
  const paginationClause = `LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  values.push(limit, offset);

  const dataQuery = `
    SELECT
      id,
      external_id AS "externalId",
      title,
      genre,
      release_date AS "releaseDate",
      overview,
      vote_average AS "voteAverage",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM movies
    ${whereClause}
    ${orderClause}
    ${paginationClause}
  `;

  const countQuery = `SELECT COUNT(*) AS total FROM movies ${whereClause}`;

  const [movies, countRows] = await Promise.all([
    sql.unsafe<Movie[]>(dataQuery, values),
    sql.unsafe<{ total: string }[]>(countQuery, values.slice(0, values.length - 2)),
  ]);

  return {
    data: (movies).map(toMovieResponse),
    total: Number((countRows)[0]?.total ?? 0),
    page,
    limit,
  };
}

export async function getMovieById(id: number): Promise<MovieResponse | null> {
  const rows = await sql<Movie[]>`
    SELECT
      id,
      external_id AS "externalId",
      title,
      genre,
      release_date AS "releaseDate",
      overview,
      vote_average AS "voteAverage",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM movies
    WHERE id = ${id}
  `;
  if (!rows[0]) return null;
  return toMovieResponse(rows[0]);
}

export async function createMovie(input: NewMovieInput): Promise<MovieResponse> {
  const rows = await sql<Movie[]>`
    INSERT INTO movies (external_id, title, genre, release_date, overview, vote_average)
    VALUES (
      ${input.externalId},
      ${input.title},
      ${input.genre},
      ${input.releaseDate},
      ${input.overview},
      ${input.voteAverage}
    )
    RETURNING
      id,
      external_id AS "externalId",
      title,
      genre,
      release_date AS "releaseDate",
      overview,
      vote_average AS "voteAverage",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
  `;
  return toMovieResponse(rows[0]);
}

export async function updateMovie(
  id: number,
  input: UpdateMovieInput,
): Promise<MovieResponse | null> {
  const rows = await sql<Movie[]>`
    UPDATE movies
    SET
      title = COALESCE(${input.title ?? null}, title),
      genre = COALESCE(${input.genre ?? null}, genre),
      release_date = COALESCE(${input.releaseDate ?? null}, release_date),
      overview = COALESCE(${input.overview ?? null}, overview),
      vote_average = COALESCE(${input.voteAverage ?? null}, vote_average),
      updated_at = now()
    WHERE id = ${id}
    RETURNING
      id,
      external_id AS "externalId",
      title,
      genre,
      release_date AS "releaseDate",
      overview,
      vote_average AS "voteAverage",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
  `;
  if (!rows[0]) return null;
  return toMovieResponse(rows[0]);
}

export async function deleteMovie(id: number): Promise<boolean> {
  const rows = await sql`DELETE FROM movies WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

export async function upsertMovies(
  movies: NewMovieInput[],
): Promise<number> {
  if (movies.length === 0) return 0;

  let upserted = 0;
  for (const movie of movies) {
    await sql`
      INSERT INTO movies (external_id, title, genre, release_date, overview, vote_average)
      VALUES (
        ${movie.externalId},
        ${movie.title},
        ${movie.genre},
        ${movie.releaseDate},
        ${movie.overview},
        ${movie.voteAverage}
      )
      ON CONFLICT (external_id) WHERE external_id != 0 DO UPDATE SET
        title = EXCLUDED.title,
        genre = EXCLUDED.genre,
        release_date = EXCLUDED.release_date,
        overview = EXCLUDED.overview,
        vote_average = EXCLUDED.vote_average,
        updated_at = now()
    `;
    upserted++;
  }
  return upserted;
}

export async function getDistinctGenres(): Promise<string[]> {
  const rows = await sql<{ genre: string }[]>`
    SELECT DISTINCT genre FROM movies ORDER BY genre ASC
  `;
  return rows.map((r) => r.genre);
}

export async function getLastSyncLog(): Promise<SyncLog | null> {
  const rows = await sql<SyncLog[]>`
    SELECT
      id,
      synced_at AS "syncedAt",
      status,
      records_synced AS "recordsSynced",
      error_message AS "errorMessage"
    FROM sync_logs
    ORDER BY synced_at DESC
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function createSyncLog(
  status: "success" | "failed",
  recordsSynced: number,
  errorMessage?: string,
): Promise<SyncLog> {
  const rows = await sql<SyncLog[]>`
    INSERT INTO sync_logs (status, records_synced, error_message)
    VALUES (
      ${status},
      ${recordsSynced},
      ${errorMessage ?? null}
    )
    RETURNING
      id,
      synced_at AS "syncedAt",
      status,
      records_synced AS "recordsSynced",
      error_message AS "errorMessage"
  `;
  return rows[0];
}

export async function getMoviesTotalCount(
  startDate?: string,
  endDate?: string,
): Promise<number> {
  const startCondition = startDate
    ? sql`AND release_date >= ${startDate}::date`
    : sql``;
  const endCondition = endDate
    ? sql`AND release_date <= ${endDate}::date`
    : sql``;

  const rows = await sql<{ count: string }[]>`
    SELECT COUNT(*) AS count FROM movies
    WHERE 1=1 ${startCondition} ${endCondition}
  `;
  return Number(rows[0]?.count ?? 0);
}

export async function getGenreDistribution(
  startDate?: string,
  endDate?: string,
): Promise<{ genre: string; count: string }[]> {
  const startCondition = startDate
    ? sql`AND release_date >= ${startDate}::date`
    : sql``;
  const endCondition = endDate
    ? sql`AND release_date <= ${endDate}::date`
    : sql``;

  return sql<{ genre: string; count: string }[]>`
    SELECT genre, COUNT(*) AS count
    FROM movies
    WHERE 1=1 ${startCondition} ${endCondition}
    GROUP BY genre
    ORDER BY count DESC
  `;
}

export async function getMoviesByDate(
  startDate?: string,
  endDate?: string,
): Promise<{ date: string; count: string }[]> {
  const startCondition = startDate
    ? sql`AND release_date >= ${startDate}::date`
    : sql``;
  const endCondition = endDate
    ? sql`AND release_date <= ${endDate}::date`
    : sql``;

  return sql<{ date: string; count: string }[]>`
    SELECT
      TO_CHAR(release_date, 'YYYY-MM') AS date,
      COUNT(*) AS count
    FROM movies
    WHERE 1=1 ${startCondition} ${endCondition}
    GROUP BY TO_CHAR(release_date, 'YYYY-MM')
    ORDER BY date ASC
  `;
}

export async function getLatestMovieTitle(
  startDate?: string,
  endDate?: string,
): Promise<string | null> {
  const startCondition = startDate
    ? sql`AND release_date >= ${startDate}::date`
    : sql``;
  const endCondition = endDate
    ? sql`AND release_date <= ${endDate}::date`
    : sql``;

  const rows = await sql<{ title: string }[]>`
    SELECT title FROM movies
    WHERE 1=1 ${startCondition} ${endCondition}
    ORDER BY release_date DESC
    LIMIT 1
  `;
  return rows[0]?.title ?? null;
}
