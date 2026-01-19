# syntax=docker/dockerfile:1.7-labs

# Base image shared by all stages
FROM node:20-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Install all dependencies (dev deps are required for the build)
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Build the Next.js app (standalone output is enabled in next.config.mjs)
FROM deps AS builder
COPY . .
RUN npm run build

# Create a lean runtime image
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000

# Provide tsx for cron/maintenance scripts that run TypeScript directly
RUN npm install -g tsx

# Copy production dependencies for app runtime and cron scripts
COPY --from=deps /app/node_modules ./node_modules

# Non-root user
RUN groupadd -r nextjs && useradd -r -g nextjs nextjs \
  && mkdir -p /app/.next /app/public

# Copy the standalone server and assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
