# Multi-stage Dockerfile for ApexCV Next.js app with built-in node:sqlite
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

FROM node:22-alpine AS builder
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /usr/src/app

RUN apk add --no-cache su-exec

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"
ENV DB_PATH=/usr/src/app/data/cv_builder.db

# Copy standalone build artifacts
COPY --chown=node:node --from=builder /usr/src/app/public ./public
COPY --chown=node:node --from=builder /usr/src/app/.next/standalone ./
COPY --chown=node:node --from=builder /usr/src/app/.next/static ./.next/static
COPY --chmod=755 docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

EXPOSE 3001

VOLUME ["/usr/src/app/data"]

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]


