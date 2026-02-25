import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { RefreshCw, Plus, Search, Edit2, Trash2 } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Select } from "../../../../components/ui/select";
import { Modal } from "../../../../components/ui/modal";
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
import styles from "./styles.module.css";
import clsx from "clsx";

type SortKey = "title" | "genre" | "releaseDate" | "voteAverage" | "updatedAt";

type MovieFormData = {
  title: string;
  genre: string;
  release_date: string;
  overview: string;
  vote_average: string;
};

const emptyForm: MovieFormData = {
  title: "",
  genre: "",
  release_date: "",
  overview: "",
  vote_average: "",
};

const PAGE_LIMIT = 10;

export function DataManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [formData, setFormData] = useState<MovieFormData>(emptyForm);

  const searchQuery = searchParams.get("search") || "";
  const filterGenre = searchParams.get("genre") || "";
  const rawSortKey = searchParams.get("sortKey") as SortKey | null;
  const rawSortDir = searchParams.get("sortDir") as "asc" | "desc" | null;
  const sortKey = rawSortKey ?? "updatedAt";
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
    sortKey,
    sortDir,
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
    syncMutation.mutate();
  };

  const handleSort = (key: SortKey) => {
    if (rawSortKey !== key) {
      updateSearchParams({ sortKey: key, sortDir: "asc", page: "1" });
    } else if (rawSortDir === "asc") {
      updateSearchParams({ sortKey: key, sortDir: "desc", page: "1" });
    } else {
      updateSearchParams({ sortKey: null, sortDir: null, page: "1" });
    }
  };

  const sortIndicator = (key: SortKey) => {
    if (rawSortKey !== key) return null;
    return rawSortDir === "asc" ? " ↑" : " ↓";
  };

  const openAddModal = () => {
    setFormData(emptyForm);
    setIsAddModalOpen(true);
  };

  const openEditModal = (movie: Movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      genre: movie.genre,
      release_date: movie.release_date
        ? movie.release_date.substring(0, 10)
        : "",
      overview: movie.overview,
      vote_average: String(movie.vote_average),
    });
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setEditingMovie(null);
    setFormData(emptyForm);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateMovieRequest = {
      title: formData.title,
      genre: formData.genre,
      release_date: formData.release_date,
      overview: formData.overview || undefined,
      vote_average: formData.vote_average
        ? parseFloat(formData.vote_average)
        : undefined,
    };
    createMutation.mutate(payload, { onSuccess: closeModals });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMovie) return;
    updateMutation.mutate(
      {
        id: editingMovie.id,
        data: {
          title: formData.title,
          genre: formData.genre,
          release_date: formData.release_date || undefined,
          overview: formData.overview || undefined,
          vote_average: formData.vote_average
            ? parseFloat(formData.vote_average)
            : undefined,
        },
      },
      { onSuccess: closeModals },
    );
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      deleteMutation.mutate(id);
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
                    handleSort("releaseDate");
                  }}
                  className={styles.sortable}
                >
                  Release Date{sortIndicator("releaseDate")}
                </TableHead>
                <TableHead
                  onClick={() => {
                    handleSort("updatedAt");
                  }}
                  className={styles.sortable}
                >
                  Last Updated{sortIndicator("updatedAt")}
                </TableHead>
                <TableHead
                  onClick={() => {
                    handleSort("voteAverage");
                  }}
                  className={styles.sortable}
                >
                  Vote Average{sortIndicator("voteAverage")}
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

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={closeModals} title="Add New Data">
        <form onSubmit={handleAddSubmit} className={styles.form}>
          <Input
            label="Title"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <Input
            label="Genre"
            required
            value={formData.genre}
            onChange={(e) =>
              setFormData({ ...formData, genre: e.target.value })
            }
          />
          <Input
            label="Release Date"
            type="date"
            value={formData.release_date}
            onChange={(e) =>
              setFormData({ ...formData, release_date: e.target.value })
            }
          />
          <Input
            label="Overview"
            value={formData.overview}
            onChange={(e) =>
              setFormData({ ...formData, overview: e.target.value })
            }
          />
          <Input
            label="Vote Average"
            type="number"
            value={formData.vote_average}
            onChange={(e) =>
              setFormData({ ...formData, vote_average: e.target.value })
            }
          />
          <div className={styles.formActions}>
            <Button type="button" variant="outline" onClick={closeModals}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editingMovie !== null}
        onClose={closeModals}
        title="Edit Data"
      >
        <form onSubmit={handleEditSubmit} className={styles.form}>
          <Input
            label="Title"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <Input
            label="Genre"
            required
            value={formData.genre}
            onChange={(e) =>
              setFormData({ ...formData, genre: e.target.value })
            }
          />
          <Input
            label="Release Date"
            type="date"
            value={formData.release_date}
            onChange={(e) =>
              setFormData({ ...formData, release_date: e.target.value })
            }
          />
          <Input
            label="Overview"
            value={formData.overview}
            onChange={(e) =>
              setFormData({ ...formData, overview: e.target.value })
            }
          />
          <Input
            label="Vote Average"
            type="number"
            value={formData.vote_average}
            onChange={(e) =>
              setFormData({ ...formData, vote_average: e.target.value })
            }
          />
          <div className={styles.formActions}>
            <Button type="button" variant="outline" onClick={closeModals}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
