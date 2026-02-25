# Movi Dashboard

- https://movi.fahrezy.work
- https://movi-api.fahrezy.work
- https://movi-api.fahrezy.work/docs

## Description

A full-stack dashboard for syncing and managing movie data from the TMDB API. The back end exposes a REST API (Express + TypeScript + PostgreSQL) that handles syncing, CRUD, and analytics. The front end (React + React Router + Vite) provides a data management table with filtering, sorting, and pagination, plus an analytics dashboard with charts.

## Prerequisites

- node 24 or higher
- npm 11 or higher

## Quick Start

### Local Development

```bash
git clone <repository-url>
cd <clone directory>
```

### Create .env file for each projects

```bash
# cd front-end / back-end
cp .env.example .env
```

And adjust the environment variable value if needed

### Install dependencies

```bash
# cd front-end / back-end
npm install
```

### Run the app

```bash
# cd front-end / back-end
npm run dev
```

### Run using Docker

From the root of the project, first create .env file that is similar to the above, and then run:

```bash
# cd front-end / back-end
docker build -t <tag-name> .
docker run --env-file ./.env <tag-name>
```

#### With Docker Compose

```bash
# cd front-end / back-end
docker compose -f ./compose.yaml up --build
```

## Project Structure

### Back End

```
src/
  index.ts                        # Express app entry point
  lib/
    db.ts                         # postgres.js client
    tmdb.ts                       # TMDB API client
  features/movies/
    types.ts                      # Internal + response TypeScript types
    schemas.ts                    # Zod validation schemas for all endpoints
    repository.ts                 # Raw SQL queries (postgres.js)
    usecase.ts                    # Business logic layer
    representational.ts           # Express router — route handlers
```

### Front End

```
src/
  main.tsx                        # App entry point, providers
  App.tsx                         # Router setup
  components/
    layout/                       # Header, sidebar, layout shell
    ui/                           # Reusable primitives:
                                  #   button, card, input, modal, select, table, toast
  features/movies/
    api/
      movies-api.ts               # Fetch wrapper for all API calls
      movies-api.types.ts         # Request / response TypeScript types
      use-movies-api.ts           # TanStack Query hooks (queries + mutations)
    components/                   # Specific feature component(s)
    pages/                        # Specific feature page(s)
  pages/                          # Unspecific feature page(s)
  hooks/                          # Resuable hooks
  utils/                          # Shared function across project
```