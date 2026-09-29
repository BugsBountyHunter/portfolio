# syntax=docker/dockerfile:1

FROM node:24-alpine AS build
WORKDIR /app

COPY nextjs/package.json nextjs/package-lock.json ./
RUN npm ci

COPY nextjs/ ./
RUN npm run typecheck && npm test && npm run build

FROM nginx:1.29-alpine AS runtime
# Pull in Alpine security fixes released after the base image was built.
RUN apk upgrade --no-cache
COPY deployment/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/out /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --spider http://127.0.0.1/healthz || exit 1
