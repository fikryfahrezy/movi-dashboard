import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subMonths } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { useGetDashboard } from "../../features/movies/api/use-movies-api";
import styles from "./styles.module.css";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

export function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();

  const defaultStart = format(subMonths(new Date(), 1), "yyyy-MM-dd");
  const defaultEnd = format(new Date(), "yyyy-MM-dd");

  const startDate = searchParams.get("release_date_start") ?? defaultStart;
  const endDate = searchParams.get("release_date_end") ?? defaultEnd;

  const updateDate = (
    key: "release_date_start" | "release_date_end",
    value: string,
  ) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const { data, isLoading, isError } = useGetDashboard({
    release_date_start: startDate,
    release_date_end: endDate,
  });

  const coloredGenreDistribution = useMemo(() => {
    return (data?.genre_distribution ?? []).map((entry, index) => {
      return {
        ...entry,
        fill: COLORS[index % COLORS.length],
      };
    });
  }, [data?.genre_distribution]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard Analitik</h1>
        <div className={styles.filters}>
          <Input
            type="date"
            label="Release Date Start"
            value={startDate}
            onChange={(e) => updateDate("release_date_start", e.target.value)}
          />
          <Input
            type="date"
            label="Release Date End"
            value={endDate}
            onChange={(e) => updateDate("release_date_end", e.target.value)}
          />
        </div>
      </div>

      {isError && (
        <p className={styles.error}>Failed to load dashboard data.</p>
      )}

      <div className={styles.summaryGrid}>
        <Card>
          <CardContent className={styles.summaryCard}>
            <p className={styles.summaryLabel}>Total Data</p>
            <p className={styles.summaryValue}>
              {isLoading ? "..." : (data?.total_movies ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className={styles.summaryCard}>
            <p className={styles.summaryLabel}>Kategori Terbanyak</p>
            <p className={styles.summaryValue}>
              {isLoading ? "..." : (data?.top_genre ?? "N/A")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className={styles.summaryCard}>
            <p className={styles.summaryLabel}>Data Terbaru</p>
            <p className={styles.summaryValue}>
              {isLoading ? "..." : (data?.latest_movie ?? "N/A")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className={styles.chartsGrid}>
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Kategori (Genre)</CardTitle>
          </CardHeader>
          <CardContent className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={coloredGenreDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent = 0 }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={120}
                  dataKey="value"
                />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agregasi Data per Bulan Rilis</CardTitle>
          </CardHeader>
          <CardContent className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data?.movies_by_date ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Jumlah Film" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
