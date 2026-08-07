# Stage 1: Builder
FROM node:22-alpine AS builder

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace configuration and package manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend-api/package.json ./apps/backend-api/
COPY packages/common/package.json ./packages/common/
COPY packages/config/package.json ./packages/config/
COPY packages/database/package.json ./packages/database/
COPY packages/logger/package.json ./packages/logger/
COPY packages/types/package.json ./packages/types/
COPY packages/validation/package.json ./packages/validation/

# Install dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build all packages
RUN pnpm build

# Remove devDependencies to prepare production node_modules
# Prisma generation is required, so ensure it runs if needed
RUN pnpm install --prod --frozen-lockfile

# Stage 2: Production
FROM node:22-alpine AS production

WORKDIR /app

# Run as non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy production node_modules and built dist folders from builder
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/apps/backend-api/dist ./apps/backend-api/dist
COPY --from=builder --chown=appuser:appgroup /app/apps/backend-api/package.json ./apps/backend-api/package.json
COPY --from=builder --chown=appuser:appgroup /app/packages ./packages

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "apps/backend-api/dist/server.js"]
