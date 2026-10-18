# Build stage. The buf output (src/gen/) and routeTree.gen.ts are committed,
# so buf isn't needed here.
FROM docker.io/library/node:22-alpine AS build
ARG PNPM_VERSION=11.24.0
RUN npm install --global pnpm@${PNPM_VERSION}
WORKDIR /src
# Dependencies first, so they're cached until the lockfile changes.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Final stage: static files on nginx running as an unprivileged user (101).
FROM docker.io/nginxinc/nginx-unprivileged:1.28-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/dist /usr/share/nginx/html
EXPOSE 8080
