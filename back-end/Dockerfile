# use the official Node.js image
# see all versions at https://hub.docker.com//_/node/tags
FROM node:24.13.1-bookworm AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json package-lock.json /temp/dev/
RUN cd /temp/dev && npm ci

# install with --omit=dev (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json package-lock.json /temp/prod/
ENV NODE_ENV=production
RUN cd /temp/prod && npm ci --omit=dev

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
# RUN npm test
RUN npm run migrate:build
RUN node swagger.mjs
RUN npm run build

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules ./node_modules
COPY --from=prerelease /usr/src/app/dist ./dist
COPY --from=prerelease /usr/src/app/migrations ./dist/migrations
COPY --from=prerelease /usr/src/app/package.json .

# run the app
USER node

ENV PORT=3000
EXPOSE ${PORT}/tcp

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD curl -f http://localhost:${PORT}/ || exit 1

ENTRYPOINT ["sh", "-c", "node ./dist/migrate.mjs && node ./dist/index.js"]