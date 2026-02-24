import { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO, isAfter, isBefore, subMonths } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { mockMovies } from "../../data/mock-data";
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
    format(subMonths(new Date(), 120), "yyyy-MM-dd"), // Default to 10 years ago for mock data
  );
  const [endDate, setEndDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd"),
  );

  const filteredData = useMemo(() => {
    return mockMovies.filter((movie) => {
      const releaseDate = parseISO(movie.releaseDate);
      const start = startDate ? parseISO(startDate) : new Date(0);
      const end = endDate ? parseISO(endDate) : new Date();
      return isAfter(releaseDate, start) && isBefore(releaseDate, end);
    });
  }, [startDate, endDate]);

  const genreData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach((movie) => {
      counts[movie.genre] = (counts[movie.genre] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => {
      return { name, value };
    });
  }, [filteredData]);

  const dateData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach((movie) => {
      const year = movie.releaseDate.substring(0, 4);
      counts[year] = (counts[year] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([date, count]) => {
        return { date, count };
      })
      .sort((a, b) => {
        return a.date.localeCompare(b.date);
      });
  }, [filteredData]);

  const totalMovies = filteredData.length;
  const topGenre =
    genreData.length > 0
      ? genreData.reduce((prev, current) => {
          return prev.value > current.value ? prev : current;
        }).name
      : "N/A";
  const latestMovie =
    filteredData.length > 0
      ? [...filteredData].sort((a, b) => {
          return (
            new Date(b.releaseDate).getTime() -
            new Date(a.releaseDate).getTime()
          );
        })[0].title
      : "N/A";

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

      <div className={styles.summaryGrid}>
        <Card>
          <CardContent className={styles.summaryCard}>
            <p className={styles.summaryLabel}>Total Data</p>
            <p className={styles.summaryValue}>{totalMovies}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className={styles.summaryCard}>
            <p className={styles.summaryLabel}>Kategori Terbanyak</p>
            <p className={styles.summaryValue}>{topGenre}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className={styles.summaryCard}>
            <p className={styles.summaryLabel}>Data Terbaru</p>
            <p className={styles.summaryValue}>{latestMovie}</p>
          </CardContent>
        </Card>
      </div>

      <div className={styles.chartsGrid}>
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Kategori (Genre)</CardTitle>
          </CardHeader>
          <CardContent className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genreData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent = 0 }) => {
                    return `${name} ${(percent * 100).toFixed(0)}%`;
                  }}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genreData.map((_, index) => {
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    );
                  })}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agregasi Data per Tahun Rilis</CardTitle>
          </CardHeader>
          <CardContent className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dateData}>
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
