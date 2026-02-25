export type Movie = {
  id: number;
  externalId: number;
  title: string;
  genre: string;
  releaseDate: string;
  overview: string;
  voteAverage: number;
  createdAt: Date;
  updatedAt: Date;
};

export type NewMovieInput = {
  externalId: number;
  title: string;
  genre: string;
  releaseDate: string;
  overview: string;
  voteAverage: number;
};

export type UpdateMovieInput = {
  title?: string;
  genre?: string;
  releaseDate?: string;
  overview?: string;
  voteAverage?: number;
};

export type MovieResponse = {
  id: number;
  external_id: number;
  title: string;
  genre: string;
  release_date: string;
  overview: string;
  vote_average: number;
  created_at: Date;
  updated_at: Date;
};

export type SyncLog = {
  id: number;
  syncedAt: Date;
  status: "success" | "failed";
  recordsSynced: number;
  errorMessage: string | null;
};

export type SyncLogResponse = {
  id: number;
  synced_at: Date;
  status: "success" | "failed";
  records_synced: number;
  error_message: string | null;
};

export type ListMoviesQuery = {
  search?: string;
  genre?: string;
  sortKey?: "title" | "genre" | "releaseDate" | "voteAverage" | "updatedAt";
  sortDir?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export type ListMoviesResult = {
  data: MovieResponse[];
  total: number;
  page: number;
  limit: number;
};

export type DashboardData = {
  totalMovies: number;
  topGenre: string;
  latestMovie: string;
  genreDistribution: { name: string; value: number }[];
  moviesByDate: { date: string; count: number }[];
};

export type TmdbMovie = {
  id: number;
  title: string;
  genre_ids: number[];
  release_date: string;
  overview: string;
  vote_average: number;
};

export type TmdbGenre = {
  id: number;
  name: string;
};
