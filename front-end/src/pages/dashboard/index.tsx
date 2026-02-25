import { useState, useMemo } from "react";
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
  const [startDate, setStartDate] = useState<string>(
    format(subMonths(new Date(), 12), "yyyy-MM-dd"),
  );
  const [endDate, setEndDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd"),
  );

  const { data, isLoading, isError } = useGetDashboard({ startDate, endDate });

  const coloredGenreDistribution = useMemo(() => {
    return (data?.genreDistribution ?? []).map((entry, index) => {
      return {
        ...entry,
        fill: COLORS[index % COLORS.length],
      };
    });
  }, [data?.genreDistribution]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard Analitik</h1>
        <div className={styles.filters}>
          <Input
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
            }}
          />
          <Input
            type="date"
            label="End Date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
            }}
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
              {isLoading ? "..." : (data?.totalMovies ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className={styles.summaryCard}>
            <p className={styles.summaryLabel}>Kategori Terbanyak</p>
            <p className={styles.summaryValue}>
              {isLoading ? "..." : (data?.topGenre ?? "N/A")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className={styles.summaryCard}>
            <p className={styles.summaryLabel}>Data Terbaru</p>
            <p className={styles.summaryValue}>
              {isLoading ? "..." : (data?.latestMovie ?? "N/A")}
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
              <BarChart data={data?.moviesByDate ?? []}>
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
