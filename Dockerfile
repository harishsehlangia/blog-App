# ---- Build Stage ----
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency manifests from the server subdirectory
COPY server/package.json server/package-lock.json ./

# Install production dependencies only (excludes nodemon)
RUN npm ci --omit=dev

# ---- Runtime Stage ----
FROM node:18-alpine

WORKDIR /app

# Copy production node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application source from server subdirectory
COPY server/ .

# Cloud Run expects port 8080
EXPOSE 8080

# Start with node directly (not nodemon)
CMD ["node", "server.js"]
