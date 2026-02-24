FROM node:24.13.1-bookworm AS base

# 1. Install dependencies only when needed
FROM base AS deps

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN npm ci

# 2. Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3. Production image, copy all the files and run next
FROM nginx:1.29.5 AS runner
WORKDIR /app

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /var/www/out