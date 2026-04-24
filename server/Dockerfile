# ---- Build Stage ----
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency files first for layer caching
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm install --omit=dev

# ---- Runtime Stage ----
FROM node:18-alpine

WORKDIR /app

# Copy only production dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application source
COPY . .

# Cloud Run expects port 8080
EXPOSE 8080

# Use node directly (not nodemon) for production
CMD ["node", "server.js"]
