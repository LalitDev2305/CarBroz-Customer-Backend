# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy monorepo configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/common/package.json ./packages/common/
COPY packages/config/package.json ./packages/config/
COPY packages/logger/package.json ./packages/logger/
COPY packages/feature-flags/package.json ./packages/feature-flags/
COPY packages/ui-sdk/package.json ./packages/ui-sdk/
COPY packages/database/package.json ./packages/database/
COPY apps/backend-api/package.json ./apps/backend-api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/ ./apps/

# Generate Prisma Client & Build Workspace Packages
RUN pnpm prisma generate
RUN pnpm build

# Production Runtime Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy built artifacts and workspace dependencies from builder
COPY --from=builder /app ./

# Create non-root user and assign permissions
USER node

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health/liveness || exit 1

CMD ["node", "apps/backend-api/dist/server.js"]
