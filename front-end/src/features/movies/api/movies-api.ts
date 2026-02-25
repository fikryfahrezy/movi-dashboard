import type {
  CreateMovieRequest,
  DashboardData,
  DashboardParams,
  ListMoviesParams,
  ListMoviesResponse,
  Movie,
  SyncLog,
  UpdateMovieRequest,
} from "./movies-api.types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

class MoviesApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json().catch(() => {
      return {};
    });

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.error || `Request failed with status ${response.status}`,
      );
    }

    return data as T;
  }

  private buildQueryString(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : "";
  }

  async listMovies(params?: ListMoviesParams): Promise<ListMoviesResponse> {
    const qs = params ? this.buildQueryString(params as Record<string, unknown>) : "";
    return this.request<ListMoviesResponse>(`/api/movies${qs}`);
  }

  async getMovie(id: number): Promise<Movie> {
    return this.request<Movie>(`/api/movies/${id}`);
  }

  async createMovie(data: CreateMovieRequest): Promise<Movie> {
    return this.request<Movie>("/api/movies", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateMovie(id: number, data: UpdateMovieRequest): Promise<Movie> {
    return this.request<Movie>(`/api/movies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteMovie(id: number): Promise<void> {
    return this.request<void>(`/api/movies/${id}`, {
      method: "DELETE",
    });
  }

  async syncMovies(): Promise<SyncLog> {
    return this.request<SyncLog>("/api/movies/sync", {
      method: "POST",
    });
  }

  async getLastSync(): Promise<SyncLog> {
    return this.request<SyncLog>("/api/movies/sync/last");
  }

  async getDashboard(params?: DashboardParams): Promise<DashboardData> {
    const qs = params ? this.buildQueryString(params as Record<string, unknown>) : "";
    return this.request<DashboardData>(`/api/movies/dashboard${qs}`);
  }

  async getGenres(): Promise<string[]> {
    return this.request<string[]>("/api/movies/genres");
  }
}

export const moviesApi = new MoviesApiService();
