export type Movie = {
  id: number;
  external_id: number;
  title: string;
  genre: string;
  release_date: string;
  overview: string;
  vote_average: number;
  created_at: string;
  updated_at: string;
};

export type ListMoviesParams = {
  search?: string;
  genre?: string;
  sort_key?: "title" | "genre" | "release_date" | "vote_average" | "updated_at";
  sort_dir?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export type ListMoviesResponse = {
  data: Movie[];
  total: number;
  page: number;
  limit: number;
};

export type CreateMovieRequest = {
  title: string;
  genre: string;
  release_date: string;
  overview?: string;
  vote_average?: number;
};

export type UpdateMovieRequest = {
  title?: string;
  genre?: string;
  release_date?: string;
  overview?: string;
  vote_average?: number;
};

export type SyncLog = {
  id: number;
  synced_at: string;
  status: "success" | "failed";
  records_synced: number;
  error_message: string | null;
};

export type DashboardData = {
  total_movies: number;
  top_genre: string;
  latest_movie: string;
  genre_distribution: {
    name: string;
    value: number
  }[];
  movies_by_date: {
    date: string;
    count: number
  }[];
};

export type DashboardParams = {
  release_date_start?: string;
  release_date_end?: string;
};

export type GenresResponse = string[];
