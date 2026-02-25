import { z } from "zod";

export const movieCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  genre: z.string().min(1, "Genre is required"),
  release_date: z.string().min(1, "Release date is required"),
  overview: z.string().default(""),
  vote_average: z.number().min(0).max(10).default(0),
});

export const movieUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  genre: z.string().min(1).optional(),
  release_date: z.string().optional(),
  overview: z.string().optional(),
  vote_average: z.number().min(0).max(10).optional(),
});

export const movieParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const VALID_SORT_KEYS = [
  "title",
  "genre",
  "release_date",
  "vote_average",
  "updated_at",
] as const;

export const movieListQuerySchema = z.object({
  search: z.string().optional(),
  genre: z.string().optional(),
  sort_key: z.enum(VALID_SORT_KEYS).default("updated_at"),
  sort_dir: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const dashboardQuerySchema = z.object({
  release_date_start: z.string().optional(),
  release_date_end: z.string().optional(),
});
