import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { RefreshCw, Plus, Search, Edit2, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { Modal } from "../../components/ui/modal";
import { useDebouncedInput } from "../../hooks/useDebouncedInput";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/table";
import { Card, CardContent } from "../../components/ui/card";
import { mockMovies, mockLastSyncTime, type Movie } from "../../data/mock-data";
import styles from "./styles.module.css";
import clsx from "clsx";

export function DataManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<Movie[]>(mockMovies);
  const [lastSync, setLastSync] = useState<string>(mockLastSyncTime);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    genre: "",
    releaseDate: "",
  });

  const searchQuery = searchParams.get("search") || "";
  const filterGenre = searchParams.get("genre") || "";
  const sortKey = (searchParams.get("sortKey") as keyof Movie) || "lastUpdated";
  const sortDirection =
    (searchParams.get("sortDir") as "asc" | "desc") || "desc";

  const sortConfig = useMemo(() => {
    return { key: sortKey, direction: sortDirection };
  }, [sortKey, sortDirection]);

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
      updateSearchParams({ search: value });
    },
    500,
  );

  const handleSync = () => {
    // Simulate fetching from API
    setTimeout(() => {
      const newSyncTime = new Date().toISOString();
      setLastSync(newSyncTime);
      // In a real app, we would merge data here
      alert("Data synced successfully!");
    }, 1000);
  };

  const handleSort = (key: keyof Movie) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    updateSearchParams({ sortKey: key, sortDir: direction });
  };

  const processedData = useMemo(() => {
    let result = [...data];

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((item) => {
        return (
          item.title.toLowerCase().includes(lowerQuery) ||
          item.genre.toLowerCase().includes(lowerQuery)
        );
      });
    }

    if (filterGenre) {
      result = result.filter((item) => {
        return item.genre === filterGenre;
      });
    }

    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    return result;
  }, [data, searchQuery, filterGenre, sortConfig]);

  const genres = useMemo(() => {
    const uniqueGenres = Array.from(
      new Set(
        data.map((item) => {
          return item.genre;
        }),
      ),
    );
    return [
      { value: "", label: "All Genres" },
      ...uniqueGenres.map((g) => {
        return { value: g, label: g };
      }),
    ];
  }, [data]);

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setData(
        data.filter((item) => {
          return item.id !== id;
        }),
      );
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMovie: Movie = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      genre: formData.genre,
      releaseDate: formData.releaseDate,
      lastUpdated: new Date().toISOString(),
    };
    setData([newMovie, ...data]);
    setIsModalOpen(false);
    setFormData({ title: "", genre: "", releaseDate: "" });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Manajemen Data</h1>
          <p className={styles.subtitle}>
            Last Sync: {format(parseISO(lastSync), "dd MMM yyyy, HH:mm:ss")}
          </p>
        </div>
        <div className={styles.actions}>
          <Button variant="outline" onClick={handleSync}>
            <RefreshCw size={16} className={styles.icon} />
            Sync Data
          </Button>
          <Button
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
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
                options={genres}
                value={filterGenre}
                onChange={(e) => {
                  updateSearchParams({ genre: e.target.value });
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
                  Title{" "}
                  {sortConfig.key === "title" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  onClick={() => {
                    handleSort("genre");
                  }}
                  className={styles.sortable}
                >
                  Genre{" "}
                  {sortConfig.key === "genre" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  onClick={() => {
                    handleSort("releaseDate");
                  }}
                  className={styles.sortable}
                >
                  Release Date{" "}
                  {sortConfig.key === "releaseDate" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  onClick={() => {
                    handleSort("lastUpdated");
                  }}
                  className={styles.sortable}
                >
                  Last Updated{" "}
                  {sortConfig.key === "lastUpdated" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className={styles.actionsHead}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedData.length > 0 ? (
                processedData.map((movie) => {
                  return (
                    <TableRow key={movie.id}>
                      <TableCell className={styles.cellTitle}>
                        {movie.title}
                      </TableCell>
                      <TableCell>
                        <span className={styles.badge}>{movie.genre}</span>
                      </TableCell>
                      <TableCell>
                        {format(parseISO(movie.releaseDate), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        {format(
                          parseISO(movie.lastUpdated),
                          "dd MMM yyyy, HH:mm",
                        )}
                      </TableCell>
                      <TableCell>
                        <div className={styles.rowActions}>
                          <button className={styles.actionBtn} title="Edit">
                            <Edit2 size={16} />
                          </button>
                          <button
                            className={clsx(styles.actionBtn, styles.deleteBtn)}
                            title="Delete"
                            onClick={() => {
                              return handleDelete(movie.id);
                            }}
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
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          return setIsModalOpen(false);
        }}
        title="Add New Data"
      >
        <form onSubmit={handleFormSubmit} className={styles.form}>
          <Input
            label="Title"
            required
            value={formData.title}
            onChange={(e) => {
              return setFormData({ ...formData, title: e.target.value });
            }}
          />
          <Input
            label="Genre"
            required
            value={formData.genre}
            onChange={(e) => {
              return setFormData({ ...formData, genre: e.target.value });
            }}
          />
          <Input
            label="Release Date"
            type="date"
            required
            value={formData.releaseDate}
            onChange={(e) => {
              return setFormData({ ...formData, releaseDate: e.target.value });
            }}
          />
          <div className={styles.formActions}>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                return setIsModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
