# ---- Build Stage ----
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Backend API URL
ARG VITE_SERVER_DOMAIN
ENV VITE_SERVER_DOMAIN=$VITE_SERVER_DOMAIN

# Vite bakes all VITE_* env vars into the bundle at build time
RUN npm run build

# ---- Serve Stage ----
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
