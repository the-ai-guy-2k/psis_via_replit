# PSIS production image — Express API + Vite/React static frontend
FROM node:24-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

FROM base AS deps

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc tsconfig.base.json tsconfig.json ./
COPY artifacts ./artifacts
COPY lib ./lib
COPY scripts ./scripts

RUN pnpm install --frozen-lockfile

FROM deps AS build

ENV PORT=8080
ENV BASE_PATH=/
ENV NODE_ENV=production

RUN pnpm run test:psis
RUN pnpm run build

FROM base AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV BASE_PATH=/
ENV LOG_LEVEL=info

COPY --from=build /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=build /app/artifacts/api-server/data ./artifacts/api-server/data
COPY --from=build /app/artifacts/psis/dist ./artifacts/psis/dist

EXPOSE 8080

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
