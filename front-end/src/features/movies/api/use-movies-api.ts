import {
  type MutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ApiError, moviesApi } from "./movies-api";
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

export const moviesKeys = {
  all: ["movies"] as const,
  lists: () => {
    return [...moviesKeys.all, "list"] as const
  },
  list: (params: ListMoviesParams) => {
    return [...moviesKeys.lists(), params] as const
  },
  details: () => {
    return [...moviesKeys.all, "detail"] as const
  },
  detail: (id: number) => {
    return [...moviesKeys.details(), id] as const
  },
  sync: () => {
    return [...moviesKeys.all, "sync"] as const
  },
  dashboard: (params: DashboardParams) => {
    return [...moviesKeys.all, "dashboard", params] as const
  },
};

export function useListMovies(
  params?: ListMoviesParams,
  options?: Omit<
    UseQueryOptions<ListMoviesResponse, ApiError>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: moviesKeys.list(params ?? {}),
    queryFn: () => {
      return moviesApi.listMovies(params)
    },
    ...options,
  });
}

export function useGetMovie(
  id: number,
  options?: Omit<UseQueryOptions<Movie, ApiError>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: moviesKeys.detail(id),
    queryFn: () => {
      return moviesApi.getMovie(id)
    },
    enabled: id > 0,
    ...options,
  });
}

export function useCreateMovie(
  options?: Omit<
    MutationOptions<Movie, ApiError, CreateMovieRequest>,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();
  const { onSuccess: onUserSuccess, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: (payload) => {
      return moviesApi.createMovie(payload)
    },
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: moviesKeys.lists() });
      onUserSuccess?.(data, variables, context, mutation);
    },
    ...restOptions,
  });
}

export function useUpdateMovie(
  options?: Omit<
    MutationOptions<Movie, ApiError, { id: number; data: UpdateMovieRequest }>,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();
  const { onSuccess: onUserSuccess, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: ({ id, data }) => {
      return moviesApi.updateMovie(id, data)
    },
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: moviesKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: moviesKeys.detail(variables.id),
      });
      onUserSuccess?.(data, variables, context, mutation);
    },
    ...restOptions,
  });
}

export function useDeleteMovie(
  options?: Omit<
    MutationOptions<void, ApiError, number>,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();
  const { onSuccess: onUserSuccess, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: (id) => {
      return moviesApi.deleteMovie(id)
    },
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: moviesKeys.lists() });
      queryClient.removeQueries({ queryKey: moviesKeys.detail(variables) });
      onUserSuccess?.(data, variables, context, mutation);
    },
    ...restOptions,
  });
}

export function useSyncMovies(
  options?: Omit<MutationOptions<SyncLog, ApiError, void>, "mutationFn">,
) {
  const queryClient = useQueryClient();
  const { onSuccess: onUserSuccess, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: () => {
      return moviesApi.syncMovies()
    },
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: moviesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: moviesKeys.sync() });
      onUserSuccess?.(data, variables, context, mutation);
    },
    ...restOptions,
  });
}

export function useGetLastSync(
  options?: Omit<UseQueryOptions<SyncLog, ApiError>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: moviesKeys.sync(),
    queryFn: () => {
      return moviesApi.getLastSync()
    },
    retry: false,
    ...options,
  });
}

export function useGetDashboard(
  params?: DashboardParams,
  options?: Omit<
    UseQueryOptions<DashboardData, ApiError>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: moviesKeys.dashboard(params ?? {}),
    queryFn: () => {
      return moviesApi.getDashboard(params)
    },
    ...options,
  });
}
