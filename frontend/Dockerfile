# Frontend Dockerfile (Vite + React)

FROM node:20-alpine AS builder
WORKDIR /app

# Install deps first to leverage caching
COPY package*.json ./
RUN npm ci

# Build
COPY . .
RUN npm run build

# Serve with NGINX
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1
CMD ["nginx", "-g", "daemon off;"]


