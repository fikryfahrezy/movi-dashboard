import express from "express";
import { type ZodError, z } from "zod";
import * as usecase from "./usecase.ts";
import {
  dashboardQuerySchema,
  movieCreateSchema,
  movieListQuerySchema,
  movieParamsSchema,
  movieUpdateSchema,
} from "./schemas.ts";

function validationErrorResponse(error: ZodError) {
  const flattened = z.flattenError(error);
  return {
    error: "Validation failed",
    fields: flattened.fieldErrors,
    formErrors: flattened.formErrors,
  };
}

const router = express.Router();

// GET /movies/sync/last - get last sync info
router.get(
  "/sync/last",
  /* #swagger.tags = ["Movies"] */
  async (_req, res) => {
    const log = await usecase.getLastSync();
    if (!log) {
      return res.status(404).json({ error: "No sync has been performed yet" });
    }
    return res.json(log);
  },
);

// GET /movies/dashboard - dashboard data
router.get(
  "/dashboard",
  /* #swagger.tags = ["Movies"] */
  async (req, res) => {
    const parsed = dashboardQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json(validationErrorResponse(parsed.error));
    }

    const data = await usecase.getDashboardData(
      parsed.data.startDate,
      parsed.data.endDate,
    );
    return res.json(data);
  },
);

// POST /movies/sync - trigger TMDB sync
router.post(
  "/sync",
  /* #swagger.tags = ["Movies"] */
  async (_req, res) => {
    const log = await usecase.syncMovies();
    const statusCode = log.status === "success" ? 200 : 500;
    return res.status(statusCode).json(log);
  },
);

// GET /movies - list movies
router.get(
  "/",
  /* #swagger.tags = ["Movies"] */
  async (req, res) => {
    const parsed = movieListQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json(validationErrorResponse(parsed.error));
    }

    const result = await usecase.listMovies(parsed.data);
    return res.json(result);
  },
);

// GET /movies/:id - get a single movie
router.get(
  "/:id",
  /* #swagger.tags = ["Movies"] */
  async (req, res) => {
    const parsed = movieParamsSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json(validationErrorResponse(parsed.error));
    }

    const movie = await usecase.getMovieById(parsed.data.id);
    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }
    return res.json(movie);
  },
);

// POST /movies - create a movie
router.post(
  "/",
  /* #swagger.tags = ["Movies"] */
  /* #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["title", "genre", "release_date"],
            properties: {
              title: { type: "string", example: "My Movie" },
              genre: { type: "string", example: "Action" },
              release_date: { type: "string", example: "2024-01-01" },
              overview: { type: "string", example: "A great movie." },
              vote_average: { type: "number", example: 7.5 }
            }
          }
        }
      }
    } */
  async (req, res) => {
    const parsed = movieCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(validationErrorResponse(parsed.error));
    }

    const movie = await usecase.createMovie({
      externalId: 0, // manually created movies have no external ID
      title: parsed.data.title,
      genre: parsed.data.genre,
      releaseDate: parsed.data.release_date,
      overview: parsed.data.overview,
      voteAverage: parsed.data.vote_average,
    });
    return res.status(201).json(movie);
  },
);

// PUT /movies/:id - update a movie
router.put(
  "/:id",
  /* #swagger.tags = ["Movies"] */
  /* #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              title: { type: "string", example: "Updated Title" },
              genre: { type: "string", example: "Drama" },
              release_date: { type: "string", example: "2024-06-01" },
              overview: { type: "string", example: "Updated overview." },
              vote_average: { type: "number", example: 8.0 }
            }
          }
        }
      }
    } */
  async (req, res) => {
    const parsedParams = movieParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json(validationErrorResponse(parsedParams.error));
    }

    const parsedBody = movieUpdateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json(validationErrorResponse(parsedBody.error));
    }

    const movie = await usecase.updateMovie(parsedParams.data.id, {
      title: parsedBody.data.title,
      genre: parsedBody.data.genre,
      releaseDate: parsedBody.data.release_date,
      overview: parsedBody.data.overview,
      voteAverage: parsedBody.data.vote_average,
    });

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }
    return res.json(movie);
  },
);

// DELETE /movies/:id - delete a movie
router.delete(
  "/:id",
  /* #swagger.tags = ["Movies"] */
  async (req, res) => {
    const parsed = movieParamsSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json(validationErrorResponse(parsed.error));
    }

    const deleted = await usecase.deleteMovie(parsed.data.id);
    if (!deleted) {
      return res.status(404).json({ error: "Movie not found" });
    }
    return res.status(204).send();
  },
);

export default router;
