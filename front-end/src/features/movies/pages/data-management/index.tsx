import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { RefreshCw, Plus, Search, Edit2, Trash2 } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Select } from "../../../../components/ui/select";
import { Modal } from "../../../../components/ui/modal";
import { toast } from "../../../../components/ui/toast/toast-store";
import { useDebouncedInput } from "../../../../hooks/useDebouncedInput";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../../components/ui/table";
import { Card, CardContent } from "../../../../components/ui/card";
import {
  useListMovies,
  useGetLastSync,
  useSyncMovies,
  useCreateMovie,
  useUpdateMovie,
  useDeleteMovie,
  useGetGenres,
} from "../../api/use-movies-api";
import type { Movie, CreateMovieRequest } from "../../api/movies-api.types";
import { type MovieFormValues, MovieForm } from "../../components/movie-form";
import styles from "./styles.module.css";
import clsx from "clsx";

type SortKey =
  | "title"
  | "genre"
  | "release_date"
  | "vote_average"
  | "updated_at";

const PAGE_LIMIT = 10;

export function DataManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  const searchQuery = searchParams.get("search") || "";
  const filterGenre = searchParams.get("genre") || "";
  const rawSortKey = searchParams.get("sort_key") as SortKey | null;
  const rawSortDir = searchParams.get("sort_dir") as "asc" | "desc" | null;
  const sortKey = rawSortKey ?? "updated_at";
  const sortDir = rawSortDir ?? "desc";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const updateSearchParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams);
  };

  const [searchInputValue, handleSearchChange] = useDebouncedInput(
    searchQuery,
    (value) => {
      updateSearchParams({ search: value, page: "1" });
    },
    500,
  );

  const { data: moviesResult, isLoading: moviesLoading } = useListMovies({
    search: searchQuery,
    genre: filterGenre,
    sort_key: sortKey,
    sort_dir: sortDir,
    page,
    limit: PAGE_LIMIT,
  });

  const { data: lastSyncData } = useGetLastSync();
  const { data: genresData } = useGetGenres();

  const genreOptions = [
    { value: "", label: "All Genres" },
    ...(genresData ?? []).map((g) => ({ value: g, label: g })),
  ];

  const syncMutation = useSyncMovies();
  const createMutation = useCreateMovie();
  const updateMutation = useUpdateMovie();
  const deleteMutation = useDeleteMovie();

  const movies = moviesResult?.data ?? [];
  const total = moviesResult?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_LIMIT);

  const handleSync = () => {
    syncMutation.mutate(undefined, {
      onSuccess: () => toast.success("Data synced successfully"),
      onError: (err) => toast.error(err.message || "Sync failed"),
    });
  };

  const handleSort = (key: SortKey) => {
    if (rawSortKey !== key) {
      updateSearchParams({ sort_key: key, sort_dir: "asc", page: "1" });
    } else if (rawSortDir === "asc") {
      updateSearchParams({ sort_key: key, sort_dir: "desc", page: "1" });
    } else {
      updateSearchParams({ sort_key: null, sort_dir: null, page: "1" });
    }
  };

  const sortIndicator = (key: SortKey) => {
    if (rawSortKey !== key) return null;
    return rawSortDir === "asc" ? " ↑" : " ↓";
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const openEditModal = (movie: Movie) => {
    setEditingMovie(movie);
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setEditingMovie(null);
  };

  const handleAddSubmit = (values: MovieFormValues) => {
    const payload: CreateMovieRequest = {
      title: values.title,
      genre: values.genre,
      release_date: values.release_date,
      overview: values.overview || undefined,
      vote_average: values.vote_average
        ? parseFloat(values.vote_average)
        : undefined,
    };
    createMutation.mutate(payload, {
      onSuccess: () => {
        closeModals();
        toast.success("Movie added successfully");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to add movie");
      },
    });
  };

  const handleEditSubmit = (values: MovieFormValues) => {
    if (!editingMovie) return;
    updateMutation.mutate(
      {
        id: editingMovie.id,
        data: {
          title: values.title,
          genre: values.genre,
          release_date: values.release_date || undefined,
          overview: values.overview || undefined,
          vote_average: values.vote_average
            ? parseFloat(values.vote_average)
            : undefined,
        },
      },
      {
        onSuccess: () => {
          closeModals();
          toast.success("Movie updated successfully");
        },
        onError: (err) => toast.error(err.message || "Failed to update movie"),
      },
    );
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success("Movie deleted"),
        onError: (err) => toast.error(err.message || "Failed to delete movie"),
      });
    }
  };

  const lastSyncText = lastSyncData?.synced_at
    ? format(parseISO(lastSyncData.synced_at), "dd MMM yyyy, HH:mm:ss")
    : "Never";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Manajemen Data</h1>
          <p className={styles.subtitle}>Last Sync: {lastSyncText}</p>
        </div>
        <div className={styles.actions}>
          <Button
            variant="outline"
            onClick={handleSync}
            disabled={syncMutation.isPending}
          >
            <RefreshCw size={16} className={styles.icon} />
            {syncMutation.isPending ? "Syncing..." : "Sync Data"}
          </Button>
          <Button onClick={openAddModal}>
            <Plus size={16} className={styles.icon} />
            Add Data
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className={styles.cardContent}>
          <div className={styles.controls}>
            <div className={styles.searchBox}>
              <Search size={18} className={styles.searchIcon} />
              <Input
                placeholder="Search movies..."
                value={searchInputValue}
                onChange={handleSearchChange}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.filterBox}>
              <Select
                options={genreOptions}
                value={filterGenre}
                onChange={(e) => {
                  updateSearchParams({ genre: e.target.value, page: "1" });
                }}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  onClick={() => {
                    handleSort("title");
                  }}
                  className={styles.sortable}
                >
                  Title{sortIndicator("title")}
                </TableHead>
                <TableHead
                  onClick={() => {
                    handleSort("genre");
                  }}
                  className={styles.sortable}
                >
                  Genre{sortIndicator("genre")}
                </TableHead>
                <TableHead
                  onClick={() => {
                    handleSort("release_date");
                  }}
                  className={styles.sortable}
                >
                  Release Date{sortIndicator("release_date")}
                </TableHead>
                <TableHead
                  onClick={() => {
                    handleSort("updated_at");
                  }}
                  className={styles.sortable}
                >
                  Last Updated{sortIndicator("updated_at")}
                </TableHead>
                <TableHead
                  onClick={() => {
                    handleSort("vote_average");
                  }}
                  className={styles.sortable}
                >
                  Vote Average{sortIndicator("vote_average")}
                </TableHead>
                <TableHead className={styles.actionsHead}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {moviesLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className={styles.emptyState}>
                    Loading...
                  </TableCell>
                </TableRow>
              ) : movies.length > 0 ? (
                movies.map((movie) => {
                  return (
                    <TableRow key={movie.id}>
                      <TableCell className={styles.cellTitle}>
                        {movie.title}
                      </TableCell>
                      <TableCell>
                        <span className={styles.badge}>{movie.genre}</span>
                      </TableCell>
                      <TableCell>
                        {movie.release_date
                          ? format(parseISO(movie.release_date), "dd MMM yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {format(
                          parseISO(movie.updated_at),
                          "dd MMM yyyy, HH:mm",
                        )}
                      </TableCell>

                      <TableCell>{movie.vote_average}</TableCell>
                      <TableCell>
                        <div className={styles.rowActions}>
                          <button
                            className={styles.actionBtn}
                            title="Edit"
                            onClick={() => {
                              return openEditModal(movie);
                            }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className={clsx(styles.actionBtn, styles.deleteBtn)}
                            title="Delete"
                            onClick={() => {
                              return handleDelete(movie.id);
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className={styles.emptyState}>
                    No data found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => {
                  return updateSearchParams({ page: String(page - 1) });
                }}
              >
                Previous
              </Button>
              <span className={styles.pageInfo}>
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => {
                  return updateSearchParams({ page: String(page + 1) });
                }}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={isAddModalOpen} onClose={closeModals} title="Add New Data">
        <MovieForm
          onSubmit={handleAddSubmit}
          isPending={createMutation.isPending}
          onCancel={closeModals}
        />
      </Modal>

      <Modal
        isOpen={editingMovie !== null}
        onClose={closeModals}
        title="Edit Data"
      >
        <MovieForm
          defaultValues={
            editingMovie
              ? {
                  title: editingMovie.title,
                  genre: editingMovie.genre,
                  release_date: editingMovie.release_date
                    ? editingMovie.release_date.substring(0, 10)
                    : "",
                  overview: editingMovie.overview,
                  vote_average: String(editingMovie.vote_average),
                }
              : {}
          }
          onSubmit={handleEditSubmit}
          isPending={updateMutation.isPending}
          onCancel={closeModals}
        />
      </Modal>
    </div>
  );
}
