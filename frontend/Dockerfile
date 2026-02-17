# Multi-stage build for production
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY frontend/package.json ./frontend/
COPY shared/package.json ./shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY frontend ./frontend
COPY shared ./shared
COPY tsconfig.json ./

# Build application
ENV NEXT_TELEMETRY_DISABLED 1
RUN pnpm --filter frontend build

# Production stage
FROM node:20-alpine AS runner

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy built files
COPY --from=builder /app/frontend/.next ./.next
COPY --from=builder /app/frontend/public ./public
COPY --from=builder /app/frontend/package.json ./
COPY --from=builder /app/frontend/node_modules ./node_modules

# Expose port
EXPOSE 3000

# Run application
CMD ["pnpm", "start"]
